import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLabReport, setLabReportCatalog } from '../src/lib/labReports.js';

const contract = (exercise) => ({
  exercises: {
    [exercise]: {
      version: 1,
      lesson: '#/ch02/lab',
      checkpoints: {
        final: {
          files: [],
          groups: {},
          local: [{ id: 'result' }],
          probes: [],
        },
      },
    },
  },
});
const report = (exercise) => ({
  app: 'kernel-path-lab',
  version: 1,
  exerciseId: exercise,
  exerciseVersion: 1,
  checkpointId: 'final',
  checkedAt: '2026-10-03T00:00:00Z',
  checks: [{ id: 'result', status: 'pass', message: 'Observed', lesson: '#/ch02/lab' }],
});

test('report imports follow the active program contract and reject another program', () => {
  try {
    setLabReportCatalog(contract('first-exercise'));
    assert.equal(validateLabReport(report('first-exercise')).exerciseId, 'first-exercise');
    assert.throws(() => validateLabReport(report('second-exercise')), /not supported/);
    setLabReportCatalog(contract('second-exercise'));
    assert.equal(validateLabReport(report('second-exercise')).exerciseId, 'second-exercise');
    assert.throws(() => validateLabReport(report('first-exercise')), /not supported/);
    assert.throws(() => validateLabReport({ ...report('second-exercise'), checks: [] }), /not a supported/);
    assert.throws(
      () => validateLabReport({ ...report('second-exercise'), checks: [{ ...report('second-exercise').checks[0], id: 'forged' }] }),
      /unsupported check/,
    );
  } finally {
    setLabReportCatalog(null);
  }
});
