import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '../src/index.js';
import { createValidator } from '../src/validator.js';

test('each compiled program owns its report contract and foreign exercises cannot leak into it', async () => {
  const { files } = await compile('content');
  const site = JSON.parse(files.get('site.json'));
  const catalog = JSON.parse(files.get('lab/graders.json'));
  const owners = new Set();
  const validator = createValidator();
  for (const entry of site.programs) {
    const manifest = JSON.parse(files.get(entry.manifest));
    // Membership is independently derived from the source program exercise directory.
    const fs = await import('node:fs');
    const path = `content/programs/${entry.id}/lab`;
    assert.deepEqual(validator.check(validator.ids.bundle.manifest, manifest), []);
    const malformed = structuredClone(manifest);
    malformed.labReports = { exercises: { forged: { version: 1 } } };
    assert(validator.check(validator.ids.bundle.manifest, malformed).length > 0);
    const names = fs.existsSync(path)
      ? fs
          .readdirSync(path)
          .filter((p) => p.endsWith('.yml'))
          .map((p) => p.slice(0, -4))
      : [];
    assert.deepEqual(Object.keys(manifest.labReports.exercises).sort(), names.sort());
    for (const name of names) {
      assert(!owners.has(name));
      owners.add(name);
      assert.equal(manifest.labReports.exercises[name].version, catalog.exercises[name].version);
    }
  }
  assert.equal(owners.size, Object.keys(catalog.exercises).length);
});
