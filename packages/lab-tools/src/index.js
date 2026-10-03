// The files the compiler publishes in the bundle's lab/ folder so that the installed
// `lab` command keeps working: the command itself, its grader and setup program, and the
// home-lab build scripts. They are platform code, reviewed with the platform.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Published file name → file contents. */
export function toolFiles() {
  const files = new Map();
  for (const name of ['lab', 'grade.py', 'prepare.py']) files.set(name, fs.readFileSync(path.join(dir, name)));
  for (const name of fs.readdirSync(path.join(dir, 'setup'))) files.set(`setup/${name}`, fs.readFileSync(path.join(dir, 'setup', name)));
  return files;
}
