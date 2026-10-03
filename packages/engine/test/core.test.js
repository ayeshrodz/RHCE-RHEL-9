import test from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../src/lib/jinja.js';
import { expandRange, parseInventory, graph } from '../src/lib/inventory.js';
import { matchPattern } from '../src/lib/hostPattern.js';
import { validateProgress, importProgress, exportProgress, writeStored, resetAllProgress, setProgramScope } from '../src/lib/storage.js';

setProgramScope('rhel9-ansible');

const payload = (data, version = 1) => ({ app: 'kernel-path', version, data });
test('invalid imports preserve saved progress', () => {
  writeStored('completed', ['ch02/why-automate']);
  for (const value of [null, [], { completed: false }, { completed: [42] }, { readiness: { x: 4 } }, { unknown: 1 }]) {
    assert.throws(() => importProgress(payload(value)));
    assert.deepEqual(exportProgress().data.completed, ['ch02/why-automate']);
  }
  assert.throws(() => importProgress(payload({}, 99)));
  assert.throws(() => importProgress(payload({}, '1')));
});
test('legacy exports and preferences remain compatible', () => {
  writeStored('theme', 'dark');
  for (const app of ['kernel-path', 'playbook-path', 'rhce-field-guide']) {
    for (const version of [1, 2]) {
      importProgress({ ...payload({ completed: ['ch03/inventory'], theme: 'light' }, version), app });
      assert.deepEqual(exportProgress().data, { completed: ['ch03/inventory'] });
      assert.equal(exportProgress().app, 'kernel-path');
    }
  }
  const migrated = validateProgress(payload({ 'quiz:ch03/inventory:check': { 0: 1 } }))['quiz:ch03/inventory:check'];
  assert.equal(migrated.version, 2);
  assert.equal(Object.values(migrated.items)[0].attempts[0].choice, 1);
});
test('progress exports include memory-only changes when storage is unavailable', () => {
  resetAllProgress();
  writeStored('completed', ['ch04/facts']);
  assert.deepEqual(exportProgress().data.completed, ['ch04/facts']);
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

test('shared group descendants and deep inventories have bounded traversal', () => {
  const lines = ['[root:children]', 'a0', 'b0'];
  for (let i = 0; i < 24; i++) {
    for (const side of ['a', 'b']) lines.push(`[${side}${i}:children]`, `a${i + 1}`, `b${i + 1}`);
  }
  lines.push('[a24]', 'web1');
  const inventory = parseInventory(lines.join('\n'));
  const output = graph(inventory, 'root');
  assert.match(output, /Graph output limited/);
  assert.ok(output.split('\n').length <= 5001);
  assert.deepEqual(matchPattern(inventory, 'root').hosts, ['web1']);
  assert.match(matchPattern(inventory, '~a*a*a*a*b').error, /quantifiers/);
});

test('wildcards select hosts and bound expensive learner patterns', () => {
  const inventory = parseInventory('[web]\nweb01\nweb02\ndb01');
  assert.deepEqual(matchPattern(inventory, 'w*b0?').hosts, ['web01', 'web02']);
  const longHost = parseInventory('[web]\n' + 'a'.repeat(1600) + 'b');
  assert.match(matchPattern(longHost, '*' + 'a'.repeat(600) + 'c').error, /work limit/);
});
