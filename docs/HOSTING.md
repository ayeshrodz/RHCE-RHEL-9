# Hosting

Kernel Path needs nothing but static files. The default is GitHub Pages; the same files work on any static host or CDN.

## GitHub Pages (default)

The deploy workflow builds `dist/` and publishes it. The site, its content (`dist/content/`) and the lab tree (`dist/lab/`) are served from one origin, and the content security policy in `index.html` allows only that origin.

GitHub Pages cannot send custom headers, so the content security policy is a `<meta>` tag, and anti-framing protection (`frame-ancestors`) is not available. The cache lifetime is fixed at about ten minutes; content files carry a hash in their name, so a stale cache never mixes versions. Only `site.json` and `kernel.config.json` are unhashed.

## Content on another host (S3, a CDN)

Set `contentBase` in `dist/kernel.config.json` (no rebuild needed) and upload the contents of `dist/content/` there.

1. **CORS.** The content host must answer with `Access-Control-Allow-Origin` for the site's origin (or `*`; the content is public). Only `GET` is used.
2. **Security policy.** The `<meta>` policy in `index.html` must list the content origin in `connect-src`. The build writes it from `contentBase`; if you change `dist/kernel.config.json` afterwards, run `node scripts/inject-meta.mjs dist` again to update the policy (it is safe to repeat).
3. **Cache.** Files with a hash in their name never change: serve them with a long `Cache-Control: public, max-age=31536000, immutable`. Serve `site.json` with a short lifetime (a minute or so), because it is the entry point that names the current files.
4. **Both versions at once.** Upload the new hashed files before the new `site.json`, and keep the old files for a while, so a reader who loaded the old index can still finish.

## Signed content (optional)

Content is already fingerprinted: the engine rejects any file whose bytes do not match the hash in its name. Signing goes further and protects against someone who can replace `site.json` itself on the content host.

```bash
node packages/compiler/src/cli.js keygen signing-key.pem   # prints the public key
```

1. Store the private key as the repository **secret** `KERNEL_SIGNING_KEY` (the whole PEM text). Never commit it.
2. Store the printed public key (the JSON object after `"publicKey":`) as the repository **variable** `KERNEL_PUBLIC_KEY`.
3. The deploy workflow signs the content during the build and pins the key in `kernel.config.json`. The build fails if the key and the signature do not match, or if the key is set and the content is unsigned.

With a key pinned, the engine refuses unsigned content, content signed by another key, and any index that was changed after signing. Rotate the key by generating a new one, updating both settings and redeploying. The `kernel.config.json` file itself comes from the same deployment as the engine, so protect the deployment as you would the code.

The lab tools published in `lab/` are code that learners run. They are fingerprinted by the deployment but not signed in this version.
