// The browser refuses content that does not match its file-name fingerprint or its signature.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { compile } from '@kernel-path/compiler';
import { matchesName, promisedHash, signedPayload, validPublicKey, verifySite } from '../src/lib/integrity.js';
import { MAX_BYTES } from '@kernel-path/schema/limits';

const keys = () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const { x, y } = publicKey.export({ format: 'jwk' });
  return { privateKey, jwk: { kty: 'EC', crv: 'P-256', x, y } };
};

const { privateKey, jwk } = keys();
const signed = await compile('content', { now: new Date('2026-01-01T00:00:00Z'), signingKey: privateKey });
const site = JSON.parse(signed.files.get('site.json'));
const signatureFile = JSON.parse(signed.files.get(site.signature));

test('every hashed file matches the fingerprint in its name, and a changed byte does not', async () => {
  let checked = 0;
  for (const [file, content] of signed.files) {
    if (!promisedHash(file)) continue;
    const text = typeof content === 'string' ? content : content.toString('utf8');
    assert.ok(await matchesName(file, text), file);
    assert.ok(!(await matchesName(file, text.slice(0, -1) + (text.endsWith('}') ? ' }' : '}'))), `${file} accepted an altered copy`);
    checked++;
  }
  assert.ok(checked > 100);
  assert.ok(await matchesName('site.json', 'anything'), 'unhashed files are not fingerprinted');
});

test('a signed site verifies with its key and not after any change', async () => {
  assert.ok(await verifySite(site, signatureFile, jwk));
  assert.ok(!(await verifySite({ ...site, generatedAt: '2027-01-01T00:00:00.000Z' }, signatureFile, jwk)), 'changed index');
  assert.ok(!(await verifySite({ ...site, programs: [] }, signatureFile, jwk)), 'removed programs');
  assert.ok(!(await verifySite(site, signatureFile, keys().jwk)), 'another key');
  assert.ok(
    !(await verifySite(site, { ...signatureFile, signature: signatureFile.signature.replace(/^./, (c) => (c === 'A' ? 'B' : 'A')) }, jwk)),
    'altered signature',
  );
  assert.ok(!(await verifySite(site, { ...signatureFile, alg: 'none' }, jwk)), 'unsupported algorithm');
  assert.ok(!(await verifySite(site, { alg: 'ES256', signature: 'short' }, jwk)), 'malformed signature');
});

test('the signed payload ignores only the signature field and keeps the published order', () => {
  assert.equal(signedPayload(site), JSON.stringify({ ...site, signature: undefined }));
  assert.deepEqual(
    Object.keys(JSON.parse(signedPayload(site))),
    Object.keys(site).filter((k) => k !== 'signature'),
  );
});

test('only an ECDSA P-256 public key is accepted from the configuration', () => {
  assert.ok(validPublicKey(jwk));
  for (const bad of [
    null,
    {},
    'key',
    { ...jwk, kty: 'RSA' },
    { ...jwk, crv: 'P-384' },
    { ...jwk, x: 'short' },
    { ...jwk, d: 'secret', x: 1 },
  ])
    assert.ok(!validPublicKey(bad));
});

test('no bundle file is larger than the limit for its kind', () => {
  const limit = (file) =>
    file.includes('/pages/') || file.startsWith('site/home')
      ? MAX_BYTES.page
      : file === 'site.json'
        ? MAX_BYTES.site
        : file.includes('manifest')
          ? MAX_BYTES.manifest
          : file.includes('search')
            ? MAX_BYTES.search
            : file.includes('legacy')
              ? MAX_BYTES.legacy
              : file.includes('interface')
                ? MAX_BYTES.interface
                : file.endsWith('.sig')
                  ? MAX_BYTES.signature
                  : Infinity;
  for (const [file, content] of signed.files)
    if (promisedHash(file) || file === 'site.json') assert.ok(content.length <= limit(file), file);
});
