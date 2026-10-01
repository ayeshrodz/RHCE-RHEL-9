import test from 'node:test';
import assert from 'node:assert/strict';
import { challenges } from '../src/data/challenges.js';
import { evaluateChallenge, solutionFor } from '../src/lib/challengeEngine.js';
test('two linked challenges exist for every core chapter', () => {
  assert.equal(new Set(challenges.map((c) => c.id)).size, 20);
  for (let i = 1; i <= 10; i++) assert.equal(challenges.filter((c) => c.chapter === `ch${String(i).padStart(2, '0')}`).length, 2);
});
for (const c of challenges)
  test(`${c.id}: solution passes and empty or wrong input fails`, () => {
    assert.equal(evaluateChallenge(c, String(solutionFor(c))).passed, true);
    assert.equal(evaluateChallenge(c, '').passed, false);
    assert.equal(evaluateChallenge(c, 'incorrect').passed, false);
  });
test('equivalent YAML quoting, key order, comments and task names are accepted', () => {
  const c = challenges.find((c) => c.id === 'repair-play');
  assert.equal(
    evaluateChallenge(
      c,
      '- tasks:\n    - name: Install the package\n      ansible.builtin.dnf: {state: present, name: "httpd"}\n  hosts: web # target\n',
    ).passed,
    true,
  );
  assert.equal(evaluateChallenge(c, '- hosts: web\n  tasks: []').passed, false);
});
