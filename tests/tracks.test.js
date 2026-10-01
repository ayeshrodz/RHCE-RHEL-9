import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readTrack } from '../scripts/read-track.mjs';

test('selected track supplies its reference metadata and content location', () => {
  const track = readTrack('content', 'rhel9');
  assert.equal(track.id, 'rhel9');
  assert.equal(track.platform.path, '/platform');
  assert.equal(track.platform.contentFile, 'tracks/rhel9/platform.mdx');
  assert.match(track.platform.title, /^RHEL 9:/);
});

test('reference discovery supports another track without changing renderer code', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'playbook-track-'));
  try {
    fs.mkdirSync(path.join(dir, 'tracks/sample'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'tracks/sample/_track.yml'), 'id: sample\nlabel: Sample track\nplatform: overview.mdx\n');
    const file = path.join(dir, 'tracks/sample/overview.mdx');
    fs.writeFileSync(file, '---\ntitle: A different learning environment\neyebrow: Sample\ndescription: Track-specific wording\n---\n');
    const track = readTrack(dir, 'sample');
    assert.equal(track.label, 'Sample track');
    assert.equal(track.platform.contentFile, 'tracks/sample/overview.mdx');
    assert.equal(track.platform.description, 'Track-specific wording');
    fs.writeFileSync(file, '---\ntitle: Missing description\neyebrow: Sample\n---\n');
    assert.throws(() => readTrack(dir, 'sample'), /missing description/);
    fs.writeFileSync(path.join(dir, 'tracks/sample/_track.yml'), 'id: sample\nlabel: Sample\nplatform: ../../outside.mdx\n');
    assert.throws(() => readTrack(dir, 'sample'), /MDX filename/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('invalid track paths fail before reading outside the content directory', () => {
  for (const id of [undefined, '../sample', '/sample', 'sample/name']) {
    assert.throws(() => readTrack('content', id), /track ID/);
  }
});
