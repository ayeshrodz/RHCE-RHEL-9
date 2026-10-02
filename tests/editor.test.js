import test from 'node:test';
import assert from 'node:assert/strict';
import { indentSelection } from '../src/lib/editor.js';

test('indent an empty editor and retain the insertion point', () => {
  assert.deepEqual(indentSelection('', 0, 0), {value: '  ', start: 2, end: 2});
});
test('indent selected lines, leaving the following unselected line alone', () => {
  assert.deepEqual(indentSelection('one\ntwo\nthree', 0, 8), {value: '  one\n  two\nthree', start: 2, end: 12});
});
test('outdent mixed indentation without deleting non-space content', () => {
  assert.deepEqual(indentSelection('  a\n b\nc', 0, 8, true), {value: 'a\nb\nc', start: 0, end: 5});
});
test('indentation round trip preserves a selected expression', () => {
  const value = 'vars:\n  name: test\nend';
  const indented = indentSelection(value, 8, 18);
  const restored = indentSelection(indented.value, indented.start, indented.end, true);
  assert.deepEqual(restored, {value, start: 8, end: 18});
});
test('outdent with a cursor inside removed spaces clamps to line start', () => {
  assert.deepEqual(indentSelection('  key', 1, 1, true), {value: 'key', start: 0, end: 0});
});
