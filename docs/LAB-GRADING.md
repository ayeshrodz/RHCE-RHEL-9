# Local lab feedback

Run `lab update` on workstation to install the current helper. Grade before `lab finish`, while the project and host state still exist:

```sh
lab grade system-storage
lab grade file-manage --checkpoint copied
lab grade system-archive --json > system-archive-result.json
```

The grader reads project files, resolves inventory with Ansible, and sends maintained read-only probes through Ansible's `raw` module. It does not run your playbook or repair the managed hosts. Run your playbooks again yourself and perform the reboot checks requested by each exercise.

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

Edit `public/lab/graders.json`. Every published starter manifest needs an exercise entry with a version, lesson link, and `final` checkpoint. Keep prerequisites, the challenge brief, verification guidance, and independent variations in the lesson’s MDX `<LabNotes>` and `<LabChallenge>`; see [authoring](AUTHORING.md). List required project files and add narrowly scoped, read-only probes for the resulting host state. Every probe must declare its required inventory host names in `targets`; omitting a host must not turn a partial result into a pass.

Add a named checkpoint when later tasks remove or replace earlier results. Keep intentionally broken troubleshooting starters identified in `intentionalFaults`. Never call a learner playbook from the grader. Avoid output containing passwords, private keys, or password hashes.

Run `python3 -m unittest discover -s tests -p '*_test.py'`. The fixture tests exercise report handling across passing, failing, and unreachable responses. They do not replace actual VM validation of probe commands and lesson solutions. Record real runs, repeat runs, broken states, reset behavior, and reboot persistence in `docs/VALIDATION.md`.

Starter downloads are prepared before existing work is archived. Setup failures leave `.lab-not-ready`, return an error, and prevent grading until the exercise has been prepared successfully.
