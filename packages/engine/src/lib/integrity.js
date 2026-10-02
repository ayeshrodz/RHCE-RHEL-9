// Integrity checks for the content bundle. File names carry a hash of their content, so a file
// swapped on a CDN is detected; a site can also publish a signature that the deploy-time
// configuration pins to a public key, so a tampered bundle as a whole is refused.

const encoder = new TextEncoder();
const HASH_IN_NAME = /\.([a-f0-9]{8,64})\.(?:json|sig)$/;

const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
const bytes = (base64url) => Uint8Array.from(atob(base64url.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export const canCheckIntegrity = () => typeof crypto !== 'undefined' && !!crypto.subtle;

/** The hash a bundle file name promises, or null for an unhashed file such as site.json. */
export const promisedHash = (file) => HASH_IN_NAME.exec(file)?.[1] ?? null;

/** Does `text` match the hash in its file name? Files without a hash always match. */
export async function matchesName(file, text) {
  const promised = promisedHash(file);
  if (!promised) return true;
  const digest = hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
  return digest.startsWith(promised);
}

/** The text that is signed: the site index without its signature field, in its published key order. */
export function signedPayload(site) {
  const { signature, ...rest } = site;
  return JSON.stringify(rest);
}

/** Is a configured public key shaped like an ECDSA P-256 public JWK? */
export function validPublicKey(jwk) {
  return (
    jwk !== null &&
    typeof jwk === 'object' &&
    jwk.kty === 'EC' &&
    jwk.crv === 'P-256' &&
    typeof jwk.x === 'string' &&
    typeof jwk.y === 'string' &&
    /^[A-Za-z0-9_-]{43}$/.test(jwk.x) &&
    /^[A-Za-z0-9_-]{43}$/.test(jwk.y)
  );
}

/** Verify the signature file against the site index and the pinned public key. */
export async function verifySite(site, signatureFile, jwk) {
  if (signatureFile?.alg !== 'ES256' || typeof signatureFile.signature !== 'string' || !/^[A-Za-z0-9_-]{86}$/.test(signatureFile.signature))
    return false;
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, bytes(signatureFile.signature), encoder.encode(signedPayload(site)));
}
