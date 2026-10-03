# Validation record

Review date: 2026-10-03. This is an authoring and review record, not learner material. Production was inspected but not deployed. Nothing was merged.

## Content and application

The curriculum adds 105 lesson/lab/quiz/reference pages across chapters 2–22, preserving the nine existing chapter 1 pages. It includes 21 original diagrams, 105 quiz questions, 63 retrieval cards, 21 lab contracts and 46 mapped objectives. Application behavior comes from shared components; course text and configuration remain under this program.

Every chapter branch was independently compiled and schema-validated against its actual committed snapshot. Full content, widget, schema generation and author support checks passed. All 104 shared JavaScript tests and 31 Python lab-tool tests passed, as did formatting and production build. The existing browser suite covered 130 legacy routes, 44 authored lab modes and the existing mobile and accessibility behaviors. A separate sysadmin browser check covered all 116 program routes at 1440 and 320 pixels, with no horizontal overflow or load failures. It imported a real passing sysadmin-02 grader report and checked the content-configured integrated-practice link.

The finalized Ansible program has no source changes. Legacy short links retain their original program. Shared platform fixes support per-program grading catalogs, generic validation and authored progress pages; they are reviewed in their own prerequisite PR.

## Rodzlab execution

Read-only inventory established Rocky Linux 9.8, enforcing SELinux, a blank secondary disk and missing optional packages. Two disposable VMs and a separate 5 GiB test volume were created for exercises; existing six lab VMs were preserved. Rocky testing verifies the compatible commands used here, not RHEL subscription behavior.

Executed checks:

- Shell/files/help/text/process/archive project fixtures and real sysadmin-02 grading, with independent content and mode checks.
- Account/group lifecycle, sudo fixture and ACL read permission with denied write; native systemd service failure and repair; timer execution.
- Persistent journal across reboot, NetworkManager dummy profile persistence, time-service inspection.
- Enforcing SELinux web-root denial followed by persistent label repair and successful HTTP retrieval; dedicated service account.
- Blank-disk XFS creation, UUID mount and remount; LVM creation and growth to 1536 MiB, XFS growth and marker retention, mount persistence after reboot.
- Rootless Podman through a normal student SSH session, Quadlet activation and lingering, persistent volume marker after logout and reboot; simple Containerfile build and run.
- Read-only NFS export on the enforcing provider; autofs access and denied write from a separate client. The client was not enforcing, so its enforcing-policy matrix remains pending.
- Remote HTTP denied with the service removed from saved firewall configuration; allowed by runtime-only addition with saved state absent; allowed after permanent addition and reload.
- Swap-file creation and activation on the scratch root file system. Its final reboot check could not complete because the LXD restart operation stalled.

Logs and screenshots are retained in the author's local /tmp/sysadmin-* artifacts for this session. They are not durable CI evidence; reviewers should reproduce the relevant scenario before leaving draft status.

## Remaining review gates

All PRs remain draft. Before publishing, reproduce full lab solutions, deliberate failure, repeat execution and cleanup on the provided RHEL 9 environment. In particular verify console password/boot recovery, installation and Kickstart in a fresh VM, RHEL registration/repositories, SSH/network disconnect recovery, NFS expiry/outage/reboot with enforcing clients, and restore verification. Check the integrated chapter 22 scenario end to end. Observation files in the grader record investigation work; they do not independently prove live network, boot, clock or container behavior.

Host-sensitive chapter PRs and the final activation PR must remain draft until their listed gates are satisfied. A validated build and the successful subset above do not imply every practical exercise has been executed.

## Lab cleanup exception

After the successful earlier reboot checks, a later LXD restart stalled. The provider is reported STOPPED while its restart operation remains busy; the client stop/delete operation also remains pending with its QEMU monitor gone. The test instances `kp-sysadmin-verify` and `kp-sysadmin-nfs`, and custom volume `kp-sysadmin-verify-disk` (including snapshots), remain for cleanup after the host's LXD operations recover. Attempts to force-stop/delete did not resolve the busy operations. No host daemon restart was performed because it would affect shared lab infrastructure. The original six VMs were confirmed RUNNING afterward.

Once operations recover, remove only these test instances with `lxc delete kp-sysadmin-verify --force` and `lxc delete kp-sysadmin-nfs --force`, then `lxc storage volume delete default kp-sysadmin-verify-disk`, in project `rhce`. Do not delete existing lab VMs or volumes. Re-run the swap persistence check in a fresh disposable VM.
