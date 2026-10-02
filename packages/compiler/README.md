# @kernel-path/compiler

The `kernel` command checks Kernel Path content against the contract in [`@kernel-path/schema`](../schema) and compiles it into a static, content-hashed bundle.

```bash
kernel validate [content-dir]             # check everything, print every error with file and line
kernel build [content-dir] --out <dir>    # check, then write the bundle
```

The bundle contains:

| File | Contents |
| --- | --- |
| `site.json` | Entry point and program list (the only unhashed file) |
| `p/<program>/manifest.<hash>.json` | Navigation, activities, objectives, page index |
| `p/<program>/pages/<page>.<hash>.json` | One page: render tree, table of contents, typed page data |
| `p/<program>/search.<hash>.json` | Search index |

**What the compiler does:**

- Highlights code at build time into token data.
- Moves structured data (quiz banks, decks, flows, widget copy) into page data.
- Validates every tag, attribute, data entry, link and output file before writing.
- Produces output that is deterministic for the same content.

**Current input format.** It reads today's content layout through `legacy-source.js`, and MDX through `mdx-bridge.js`. The bridge evaluates exports and JSX attributes statically and rejects anything that isn't data. Both modules go away when content moves to Markdoc and `programs/` folders (phases 4 and 5 in [docs/architecture.md](../../docs/architecture.md)).
