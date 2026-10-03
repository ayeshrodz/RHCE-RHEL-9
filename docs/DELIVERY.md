# Delivery and merge order

These six branches form an ordered PR stack. All six PRs target `main` and are ready for the maintainer to merge. Use GitHub's **Create a merge commit** option in the order below. Later branches include earlier work; their diffs shrink as preceding PRs merge. Squashing or rebasing requires updating the dependent branches before continuing.

| Order | PR | Branch | Scope |
| --- | --- | --- | --- |
| 1 | [#12](https://github.com/ayeshrodz/kernel-path/pull/12) | `fix/learning-correctness` | Technical corrections, safe progress imports, bounded simulations |
| 2 | [#13](https://github.com/ayeshrodz/kernel-path/pull/13) | `content/practice-curriculum` | Linux readiness, skill mappings, current workflow bridge, recovery and security labs |
| 3 | [#14](https://github.com/ayeshrodz/kernel-path/pull/14) | `feat/browser-practice` | Twenty challenges, immediate feedback, Guided and Challenge lab modes |
| 4 | [#15](https://github.com/ayeshrodz/kernel-path/pull/15) | `feat/lab-grading` | Read-only exercise checks, checkpoints, reliable preparation |
| 5 | [#16](https://github.com/ayeshrodz/kernel-path/pull/16) | `feat/learning-progress` | Stable history, dashboard, report imports, integrated assessments |
| 6 | [#17](https://github.com/ayeshrodz/kernel-path/pull/17) | `chore/platform-quality` | Platform reference and track-owned metadata, shared activity and table styling, dashboard refinement, MDX-authored challenge briefs, expanded workflow lessons, accessibility, lazy loading, content/browser CI, contributor documentation, grading corrections |

Each PR describes its checks and outstanding validation. The maintainer requested ready-to-merge status on 2 October 2026; remaining VM and desktop workflow checks are still pending. Ready status does not establish that those checks passed. [Validation evidence](VALIDATION.md) distinguishes real host checks from fixtures and lists pending work.

PR #11, the earlier site rename, is already merged. No branch-protection rules have been relaxed to enable these merges.

Merging to `main` triggers the existing GitHub Pages workflow. The maintainer controls merging and deployment. Learning stays free, static, and usable without accounts or telemetry.
