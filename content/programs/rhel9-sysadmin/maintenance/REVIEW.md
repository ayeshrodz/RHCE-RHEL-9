# Sysadmin program review order

All 24 PRs are draft and form a linear dependency chain. Each chapter PR contains only that chapter's sysadmin content, lab starter/contract and objective mappings. The separate shared-platform PR fixes behavior that applies across programs. The finalized Ansible curriculum and existing sysadmin chapter 1 are unchanged.

Review the design first, then the shared prerequisite, chapters in order and integration last. After merging a parent, retarget the next PR to main. Do not squash away the prerequisite branch without checking the next diff; if GitHub shows inherited changes after a squash merge, rebase the remaining chain before proceeding. Nothing has been deployed or merged.

| Order | PR | Branch | Depends on |
| --- | --- | --- | --- |
| 1 | [Design RHEL 9 sysadmin curriculum and lab readiness](https://github.com/ayeshrodz/kernel-path/pull/44) | `content/sysadmin-foundation` | `main` |
| 2 | [Support content-driven learning contracts across programs](https://github.com/ayeshrodz/kernel-path/pull/45) | `fix/multi-program-learning-contracts` | `content/sysadmin-foundation` |
| 3 | [Sysadmin chapter 02: Command-line essentials](https://github.com/ayeshrodz/kernel-path/pull/46) | `content/sysadmin-ch02` | `fix/multi-program-learning-contracts` |
| 4 | [Sysadmin chapter 03: Files and directories](https://github.com/ayeshrodz/kernel-path/pull/47) | `content/sysadmin-ch03` | `content/sysadmin-ch02` |
| 5 | [Sysadmin chapter 04: Getting help](https://github.com/ayeshrodz/kernel-path/pull/48) | `content/sysadmin-ch04` | `content/sysadmin-ch03` |
| 6 | [Sysadmin chapter 05: Working with text](https://github.com/ayeshrodz/kernel-path/pull/49) | `content/sysadmin-ch05` | `content/sysadmin-ch04` |
| 7 | [Sysadmin chapter 06: Users and groups](https://github.com/ayeshrodz/kernel-path/pull/50) | `content/sysadmin-ch06` | `content/sysadmin-ch05` |
| 8 | [Sysadmin chapter 07: Permissions and ACLs](https://github.com/ayeshrodz/kernel-path/pull/51) | `content/sysadmin-ch07` | `content/sysadmin-ch06` |
| 9 | [Sysadmin chapter 08: Processes](https://github.com/ayeshrodz/kernel-path/pull/52) | `content/sysadmin-ch08` | `content/sysadmin-ch07` |
| 10 | [Sysadmin chapter 09: Services and the boot process](https://github.com/ayeshrodz/kernel-path/pull/53) | `content/sysadmin-ch09` | `content/sysadmin-ch08` |
| 11 | [Sysadmin chapter 10: Secure remote access](https://github.com/ayeshrodz/kernel-path/pull/54) | `content/sysadmin-ch10` | `content/sysadmin-ch09` |
| 12 | [Sysadmin chapter 11: Logs and time](https://github.com/ayeshrodz/kernel-path/pull/55) | `content/sysadmin-ch11` | `content/sysadmin-ch10` |
| 13 | [Sysadmin chapter 12: Networking](https://github.com/ayeshrodz/kernel-path/pull/56) | `content/sysadmin-ch12` | `content/sysadmin-ch11` |
| 14 | [Sysadmin chapter 13: Software management](https://github.com/ayeshrodz/kernel-path/pull/57) | `content/sysadmin-ch13` | `content/sysadmin-ch12` |
| 15 | [Sysadmin chapter 14: Archives and file transfer](https://github.com/ayeshrodz/kernel-path/pull/58) | `content/sysadmin-ch14` | `content/sysadmin-ch13` |
| 16 | [Sysadmin chapter 15: Scripts and scheduling](https://github.com/ayeshrodz/kernel-path/pull/59) | `content/sysadmin-ch15` | `content/sysadmin-ch14` |
| 17 | [Sysadmin chapter 16: SELinux](https://github.com/ayeshrodz/kernel-path/pull/60) | `content/sysadmin-ch16` | `content/sysadmin-ch15` |
| 18 | [Sysadmin chapter 17: Storage and file systems](https://github.com/ayeshrodz/kernel-path/pull/61) | `content/sysadmin-ch17` | `content/sysadmin-ch16` |
| 19 | [Sysadmin chapter 18: Logical volume management](https://github.com/ayeshrodz/kernel-path/pull/62) | `content/sysadmin-ch18` | `content/sysadmin-ch17` |
| 20 | [Sysadmin chapter 19: Network file systems and autofs](https://github.com/ayeshrodz/kernel-path/pull/63) | `content/sysadmin-ch19` | `content/sysadmin-ch18` |
| 21 | [Sysadmin chapter 20: The firewall](https://github.com/ayeshrodz/kernel-path/pull/64) | `content/sysadmin-ch20` | `content/sysadmin-ch19` |
| 22 | [Sysadmin chapter 21: Containers with Podman](https://github.com/ayeshrodz/kernel-path/pull/65) | `content/sysadmin-ch21` | `content/sysadmin-ch20` |
| 23 | [Sysadmin chapter 22: Review and practice](https://github.com/ayeshrodz/kernel-path/pull/66) | `content/sysadmin-ch22` | `content/sysadmin-ch21` |
| 24 | [Integrate sysadmin program and document release validation](https://github.com/ayeshrodz/kernel-path/pull/67) | `content/sysadmin-integration` | `content/sysadmin-ch22` |

## Evidence and remaining work

Read [DESIGN.md](DESIGN.md) for the curriculum progression and research basis, and [VALIDATION.md](VALIDATION.md) for executed checks and their limits. Shared automated checks passed: 104 JavaScript tests, 31 lab-tool tests, full content/schema/widget validation, formatting and production build. Browser checks covered the legacy program and all 116 sysadmin routes on desktop/mobile, including a real grader report import. Selected Rodzlab exercises passed under enforcing SELinux on disposable Rocky 9.8 VMs; that is not a substitute for the remaining RHEL 9 practical review.

Keep host-sensitive chapters and integration draft until their relevant solution/failure/repeat/reset/reboot matrix is reproduced. Console recovery, installation/registration, disconnect recovery, NFS failure and enforcing-client coverage, restore verification and the final integrated scenario remain pending.
