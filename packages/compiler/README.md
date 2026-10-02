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
- Checks each tag's page data (quiz banks, decks, flows, widget copy) against its data schema.
- Validates every tag, attribute, data entry, link and output file before writing.
- Produces output that is deterministic for the same content.

**Input format.** Pages are Markdoc (`.md`) with an optional `.data.yml` beside them. Markdoc runs as a parser only: variables, functions and annotations are rejected, code blocks are never scanned for tags, and raw HTML stays text. `site.yml` lists the programs; each `programs/<id>/` folder holds a `program.yml`, `objectives.yml`, optional `details.md` and `chapters/`. `source.js` reads that tree, and the compiler checks every file against the contract.
