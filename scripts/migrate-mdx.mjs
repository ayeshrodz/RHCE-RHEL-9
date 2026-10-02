// One-off migration: rewrites every content/**/*.mdx page as Markdoc (.md) plus a page
// data file (.data.yml). JSX components become catalog tags, data attributes and exported
// constants move into the data file under the tag's `ref`. Run once, then delete.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';
import { catalog, mdxMigration } from '@kernel-path/schema';
import { readMdxPage } from '../packages/compiler/src/mdx-bridge.js';
import { convertPage } from '../packages/compiler/src/tree.js';
import { Diagnostics } from '../packages/compiler/src/diagnostics.js';
import { createValidator } from '../packages/compiler/src/validator.js';
import { initHighlighter } from '../packages/compiler/src/highlight.js';

const LEGACY = new Set(catalog.components['legacy-widget'].attributes.name.enum);
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const value = (v) => (typeof v === 'string' || Array.isArray(v) ? JSON.stringify(v) : String(v));
const write = process.argv.includes('--write');

/** End offset (exclusive) of the JSX opening tag that starts at `start`, and whether it self-closes. */
function openingTagEnd(source, start) {
  let depth = 0;
  let quote = null;
  for (let i = start + 1; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '>' && depth === 0) return { end: i + 1, selfClosing: source[i - 1] === '/' };
  }
  throw new Error(`unterminated tag at ${start}`);
}

function migrate(file, validator) {
  const source = fs.readFileSync(file, 'utf8');
  const diagnostics = new Diagnostics(process.cwd());
  const parsed = readMdxPage(source, file, diagnostics);
  const expected = convertPage(structuredClone(parsed), { file, diagnostics, validator });
  if (!diagnostics.ok) throw new Error(diagnostics.format());

  const widgetContent = parsed.scope.widgetContent ?? {};
  const counts = new Map();
  const data = {};
  const legacyData = [];
  const usedWidgets = new Set();
  const edits = [];
  const problems = [];
  const uniqueRef = (base) => {
    const n = (counts.get(base) ?? 0) + 1;
    counts.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  function tagFor(node) {
    const rule = mdxMigration.components[node.name];
    const props = node.props ?? {};
    if (!rule) {
      usedWidgets.add(node.name);
      const ref = uniqueRef(kebab(node.name));
      const copy = widgetContent[node.name];
      data[ref] = {
        ...(copy?.text ? { text: copy.text } : {}),
        ...(copy?.data ? { data: copy.data } : {}),
        ...(Object.keys(props).length ? { props } : {}),
      };
      legacyData.push(data[ref]);
      return { name: 'legacy-widget', attrs: { name: node.name, ref } };
    }
    const attrs = { ...(rule.fixed ?? {}) };
    const dropped = new Set([...(rule.dropAttributes ?? []), rule.dataAttribute, ...(rule.dataAttributes ?? [])]);
    for (const [key, v] of Object.entries(props)) {
      if (dropped.has(key)) continue;
      const target = rule.rename?.[key] ?? key;
      attrs[target] = rule.transform?.[target] === 'strip-lab-start' ? String(v).replace(/^lab start\s+/, '') : v;
    }
    if (rule.dataShape) {
      const ref = uniqueRef(rule.tag === 'quiz' ? (props.id ?? 'quiz') : rule.dataShape);
      data[ref] = expected.data[ref];
      attrs.ref = ref;
    }
    return { name: rule.tag, attrs };
  }

  (function visit(node) {
    if (node.type === 'mdxjsEsm') {
      let end = node.position.end.offset;
      while (source[end] === '\n') end++;
      edits.push([node.position.start.offset, end, '']);
      return;
    }
    if (node.type === 'code' && node.meta) {
      const start = node.position.start.offset;
      const lineEnd = source.indexOf('\n', start);
      const info = source.slice(start, lineEnd);
      const title = node.meta.match(/^title="([^"]+)"$/)?.[1];
      if (!title) problems.push(`${file}: code meta '${node.meta}' is not a title`);
      else edits.push([start, lineEnd, info.replace(node.meta, `{% title=${JSON.stringify(title)} %}`)]);
    }
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      const start = node.position.start.offset;
      const end = node.position.end.offset;
      const open = openingTagEnd(source, start);
      const { name, attrs } = tagFor(node);
      const flow = node.type === 'mdxJsxFlowElement';
      const list = Object.entries(attrs).map(([k, v]) => `${k}=${value(v)}`);
      const close = open.selfClosing ? ' /%}' : ' %}';
      let opening = `{% ${[name, ...list].join(' ')}${close}`;
      const multiLine = source.slice(start, open.end).includes('\n');
      if (flow && multiLine && list.length > 1) {
        const column = start - source.lastIndexOf('\n', start - 1) - 1;
        const indent = ' '.repeat(column + 2);
        opening = `{% ${name}\n${list.map((a) => indent + a).join('\n')}${close}`;
      }
      edits.push([start, open.end, opening]);
      if (!open.selfClosing) {
        const closing = `</${node.name}>`;
        if (source.slice(end - closing.length, end) !== closing) problems.push(`${file}: cannot find ${closing} at ${end}`);
        edits.push([end - closing.length, end, `{% /${name} %}`]);
        // A block tag must sit on its own lines unless the whole element is on one line.
        if (flow && !open.selfClosing) {
          const lineAfterOpen = source.slice(open.end, source.indexOf('\n', open.end));
          const lineBeforeClose = source.slice(source.lastIndexOf('\n', end - closing.length - 1) + 1, end - closing.length);
          const oneLine = !source.slice(start, end).includes('\n');
          if (!oneLine && (lineAfterOpen.trim() || lineBeforeClose.trim()))
            problems.push(`${file}:${node.position.start.line} <${node.name}> shares a line with its content`);
        }
      }
    }
    for (const child of node.children ?? []) visit(child);
  })(parsed.tree);

  const dependencies = Object.fromEntries(
    Object.entries(widgetContent)
      .filter(([name]) => !usedWidgets.has(name))
      .map(([name, copy]) => [name, { ...(copy.text ? { text: copy.text } : {}), ...(copy.data ? { data: copy.data } : {}) }]),
  );
  if (Object.keys(dependencies).length) for (const entry of legacyData) entry.dependencies = dependencies;

  assert.deepEqual(data, expected.data, `${file}: page data differs from the compiler's`);

  edits.sort((a, b) => b[0] - a[0]);
  let out = source;
  for (const [s, e, text] of edits) out = out.slice(0, s) + text + out.slice(e);
  out = out.replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');

  const target = file.replace(/\.mdx$/, '.md');
  const dataFile = file.replace(/\.mdx$/, '.data.yml');
  if (write) {
    fs.writeFileSync(target, out);
    if (Object.keys(data).length) fs.writeFileSync(dataFile, YAML.stringify(data, { lineWidth: 0, aliasDuplicateObjects: false }));
    fs.rmSync(file);
  }
  return { problems, expected, data };
}

function mdxFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? mdxFiles(p) : p.endsWith('.mdx') ? [p] : [];
  });
}

await initHighlighter();
const validator = createValidator();
const problems = [];
const files = mdxFiles('content');
for (const file of files) problems.push(...migrate(file, validator).problems);
for (const p of problems) console.error(p);
console.log(`${write ? 'Migrated' : 'Checked'} ${files.length} pages; ${problems.length} problem(s).`);
process.exitCode = problems.length ? 1 : 0;
