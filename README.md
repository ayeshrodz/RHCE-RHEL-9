# Kernel Path

[![Deploy](https://github.com/ayeshrodz/playbook-path/actions/workflows/deploy.yml/badge.svg)](https://github.com/ayeshrodz/playbook-path/actions/workflows/deploy.yml) [![Code: MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE) [![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)](LICENSE-CONTENT)

**Read it online: https://kernelpath.dev/**

**Learn Ansible automation by doing.** A free, interactive course and home-lab build that takes you from your first playbook to automating real Linux administration on RHEL 9. The path follows the objectives of the **RHCE** exam, so it doubles as exam preparation. It is written by learners, for learners, as a way to study together: short explanations combine browser activities, real Linux labs, quizzes, and summaries. A learning dashboard keeps reading, practice, confidence, and local grading evidence separate.

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
| 8. Troubleshooting Ansible | Complete |
| 9. Automating Linux Administration Tasks | Complete |
| 10. Comprehensive Review | Includes two integrated assessments |
| 11. Current Automation Workflows | Git, development containers, execution environments, archive recovery, and security |

## Quick start

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # static site in dist/
npm run preview   # serve the built site locally
npm run format    # format application code
npm run validate:content
npm test
npm run test:labs
```

## How it is built

Kernel Path is being turned into a data-only learning platform (see [docs/architecture.md](docs/architecture.md)). It is three parts plus the content:

- **The contract** (`packages/schema`): JSON schemas for content and for the compiled bundle, the catalog of tags content may use, and generated browser validators.
- **The compiler** (`packages/compiler`, the `kernel` command): validates `content/` against the contract and compiles it into a static, content-hashed bundle. Code is highlighted at build time.
- **The engine** (`packages/engine`): a React 19 + Vite 8 player. At startup it fetches the bundle from the location in `kernel.config.json`, validates every file, and renders pages through its own components. It contains no course text and never renders raw HTML.
- **A site home and program selector.** `#/` lists every program with the reader's progress, from `content/site/home.md`; the header's program menu switches between programs. A program without authored landing or dashboard copy gets built-in ones, and a planned program shows its outline.
- **No backend.** Routing lives in the URL hash (`#/rhel9-ansible/ch03/inventory`: program, chapter, section). Progress is kept separately for each program. Progress, lab checklists, quiz answers and the last page read are stored in the reader's `localStorage`, sync across tabs, and can be exported or imported from the progress menu.

```
content/                          the course (see docs/AUTHORING.md)
packages/
  schema/                         the content contract
  compiler/                       `kernel validate|build`
  lab-tools/                      `lab`, the read-only grader and the exercise setup program (run on the learner's machine)
  engine/
    src/lib/content.js            fetches and validates the bundle
    src/lib/course.js             the loaded program: chapters, pages, objectives
    src/components/content/       render-tree renderer and tag → component registry
    src/components/              layout, interactive components, search
    src/diagrams/                 diagram kit and chapter widgets (moving to generic components)
    plugins/content-bundle.js     dev server: compiles content/ and serves it at /content/
    public/kernel.config.json     where the engine loads content from
scripts/                          content checks and build helpers
tests/                            browser, phone, lab and content tests
```

`npm run build` builds the engine into `dist/` and the content bundle into `dist/content/`; the lab tree (the `lab` command, exercise starter files and the grading catalog) is also placed at `dist/lab/`, where learners install it from. To load content from somewhere else (for example a CDN), change `contentBase` in `dist/kernel.config.json`. The security policy, optional content signing and cache rules are in [docs/HOSTING.md](docs/HOSTING.md).

See [validation evidence](docs/VALIDATION.md) for the tested stack and remaining host checks, [progress compatibility](docs/PROGRESS.md) for backups, and [local grading](docs/LAB-GRADING.md) for exercise checkpoints.

## Deploying to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

1. Push the repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site appears at `https://<user>.github.io/<repo>/`.

No configuration is needed for the repository name: assets use relative paths and routes live in the URL hash (`#/rhel9-ansible/ch03/inventory`), so deep links and page refreshes work from any sub-path without a 404 fallback. `packages/engine/public/.nojekyll` stops GitHub from running Jekyll over the output.

## Contributing

Contributions are welcome: corrections, lab feedback, new chapters, diagrams. Fork the repository, make your change on a branch and open a pull request; the maintainer reviews and merges it, and merging redeploys the site. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and see [docs/AUTHORING.md](docs/AUTHORING.md) for how sections and diagrams are written. In short: write in your own words and keep commands tested.

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md). Security problems: see [SECURITY.md](SECURITY.md).

## License

- **Source code** (`packages/`, `scripts/`, build and configuration files): [MIT](LICENSE).
- **Written content** (`content/`, `docs/`) and the site's text and diagrams: [CC BY 4.0](LICENSE-CONTENT). Reuse is welcome with credit.

Red Hat, Red Hat Enterprise Linux, RHCE and Ansible are trademarks of Red Hat, Inc. This project is independent and is not affiliated with, sponsored by, or endorsed by Red Hat, Inc.
