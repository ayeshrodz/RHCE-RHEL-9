# RHCE Field Guide

[![Deploy](https://github.com/ayeshrodz/RHCE-RHEL-9/actions/workflows/deploy.yml/badge.svg)](https://github.com/ayeshrodz/RHCE-RHEL-9/actions/workflows/deploy.yml) [![Code: MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE) [![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)](LICENSE-CONTENT)

**Read it online: https://ayeshrodz.github.io/RHCE-RHEL-9/**

A free, interactive study guide and home-lab build for people working towards the **RHCE** certification: Ansible automation on RHEL 9. It is written by learners, for learners, as a way to study together. Every concept gets a diagram, every exercise is a checklist that remembers your progress, and every chapter ends with a quiz and a cheat sheet.

> An independent, community-made study companion. Not affiliated with, sponsored by, or endorsed by Red Hat, Inc. It is not official training material and does not replace Red Hat's courses or documentation.

## Status

| Chapter | Status |
| --- | --- |
| 0. Build Your Practice Lab | Complete (tested home lab: Rocky Linux 9 on LXD) |
| 1. Introducing Ansible | Complete |
| 2. Implementing an Ansible Playbook | Complete |
| 3. Managing Variables and Facts | Complete |
| 4. Implementing Task Control | Complete |
| 5. Deploying Files to Managed Hosts | Complete |
| 6. Managing Complex Plays and Playbooks | Complete |
| 7. Simplifying Playbooks with Roles and Collections | Complete |
| 8–10 | Planned (listed as "coming soon" in the site) |

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
  diagrams/chNN/                 chapter diagrams and interactive widgets
public/lab/                      the home-lab `lab` command and each exercise's starter files
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

## Contributing

Contributions are welcome: corrections, lab feedback, new chapters, diagrams. Fork the repository, make your change on a branch and open a pull request; the maintainer reviews and merges it, and merging redeploys the site. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and see [docs/AUTHORING.md](docs/AUTHORING.md) for how sections and diagrams are written. In short: write in your own words and keep commands tested.

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md). Security problems: see [SECURITY.md](SECURITY.md).

## License

- **Source code** (`src/`, `plugins/`, build and configuration files): [MIT](LICENSE).
- **Written content** (`content/`, `docs/`) and the site's text and diagrams: [CC BY 4.0](LICENSE-CONTENT). Reuse is welcome with credit.

Red Hat, Red Hat Enterprise Linux, RHCE and Ansible are trademarks of Red Hat, Inc. This project is independent and is not affiliated with, sponsored by, or endorsed by Red Hat, Inc.
