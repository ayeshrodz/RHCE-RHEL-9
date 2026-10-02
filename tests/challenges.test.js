import test from 'node:test';
import assert from 'node:assert/strict';
import { readPractice } from '../scripts/read-practice.mjs';
const challenges = readPractice();
test('two linked practice questions exist for every core chapter', () => {
  assert.equal(new Set(challenges.map((c) => c.id)).size, 22);
  for (let i = 1; i <= 11; i++) assert.equal(challenges.filter((c) => c.chapter === `ch${String(i).padStart(2, '0')}`).length, 2);
});
for (const c of challenges)
  test(`${c.id}: uses the shared multiple-choice format`, () => {
    assert.equal(c.type, 'choice');
    assert.ok(Array.isArray(c.options) && c.options.length >= 3);
    assert.equal(new Set(c.options).size, c.options.length, 'options are distinct');
    assert.equal(c.options.filter((o) => o === c.expected).length, 1, 'exactly one option is the answer');
  });
