# Delivery and merge order

These six branches form an ordered PR stack. Use merge commits while the stack is open. After each merge, retarget the next PR to `main` and rerun its checks. Squashing or rebasing requires updating the dependent branches before continuing.

| Order | PR | Branch | Scope |
| --- | --- | --- | --- |
| 1 | [#12](https://github.com/ayeshrodz/playbook-path/pull/12) | `fix/learning-correctness` | Technical corrections, safe progress imports, bounded simulations |
| 2 | [#13](https://github.com/ayeshrodz/playbook-path/pull/13) | `content/practice-curriculum` | Linux readiness, skill mappings, current workflow bridge, recovery and security labs |
| 3 | [#14](https://github.com/ayeshrodz/playbook-path/pull/14) | `feat/browser-practice` | Twenty challenges, immediate feedback, Guided and Challenge lab modes |
| 4 | [#15](https://github.com/ayeshrodz/playbook-path/pull/15) | `feat/lab-grading` | Read-only exercise checks, checkpoints, reliable preparation |
| 5 | [#16](https://github.com/ayeshrodz/playbook-path/pull/16) | `feat/learning-progress` | Stable history, dashboard, report imports, integrated assessments |
| 6 | [#17](https://github.com/ayeshrodz/playbook-path/pull/17) | `chore/platform-quality` | Accessibility, lazy loading, content/browser CI, contributor documentation, grading corrections |

Each PR describes its checks and outstanding validation. VM-dependent PRs remain drafts until their required host runs pass. [Validation evidence](VALIDATION.md) distinguishes real host checks from fixtures and lists pending work.

Merging to `main` triggers the existing GitHub Pages workflow. The maintainer controls merging and deployment. Learning stays free, static, and usable without accounts or telemetry.
