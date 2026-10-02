# Validation evidence

Results recorded on 2 October 2026. VM work uses isolated copies of clean lab snapshots and separate copied data volumes.

## Documented lab stack

- Rocky Linux 9.8 guests on LXD virtual machines.
- ansible-core 2.14.18 on workstation; ansible-navigator 26.9.0.
- ansible.posix 1.5.4, community.general 9.5.13, redhat.rhel_system_roles 1.120.5.
- Home-lab disk `/dev/sdb`; classroom examples use `/dev/vdb`.

## Verified on VMs

| Exercise | Solution run | Second run | Local checks |
| --- | --- | --- | --- |
| `bridge-archive` | Passed | `changed=0` | Passed |
| `bridge-security` | Passed | `changed=0` | Passed |
| `system-storage` | Passed, XFS volumes 512 and 768 MiB | `changed=0` | Passed |
| `system-network` | Passed, dummy interface | `changed=0` | Passed |

Broken security permissions and a damaged restored file were detected by the grader. An invalid sudo policy was rejected before replacing the valid policy. Recovery succeeded, and all four graders passed after an explicit VM reboot.

These results validate the listed cases on this stack. The remaining exercises and intermediate checkpoints still need complete VM runs with their published solutions, deliberately broken states, and applicable reboot checks. VM-dependent PRs remain drafts until their required checks are recorded.

## Automated coverage

- JavaScript regression tests cover import rejection without progress loss, older exports, unavailable storage, cyclic inventory groups, bounded ranges, template behavior, and all twenty browser challenge solutions with invalid inputs.
- Python fixtures exercise every grading checkpoint with successful, failing, and unreachable responses. They validate control flow and report behavior; they do not establish that each shell probe matches a real host.
- Downloader tests cover missing files, failing setup hooks, unsafe manifest paths, preservation of existing work, and successful preparation.
- Production build and formatting checks pass.

## Learning progress and assessments

- 36 JavaScript tests pass, including version 1 migration, stable task/confidence IDs, quiz history after resets and corrections, version 2 round trips, complete lab report validation, and cross-tab cache updates.
- Chromium verified quiz persistence, legacy quiz migration, review queue links, timer persistence after reload, cross-tab updates, and the unavailable-storage message. Mobile assessment layout has no horizontal page overflow.
- The web-release assessment deployed successfully, repeated with no unexpected changes, passed its grader, served the expected page to workstation, and passed after a reboot.
- The operations assessment deployed successfully, repeated with `changed=0`, passed its grader, allowed the reporter SSH login and limited sudo command, and passed after a reboot.
