import test from 'node:test';
import assert from 'node:assert/strict';
import { tableColumnWidths } from '../src/lib/tableLayout.js';

test('description columns receive more space without starving compact columns', () => {
  const widths = tableColumnWidths(['Setting', 'What it does'], [['state', 'Manage a package and verify the resulting state on the host.']]);
  assert.equal(widths.length, 2);
  assert(widths[1] > widths[0]);
  assert(widths.every((width) => width > 15));
  assert(Math.abs(widths.reduce((sum, width) => sum + width, 0) - 100) < 0.001);
});

test('one unusually long command does not change the typical column allocation', () => {
  const labels = ['Command', 'Explanation'];
  const rows = Array.from({ length: 12 }, () => ['ansible --version', 'Check the engine version and configuration.']);
  const expected = tableColumnWidths(labels, rows);
  rows.push(['x'.repeat(10000), 'Check the engine version and configuration.']);
  assert.deepEqual(tableColumnWidths(labels, rows), expected);
});

test('empty, blank-header and compact comparison tables have usable widths', () => {
  assert.deepEqual(tableColumnWidths([], []), []);
  const compact = tableColumnWidths(['', 'Yes', 'No'], [['state', 'yes', 'no']]);
  assert(compact.every((width) => Math.abs(width - 100 / 3) < 0.001));
  for (const count of [2, 3, 4, 5]) {
    const widths = tableColumnWidths(Array(count).fill('Column'), []);
    assert(widths.every((width) => Number.isFinite(width) && width > 0));
    assert(Math.abs(widths.reduce((sum, width) => sum + width, 0) - 100) < 0.001);
  }
});
