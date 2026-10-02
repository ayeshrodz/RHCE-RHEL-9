# @kernel-path/schema

The content contract for Kernel Path. It's framework-neutral JSON shared by the content compiler, the engine and the lab tools:

| Folder | Contents |
| --- | --- |
| `schemas/source/` | What authors write: site, program, chapter, section frontmatter, objectives, theme tokens, lab exercises |
| `schemas/data/` | Page data behind tags such as `quiz`, `practice`, `flashcards` and `flow-map` |
| `schemas/bundle/` | What the compiler emits and the engine reads: `site.json`, program manifests, page render trees |
| `catalog/components.json` | Every tag content may use, with its typed attributes, children, parents and data schema |

All schemas use JSON Schema 2020-12. See [docs/architecture.md](../../docs/architecture.md) for the design and the security model.
