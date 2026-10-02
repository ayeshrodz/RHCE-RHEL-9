import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '@kernel-path/compiler';
import { tagProblem } from '../src/lib/tagCheck.js';

test('every tag in the real content passes the browser check', async () => {
  const { files } = await compile('content');
  const site = JSON.parse(files.get('site.json'));
  const manifest = JSON.parse(files.get(site.programs[0].manifest));
  let tags = 0;
  const visit = (nodes) => {
    for (const node of nodes ?? []) {
      if (node.t === 'tag') {
        tags++;
        assert.equal(tagProblem(node), null, JSON.stringify(node).slice(0, 200));
      }
      visit(node.c);
    }
  };
  for (const file of Object.values(manifest.pages)) visit(JSON.parse(files.get(file)).tree);
  assert.ok(tags > 1000);
});

test('unknown tags, unknown attributes, wrong kinds of value and missing attributes are refused', () => {
  const problem = (node) => tagProblem({ t: 'tag', ...node });
  assert.equal(problem({ name: 'callout', attrs: { type: 'tip', title: 'Hi' } }), null);
  assert.match(problem({ name: 'script' }), /unknown component/);
  assert.match(problem({ name: 'constructor' }), /unknown component/);
  assert.match(problem({ name: '__proto__' }), /unknown component/);
  assert.match(problem({ name: 'callout', attrs: { onclick: 'alert(1)' } }), /no attribute/);
  assert.match(problem({ name: 'callout', attrs: { type: 'danger' } }), /wrong kind/);
  assert.match(problem({ name: 'callout', attrs: { title: 5 } }), /wrong kind/);
  assert.match(problem({ name: 'cards', attrs: { cols: 9 } }), /wrong kind/);
  assert.match(problem({ name: 'cards', attrs: { cols: 2.5 } }), /wrong kind/);
  assert.match(problem({ name: 'lab', attrs: { id: 'x', title: 'X', outcomes: [1, 2] } }), /wrong kind/);
  assert.match(problem({ name: 'lab', attrs: { id: 'x', title: 'X', starter: 'yes' } }), /wrong kind/);
  assert.match(problem({ name: 'lab', attrs: { id: 'x' } }), /needs the attribute 'title'/);
  assert.match(problem({ name: 'quiz', attrs: {} }), /needs the attribute 'ref'/);
});
