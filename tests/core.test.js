import test from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../src/lib/jinja.js';
import { expandRange, parseInventory, graph } from '../src/lib/inventory.js';
import { matchPattern } from '../src/lib/hostPattern.js';
import { validateProgress, importProgress, exportProgress, writeStored, resetAllProgress } from '../src/lib/storage.js';

const payload = (data, version = 1) => ({ app: 'playbook-path', version, data });
test('invalid imports preserve saved progress', () => {
  writeStored('completed', ['ch01/why-automate']);
  for (const value of [null, [], { completed: false }, { completed: [42] }, { readiness: { x: 4 } }, { unknown: 1 }]) {
    assert.throws(() => importProgress(payload(value)));
    assert.deepEqual(exportProgress().data.completed, ['ch01/why-automate']);
  }
  assert.throws(() => importProgress(payload({}, 99)));
  assert.throws(() => importProgress(payload({}, '1')));
});
test('legacy exports and preferences remain compatible', () => {
  writeStored('theme', 'dark');
  importProgress({ ...payload({ completed: ['ch02/inventory'], theme: 'light' }), app: 'rhce-field-guide' });
  assert.deepEqual(exportProgress().data, { completed: ['ch02/inventory'] });
  assert.deepEqual(validateProgress(payload({ 'quiz:ch02/inventory:check': { 0: 1 } })), { 'quiz:ch02/inventory:check': { 0: 1 } });
});
test('progress exports include memory-only changes when storage is unavailable', () => {
  resetAllProgress(); writeStored('completed', ['ch03/facts']);
  assert.deepEqual(exportProgress().data.completed, ['ch03/facts']);
});
test('cyclic inventories produce useful feedback instead of a stack overflow', () => {
  const inv = parseInventory('[a:children]\nb\n[b:children]\na');
  assert.match(inv.warnings.join(' '), /Cyclic/);
  assert.match(graph(inv, 'a'), /cycle/);
});
test('host range expansion is bounded and preserves padding', () => {
  assert.deepEqual(expandRange('node[01:03]').hosts, ['node01', 'node02', 'node03']);
  assert.match(expandRange('node[1:999999999999]').error, /at most/);
  assert.match(expandRange('node[9007199254740992:9007199254740993]').error, /safe integers/);
});
test('host patterns intersect and exclude groups', () => {
  const inv = parseInventory('[web]\na\nb\n[staging]\nb');
  assert.deepEqual(matchPattern(inv, 'web,!staging').hosts, ['a']);
});
test('templates reject undefined conditions and compare dictionaries by values', () => {
  assert.throws(() => render('{% if missing %}yes{% endif %}', {}), /undefined/);
  assert.equal(render('{{ a == b }}', { a: { x: 1, y: 2 }, b: { y: 2, x: 1 } }), 'True');
  assert.equal(render('{{ missing | default("safe") }}', {}), 'safe');
  assert.equal(render('{% if missing is defined %}yes{% else %}no{% endif %}', {}), 'no');
});
test('template blocks, short circuiting and loops behave as taught', () => {
  assert.equal(render('{% for x in items %}{{ loop.index }}:{{ x }}\n{% endfor %}', { items: ['a', 'b'] }), '1:a\n2:b\n');
  assert.equal(render('{% if false and missing %}bad{% else %}safe{% endif %}', {}), 'safe');
  assert.equal(render('{{ not 1 == 2 }}', {}), 'True');
  assert.throws(() => render('{% for x in items %}{{ x }}{% endfor %}', { items: Array(6000).fill('a') }), /5,000/);
  assert.throws(() => render('{% for x in a %}{% for y in a %}{{ y }}{% endfor %}{% endfor %}', { a: Array(110).fill('a') }), /step/);
  assert.throws(() => render('x'.repeat(20001), {}), /20 KB/);
  assert.throws(() => render('{{ constructor }}', {}), /undefined/);
});
