// The compiler must turn today's content into a valid bundle that describes exactly what the
// current site shows, reject unsafe or malformed content, and produce identical output on rebuild.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '../src/index.js';
import { CompileError } from '../src/diagnostics.js';

const ROOT = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const CONTENT = path.join(ROOT, 'content');
const NOW = new Date('2026-01-01T00:00:00Z');

const result = await compile(CONTENT, { now: NOW });
const json = (file) => JSON.parse(result.files.get(file));
const site = json('site.json');
const manifest = json(site.programs[0].manifest);

test('the manifest lists every chapter folder and section file in order', () => {
  const dirs = fs
    .readdirSync(CONTENT)
    .filter((d) => /^ch\d{2}-/.test(d))
    .sort();
  assert.deepEqual(
    manifest.chapters.map((c) => c.id),
    dirs.map((d) => d.slice(0, 4)),
  );
  for (const [i, dir] of dirs.entries()) {
    const files = fs
      .readdirSync(path.join(CONTENT, dir))
      .filter((f) => f.endsWith('.mdx'))
      .sort();
    assert.deepEqual(
      manifest.chapters[i].sections.map((s) => s.slug),
      files.map((f) => f.replace(/^\d+-|\.mdx$/g, '')),
      dir,
    );
    assert.equal(manifest.chapters[i].number, Number(dir.slice(2, 4)));
  }
});

test('quiz revisions are computed by the shared contract function', () => {
  const quizzes = manifest.chapters.flatMap((c) => c.sections.flatMap((s) => s.activities.quizzes));
  assert.ok(quizzes.length > 250);
  assert.ok(quizzes.every((q) => /^[a-f0-9]{1,8}$/.test(q.revision) && q.quizId && q.prompt));
});

test('practice questions match the current registry', async () => {
  const { readPractice } = await import(path.join(ROOT, 'scripts/read-practice.mjs'));
  const current = readPractice(CONTENT).map(({ id, objective, title }) => ({ id, objective, title }));
  const compiled = manifest.chapters.flatMap((c) => c.sections.flatMap((s) => s.activities.practice ?? []));
  assert.deepEqual(compiled, current);
});

test('every section and the details page has a compiled page', () => {
  for (const chapter of manifest.chapters)
    for (const section of chapter.sections)
      assert.ok(result.files.has(manifest.pages[`${chapter.id}/${section.slug}`]), `${chapter.id}/${section.slug}`);
  assert.ok(result.files.has(manifest.pages.details));
});

test('pages carry their data, headings and code as data', () => {
  const page = json(manifest.pages['ch03/inventory']);
  assert.equal(page.title, 'Building an Ansible inventory');
  assert.ok(page.toc.some((h) => h.id === 'what-an-inventory-is'));
  assert.ok(page.data.check?.questions.length >= 1, 'quiz data moved into page data');
  const code = [];
  (function walk(nodes) {
    for (const n of nodes ?? []) n.t === 'code' ? code.push(n) : walk(n.c);
  })(page.tree);
  assert.ok(code.some((c) => c.title === 'inventory' && c.lang === 'ini'));
  assert.ok(code.every((c) => c.lines.every((line) => line.every((token) => !token.l || /^#[0-9a-fA-F]{6}$/.test(token.l)))));
});

test('output is deterministic: rebuilding gives identical files', async () => {
  const again = await compile(CONTENT, { now: NOW });
  assert.deepEqual([...again.files.entries()], [...result.files.entries()]);
});

// ---------- Rejections ----------

/** Compile a one-chapter content tree whose single page has `body`; returns the errors. */
async function errorsFor(body, { front = 'title: Test\nkind: lesson\nminutes: 5' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-compile-'));
  try {
    fs.cpSync(path.join(CONTENT, '_course.yml'), path.join(dir, '_course.yml'));
    for (const file of ['home.json', 'progress.json', '_interface.json']) fs.cpSync(path.join(CONTENT, file), path.join(dir, file));
    fs.cpSync(path.join(CONTENT, 'tracks'), path.join(dir, 'tracks'), { recursive: true });
    fs.writeFileSync(path.join(dir, '_objectives.yml'), '[]\n');
    fs.mkdirSync(path.join(dir, 'ch01-test'));
    fs.writeFileSync(path.join(dir, 'ch01-test', '_chapter.yml'), 'title: Test chapter\n');
    fs.writeFileSync(path.join(dir, 'ch01-test', '01-page.mdx'), `---\n${front}\n---\n\n${body}\n`);
    try {
      await compile(dir, { now: NOW });
      return [];
    } catch (e) {
      if (!(e instanceof CompileError)) throw e;
      return e.diagnostics.errors.map((x) => `${x.file}:${x.line ?? ''} ${x.message}`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
const rejects = async (body, pattern, options) => {
  const errors = await errorsFor(body, options);
  assert.ok(
    errors.some((e) => pattern.test(e)),
    `expected ${pattern}, got:\n${errors.join('\n') || '(no errors)'}`,
  );
};

test('a minimal valid page compiles', async () => {
  assert.deepEqual(await errorsFor('## Hello\n\nSome **text** with `code`.\n\n<Callout type="tip" title="Hi">Body</Callout>'), []);
});

test('unknown components and attributes are rejected with their line', async () => {
  await rejects('\n\n<Banner />', /01-page\.mdx:\d+ unknown component <Banner>/);
  await rejects('<Callout type="danger">x</Callout>', /'callout' attribute 'type' must be one of/);
  await rejects('<Callout colour="red">x</Callout>', /'callout' has no attribute 'colour'/);
  await rejects('<Card title="x">x</Card>', /'card' must be inside cards/);
  await rejects('<Tabs>loose text</Tabs>', /'tabs' can only contain tab/);
  await rejects('<Lab title="x" id="Bad Id"><Task id="t" title="t">x</Task></Lab>', /'lab' attribute 'id' is not a valid id/);
});

test('code, expressions and raw HTML are rejected', async () => {
  await rejects('import x from "y"\n\ntext', /only `export const NAME = <data>` is allowed/);
  await rejects('export const x = fetch("https://evil.example")', /CallExpression is code, not data/);
  await rejects('export const x = `a${1}b`', /template literals cannot interpolate/);
  await rejects('Hello {window.alert(1)}', /inline \{expressions\} are code/);
  await rejects('<Callout title={doSomething()}>x</Callout>', /CallExpression is code, not data/);
  await rejects('<Callout {...props}>x</Callout>', /spread attributes are not allowed/);
});

test('unsafe links are rejected', async () => {
  await rejects('[click](javascript:alert(1))', /link 'javascript:alert\(1\)' is not allowed/);
  await rejects('[x](http://example.com)', /link 'http:\/\/example.com' is not allowed/);
  await rejects('[x](data:text/html,hi)', /is not allowed/);
});

test('malformed data and frontmatter are rejected', async () => {
  await rejects(
    '<Quiz id="q" questions={[{ id: "q-123456", q: "Q?", options: ["a"], answer: 0, explain: "e" }]} />',
    /quiz data \/questions\/0\/options must NOT have fewer than 2 items/,
  );
  await rejects('text', /frontmatter: \(root\) must have required property 'title'/, { front: 'kind: lesson' });
  await rejects('text', /frontmatter: \/kind must be equal to one of/, { front: 'title: T\nkind: blog' });
});
