import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';

/** Read the selected track's reference page without embedding its wording in UI code. */
export function readTrack(contentDir, id) {
  assert.match(id ?? '', /^[a-z][a-z0-9-]*$/, 'Invalid course track ID');
  const dir = `tracks/${id}`;
  const meta = YAML.parse(fs.readFileSync(path.join(contentDir, dir, '_track.yml'), 'utf8'));
  assert.equal(meta.id, id, 'Track metadata must match its directory');
  assert(typeof meta.label === 'string' && meta.label.trim(), 'Track needs a label');
  assert.match(meta.platform ?? '', /^[a-z][a-z0-9-]*\.mdx$/, 'Track platform must be an MDX filename');
  const contentFile = `${dir}/${meta.platform}`;
  const source = fs.readFileSync(path.join(contentDir, contentFile), 'utf8');
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(front, `${contentFile}: missing frontmatter`);
  const page = YAML.parse(front[1]);
  for (const field of ['title', 'eyebrow', 'description']) {
    assert(typeof page[field] === 'string' && page[field].trim(), `${contentFile}: missing ${field}`);
  }
  return { ...meta, id, label: meta.label, platform: { ...page, contentFile, path: '/platform' } };
}
