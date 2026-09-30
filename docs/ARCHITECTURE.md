# System Architecture & Technical Design

This document details the software architecture, component model, and build pipeline for the **RHCE Field Guide** web application.

---

## 1. Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 + React Router 7 | Reactive SPA architecture with hash-based routing (`/#/ch01/why-automate`). |
| **Build Tool** | Vite 8 | Fast ESM development server, sub-second HMR, optimized static build with tree-shaking. |
| **Content Engine** | `@mdx-js/rollup` + Remark + Rehype | Compiles Markdown + JSX into React components on the fly. |
| **Code Highlighting** | Shiki (`@shikijs/rehype`) | Accurate token-based syntax highlighting with dual light/dark themes (`github-light` / `github-dark`), line highlights, and title metadata. |
| **Diagram System** | Custom React SVG Kit (`src/diagrams/kit`) | Theme-adaptive, accessible vector diagrams with steppers, node inspectors, and pan/zoom capabilities. |
| **Icons & UI** | Lucide React | Modern, consistent iconography for navigation, kinds, and status indicators. |
| **Persistence** | Browser `localStorage` | Client-side tracking of completed sections, quiz results, and theme preferences (`light`, `dark`, `system`). |

---

## 2. Directory Structure

```text
RHCE/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Automated GitHub Pages CI/CD workflow
├── content/
│   ├── ch01-introducing-ansible/   # Chapter 1 MDX lessons, labs, quiz, summary
│   └── ch02-implementing-playbooks/# Chapter 2 MDX lessons, labs, quiz, summary
├── docs/
│   ├── ARCHITECTURE.md             # This technical architecture document
│   ├── AUTHORING.md                # Style guide and component reference
├── src/
│   ├── App.jsx                     # Top-level routing and MDXProvider wrapper
│   ├── main.jsx                    # Application entrypoint and theme bootstrap
│   ├── components/
│   │   ├── interactive/            # Interactive quiz, flashcards, labs, checklists
│   │   ├── layout/                 # AppShell, Header, Sidebar, TableOfContents
│   │   ├── mdx/                    # MDX primitives (Callout, Terminal, CodeBlock, etc.)
│   │   └── search/                 # Modal search dialog (Ctrl+K)
│   ├── diagrams/
│   │   ├── kit/                    # Reusable SVG primitives (Node, Arrow, Group, Stepper)
│   │   ├── ch01/                   # Chapter 1 interactive visual models
│   │   └── ch02/                   # Chapter 2 inventory and playbook models
│   ├── hooks/                      # useProgress, useSearch, useTheme
│   ├── lib/
│   │   ├── course.js               # Single source of truth for course hierarchy
│   │   ├── inventory.js            # Inventory parser and validator utilities
│   │   └── storage.js              # LocalStorage helper functions
│   ├── pages/                      # HomePage, ChapterPage, SectionPage, NotFound
│   └── styles/                     # CSS stylesheets, CSS custom properties, responsive design
├── index.html                      # Semantic HTML5 entry with pre-paint theme script
├── package.json                    # Project dependencies and npm scripts
└── vite.config.js                  # Vite configuration with MDX and path aliases
```

---

## 3. Core Architectural Subsystems

### 3.1 Course Manifest & Route Generation
- `src/lib/course.js` is the single source of truth. Every chapter and section is declared here with its slug, title, reading time, kind (`lesson`, `lab`, `quiz`, `summary`), and target MDX file.
- Pages are loaded lazily on demand using Vite's `import.meta.glob('/content/**/*.mdx')`.

### 3.2 Dynamic Search Index
- When the search dialog (`Ctrl+K`) is invoked, raw Markdown/MDX content is asynchronously pulled across all pages using `import.meta.glob('/content/**/*.mdx', { query: '?raw' })`.
- A client-side inverted index processes headings, titles, code snippets, and paragraphs for instant sub-millisecond filtering.

### 3.3 Study Progress & State Management
- Progress is stored in `localStorage` under `rhce:progress`.
- The `useProgress` hook coordinates:
  - Section completion toggles.
  - Interactive quiz answer validation and persistence.
  - Lab exercise task checklists with persistent state.
  - Visual progress rings in the header and sidebar checkmarks.

### 3.4 GitHub Pages Deployment Pipeline
- `vite.config.js` sets `base: './'`.
- Running `npm run build` generates purely static HTML, JS, and CSS in `dist/`.
- The included GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys directly to GitHub Pages on every push to `main`.
