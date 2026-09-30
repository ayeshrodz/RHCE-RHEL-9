# RHCE Field Guide

A free, interactive study guide and home-lab build for the **Red Hat Certified Engineer (EX294)** exam: Ansible automation on RHEL 9, following the structure of the RH294 course. Every concept gets a diagram, every exercise is a checklist that remembers your progress, and every chapter ends with a quiz and a cheat sheet.

> An independent, community-made study companion. Not affiliated with, sponsored by, or endorsed by Red Hat, Inc.

## Status

| Chapter | Status |
| --- | --- |
| 0. Build Your Practice Lab | Complete (tested home lab: Rocky Linux 9 on LXD) |
| 1. Introducing Ansible | Complete |
| 2. Implementing an Ansible Playbook | Complete |
| 3. Managing Variables and Facts | Complete |
| 4. Implementing Task Control | Complete |
| 5–10 | Planned (listed as "coming soon" in the site) |

## Quick start

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # static site in dist/
npm run preview   # serve the built site locally
npm run format    # prettier over src/
```

## How it is built

- **React 19 + Vite 8.** Hash-based routing (`#/ch02/inventory`), so the built site works on any GitHub Pages path without server rewrites.
- **MDX content.** Each section is an `.mdx` file in `content/`. Pages can use React components directly (diagrams, quizzes, labs) without importing them.
- **Shiki** highlights code at build time, with light and dark themes.
- **Content-driven.** `plugins/content-manifest.js` builds the navigation from the `content/` folder (folder names, filenames and frontmatter), with live reload in dev.
- **No backend.** Progress, lab checklists, quiz answers and the last page read are stored in the reader's `localStorage`. They sync across open tabs and can be exported or imported as a JSON file from the progress menu in the header.

```
content/                         everything readers see (see docs/AUTHORING.md)
  _course.yml, _platform.mdx
  ch01-introducing-ansible/      _chapter.yml + one .mdx per section
plugins/content-manifest.js      builds the course manifest from content/
src/
  App.jsx, main.jsx              router + MDX provider
  lib/course.js                  helpers over the generated manifest
  lib/storage.js                 localStorage store with subscriptions
  lib/inventory.js               INI inventory parser + host range expansion
  components/layout/             header, sidebar, table of contents
  components/mdx/                code blocks, callouts, cards, tabs, steps…
  components/interactive/        Quiz, Lab/Task, Flashcards
  components/search/             client-side search (built lazily from MDX)
  diagrams/kit/                  SVG diagram primitives (Diagram, Node, Arrow…)
  diagrams/ch01, ch02/           chapter diagrams and interactive widgets
  pages/                         home, chapter overview, section, 404
  styles/                        design tokens, layout, prose, components
docs/AUTHORING.md                how to write new sections and diagrams
```

## Deploying to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

1. Push the repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site appears at `https://<user>.github.io/<repo>/`.

No configuration is needed for the repository name: assets use relative paths and routes live in the URL hash (`#/ch02/inventory`), so deep links and page refreshes work from any sub-path without a 404 fallback. `public/.nojekyll` stops GitHub from running Jekyll over the output.

## Contributing content

See [docs/AUTHORING.md](docs/AUTHORING.md). In short: add an `.mdx` file with a frontmatter title to a chapter folder, and write in your own words.
