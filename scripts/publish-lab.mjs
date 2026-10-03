// The lab tree (starter files, the `lab` command, its grader) is part of the compiled bundle, but learners
// install it from the site root (https://kernelpath.dev/lab), so the build publishes it there as well.
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2] ?? 'dist';
const from = path.join(dist, 'content', 'lab');
if (fs.existsSync(from)) {
  fs.rmSync(path.join(dist, 'lab'), { recursive: true, force: true });
  fs.cpSync(from, path.join(dist, 'lab'), { recursive: true });
}
