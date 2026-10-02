// Size limits for compiled bundle files, in bytes. The compiler refuses to emit a larger file and
// the engine refuses to parse a larger response, so neither a careless author nor a tampered
// CDN can make a browser parse an enormous document.
export const MAX_BYTES = {
  site: 64_000,
  interface: 1_000_000,
  legacy: 1_000_000,
  manifest: 1_000_000,
  page: 1_000_000,
  search: 5_000_000,
  signature: 4_000,
};
