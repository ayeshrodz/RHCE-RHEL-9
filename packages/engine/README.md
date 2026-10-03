# @kernel-path/engine

The browser player for Kernel Path: a React 19 and Vite 8 single-page app that renders the compiled content bundle. It runs entirely in the reader's browser and works on any static host.

**What it does**

- Reads `kernel.config.json` (where the content lives, and an optional pinned public key), fetches the site index, and loads programs and pages on demand.
- Checks every file before use: size, the fingerprint in its file name, the signature when a key is pinned, the generated schema validators, and each tag against the component catalog.
- Renders only what the contract allows: a fixed set of Markdown elements, highlighted code as token data, and catalog tags mapped to its own components. It never renders raw HTML.
- Keeps progress per program in the reader's browser (`localStorage`), validates everything it reads back, and exports and imports progress as a file.

**What it does not contain**: course text, content parsing, or syntax highlighting. Those belong to content and the compiler.

```text
src/lib/content.js           fetch, size and fingerprint checks, validators, signature
src/lib/integrity.js         hashes and signature verification (Web Crypto)
src/lib/tagCheck.js          tag attributes against the catalog
src/lib/course.js            the loaded site and the active program
src/lib/storage.js           per-program progress, import and export
src/components/content/      page renderer, tag → component registry, data-driven diagrams
src/components/              layout, interactive components, search
src/diagrams/                diagram kit and the remaining interactive kits
plugins/content-bundle.js    dev server: compiles content/ and serves it at /content and /lab
public/kernel.config.json    deploy-time configuration
```

**Adding a component.** A new kind of interaction is a platform change, not a content change:

1. Describe the tag in `packages/schema/catalog/components.json` (attributes, children, data schema).
2. Run `npm run schema:validators` and `npm run authoring:generate`.
3. Map the tag to a React component in `src/components/content/registry.jsx`.
4. Add tests, then document it where authors will look.

Content never imports engine code, so upgrading React or the build tools never changes content.

**Security rules for contributors.** No `dangerouslySetInnerHTML`, `eval`, `new Function`, inline scripts or inline event handlers; the page's content security policy forbids them and the browser tests fail on any violation. Treat everything from the content bundle and from saved progress as untrusted input.

Run it with `npm run dev` from the repository root; see the root README for the other commands.
