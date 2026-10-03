// Generates the lab report schema the engine uses to validate imported grading reports,
// from the compiled exercise catalog. `--check` fails when the committed copy is stale.
import fs from 'node:fs';
import { compile } from '@kernel-path/compiler';

const { files } = await compile('content');
// Preserve the pre-manifest fallback for legacy programs only. New programs carry their
// report contract in their content manifest and never require an engine data edit.
const site = JSON.parse(files.get('site.json'));
const schema = { exercises: {} };
for (const entry of site.programs) {
  const manifest = JSON.parse(files.get(entry.manifest));
  if (entry.id === site.legacyProgram) Object.assign(schema.exercises, manifest.labReports.exercises);
}
const target = 'packages/engine/src/data/labReportSchema.json';
const output = JSON.stringify(schema, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output)
    throw new Error('Lab report schema is stale. Run node scripts/generate-report-schema.mjs');
} else fs.writeFileSync(target, output);
