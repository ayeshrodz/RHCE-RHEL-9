# Linux system administration on RHEL 9: content design

Design date: 2026-10-03. Scope: the existing 22 chapters, including the published practice-lab chapter. Learner material contains no credential or assessment-provider framing.

## Purpose and delivery

Develop administrators who can explain a change, perform it safely, verify its live and persistent behavior, troubleshoot a failure, and hand over an intelligible record. Keep all curriculum changes under this program. Reuse the platform contract for lessons, diagrams, quizzes, persisted lab tasks, objectives and typed read-only grading; do not add course-specific engine behavior.

Preserve the existing chapter folders and chapter 1 routes. Publish each remaining chapter as two focused lessons, a guided lab, a diagnostic quiz and a reference sheet. Use optional reveals for worked solutions. Lab brief comes before commands. Every lab states host, privilege, preconditions, measurable result, failure diagnosis and cleanup/reset. Early labs stay in a disposable project directory; later labs use resettable servers. Security remains enforcing. Storage exercises identify the blank secondary disk before writing anything. Network and remote-access changes require a console recovery path.

Progression: chapters 2–5 shell/files/help/text; 6–7 identity and discretionary access; 8–11 processes/services/remote access/observability; 12–14 network/software/data movement; 15–16 small automation and mandatory access; 17–20 local/network storage and firewall; 21 containers; 22 integrated service delivery and recovery. The review chapter links back to the relevant prerequisite rather than reteaching commands. Chapter 9 recovery and chapter 13 installation are optional extensions after their foundational pages.

## Teaching and evidence contract

Each chapter has explicit objectives mapped to both lesson routes and its lab. Diagrams explain a topic-specific relationship, with selectable explanations supplied as YAML data. Quizzes ask about consequences and diagnosis, not command trivia. Reference pages include retrieval questions and links to versioned documentation. Labs use original scenarios and names, with a second variation that changes a constraint. No copied training-book text, scripts or confidential scenarios.

Use the existing typed grader where it can observe actual results. Local checks observe real project artifacts; managed-host checks observe files, packages, services, accounts, mounts and security policy. A written observation file is evidence of an investigation, not an automated proof that a network, clock, container or boot recovery works. Explicit learner checks cover gaps. The grader transports checks with Ansible; that is an optional feedback dependency, not the subject of this program. Manual labs remain usable without it.

## Version and environment policy

Teach RHEL 9 package-mode administration. Separate RHEL registration/support from Rocky package access. Explain NetworkManager profile storage, DNF module availability, OpenSSH scp/SFTP behavior and Podman/systemd integration as version-sensitive. Prefer Quadlet when the installed Podman provides it; explain the older generated-unit path as a compatibility extension. Do not make RHEL 10-only tools prerequisites.

The production application at https://kernelpath.dev/ serves a signed data bundle. On review it advertised sysadmin as planned with nine practice-lab sections. GitHub origin is https://github.com/ayeshrodz/kernel-path; implementation starts from current origin/main. Existing unpublished Ansible content is the component and exercise reference, not a source to duplicate.

Rodzlab review: six running VMs; Rocky Linux 9.8; SELinux enforcing; systemd 252; firewalld and chrony active. servera has a 20 GiB root disk with an ext4 root file system and a blank 5 GiB secondary disk. Do not assume the root file system is XFS. man-db and Podman were missing; teach package readiness checks. Private host access details belong outside published content.

## Research basis

Public course outlines were consulted only for broad topic coverage. They currently describe RHEL 10, so all implementation references below are RHEL 9 or upstream command documentation. Installation, subscriptions, support diagnostics, practical regular expressions and small scripts supplement the existing outline. Image mode, desktop application delivery and AI assistants are optional future pathways rather than required infrastructure for this server program.

- [RHEL 9 documentation index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9)
- [Basic system settings: accounts, SSH, time, logs, recovery](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
- [DNF software management](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index)
- [systemd units](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/index)
- [Performance](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/monitoring_and_managing_system_status_and_performance/index)
- [Networking](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/index)
- [SELinux](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/index)
- [File systems](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
- [LVM](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/index)
- [NFS](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/index)
- [Firewalls](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_firewalls_and_packet_filters/index)
- [Containers](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/building_running_and_managing_containers/index)
- [Automated installation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/automatically_installing_rhel/index)
- [GNU Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
- [GNU Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
- [GNU tar manual](https://www.gnu.org/software/tar/manual/tar.html)

## Review and release gates

Use a design PR followed by dependent chapter PRs, each based on the preceding branch. Merge in order; after a parent merges, retarget its child to main. Keep host-sensitive chapters in draft until solution, deliberate failure, repeat operation, reset and reboot checks have evidence. Run schema/content validation, shared unit and lab contract tests, build, and desktop/mobile browser checks. Inspect production before changes; do not deploy or merge PRs. Record actual checks in VALIDATION.md beside this design. A passing build does not replace RHEL VM testing, console recovery, network-disruption testing or restore verification.
