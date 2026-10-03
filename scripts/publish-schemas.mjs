// Publishes the content schemas at the addresses their $id names (https://<site>/schema/v1/...), so
// editors and authors outside this repository can validate against them and relative $refs resolve.
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2] ?? 'dist';
const from = 'packages/schema';
const to = path.join(dist, 'schema', 'v1');
fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(path.join(from, 'schemas'), to, { recursive: true });
fs.cpSync(path.join(from, 'catalog'), path.join(to, 'catalog'), { recursive: true });
