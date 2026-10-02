#!/usr/bin/env node
// kernel validate [content-dir]
// kernel build [content-dir] --out <dir>
import path from 'node:path';
import { compile, writeBundle } from './index.js';
import { CompileError } from './diagnostics.js';

const USAGE = 'usage: kernel validate [content-dir]\n       kernel build [content-dir] --out <dir>';

async function main(argv) {
  const [command, ...rest] = argv;
  const outFlag = rest.indexOf('--out');
  const out = outFlag >= 0 ? rest[outFlag + 1] : null;
  const contentDir = rest.find((arg, i) => !arg.startsWith('--') && i !== outFlag + 1) ?? 'content';
  if (!['validate', 'build'].includes(command) || (command === 'build' && !out)) {
    console.error(USAGE);
    return 2;
  }
  const started = performance.now();
  try {
    const { files, diagnostics, stats } = await compile(contentDir);
    if (diagnostics.warnings.length) console.warn(diagnostics.format());
    if (command === 'build') writeBundle(files, path.resolve(out));
    const ms = Math.round(performance.now() - started);
    console.log(
      `${command === 'build' ? 'Built' : 'Validated'} ${stats.programs} program(s), ${stats.pages} pages` +
        (command === 'build' ? ` into ${out}` : '') +
        ` in ${ms} ms.`,
    );
    return 0;
  } catch (e) {
    if (!(e instanceof CompileError)) throw e;
    console.error(e.message);
    return 1;
  }
}

process.exitCode = await main(process.argv.slice(2));
