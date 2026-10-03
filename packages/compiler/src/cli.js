#!/usr/bin/env node
// kernel validate [content-dir]
// kernel build [content-dir] --out <dir> [--sign-key <private-key.pem>]
// kernel new program|chapter|section|lab …   start from a template that passes `kernel validate`
// kernel keygen <private-key.pem>        make a signing key; prints the public key to put in kernel.config.json
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { compile, writeBundle } from './index.js';
import { CompileError } from './diagnostics.js';
import { ScaffoldError, scaffold } from './scaffold.js';

const USAGE =
  'usage: kernel validate [content-dir]\n       kernel build [content-dir] --out <dir> [--sign-key <private-key.pem>]\n       kernel new program <id> | chapter <program> <name> | section <program> <chapter> <name> | lab <program> <name> --page chNN/slug\n       kernel keygen <private-key.pem>';

/** `kernel new <kind> <args…> [--title T] [--kind K] [--page P] [--content DIR]` */
function create(args) {
  const options = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) options[args[i].slice(2)] = args[++i];
    else positional.push(args[i]);
  }
  try {
    const files = scaffold(positional[0], positional.slice(1), options, options.content ?? 'content');
    for (const file of files) console.log(`created ${file}`);
    if (positional[0] === 'lab')
      console.log(
        `The lesson ${options.page} must use it: {% lab id="..." title="..." exercise="${positional[2]}" objectives=["chNN.skill"] %} with a lab-notes and a lab-challenge inside.`,
      );
    console.log('Next: edit it, then run `kernel validate`.');
    return 0;
  } catch (e) {
    if (!(e instanceof ScaffoldError)) throw e;
    console.error(e.message);
    return 1;
  }
}

/** Make an ECDSA P-256 signing key: the private key goes to a file, the public key is printed. */
function keygen(file) {
  if (!file) {
    console.error(USAGE);
    return 2;
  }
  if (fs.existsSync(file)) {
    console.error(`${file} already exists; it was not overwritten.`);
    return 1;
  }
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  fs.writeFileSync(file, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  const { x, y } = publicKey.export({ format: 'jwk' });
  console.log(`Private key written to ${file}. Keep it secret (a CI secret is ideal).`);
  console.log('Add this to kernel.config.json to require signed content:');
  console.log(JSON.stringify({ publicKey: { kty: 'EC', crv: 'P-256', x, y } }, null, 2));
  return 0;
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === 'keygen') return keygen(rest[0]);
  if (command === 'new') return create(rest);
  const outFlag = rest.indexOf('--out');
  const out = outFlag >= 0 ? rest[outFlag + 1] : null;
  const keyFlag = rest.indexOf('--sign-key');
  const keyFile = keyFlag >= 0 ? rest[keyFlag + 1] : null;
  const flagValues = new Set([outFlag, keyFlag].filter((i) => i >= 0).map((i) => i + 1));
  const contentDir = rest.find((arg, i) => !arg.startsWith('--') && !flagValues.has(i)) ?? 'content';
  if (!['validate', 'build'].includes(command) || (command === 'build' && !out)) {
    console.error(USAGE);
    return 2;
  }
  const started = performance.now();
  try {
    // The private key comes from a file, or from KERNEL_SIGNING_KEY (for a CI secret). Without one the bundle is unsigned.
    const pem = keyFile ? fs.readFileSync(keyFile, 'utf8') : process.env.KERNEL_SIGNING_KEY;
    const signingKey = command === 'build' && pem?.trim() ? crypto.createPrivateKey(pem) : null;
    const { files, diagnostics, stats } = await compile(contentDir, { signingKey });
    if (diagnostics.warnings.length) console.warn(diagnostics.format());
    if (command === 'build') writeBundle(files, path.resolve(out));
    const ms = Math.round(performance.now() - started);
    console.log(
      `${command === 'build' ? 'Built' : 'Validated'} ${stats.programs} program(s), ${stats.pages} pages` +
        (command === 'build' ? ` into ${out}${signingKey ? ' (signed)' : ''}` : '') +
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
