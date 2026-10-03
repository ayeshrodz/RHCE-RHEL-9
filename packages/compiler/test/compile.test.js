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

test('diagram data is checked: unknown kinds, properties and out-of-range values are rejected', async () => {
  const spec = (element) => `d:\n  title: T\n  height: 100\n  elements:\n    - ${element}\n`;
  const ok = '{ kind: node, x: 0, y: 0, w: 10, h: 10, title: Box }';
  assert.deepEqual(await errorsFor('{% diagram ref="d" /%}', { data: spec(ok) }), []);
  await rejects('{% diagram ref="d" /%}', /diagram data/, { data: spec('{ kind: script, src: "x" }') });
  await rejects('{% diagram ref="d" /%}', /diagram data .*additional properties/, {
    data: spec('{ kind: node, x: 0, y: 0, w: 10, h: 10, onclick: "alert(1)" }'),
  });
  await rejects('{% diagram ref="d" /%}', /diagram data/, { data: spec('{ kind: node, x: 0, y: 0, w: 10, h: 10, tone: "red; x:y" }') });
  await rejects('{% diagram ref="d" /%}', /diagram data/, { data: spec('{ kind: arrow, points: [[0, 0]] }') });
});

// ---------- Lab exercises ----------

/** Compile a one-page program that teaches an exercise whose definition is `labYaml`; `files` adds starter files. */
async function labErrors(
  labYaml,
  {
    files = {},
    lab = '{% lab id="x" title="X" exercise="demo" objectives=["ch01.demo"] %}\n{% task id="t" title="T" %}x{% /task %}\n{% /lab %}',
  } = {},
) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-lab-'));
  try {
    const program = path.join(dir, 'programs', 'p');
    const chapter = path.join(program, 'chapters', 'ch01-x');
    fs.mkdirSync(path.join(program, 'lab', 'demo', 'starter'), { recursive: true });
    fs.mkdirSync(chapter, { recursive: true });
    fs.writeFileSync(path.join(dir, 'site.yml'), 'apiVersion: 1\nname: T\ntagline: T\nprograms: [p]\n');
    fs.writeFileSync(
      path.join(program, 'program.yml'),
      'apiVersion: 1\nid: p\ntitle: T\nlabel: T\nsummary: S\nplatform: { family: linux, version: "1", label: L }\nstatus: active\n',
    );
    fs.writeFileSync(path.join(program, 'objectives.yml'), '[]\n');
    fs.writeFileSync(path.join(chapter, '_chapter.yml'), 'title: C\n');
    fs.writeFileSync(path.join(chapter, '01-lab.md'), `---\ntitle: "Exercise: Demo"\nkind: lab\nminutes: 5\n---\n\n${lab}\n`);
    fs.writeFileSync(path.join(program, 'lab', 'demo.yml'), labYaml);
    for (const [name, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(program, 'lab', 'demo', name)), { recursive: true });
      fs.writeFileSync(path.join(program, 'lab', 'demo', name), text);
    }
    try {
      const out = await compile(dir, { now: NOW });
      return { errors: [], out };
    } catch (e) {
      if (!(e instanceof CompileError)) throw e;
      return { errors: e.diagnostics.errors.map((x) => x.message) };
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
const DEMO = 'name: demo\ntitle: Demo\npage: ch01/lab\n';
const check = (c) => `${DEMO}checkpoints:\n  final:\n    checks:\n      - ${c}\n`;

test('an exercise compiles into published starter files, a manifest, an index and a typed catalog', async () => {
  const { errors, out } = await labErrors(
    `${DEMO}starter: [inventory, files/index.html]\nsetup: []\ncheckpoints:\n  final:\n    files: [site.yml]\n    checks:\n      - { id: web, kind: service, on: web, targets: [servera.lab.example.com], message: Apache runs, names: [httpd], active: true }\n`,
    { files: { 'starter/inventory': 'localhost\n', 'starter/files/index.html': '<h1>Hello</h1>\n' } },
  );
  assert.deepEqual(errors, []);
  assert.equal(out.files.get('lab/demo/MANIFEST'), '# Demo\ninventory=inventory.lab\nfiles/index.html=files/index.html.lab\n');
  assert.ok(out.files.has('lab/demo/files/index.html.lab'), 'starter files are published inert, with a .lab suffix');
  assert.ok(![...out.files.keys()].some((f) => f.endsWith('.html')), 'no page a browser could render');
  assert.match(out.files.get('lab/INDEX'), /demo\s+1\.1\s+Demo/);
  const catalog = JSON.parse(out.files.get('lab/graders.json'));
  assert.equal(catalog.version, 2);
  assert.equal(catalog.exercises.demo.lesson, '#/ch01/lab');
  assert.ok(out.files.has('lab/grade.py') && out.files.has('lab/prepare.py') && out.files.has('lab/lab'), 'the lab tools are published');
});

test('lab checks hold values, never commands', async () => {
  const web = 'on: web, targets: [servera.lab.example.com], message: m';
  const bad = (c, pattern) =>
    labErrors(check(c)).then(({ errors }) =>
      assert.ok(
        errors.some((e) => pattern.test(e)),
        `${pattern}: ${errors.join('\n') || 'no errors'}`,
      ),
    );
  await bad(`{ id: a, kind: shell, ${web}, command: "rm -rf /" }`, /exercise/);
  await bad(`{ id: a, kind: service, ${web}, names: ["httpd; reboot"] }`, /exercise/);
  await bad(`{ id: a, kind: file, ${web}, paths: ["/etc/../../root/x"] }`, /exercise/);
  await bad(`{ id: a, kind: file, ${web}, paths: ["/tmp/$(id)"] }`, /exercise/);
  await bad(`{ id: a, kind: http, ${web}, url: "http://evil.example.org/" }`, /exercise/);
  await bad(`{ id: a, kind: service, on: web, message: m, names: [httpd] }`, /needs targets/);
  await bad(`{ id: a, kind: git, ${web}, clean: true }`, /exercise|control node/);
  const dup = `${DEMO}checkpoints:\n  final:\n    checks:\n      - { id: a, kind: commands, on: control, message: m, names: [ls] }\n      - { id: a, kind: commands, on: control, message: m, names: [ls] }\n`;
  assert.ok((await labErrors(dup)).errors.some((e) => /two checks named 'a'/.test(e)));
});

test('an exercise must be taught, defined once, and have its starter files', async () => {
  const ok = check('{ id: a, kind: commands, on: control, message: m, names: [ls] }');
  assert.ok(
    (await labErrors(ok.replace('page: ch01/lab', 'page: ch01/other'))).errors.some((e) => /page 'ch01\/other' does not exist/.test(e)),
  );
  assert.ok(
    (await labErrors(`${ok.replace('checkpoints:', 'starter: [missing.yml]\ncheckpoints:')}`)).errors.some((e) =>
      /starter file 'missing.yml' is missing/.test(e),
    ),
  );
  assert.ok((await labErrors(ok, { lab: 'No lab tag here.' })).errors.some((e) => /no lab tag on any page uses exercise 'demo'/.test(e)));
  assert.ok(
    (
      await labErrors(ok, {
        lab: '{% lab id="x" title="X" exercise="ghost" objectives=["ch01.demo"] %}\n{% task id="t" title="T" %}x{% /task %}\n{% /lab %}',
      })
    ).errors.some((e) => /exercise 'ghost', which has no definition/.test(e)),
  );
  assert.ok(
    (
      await labErrors(`${ok.replace('checkpoints:', 'starter: [a.yml]\ncheckpoints:')}`, { files: { 'starter/a.yml': 'a: [unclosed\n' } })
    ).errors.some((e) => /not valid YAML/.test(e)),
  );
});

test('symbolic links in content are refused, so nothing outside content can be published', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kernel-link-'));
  try {
    fs.cpSync(path.join(import.meta.dirname, 'fixtures', 'second-program'), path.join(dir, 'programs', 'second-program'), {
      recursive: true,
    });
    fs.writeFileSync(path.join(dir, 'site.yml'), 'apiVersion: 1\nname: T\ntagline: T\nprograms: [second-program]\n');
    const chapter = path.join(dir, 'programs/second-program/chapters/ch01-first-steps');
    fs.symlinkSync('/etc/hostname', path.join(chapter, '03-leak.md'));
    const errors = await compile(dir, { now: NOW }).then(
      () => [],
      (e) => e.diagnostics.errors.map((x) => `${x.file} ${x.message}`),
    );
    assert.ok(
      errors.some((e) => /03-leak\.md symbolic links are not allowed/.test(e)),
      errors.join('\n'),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('lab files with dotfile names are published under names static hosts serve', async () => {
  const { errors, out } = await labErrors(
    `${DEMO}starter: [.ansible-lint, files/.htaccess]\nsetup:\n  - { action: htpasswd, path: files/htpasswd, user: guest, password: redhat }\ncheckpoints:\n  final:\n    files: [site.yml]\n`,
    { files: { 'starter/.ansible-lint': 'x\n', 'starter/files/.htaccess': 'Require valid-user\n' } },
  );
  assert.deepEqual(errors, []);
  const published = [...out.files.keys()].filter((f) => f.startsWith('lab/demo/'));
  assert.ok(
    published.every((f) => !f.split('/').some((part) => part.startsWith('.'))),
    published.join('\n'),
  );
  const manifest = out.files.get('lab/demo/MANIFEST');
  assert.match(manifest, /^\.ansible-lint=_\.ansible-lint\.lab$/m);
  assert.match(manifest, /^files\/\.htaccess=files\/_\.htaccess\.lab$/m);
  assert.match(manifest, /^@lab-update-required$/m, 'an old lab command is told to update');
  assert.match(out.files.get('lab/demo/lab-update-required'), /lab update/);
  assert.ok(
    (await labErrors(`${DEMO}starter: [_.x]\ncheckpoints:\n  final:\n    files: [a]\n`, { files: { 'starter/_.x': 'x' } })).errors.some(
      (e) => /reserved/.test(e),
    ),
  );
});
