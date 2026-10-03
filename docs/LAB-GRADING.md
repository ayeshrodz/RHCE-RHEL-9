# Local lab feedback

Run `lab update` on workstation to install the current helper (version 5 or later reads the typed exercise catalog). An older `lab` command still starts exercises without setup actions; for an exercise that has them, it stops with "Run: lab update" instead of preparing it half-way. Grade before `lab finish`, while the project and host state still exist:

```sh
lab grade system-storage
lab grade file-manage --checkpoint copied
lab grade system-archive --json > system-archive-result.json
```

The grader reads project files, resolves inventory with Ansible, and sends fixed, read-only checks through Ansible's `raw` module. Each check is a typed description from the exercise catalog; the grader builds the command from the check's values, quoted, and never runs text from the catalog as a command. It does not run your playbook or repair the managed hosts. Run your playbooks again yourself and perform the reboot checks requested by each exercise.

- **PASS**: the named requirement was observed.
- **FAIL**: a file, host, or resulting state does not meet the requirement.
- **SKIP**: that check could not run. Check inventory, SSH, sudo, installed tools, and host readiness.

Exit codes are `0` when every check passes, `1` for unmet requirements, and `2` for an environment or execution problem. A result is practice evidence for the checks listed; it does not certify the whole playbook or predict an exam result.

## Checkpoints

The default checkpoint is `final`. Earlier checkpoints preserve a useful place to grade before a later task changes the state:

| Exercise | Earlier checkpoint | When to run it |
| --- | --- | --- |
| `file-manage` | `copied` | After copying the file with its custom SELinux context |
| `file-manage` | `edited` | After adding the line and block, before deleting the file |
| `role-galaxy` | `applied` | While the temporary `student2` account exists |
| `system-software` | `installed` | Before removing the practice package |
| `system-process` | `scheduled` | Before removing the recurring cron job |
| `review-playbooks` | `deployed` | Before stopping Apache to demonstrate rescue |
| `review-playbooks` | `rescued` | While Apache is stopped and the failed request is recorded |

The final review-playbooks checkpoint expects Apache running again and the earlier rescue log retained.

The final scheduling check waits for the one-off job's output, so run it after the scheduled minute has elapsed. Reboot persistence is a separate learner action.

## Report format

New reports use `app: "kernel-path-lab"` and `version: 1`. Reports from the previous `playbook-path-lab` helper remain accepted. They include `exerciseId`, `exerciseVersion`, `checkpointId`, `checkedAt`, and `checks`. Each check has a stable `id`, a lower-case `status` (`pass`, `fail`, or `skip`), a message, and a lesson link. Reports contain check results rather than command output or secret values. The browser validates a report before saving it.

The web-release assessment now teaches the Kernel Path page text and `/etc/kernel-path/release-token`. Its grader also accepts the earlier page name and `/etc/playbook-path/release-token` with the same required permissions, so existing completed projects and their reports remain valid. This compatibility does not change exercise IDs, checkpoints, or required skills.

## Contributing checks

Exercises are defined in `content/programs/<program>/lab/<name>.yml`; see the authoring guide ([exercises](AUTHORING.md)). The compiler turns them into the `graders.json` catalog that the grader reads. List required project files, then add `checks` of the typed kinds for the resulting host state. Every check on managed hosts must declare its required inventory host names in `targets`; omitting a host must not turn a partial result into a pass. Prefer several small checks to one large one, so a failure points at one requirement.

Add a named checkpoint when later tasks remove or replace earlier results. Mark intentionally broken troubleshooting starters with `intentionalFaults: true`. A new kind of check is added to `packages/lab-tools/grade.py` and the lab schema together, with a test that runs the generated command against this machine.

Run `npm run test:labs`. The tests compile the real exercises and exercise every check against passing, failing and unreachable responses, run the generated commands for real where they only read local facts, and prove that hostile values stay inside quotes. They do not replace validation on real VMs: run each exercise's solution, a deliberate broken state, repeat execution, reset behavior and reboot persistence, and record the tested stack in `docs/VALIDATION.md`.

Starter downloads and setup run in a staging step before existing work is archived. A setup failure leaves `.lab-not-ready`, returns an error, and prevents grading until the exercise has been prepared successfully. No exercise downloads or runs a script of its own.
