import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync('public/lab/graders.json', 'utf8'));
const schema = { exercises: {} };
for (const [id, exercise] of Object.entries(catalog.exercises)) {
  schema.exercises[id] = { version: exercise.version, lesson: exercise.lesson, checkpoints: {} };
  for (const [name, checkpoint] of Object.entries(exercise.checkpoints)) {
    schema.exercises[id].checkpoints[name] = {
      files: checkpoint.files,
      groups: Object.fromEntries(Object.keys(checkpoint.groups ?? {}).map((group) => [group, []])),
      local: (checkpoint.local ?? []).map(({ id }) => ({ id })),
      probes: checkpoint.probes.map(({ id, targets }) => ({ id, targets })),
    };
  }
}
const target = 'src/data/labReportSchema.json';
const output = JSON.stringify(schema, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output) throw new Error('Lab report schema is stale. Run node scripts/generate-report-schema.mjs');
} else fs.writeFileSync(target, output);
