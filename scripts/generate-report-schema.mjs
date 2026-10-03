// Generates the lab report schema the engine uses to validate imported grading reports,
// from the compiled exercise catalog. `--check` fails when the committed copy is stale.
import fs from 'node:fs';
import { compile } from '@kernel-path/compiler';

const { files } = await compile('content');
const catalog = JSON.parse(files.get('lab/graders.json'));
const schema = { exercises: {} };
for (const [id, exercise] of Object.entries(catalog.exercises)) {
  schema.exercises[id] = { version: exercise.version, lesson: exercise.lesson, checkpoints: {} };
  for (const [name, checkpoint] of Object.entries(exercise.checkpoints)) {
    const checks = checkpoint.checks ?? [];
    schema.exercises[id].checkpoints[name] = {
      files: checkpoint.files ?? [],
      groups: Object.fromEntries(Object.keys(checkpoint.groups ?? {}).map((group) => [group, []])),
      // Checks on the control node report once; checks on managed hosts report once per required host.
      local: checks.filter((check) => check.on === 'control').map(({ id }) => ({ id })),
      probes: checks.filter((check) => check.on !== 'control').map(({ id, targets }) => ({ id, targets })),
    };
  }
}
const target = 'packages/engine/src/data/labReportSchema.json';
const output = JSON.stringify(schema, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output) throw new Error('Lab report schema is stale. Run node scripts/generate-report-schema.mjs');
} else fs.writeFileSync(target, output);
