---
title: "RHEL 9: Environment and practice"
eyebrow: Your learning environment
description: Choose a resettable RHEL 9 or Rocky 9 lab, verify its tools, and understand the evidence behind each exercise.
---

## The administration workflow

This program teaches Linux system administration on **RHEL 9**, from your first shell command to running and recovering a service. Learn the model, predict a result, perform a small change, inspect effective state, then verify the useful operation and its persistence. Reading, practice and machine evidence are different forms of progress.

The [practice-lab chapter](#/ch01/overview) builds Rocky Linux 9 VMs on LXD. The provided names and subnet belong to an isolated exercise environment. RHEL 9 can be used instead when you have appropriate media, subscription access and resettable machines. Repository registration and support integration differ between RHEL and Rocky; the core Linux procedures should still be checked against your installed versions.

## Readiness and safe resets

On workstation, check these tools:

```bash
cat /etc/os-release
command -v bash man vim tar rsync curl
rpm -q man-db man-pages vim-enhanced acl rsync
```

If required tools are missing on a home-lab VM, install them from its approved repositories:

```bash
sudo dnf install man-db man-pages vim-enhanced acl rsync curl
```

On each server, inspect `getenforce`, `systemctl is-active firewalld chronyd`, `lsblk` and the active NetworkManager profile. Keep SELinux enforcing. Install workload packages only when their lesson requires them. A fresh cloud image may lack manual viewers or container tooling; command absence is a prerequisite problem to resolve, not an option to ignore.

Host reset commands belong on the Ubuntu host. Save the current exercise evidence first. The practice-lab reset restores the VM **and its separately attached spare disk**. A VM-only snapshot does not restore storage held in an external LXD volume. Reset servera before each independent system-changing chapter, and both servera and serverb for the NFS exercise. Never reset a machine containing work you have not preserved.

Use the VM console before changing a management connection, SSH policy, mount-at-boot behavior or boot parameters. Verify the root disk and the disposable secondary disk independently before any storage write. An example device name is not proof of identity.

## Optional home-lab feedback

Every exercise includes manual verification. The optional `lab` helper downloads starter **data**, tracks project folders and calls typed read-only checks. It does not configure or reset your server. Its current grader uses Ansible only to transport those checks; no playbook writing is required for this program.

Install the helper on workstation after the new content has been published:

```bash
curl -fsSLo /tmp/kp-lab https://kernelpath.dev/lab/lab
less /tmp/kp-lab
sudo install -m 0755 /tmp/kp-lab /usr/local/bin/lab
rm /tmp/kp-lab
lab version
lab update
```

Local artifact checks need the helper's Python support. Managed-host checks additionally need the transport package:

```bash
sudo dnf install ansible-core
```

Use a dedicated key for the lab's existing `devops` transport identity, which has passwordless sudo **inside the isolated lab**. Verify each server's host-key fingerprint through the console before trusting it. On workstation, create a passphrase-protected key if you do not already have an appropriate one; do not overwrite an existing key:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-copy-id -i ~/.ssh/id_ed25519.pub devops@servera.lab.example.com
ssh-copy-id -i ~/.ssh/id_ed25519.pub devops@serverb.lab.example.com
ssh devops@servera.lab.example.com sudo -n true
ssh devops@serverb.lab.example.com sudo -n true
```

The initial lab-only devops password is `redhat`. This identity is a testing convenience, not a production privilege policy. A key or agent can need refreshing after reset or a new workstation session. Follow your installed cryptographic policy if Ed25519 is unavailable. For a provided RHEL environment, use its authorized identity and helper; do not create broad passwordless policy just to reproduce these defaults.

```bash
lab start sysadmin-02
cd ~/sysadmin-02
lab grade sysadmin-02
lab grade sysadmin-02 --json > result.json
```

The project directory contains a requirements file and, where needed, a small inventory of required hosts. Host commands in lessons still run manually as student with sudo. PASS proves only the named observed requirement; FAIL means it was not observed; SKIP means a prerequisite or connection prevented checking. Read the report rather than treating its total as a guarantee of operational competence.

A passing check of a saved file does not prove a restart, remote connection, synchronized clock, automount expiry, rootless container lifecycle or recovery procedure. Perform the independent checks requested in the lab. Import a grade report through the program dashboard where available and retain a short observation record.

## Learning sequence and workload

Each authored chapter combines two short conceptual lessons, an interactive model, a real lab, diagnostic questions and a reference sheet. Reading estimates cover the page, not the full laboratory. Allow extra time for package downloads, reboot, inspection and troubleshooting. Repeat a lab with changed constraints after recording its original result.

The final review connects service delivery, access, security, reboot behavior and data restoration. Use its handover record to identify what you can explain independently and which procedure you should repeat. Version-specific limitations and actual validation evidence are recorded in the program's maintenance files in the repository.

## Versioned references

- [RHEL 9 documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9)
- [RHEL 9 basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
- [RHEL 9 containers](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/building_running_and_managing_containers/index)

Check the installed versions before applying a latest upstream example. A Rocky 9 validation result does not establish RHEL subscription behavior, every minor release or an untested installation-media recovery path.
