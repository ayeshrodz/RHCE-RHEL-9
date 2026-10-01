# Architecture

Playbook Path is a static React application. GitHub Pages serves the built files; learning progress stays in the reader's browser. There are no accounts, server APIs, analytics, or paid dependencies.

## Content and routing

`plugins/content-manifest.js` builds `virtual:course` from chapter metadata and MDX frontmatter. `src/lib/course.js` exposes navigation and page lookup. MDX pages load on demand through Vite imports.

Published URLs use hash routing, for example `#/ch02/inventory`. A second hash identifies a heading or activity. Keep published filenames, heading text, and stable activity IDs when editing. Links into optional reveals open their containing details.

`content/_objectives.yml` maps stable skill IDs to lessons, challenges, and labs. Each chapter lists its objective IDs; quizzes and labs reference the skills they practise.

## Track boundary and platform reference

Site metadata lives in `content/_course.yml`; it names the active track. Track identity and version metadata live in `content/tracks/<id>/_track.yml`. `scripts/read-track.mjs` is shared by the content manifest and validation, and supplies the track's reference page metadata and content location. `src/lib/course.js` exposes the `track` alongside the course/chapter data.

The header badge links to `#/platform`. The lazy `ReferencePage` receives a page descriptor and loads its MDX; it contains no RHEL-specific wording. `FlowMap` renders authored steps with the existing diagram kit and muted controls. Lessons and reference pages share `useHeadingNavigation` for copied links, table-of-contents navigation, and opening optional details. Reference pages have no completion key and do not replace the last visited lesson.

This starts the content boundary for multiple tracks; it does not implement track switching. Before publishing a second track, scope chapter/objective manifests, lab downloads/grading contracts, activity IDs, and progress by track. Migrate existing saved RHEL 9 progress explicitly and preserve published URLs. Prefer explicit track URLs for shared links, and reuse components and grading engines across content packages. Keep the current RHEL 9 curriculum in place until that migration is implemented and verified.

## Shared content tables

`src/components/mdx/Table.jsx` renders all Markdown tables through the MDX component registry. It keeps content unchanged, adds explicit table/header semantics and mobile labels, and generates column widths from typical text length through `tableLayout.js`. A single exceptional command cannot dictate the table's width.

`prose.css` constrains desktop tables to the article, wraps prose and code, and keeps headers visible during long-table reading. Container queries preserve labelled row cards below 640 pixels of available table space, including tables inside lab tasks and other nested content. The renderer is shared across chapters and track reference pages; authors continue to write plain Markdown tables.

## Learning activities

`ActivityPanel`, `AnswerOptions`, and `ActivityFeedback` provide shared quiz/practice chrome. `OptionSwitch` renders both environment and exercise modes with the same muted treatment. `Reveal` supports optional controlled state for solution-view tracking; `CodeBlock` supplies the same code presentation throughout. Activity wording and grading definitions remain in MDX, separate from these rendering components.

- `Quiz.jsx` stores attempts by question ID. Question revisions come from the question, options, and answer. Corrections request another attempt and retain history.
- `Lab.jsx` stores checked task IDs separately from reading completion. Guided mode shows the procedure; Challenge mode renders explicit MDX `<LabChallenge>` requirements and keeps the full guided walkthrough closed until requested. `<LabNotes>` supplies MDX prerequisites, verification, and independent variations. Setup labs without challenge briefs expose only the walkthrough.
- Chapter quiz MDX exports define twenty browser challenges; `scripts/read-practice.mjs` reads their JSON-compatible data and `plugins/practice-manifest.js` exposes the shared dashboard registry as `virtual:challenges`. `challengeEngine.js` checks a documented subset of YAML, inventory, template, and diagnostic behavior. These are simulations, with hints and explained solutions.
- Chapter diagrams are React/SVG components. `plugins/chapter-widgets.js` discovers named default exports in chapter indexes and creates lazy wrappers. Chapter widgets, browser challenges, search, and the progress dashboard load when needed.
- `AssessmentTimer.jsx` persists an optional end time. The two integrated assessments have independent requirements, solutions, and local graders.

## Browser progress

`src/lib/storage.js` wraps individual `rhce:` localStorage keys and subscriptions. The original prefix is retained so earlier progress survives. Same-tab writes and cross-tab storage events update readers; unavailable storage falls back to memory and shows a warning.

Version 2 exports include reading completion, quiz history, task completion, challenge attempts, confidence, timers, and imported lab reports. Preferences are separate. Imports validate every entry before replacing progress. Invalid stored entries are preserved on disk, ignored by the UI, and omitted from exports.

`progressModel.js` migrates older positional activity data using the frozen `legacyActivityMap.json`. Never regenerate that map from reordered content. `labReports.js` validates imported reports against the generated, versioned `labReportSchema.json`.

The dashboard combines these independent signals into a next lesson, review queue, practice links, and skills to revisit. It does not predict an exam score.

## Local lab tooling

`public/lab/lab` downloads an exercise into a staging directory, validates downloads and setup hooks, then moves it into place. Failed preparation is explicit and preserves existing work. Starter folders use `MANIFEST`; the index and grading catalog cover every published exercise.

`grade.py` checks project files, inventory groups, and read-only host probes defined in `graders.json`. It uses the learner's Ansible connection settings. Checks report PASS, FAIL, or SKIP and link to the lesson. Grading does not run playbooks or repair systems. See [lab grading](LAB-GRADING.md) for report and exit-code contracts.

## Build and checks

React 19, React Router 7, Vite 8, MDX, Shiki, and CSS build into `dist/`. `base: './'` and hash routing support GitHub Pages.

PR CI runs formatting, content validation, JavaScript regressions, Python lab-tool tests, a production build, and Chromium learning-flow checks. Content validation covers routes and heading links, activity/objective IDs, quiz answers, starter manifests, setup syntax, and grader coverage. Browser checks cover every route plus mobile layouts, focus, persistence, and imports.

`.github/workflows/deploy.yml` publishes pushes to `main`. Maintainers control merging. VM-dependent changes stay in draft until their required host checks are recorded in [validation evidence](VALIDATION.md).
