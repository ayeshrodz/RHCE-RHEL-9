import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateEntry, latestAnswer, recordAnswer, resetQuiz } from '../src/lib/progressModel.js';
import { validateLabReport } from '../src/lib/labReports.js';
import {
  validateProgress,
  exportProgress,
  importProgress,
  writeStored,
  readStored,
  resetAllProgress,
  setProgramScope,
} from '../src/lib/storage.js';
import legacy from '../src/data/legacyActivityMap.json' with { type: 'json' };
import catalog from '../public/lab/graders.json' with { type: 'json' };

setProgramScope('rhel9-ansible');

const question = { id: 'q-stable', q: 'Choose the current value', options: ['a', 'b'], answer: 1 };
test('legacy quiz answers become retained history requiring a fresh attempt', () => {
  const key = Object.keys(legacy.quizzes)[0];
  const migrated = migrateEntry(key, { 0: 1 });
  const record = migrated.items[legacy.quizzes[key][0]];
  assert.equal(record.active, false);
  assert.equal(record.attempts[0].choice, 1);
  assert.deepEqual(migrateEntry(key, migrated), migrated);
});
test('stable task and confidence IDs preserve old positional progress', () => {
  const key = Object.keys(legacy.labs)[0];
  const migrated = migrateEntry(key, [1, 2]);
  assert.deepEqual(migrated, legacy.labs[key].slice(0, 2));
  assert.deepEqual(migrateEntry(key, migrated), migrated);
  assert.deepEqual(migrateEntry('readiness', { 'ch02:0': 2 }), { [legacy.readiness['ch02:0']]: 2 });
});
test('quiz attempts survive resets and corrected questions request another answer', () => {
  const quiz = recordAnswer({ version: 2, items: {} }, question, 1);
  assert.equal(latestAnswer(quiz.items[question.id], question), 1);
  assert.equal(latestAnswer(quiz.items[question.id], { ...question, answer: 0 }), undefined);
  const reset = resetQuiz(quiz);
  assert.equal(latestAnswer(reset.items[question.id], question), undefined);
  assert.equal(reset.items[question.id].attempts.length, 1);
  const retry = recordAnswer(reset, question, 0);
  assert.equal(retry.items[question.id].attempts.length, 2);
  assert.equal(retry.items[question.id].attempts[1].correct, false);
});
test('version two exports round-trip histories and reject malformed data atomically', () => {
  const value = recordAnswer({ version: 2, items: {} }, question, 1);
  writeStored('quiz:ch02/quiz:chapter', value);
  const backup = exportProgress();
  assert.equal(backup.version, 3);
  assert.equal(backup.program, 'rhel9-ansible');
  assert.equal(backup.app, 'kernel-path');
  importProgress(backup);
  assert.deepEqual(exportProgress().data, backup.data);
  for (const bad of [
    { version: 2, items: null },
    { version: 2, items: { a: { active: true, attempts: [{ choice: -1 }] } } },
  ]) {
    assert.throws(() => importProgress({ app: 'playbook-path', version: 2, data: { 'quiz:ch02/quiz:chapter': bad } }));
    assert.deepEqual(exportProgress().data, backup.data);
  }
});
function reportFor(name = 'system-archive') {
  const e = catalog.exercises[name],
    c = e.checkpoints.final;
  const ids = [
    ...c.files.map((f) => `file:${f}`),
    ...(c.local ?? []).map((x) => x.id),
    ...Object.keys(c.groups ?? {}).map((g) => `group:${g}`),
    ...c.probes.flatMap((p) => p.targets.map((h) => `${p.id}:${h}`)),
  ];
  return {
    app: 'kernel-path-lab',
    version: 1,
    exerciseId: name,
    exerciseVersion: e.version,
    checkpointId: 'final',
    checkedAt: new Date().toISOString(),
    checks: ids.map((id) => ({ id, status: 'pass', message: 'Requirement observed', lesson: e.lesson })),
  };
}
test('lab reports require supported versions, valid checks and complete coverage', () => {
  const report = reportFor();
  assert.equal(validateLabReport(report, catalog), report);
  for (const invalid of [
    null,
    {},
    { ...report, app: 'unrelated-app' },
    { ...report, version: 9 },
    { ...report, checks: [] },
    { ...report, checks: report.checks.slice(1) },
    { ...report, checks: [...report.checks, report.checks[0]] },
    { ...report, checkedAt: 'invalid' },
    { ...report, checks: [...report.checks, { ...report.checks[0], id: 'unknown-check' }] },
    { ...report, exerciseVersion: 99 },
  ])
    assert.throws(() => validateLabReport(invalid, catalog));
  const failing = { ...report, checks: report.checks.map((c) => ({ ...c, status: 'fail' })) };
  assert.equal(validateLabReport(failing, catalog), failing);
  assert.throws(() =>
    validateProgress({
      app: 'playbook-path',
      version: 2,
      data: { labReports: [{ ...report, checks: [{ ...report.checks[0], status: 'success' }] }] },
    }),
  );
});

test('reports for retired exercises still import', () => {
  const report = {
    app: 'playbook-path-lab',
    version: 1,
    exerciseId: 'bridge-archive',
    exerciseVersion: 1,
    checkpointId: 'final',
    checkedAt: '2026-10-01T00:00:00Z',
    checks: [{ id: 'restored:servera.lab.example.com', status: 'pass', message: 'Restored', lesson: '#/ch12/lab-archive-recovery' }],
  };
  assert.equal(validateLabReport(report, catalog), report);
});
test('renamed and legacy lab reports survive old progress imports and new exports', () => {
  for (const app of ['kernel-path-lab', 'playbook-path-lab']) {
    const report = { ...reportFor('assessment-release'), app };
    assert.equal(validateLabReport(report, catalog), report);
    for (const progressApp of ['kernel-path', 'playbook-path', 'rhce-field-guide']) {
      importProgress({ app: progressApp, version: 2, data: { labReports: [report], completed: ['ch11/assessment-release'] } });
      const backup = exportProgress();
      assert.equal(backup.app, 'kernel-path');
      assert.deepEqual(backup.data.labReports, [report]);
      assert.deepEqual(backup.data.completed, ['ch11/assessment-release']);
    }
  }
});

test('cross-tab writes and clears invalidate cached values', async () => {
  const oldWindow = globalThis.window,
    oldStorage = globalThis.localStorage;
  const values = new Map();
  let receive;
  globalThis.window = {
    addEventListener: (event, handler) => {
      if (event === 'storage') receive = handler;
    },
  };
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  try {
    const store = await import('../src/lib/storage.js?cross-tab-regression');
    store.setProgramScope('rhel9-ansible');
    store.writeStored('completed', ['ch02/why-automate']);
    values.set('rhce:rhel9-ansible@completed', JSON.stringify(['ch03/inventory']));
    receive({ key: 'rhce:rhel9-ansible@completed', newValue: values.get('rhce:rhel9-ansible@completed') });
    assert.deepEqual(store.readStored('completed', []), ['ch03/inventory']);
    values.clear();
    receive({ key: null });
    assert.deepEqual(store.readStored('completed', []), []);
    assert.deepEqual(store.exportProgress().data, {});
  } finally {
    globalThis.window = oldWindow;
    globalThis.localStorage = oldStorage;
  }
});

test('corrupt stored data cannot crash the dashboard or replace the raw backup', async () => {
  const previous = globalThis.localStorage;
  const values = new Map([
    ['rhce:rhel9-ansible@completed', 'false'],
    ['rhce:rhel9-ansible@readiness', '{broken'],
  ]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  for (const key of values.keys()) storage[key] = values.get(key);
  globalThis.localStorage = storage;
  try {
    const store = await import('../src/lib/storage.js?corrupt-data-regression');
    store.setProgramScope('rhel9-ansible');
    assert.deepEqual(store.readStored('completed', []), []);
    assert.deepEqual(store.readStored('readiness', {}), {});
    assert.deepEqual(store.exportProgress().data, {});
    assert.equal(values.get('rhce:rhel9-ansible@completed'), 'false');
    store.writeStored('completed', ['ch02/why-automate']);
    assert.deepEqual(store.exportProgress().data.completed, ['ch02/why-automate']);
  } finally {
    globalThis.localStorage = previous;
  }
});

test('progress is kept separately for each program', () => {
  setProgramScope('rhel9-ansible');
  resetAllProgress();
  writeStored('completed', ['ch02/why-automate']);
  const ansible = exportProgress();
  assert.deepEqual(ansible.data.completed, ['ch02/why-automate']);

  setProgramScope('second-program');
  assert.deepEqual(readStored('completed', []), [], 'the other program starts empty');
  assert.deepEqual(exportProgress().data, {});
  writeStored('completed', ['ch01/hello']);
  assert.deepEqual(exportProgress().data.completed, ['ch01/hello']);
  assert.throws(() => importProgress(ansible), /for the program "rhel9-ansible", not "second-program"/);

  resetAllProgress();
  assert.deepEqual(readStored('completed', []), []);
  setProgramScope('rhel9-ansible');
  assert.deepEqual(readStored('completed', []), ['ch02/why-automate'], 'resetting one program leaves the other alone');
});

test('exports from before programs existed import into the current program', () => {
  setProgramScope('second-program');
  resetAllProgress();
  importProgress({ app: 'kernel-path', version: 2, data: { completed: ['ch01/hello'] } });
  assert.deepEqual(readStored('completed', []), ['ch01/hello']);
  assert.throws(() => validateProgress({ app: 'kernel-path', version: 3, program: 'Bad Id', data: {} }), /valid program/);
  setProgramScope('rhel9-ansible');
});
