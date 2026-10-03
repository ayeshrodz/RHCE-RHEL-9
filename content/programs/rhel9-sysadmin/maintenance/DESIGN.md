# Linux system administration on RHEL 9: content design

Revised 2026-10-04. Scope: all 22 chapters of the program.

## Audience and promise

Learners with no Linux administration experience. Every chapter teaches a small set of real tasks in plain language, shows the idea as a picture before the commands, lets the learner try it in the browser where that helps, and then has them do it on the practice lab and check the result with `lab grade`.

## The practice lab

The program uses a lighter version of the Ansible program's lab: `workstation`, `servera` and `serverb` on the same sealed `rhcebr0` network, in the same `rhce` LXD project, with the same names, addresses and passwords. There is no Ansible, no `devops` account and no `serverc`, `serverd` or `utility`. Each server has an empty 5 GiB second disk (`/dev/sdb`) for the storage chapters.

- The Ansible lab is a complete superset: its profile installs the same everyday tools, so every exercise here runs on it unchanged.
- The lighter lab cannot become the Ansible lab in place (the `devops` account is created by cloud-init on first boot), so a learner moving on tears it down and builds the Ansible lab. Both lab chapters say so.
- The same tools run in both labs: `lab` (version 6) on workstation and `rht-vmctl` (version 3) on the host. `servers` and `all` mean the VMs that exist.
- Exercises in this program set `transport: ssh`: `lab grade` reaches each server as root with the learner's SSH key, which chapter 1 sets up. Ansible exercises keep the Ansible transport.

## Chapter shape

Each chapter follows the Ansible program's structure, so the two programs look and behave the same:

1. Two to four lessons. Each opens with a lead and objectives, explains one idea at a time in short sections, draws it (diagram specs or interactive kits), shows real command output, and ends with a short quiz.
2. A guided exercise after most lessons: a `lab` tag with numbered tasks, worked solutions in reveals, and a `lab start` name where the exercise needs a project folder or grading.
3. A chapter lab: a brief, the requirements, tasks with hidden solutions, and `lab grade` with typed checks.
4. A knowledge check with explained answers, and a summary page with a cheat sheet and flashcards.

Exercise names are `sa-<topic>` (guided) and `sa-<topic>-review` (chapter lab). Every command and every expected output is run on the practice lab before it is published. The grader only reads; deliberate failure, repeat and reboot checks are written into the tasks.

## Progression

| Chapters | Stage |
| --- | --- |
| 2–5 | The shell, files, help, and text: redirection, editors, the environment, grep |
| 6–7, 10 | Users, groups, sudo, permissions, ACLs, SSH |
| 8–9, 11, 15 | Processes, services and boot, logs and time, scripts and scheduling |
| 12, 16, 20 | Networking, SELinux, the firewall |
| 13–14, 17–19 | Software, archives and transfer, disks and file systems, LVM, NFS and autofs |
| 21–22 | Containers, then a comprehensive review |

## Wording

Public text is neutral: no course or exam codes, no claims about exam content, and no references to training material. Prose is original. Commands, configuration snippets and standard file contents may match the upstream documentation.

## References

- [RHEL 9 documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9)
- [GNU Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
- [GNU Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
