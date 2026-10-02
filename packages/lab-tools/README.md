# @kernel-path/lab

The tools learners run on their own machine, never on a server:

| File | What it does |
| --- | --- |
| `lab` | The `lab` command: `start`, `finish`, `grade`, `list`, `check`, `update`. Downloads are all-or-nothing, and nothing an exercise ships is executed. |
| `prepare.py` | Runs an exercise's typed setup actions after `lab start` has copied its starter files: certificates, Vault files, SSH keys, collection archives, Git remotes. |
| `grade.py` | Read-only grading. Builds a fixed command from each typed check, sends it to the managed hosts through Ansible's `raw` module, and reports PASS, FAIL or SKIP. |
| `setup/` | The home-lab build script and `rht-vmctl`, published beside the exercises. |

Exercises are data (see [the authoring guide](../../docs/AUTHORING.md)). The compiler turns them into the catalog these tools read (`graders.json`, version 2) and publishes the tools with it, so the installed `lab` command keeps working from `https://<site>/lab`.

**Rules that keep this safe**

- The catalog supplies values. Every command is built here from validated, quoted values; no value is ever run as a command.
- Checks only read. Grading never runs a learner's playbook or changes a managed host.
- Setup actions write inside the project folder and `~/git-repos` only.
- Python 3.9 or newer, with no packages beyond the standard library.

Tests: `npm run test:labs`.
