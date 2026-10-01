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

These results validate the listed cases on this stack. The remaining exercises and intermediate checkpoints still need complete VM runs with their published solutions, deliberately broken states, and applicable reboot checks. VM-dependent PRs remain drafts until their required checks are recorded.

## Automated coverage

- JavaScript regression tests cover import rejection without progress loss, older exports, unavailable storage, cyclic inventory groups, bounded ranges, template behavior, and all twenty browser challenge solutions with invalid inputs.
- Python fixtures exercise every grading checkpoint with successful, failing, and unreachable responses. They validate control flow and report behavior; they do not establish that each shell probe matches a real host.
- Downloader tests cover missing files, failing setup hooks, unsafe manifest paths, preservation of existing work, and successful preparation.
- Production build and formatting checks pass.
