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
const CHAPTERS = path.join(CONTENT, 'programs', 'rhel9-ansible', 'chapters');
const NOW = new Date('2026-01-01T00:00:00Z');

const result = await compile(CONTENT, { now: NOW });
const json = (file) => JSON.parse(result.files.get(file));
const site = json('site.json');
const manifest = json(site.programs[0].manifest);

test('the manifest lists every chapter folder and section file in order', () => {
  const dirs = fs
    .readdirSync(CHAPTERS)
    .filter((d) => /^ch\d{2}-/.test(d))
    .sort();
  assert.deepEqual(
    manifest.chapters.map((c) => c.id),
    dirs.map((d) => d.slice(0, 4)),
  );
  for (const [i, dir] of dirs.entries()) {
    const files = fs
      .readdirSync(path.join(CHAPTERS, dir))
      .filter((f) => f.endsWith('.md'))
      .sort();
    assert.deepEqual(
      manifest.chapters[i].sections.map((s) => s.slug),
      files.map((f) => f.replace(/^\d+-|\.md$/g, '')),
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

test('practice questions are listed with their objective', () => {
  const practice = manifest.chapters.flatMap((c) => c.sections.flatMap((s) => s.activities.practice ?? []));
  assert.equal(practice.length, 22);
  assert.ok(practice.every((p) => p.id && p.objective && p.title));
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

/** Compile a one-chapter content tree whose single page has `body` (and optional `data`); returns the errors. */
async function compileFixture(body, { front = 'title: Test\nkind: lesson\nminutes: 5', data, extra = {} } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-compile-'));
  try {
    const program = path.join(dir, 'programs', 'test-program');
    const chapter = path.join(program, 'chapters', 'ch01-test');
    fs.mkdirSync(chapter, { recursive: true });
    fs.writeFileSync(path.join(dir, 'site.yml'), 'apiVersion: 1\nname: Test\ntagline: Test site\nprograms: [test-program]\n');
    fs.writeFileSync(
      path.join(program, 'program.yml'),
      'apiVersion: 1\nid: test-program\ntitle: Test program\nlabel: Test\nsummary: A program for tests.\nplatform: { family: linux, version: "1", label: Linux }\nstatus: active\n',
    );
    fs.writeFileSync(path.join(program, 'objectives.yml'), '[]\n');
    fs.writeFileSync(path.join(chapter, '_chapter.yml'), 'title: Test chapter\n');
    fs.writeFileSync(path.join(chapter, '01-page.md'), `---\n${front}\n---\n\n${body}\n`);
    if (data) fs.writeFileSync(path.join(chapter, '01-page.data.yml'), data);
    for (const [name, text] of Object.entries(extra)) fs.writeFileSync(path.join(chapter, name), text);
    try {
      const out = await compile(dir, { now: NOW });
      const site = JSON.parse(out.files.get('site.json'));
      const m = JSON.parse(out.files.get(site.programs[0].manifest));
      return { errors: [], page: JSON.parse(out.files.get(m.pages['ch01/page'])) };
    } catch (e) {
      if (!(e instanceof CompileError)) throw e;
      return { errors: e.diagnostics.errors.map((x) => `${x.file}:${x.line ?? ''} ${x.message}`) };
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
const errorsFor = async (body, options) => (await compileFixture(body, options)).errors;
const rejects = async (body, pattern, options) => {
  const errors = await errorsFor(body, options);
  assert.ok(
    errors.some((e) => pattern.test(e)),
    `expected ${pattern}, got:\n${errors.join('\n') || '(no errors)'}`,
  );
};

test('a minimal valid page compiles', async () => {
  assert.deepEqual(await errorsFor('## Hello\n\nSome **text** with `code`.\n\n{% callout type="tip" title="Hi" %}Body{% /callout %}'), []);
});

test('unknown tags and attributes are rejected with their line', async () => {
  await rejects('\n\n{% banner /%}', /01-page\.md:\d+ unknown tag 'banner'/);
  await rejects('{% callout type="danger" %}x{% /callout %}', /'callout' attribute 'type' must be one of/);
  await rejects('{% callout colour="red" %}x{% /callout %}', /'callout' has no attribute 'colour'/);
  await rejects('{% card title="x" %}x{% /card %}', /'card' must be inside cards/);
  await rejects('{% tabs %}\nloose text\n{% /tabs %}', /'tabs' can only contain tab/);
  await rejects(
    '{% lab title="x" id="Bad Id" %}\n{% task id="t" title="t" %}x{% /task %}\n{% /lab %}',
    /'lab' attribute 'id' is not a valid id/,
  );
});

test('variables, functions and annotations are rejected', async () => {
  await rejects('{% callout title=$secret %}x{% /callout %}', /variables and functions are not allowed/);
  await rejects('{% callout title=fetch("https://evil.example") %}x{% /callout %}', /variables and functions are not allowed/);
  await rejects('## Heading {% #custom .red %}', /annotation 'id' is not allowed here/);
  await rejects('{% callout title="x" %}\nunclosed', /missing closing/);
});

test('raw HTML is plain text, and code is never scanned for tags', async () => {
  const { errors, page } = await compileFixture(
    'Hi <script>alert(1)</script> <img src=x onerror=alert(1)>\n\n```jinja\n{% for x in items %}{{ x }}{% endfor %}\n```',
  );
  assert.deepEqual(errors, []);
  const json = JSON.stringify(page.tree);
  assert.ok(!json.includes('"tag":"script"') && !json.includes('"tag":"img"'));
  assert.ok(json.includes('<script>alert(1)</script>'), 'markup stays as text');
  const code = page.tree.find((n) => n.t === 'code');
  assert.equal(code.lines.map((line) => line.map((t) => t.v).join('')).join('\n'), '{% for x in items %}{{ x }}{% endfor %}');
});

test('unsafe links are rejected or left as text', async () => {
  await rejects('[x](http://example.com)', /link 'http:\/\/example.com' is not allowed/);
  await rejects('[x](lab/../../etc)', /is not allowed/);
  for (const body of ['[click](javascript:alert(1))', '[x](data:text/html,hi)', '[x](vbscript:msgbox)']) {
    const { errors, page } = await compileFixture(body);
    assert.deepEqual(errors, []);
    assert.ok(!JSON.stringify(page.tree).includes('"tag":"a"'), `${body} is not a link`);
  }
});

test('page data must match its tags', async () => {
  const quiz = 'q:\n  questions:\n    - { id: q-123456, q: "Q?", options: [a], answer: 0, explain: e }\n';
  await rejects('{% quiz id="q" ref="q" /%}', /quiz data \/questions\/0\/options must NOT have fewer than 2 items/, { data: quiz });
  await rejects('{% quiz id="q" ref="q" /%}', /refers to 'q', which is not in the page data file/);
  await rejects('Text', /'q' is not used by any tag on the page/, { data: quiz });
  await rejects('Text', /invalid page data/, { data: '- not\n- a map\n' });
});

test('malformed frontmatter is rejected', async () => {
  await rejects('text', /frontmatter: \(root\) must have required property 'title'/, { front: 'kind: lesson\nminutes: 5' });
  await rejects('text', /frontmatter: \/kind must be equal to one of/, { front: 'title: T\nkind: blog\nminutes: 5' });
  await rejects('text', /frontmatter: \(root\) must have required property 'minutes'/, { front: 'title: T\nkind: lesson' });
});

test('code, markup and style files in content are rejected', async () => {
  for (const name of ['widget.jsx', 'old.mdx', 'theme.css', 'page.html', 'hook.js'])
    await rejects('text', new RegExp(`${name.replace('.', '\\.')}.*only Markdoc, YAML, JSON`), { extra: { [name]: 'x' } });
});

// ---------- Programs ----------

test('a program folder must match the program id and be listed in the site', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-programs-'));
  try {
    fs.writeFileSync(path.join(dir, 'site.yml'), 'apiVersion: 1\nname: T\ntagline: T\nprograms: [one, missing]\n');
    const program = (id) =>
      `apiVersion: 1\nid: ${id}\ntitle: T\nlabel: T\nsummary: S\nplatform: { family: linux, version: "1", label: L }\nstatus: planned\n`;
    fs.mkdirSync(path.join(dir, 'programs', 'one'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'programs', 'one', 'program.yml'), program('other'));
    fs.mkdirSync(path.join(dir, 'programs', 'unlisted'), { recursive: true });
    const errors = await compile(dir).then(
      () => [],
      (e) => e.diagnostics.errors.map((x) => x.message),
    );
    assert.ok(
      errors.some((e) => /id 'other' must match the folder name 'one'/.test(e)),
      errors.join('\n'),
    );
    assert.ok(
      errors.some((e) => /program 'missing' has no programs\/missing\/program.yml/.test(e)),
      errors.join('\n'),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('two programs compile into separate manifests, pages and search indexes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-two-'));
  try {
    fs.cpSync(path.join(CONTENT, 'programs', 'rhel9-ansible'), path.join(dir, 'programs', 'rhel9-ansible'), { recursive: true });
    fs.cpSync(path.join(import.meta.dirname, 'fixtures', 'second-program'), path.join(dir, 'programs', 'second-program'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(dir, 'site.yml'),
      'apiVersion: 1\nname: Kernel Path\ntagline: T\nprograms: [rhel9-ansible, second-program]\n',
    );
    const out = await compile(dir, { now: NOW });
    const site = JSON.parse(out.files.get('site.json'));
    assert.deepEqual(
      site.programs.map((p) => p.id),
      ['rhel9-ansible', 'second-program'],
    );
    const [first, second] = site.programs.map((p) => JSON.parse(out.files.get(p.manifest)));
    assert.ok(Object.values(second.pages).every((f) => f.startsWith('p/second-program/')));
    assert.ok(Object.values(first.pages).every((f) => f.startsWith('p/rhel9-ansible/')));
    assert.notEqual(first.search, second.search);
    const search = JSON.parse(out.files.get(second.search));
    assert.ok(search.entries.length > 0 && search.entries.every((e) => e.page.startsWith('ch01/')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
