// Hostile-input tests. Content and saved progress are untrusted: feed the compiler, the runtime
// validators and the progress importer malformed and malicious input and check the same promises
// every time. Seeds are fixed so a failure can be reproduced; the failing input is in the message.
import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '@kernel-path/compiler';
import { convertPage, readPage } from '../packages/compiler/src/tree.js';
import { createValidator } from '../packages/compiler/src/validator.js';
import { Diagnostics } from '../packages/compiler/src/diagnostics.js';
import { initHighlighter } from '../packages/compiler/src/highlight.js';
import { catalog } from '@kernel-path/schema';
import {
  validateInterface,
  validateLegacy,
  validateManifest,
  validatePage,
  validateSearch,
  validateSite,
} from '@kernel-path/schema/validators';
import { validateProgress } from '../packages/engine/src/lib/storage.js';

// ---------- a small seeded random source ----------

function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const between = (rand, low, high) => low + Math.floor(rand() * (high - low + 1));

const HOSTILE = [
  '{%',
  '%}',
  '{% callout type="x" %}',
  '{% /callout %}',
  '{% quiz id="q" ref="q" /%}',
  '{% lab %}',
  '{% callout title=$secret %}',
  '{% callout title=fetch("x") %}',
  '{% title="x" %}',
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '[x](javascript:alert(1))',
  '[x](data:text/html,<b>x</b>)',
  '[x](//evil.example/)',
  '![i](https://evil.example/x.png)',
  '__proto__',
  'constructor',
  '{{ 7*7 }}',
  '${7*7}',
  '`',
  '```',
  '"',
  "'",
  '\\',
  '\u0000',
  '‮',
  ' ',
  '#'.repeat(9),
  '---',
  '| a | b |\n| - | - |\n',
  '- [ ] ',
  '&a [*a]',
  '*a',
  '!!js/function "x"',
  'A'.repeat(6000),
  '😀',
  '\n\n',
  '    ',
];

function mutate(rand, text) {
  let out = text;
  for (let i = between(rand, 1, 4); i > 0; i--) {
    const at = between(rand, 0, out.length);
    switch (between(rand, 0, 5)) {
      case 0:
        out = out.slice(0, at) + pick(rand, HOSTILE) + out.slice(at);
        break;
      case 1:
        out = out.slice(0, at) + out.slice(at + between(rand, 1, 40));
        break;
      case 2: {
        const piece = out.slice(at, at + between(rand, 1, 60));
        out = out.slice(0, at) + piece + piece + out.slice(at);
        break;
      }
      case 3:
        out = out.slice(0, at);
        break;
      case 4:
        out = out.slice(0, at) + pick(rand, HOSTILE) + out.slice(at + between(rand, 0, 12));
        break;
      default: {
        const lines = out.split('\n');
        const a = between(rand, 0, lines.length - 1);
        const b = between(rand, 0, lines.length - 1);
        [lines[a], lines[b]] = [lines[b], lines[a]];
        out = lines.join('\n');
      }
    }
  }
  return out;
}

// ---------- what a rendered page may contain (written independently of the schemas) ----------

const ELEMENTS = new Set(['p', 'h2', 'h3', 'h4', 'strong', 'em', 'del', 'code', 'br', 'hr', 'blockquote', 'a', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td']);
const SAFE_HREF = /^(#|lab\/|https:\/\/|mailto:)/;
const TAGS = new Set(Object.entries(catalog.components).filter(([, c]) => c.status !== 'planned').map(([name]) => name));

function assertSafeTree(nodes, where) {
  for (const node of nodes ?? []) {
    assert.ok(['text', 'el', 'code', 'tag'].includes(node.t), `${where}: node type ${node.t}`);
    if (node.t === 'el') {
      assert.ok(ELEMENTS.has(node.tag), `${where}: element <${node.tag}>`);
      for (const [key, value] of Object.entries(node.attrs ?? {})) {
        assert.ok(['id', 'href', 'align', 'start', 'checked'].includes(key), `${where}: attribute ${key}`);
        if (key === 'href') assert.match(value, SAFE_HREF, `${where}: link ${value}`);
      }
    }
    if (node.t === 'tag') {
      assert.ok(TAGS.has(node.name), `${where}: tag ${node.name}`);
      for (const value of Object.values(node.attrs ?? {}))
        assert.ok(['string', 'number', 'boolean'].includes(typeof value) || (Array.isArray(value) && value.every((v) => typeof v === 'string')), `${where}: attribute value`);
    }
    if (node.t === 'code') for (const line of node.lines) for (const token of line) for (const colour of [token.l, token.d]) assert.ok(colour === undefined || /^#[0-9a-fA-F]{6}$/.test(colour), `${where}: colour ${colour}`);
    assertSafeTree(node.c, where);
  }
}

// ---------- 1. the compiler ----------

const PAGE = `---
title: Fuzz page
kind: lesson
minutes: 5
---

{% lead %}
Some **bold** text with \`code\` and a [link](#/ch01/page#heading).
{% /lead %}

## A heading

- one
- two with *emphasis*

1. first
2. second

| a | b |
| - | - |
| \`x\` | y |

{% callout type="tip" title="Hello" %}
Body text.
{% /callout %}

{% cards cols=2 %}
{% card title="A" tone="teal" %}
Card text.
{% /card %}
{% /cards %}

\`\`\`yaml {% title="site.yml" %}
- name: Example
  ansible.builtin.debug:
    msg: "{{ ansible_hostname }}"
\`\`\`

{% quiz id="check" ref="check" /%}
`;
const DATA = `check:
  questions:
    - id: q-aaaaaa
      q: Which one?
      options: [alpha, beta]
      answer: 1
      explain: Because.
`;

test('the compiler never crashes on hostile pages, and what it accepts the browser accepts', async () => {
  await initHighlighter();
  const validator = createValidator();
  const rand = random(20261003);
  let accepted = 0;
  let rejected = 0;
  for (let i = 0; i < 1500; i++) {
    const source = rand() < 0.7 ? mutate(rand, PAGE) : PAGE;
    const data = rand() < 0.5 ? mutate(rand, DATA) : DATA;
    const diagnostics = new Diagnostics('.');
    let result;
    try {
      const parsed = readPage(source, data, 'fuzz.md', 'fuzz.data.yml', diagnostics);
      result = convertPage(parsed, { file: 'fuzz.md', dataFile: 'fuzz.data.yml', diagnostics, validator });
    } catch (error) {
      assert.fail(`the compiler threw ${error.name}: ${error.message}\n--- page ---\n${source}\n--- data ---\n${data}`);
    }
    if (!diagnostics.ok) {
      rejected++;
      continue;
    }
    // The compiler also checks the finished page against the page schema before writing it. The browser
    // runs generated validators from the same schemas; the two must always agree.
    const page = { apiVersion: 1, key: 'ch01/fuzz', title: 'Fuzz page', kind: 'lesson', minutes: 5, toc: result.toc, data: result.data, tree: result.tree };
    const compilerAccepts = validator.check(validator.ids.bundle.page, page).length === 0;
    assert.equal(validatePage(page), compilerAccepts, `the compiler and the browser disagree about this page\n${source}`);
    if (!compilerAccepts) {
      rejected++;
      continue;
    }
    accepted++;
    assertSafeTree(result.tree, 'compiled page');
  }
  assert.ok(accepted > 100 && rejected > 100, `the mutations should produce both outcomes (${accepted} accepted, ${rejected} rejected)`);
});

test('known attack strings in content become inert text or are refused', async () => {
  const dir = await import('node:fs').then((fs) => fs.mkdtempSync(`${process.env.TMPDIR ?? '/tmp'}/kernel-fuzz-`));
  const fs = await import('node:fs');
  const path = await import('node:path');
  try {
    const program = path.join(dir, 'programs', 'p');
    const chapter = path.join(program, 'chapters', 'ch01-x');
    fs.mkdirSync(chapter, { recursive: true });
    fs.writeFileSync(path.join(dir, 'site.yml'), 'apiVersion: 1\nname: T\ntagline: T\nprograms: [p]\n');
    fs.writeFileSync(path.join(program, 'program.yml'), 'apiVersion: 1\nid: p\ntitle: T\nlabel: T\nsummary: S\nplatform: { family: linux, version: "1", label: L }\nstatus: active\n');
    fs.writeFileSync(path.join(program, 'objectives.yml'), '[]\n');
    fs.writeFileSync(path.join(chapter, '_chapter.yml'), 'title: <img src=x onerror=alert(1)>\n');
    fs.writeFileSync(
      path.join(chapter, '01-a.md'),
      '---\ntitle: "<script>alert(1)</script>"\nkind: lesson\nminutes: 5\n---\n\nText <script>alert(1)</script> and <a href="javascript:alert(1)">x</a>.\n\n{% callout title="<img src=x onerror=alert(1)>" %}\n[x](vbscript:msgbox)\n{% /callout %}\n',
    );
    // Markup in a title is plain text by contract: kept as a string, never interpreted.
    const hostileTitles = await compile(dir);
    const hostileSite = JSON.parse(hostileTitles.files.get('site.json'));
    const hostileManifest = JSON.parse(hostileTitles.files.get(hostileSite.programs[0].manifest));
    assert.equal(hostileManifest.chapters[0].title, '<img src=x onerror=alert(1)>');
    assert.ok(validateManifest(hostileManifest));
    fs.writeFileSync(path.join(chapter, '_chapter.yml'), 'title: Chapter\n');
    fs.writeFileSync(path.join(chapter, '01-a.md'), '---\ntitle: Fine\nkind: lesson\nminutes: 5\n---\n\nText <script>alert(1)</script> and <a href="javascript:alert(1)">x</a> and [y](vbscript:msgbox).\n');
    const result = await compile(dir);
    const manifest = JSON.parse(result.files.get(JSON.parse(result.files.get('site.json')).programs[0].manifest));
    const page = JSON.parse(result.files.get(manifest.pages['ch01/a']));
    assertSafeTree(page.tree, 'attack page');
    assert.ok(!JSON.stringify(page).includes('"tag":"script"'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------- 2. the browser's validators ----------

const bundle = await compile('content', { now: new Date('2026-01-01T00:00:00Z') });
const site = JSON.parse(bundle.files.get('site.json'));
const manifestFile = site.programs.find((p) => p.id === 'rhel9-ansible').manifest;
const manifest = JSON.parse(bundle.files.get(manifestFile));
const samples = {
  page: Object.values(manifest.pages).map((f) => JSON.parse(bundle.files.get(f))),
  manifest: [manifest],
  site: [site],
  search: [JSON.parse(bundle.files.get(manifest.search))],
  legacy: [JSON.parse(bundle.files.get(manifest.legacy))],
  interface: [JSON.parse(bundle.files.get(site.interface))],
};
const validators = { page: validatePage, manifest: validateManifest, site: validateSite, search: validateSearch, legacy: validateLegacy, interface: validateInterface };

const VALUES = [null, 0, -1, 1e308, 2 ** 53, '', ' ', 'x'.repeat(20000), [], [[]], {}, { __proto__: null }, true, false, 'javascript:alert(1)', '<script>', '#/x', '../../etc/passwd', 'a\u0000b', [1, 2, 3], { a: { b: { c: {} } } }];

function paths(value, prefix = []) {
  if (value === null || typeof value !== 'object') return [prefix];
  return [prefix, ...Object.keys(value).flatMap((k) => paths(value[k], [...prefix, k]))];
}

function corrupt(rand, original) {
  const copy = structuredClone(original);
  for (let n = between(rand, 1, 3); n > 0; n--) {
    const candidates = paths(copy).filter((p) => p.length);
    if (!candidates.length) break;
    const target = pick(rand, candidates);
    let holder = copy;
    for (const key of target.slice(0, -1)) holder = holder[key];
    const last = target.at(-1);
    switch (between(rand, 0, 3)) {
      case 0:
        delete holder[last];
        break;
      case 1:
        holder[last] = pick(rand, VALUES);
        break;
      case 2:
        // Extra, unexpected properties, including the dangerous names.
        if (holder !== null && typeof holder === 'object' && !Array.isArray(holder)) Object.defineProperty(holder, pick(rand, ['__proto__', 'constructor', 'onclick', 'style', 'html', 'src']), { value: pick(rand, VALUES), enumerable: true, configurable: true, writable: true });
        break;
      default:
        if (Array.isArray(holder)) holder.splice(between(rand, 0, holder.length), 0, pick(rand, VALUES));
        else holder[last] = [holder[last]];
    }
  }
  return copy;
}

test('the browser validators never throw on corrupted files, and what they accept is safe to render', () => {
  const rand = random(42);
  let accepted = 0;
  let rejected = 0;
  for (let i = 0; i < 4000; i++) {
    const kind = pick(rand, Object.keys(samples));
    const input = corrupt(rand, pick(rand, samples[kind]));
    let ok;
    try {
      ok = validators[kind](input);
    } catch (error) {
      assert.fail(`validate ${kind} threw ${error.name}: ${error.message}\n${JSON.stringify(input).slice(0, 600)}`);
    }
    assert.equal(typeof ok, 'boolean');
    if (!ok) {
      rejected++;
      continue;
    }
    accepted++;
    if (kind === 'page') assertSafeTree(input.tree, `page ${input.key}`);
  }
  assert.ok(rejected > 1000 && accepted > 20, `${accepted} accepted, ${rejected} rejected`);
});

test('real files are accepted, and the same files made unsafe are refused', () => {
  for (const [kind, list] of Object.entries(samples)) for (const sample of list) assert.ok(validators[kind](sample), kind);
  const page = structuredClone(samples.page.find((p) => p.tree.length > 3));
  const attacks = [
    { t: 'el', tag: 'script', c: [{ t: 'text', v: 'alert(1)' }] },
    { t: 'el', tag: 'iframe', attrs: { src: 'https://evil.example/' } },
    { t: 'el', tag: 'a', attrs: { href: 'javascript:alert(1)' } },
    { t: 'el', tag: 'a', attrs: { href: 'data:text/html,<script>' } },
    { t: 'el', tag: 'a', attrs: { href: '//evil.example/' } },
    { t: 'el', tag: 'p', attrs: { onclick: 'alert(1)' } },
    { t: 'el', tag: 'p', attrs: { style: 'position:fixed' } },
    { t: 'html', v: '<b>x</b>' },
    { t: 'tag', name: 'script' },
    { t: 'code', lang: 'yaml', lines: [[{ v: 'x', l: 'red; background:url(//evil)' }]] },
  ];
  for (const attack of attacks) assert.ok(!validatePage({ ...page, tree: [...page.tree, attack] }), JSON.stringify(attack));
});

// ---------- 3. saved progress and imported files ----------

const KEYS = ['completed', 'lastVisited', 'readiness', 'labReports', 'lab:ch03/inventory:inventory', 'quiz:ch03/inventory:check', 'challenge:desired-state', 'assessment:release', '__proto__', 'constructor', 'prototype', 'theme', 'toString', 'polluted', 'x'];
const JSON_VALUES = () => [null, true, 0, -5, 1.5, 1e21, '', 'x', 'ch03/inventory', '__proto__', [], ['ch02/a'], [1, 2], [{}], {}, { 0: 1 }, { __proto__: { polluted: true } }, { version: 2, items: {} }, { items: null }, [{ at: 'x', passed: true }]];

function randomJson(rand, depth = 0) {
  if (depth > 2 || rand() < 0.4) return structuredClone(pick(rand, JSON_VALUES()));
  if (rand() < 0.5) return Array.from({ length: between(rand, 0, 4) }, () => randomJson(rand, depth + 1));
  const out = {};
  for (let n = between(rand, 0, 4); n > 0; n--) Object.defineProperty(out, pick(rand, KEYS), { value: randomJson(rand, depth + 1), enumerable: true, configurable: true, writable: true });
  return out;
}

test('imported progress files are validated: explicit errors only, and nothing can pollute prototypes', () => {
  const rand = random(7);
  let accepted = 0;
  for (let i = 0; i < 5000; i++) {
    const payload = {
      app: rand() < 0.8 ? 'kernel-path' : pick(rand, [null, 'other', 7, 'playbook-path']),
      version: rand() < 0.8 ? between(rand, 1, 3) : pick(rand, [0, 99, '1', null, 1.5]),
      ...(rand() < 0.3 ? { program: pick(rand, ['rhel9-ansible', 'Bad Id', 5, '__proto__']) } : {}),
      data: randomJson(rand),
    };
    try {
      const data = validateProgress(payload);
      accepted++;
      assert.equal(Object.getPrototypeOf(data), Object.prototype);
      assert.ok(!Object.hasOwn(data, '__proto__'));
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.match(error.message, /^(This |Invalid progress entry|The |Unsupported)/, `an unexpected failure: ${error.name}: ${error.message}\n${JSON.stringify(payload).slice(0, 400)}`);
    }
    assert.equal({}.polluted, undefined);
    assert.equal(Object.prototype.polluted, undefined);
  }
  assert.ok(accepted > 0, 'some random payloads should be valid');
});
