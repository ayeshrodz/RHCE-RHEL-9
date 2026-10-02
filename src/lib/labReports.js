import reportSchema from '../data/labReportSchema.json' with { type: 'json' };

const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const id = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9:._/-]{0,199}$/.test(value);

/** Validate before saving. Imported reports are the learner's own practice evidence. */
export function validateLabReport(report, catalog = reportSchema) {
  if (
    !record(report) ||
    !['kernel-path-lab', 'playbook-path-lab'].includes(report.app) ||
    report.version !== 1 ||
    !id(report.exerciseId) ||
    !id(report.checkpointId) ||
    !Number.isSafeInteger(report.exerciseVersion) ||
    report.exerciseVersion < 1 ||
    typeof report.checkedAt !== 'string' ||
    !Number.isFinite(Date.parse(report.checkedAt)) ||
    !Array.isArray(report.checks) ||
    report.checks.length < 1 ||
    report.checks.length > 500 ||
    JSON.stringify(report).length > 500_000
  ) {
    throw new Error('This is not a supported lab grading report.');
  }
  const seen = new Set();
  for (const check of report.checks) {
    if (
      !record(check) ||
      !id(check.id) ||
      seen.has(check.id) ||
      !['pass', 'fail', 'skip'].includes(check.status) ||
      typeof check.message !== 'string' ||
      check.message.length > 2000 ||
      typeof check.lesson !== 'string' ||
      !/^#\/ch\d+\/[a-z0-9-]+$/.test(check.lesson)
    )
      throw new Error('The lab report contains an invalid check.');
    seen.add(check.id);
  }
  if (catalog) {
    const exercise = catalog.exercises[report.exerciseId];
    const checkpoint = exercise?.checkpoints[report.checkpointId];
    if (!exercise || exercise.version !== report.exerciseVersion || !checkpoint)
      throw new Error('The exercise version or checkpoint is not supported.');
    const required = [
      ...checkpoint.files.map((file) => `file:${file}`),
      ...Object.keys(checkpoint.groups ?? {}).map((group) => `group:${group}`),
      ...(checkpoint.local ?? []).map((check) => check.id),
      ...checkpoint.probes.flatMap((probe) => probe.targets.map((host) => `${probe.id}:${host}`)),
    ];
    for (const check of report.checks) {
      const diagnostic = check.id === 'inventory' && check.status !== 'pass';
      const probe = checkpoint.probes.some(
        (probe) => check.id.startsWith(`${probe.id}:`) || (check.id === probe.id && check.status !== 'pass'),
      );
      if (!required.includes(check.id) && !diagnostic && !probe)
        throw new Error(`The lab report contains an unsupported check: ${check.id}`);
    }
    // A failed probe may produce a single SKIP when it could not reach any hosts.
    for (const expected of required) {
      const probeId = checkpoint.probes.find((probe) => expected.startsWith(`${probe.id}:`))?.id;
      if (!seen.has(expected) && !report.checks.some((check) => check.id === probeId && check.status !== 'pass')) {
        throw new Error(`The lab report is incomplete: ${expected}`);
      }
    }
    if (report.checks.some((check) => check.lesson !== exercise.lesson)) throw new Error('The report lesson does not match the exercise.');
  }
  return report;
}
