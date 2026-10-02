# Kernel Path platform architecture

Kernel Path is moving from a single course compiled into a React app to a **learning platform**: an engine maintained by the platform team, and courses ("programs") authored as data by anyone. This document is the design reference. It describes the target, the contract that makes it possible, and how the platform protects learners.

## Goals and constraints

1. **Content is data and styling, never code.** Authors write Markdown, typed tags, YAML data and theme tokens. All behaviour lives in the engine.
2. **Engine changes never force content changes.** A React upgrade, a dependency patch or a bug fix touches only the engine. Content refers to components by catalog name and typed attributes, never by implementation.
3. **Security first.** Content, compiled bundles and stored learner data are untrusted input. They are validated when content is built and again in the browser, and are rendered only through platform components.
4. **New programs need no code.** A new program is a new folder. Only a genuinely new kind of interaction needs an engine release.
5. **Free static hosting.** There is no server-side execution. Everything runs in GitHub Actions (build), in the learner's browser (rendering), or on the learner's own lab machines (lab tools). GitHub Pages serves static files only.

## Layers

| Package | Role | May depend on |
| --- | --- | --- |
| `@kernel-path/schema` | **The contract.** Source schemas, bundle schemas, the component catalog, lab actions and checks. Framework-neutral JSON. | nothing |
| `@kernel-path/compiler` | CLI `kernel`: validates content against the contract and emits the compiled bundle. | schema |
| `@kernel-path/engine` | The React player: shell, routing, renderer, catalog component implementations, learner state. The only place with React. | schema |
| `@kernel-path/lab` | The `lab` command and grader that run on the learner's workstation. Implements typed setup actions and checks. | schema |
| `content/` | Content packages. Later a separate repository or a bucket. | nothing (data only) |

Nothing imports `content/`. Content never contains `.js`, `.jsx`, `.ts`, `.css` or HTML files; the compiler rejects them.

## The contract (`packages/schema`)

**Source schemas** describe what authors write:

| File | Schema |
| --- | --- |
| `content/site.yml` | `source/site.schema.json`: platform name, links, program order, theme |
| `programs/<id>/program.yml` | `source/program.schema.json`: title, platform, status, stages, variants, reader variables, theme |
| `chapters/chNN-<name>/chapter.yml` | `source/chapter.schema.json` |
| section frontmatter | `source/section.schema.json`: title, kind, minutes, layout |
| `programs/<id>/objectives.yml` | `source/objectives.schema.json` |
| `programs/<id>/lab/<exercise>.yml` | `source/lab.schema.json`: starter files, typed setup actions, typed checks |
| theme tokens | `source/theme.schema.json`: named colour tokens with validated values only |

**The component catalog** (`catalog/components.json`) lists every tag content may use. Each entry has:

- a summary and a status (`stable`, `planned` or `legacy`)
- its placement (block or inline)
- what it may contain: nothing, Markdown, inline text, or specific child tags
- allowed parents
- typed **primitive** attributes: strings, numbers, booleans, enums and string lists, each optionally with a shared format such as `id`, `url` or `objectiveId`
- for data-driven tags, the schema of the page data entry its `ref` attribute points to (`data/*.schema.json`)

Objects are never attributes, so structured data always goes through a typed data file.

`planned` entries reserve names for components still being built (generic diagram, scenario, layer resolver, landing-page blocks). `legacy-widget` carries the bespoke widgets during the migration, with an enumerated `name`, and is removed when they are replaced.

**Bundle schemas** describe what the compiler emits and the engine reads:

| File | Contents |
| --- | --- |
| `bundle/site.schema.json` | `site.json`, the entry point and the only unhashed file |
| `bundle/manifest.schema.json` | one per program: navigation, activities, objectives, and the hashed URL of every page |
| `bundle/page.schema.json` | one per page: metadata, table of contents, typed page data, and a **render tree** |

The render tree has exactly four node types:

1. **`text`**
2. **`el`:** an allowlist of Markdown elements with an allowlist of attributes (`id`, a sanitised `href`, a hashed asset `src`, `alt`, …)
3. **`code`:** highlighted code as token data with validated colours
4. **`tag`:** a catalog component with primitive attributes

There is no node type for raw HTML, script, style or event handlers, so they cannot be expressed.

`catalog/mdx-v0-map.json` records how each MDX component used before `apiVersion` 1 becomes a tag. The migration uses it, and the contract tests use it to prove the catalog covers today's content.

### Versioning

`apiVersion` is part of every source and bundle file.

- Within an `apiVersion`, changes are additive: a new optional attribute, a new tag, or a new allowed value.
- A breaking change ships as a new `apiVersion`, together with `kernel migrate`, which rewrites content automatically.
- The engine supports the current and the previous `apiVersion`.

## Content source layout

```
content/
  site.yml
  site/home.md
  ui/<locale>.yml                       optional overrides of the engine's UI strings
  programs/<id>/
    program.yml  home.md  details.md  progress.yml  objectives.yml
    chapters/chNN-<name>/chapter.yml
    chapters/chNN-<name>/NN-<slug>.md   Markdown + tags
    chapters/chNN-<name>/NN-<slug>.data.yml
    lab/<exercise>.yml  lab/<exercise>/files/…
    assets/…
```

Folders and file names carry structure:

- A chapter folder's `chNN` prefix is its id, number and URL segment.
- A section file's number orders it, and the rest of its name is its slug.
- The sidebar, routes, search, progress and program selector are all generated from this structure.

## Rendering model

1. The compiler parses Markdown and tags with variables and functions disabled, validates every tag, attribute and data entry against the catalog, and highlights code at build time.
2. It emits content-hashed JSON.
3. The engine fetches `site.json`, then a program manifest, then pages on demand, from a `contentBase` set in a deploy-time `kernel.config.json`. The default is `./content/`, on the same origin.
4. The engine validates each payload again with validators generated at build time. It never uses `eval` or `new Function`, both of which the content security policy forbids.
5. A renderer walks the tree and maps each node to a platform component. Every component sits in an error boundary.

## Security model

**Assets to protect:**

- learners' browsers and the progress data stored in them
- learners' lab machines
- the platform's integrity
- authors' content

| Threat | Control |
| --- | --- |
| A malicious or careless author injects script or markup | Content is Markdown plus catalog tags. The compiler rejects HTML, unknown tags and attributes, and code files. The render tree cannot express HTML or script. |
| CSS injection (overlays, phishing, data exfiltration via `url()`) | No CSS, `style` or class names in content. Theming is limited to named colour tokens validated as hex or OKLCH values. |
| Malicious links (`javascript:`, `data:`) | All URLs are validated against one allowlist (internal routes, anchors, `https`, `mailto`) at compile time and again at render time. |
| A tampered or compromised content host | The engine re-validates every payload against the schemas, checks `apiVersion` compatibility, and can verify a manifest signature made in CI (ECDSA P-256 via Web Crypto). Pages are fetched only from the configured origin. |
| Malicious progress imports or corrupted storage | Every stored and imported value is validated by typed schemas with id patterns and size caps before use (extending today's `validateProgress`). |
| Content-supplied shell running on learners' machines | Labs are typed. Setup uses a fixed library of actions (`git-seed-remote`, `vault-encrypt`, `ssh-keypairs`, …) and grading a fixed library of read-only checks (`service`, `file`, `firewall`, `mount`, `git`, …). Content supplies validated values; the lab tools run platform code with quoted arguments. Placeholders such as `{hostShort}` are substituted by the tools, never by a shell. |
| Dependency or supply-chain compromise in the engine | Pinned lockfile, Dependabot, CI on every change, and SRI on engine assets. |
| Clickjacking | Not fully preventable on GitHub Pages: `frame-ancestors` needs an HTTP header. This is accepted while the site hosts no sensitive actions. |

**Browser hardening** fits GitHub Pages, so it is a `<meta>` content security policy:

- `default-src 'self'`
- `script-src 'self'`
- `connect-src` and `img-src` limited to `'self'` and the content origin
- `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`
- `require-trusted-types-for 'script'`

## Hosting

**GitHub Pages (default):**

1. CI runs the compiler, then builds the engine.
2. It publishes the engine with the bundle under `content/`.
3. The `lab` command downloads exercises from `content/lab/`.

All files except `site.json` and `kernel.config.json` are content-hashed, so the Pages cache never serves stale content.

**Separate content host (later):** point `contentBase` at an S3 or CloudFront URL and allow the engine's origin through CORS on that bucket. The engine needs no rebuild.

## Delivery phases

1. **Contract:** `packages/schema` (this phase).
2. **Compiler foundations:** `kernel validate|build` compiles today's content into the bundle, with parity tests against the current site and a route-by-route rendering snapshot tool.
3. **Engine renders from the compiled bundle**, and moves into `packages/engine`.
4. **Markdoc migration:** MDX becomes `.md` files plus `.data.yml`.
5. **Programs:** routing, scoped progress and search, variants, reader variables, UI strings.
6. **Platform home and program selector.**
7. **Generic components replace the bespoke widgets.**
8. **Typed labs.**
9. **Security hardening:** CSP, SRI, signing, fuzzing.
10. **RHEL 9 RHCSA** as a planned program.
11. **Authoring tooling and open-source readiness.**
