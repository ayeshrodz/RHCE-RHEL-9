---
title: Repositories, packages and trust
kind: lesson
minutes: 10
---

{% lead %}A package transaction is a dependency-aware system change. Its source, signatures and lifecycle matter as much as whether the executable appears.{% /lead %}

{% objectives %}
- Manage trusted repositories and package transactions.
- Plan a reproducible RHEL 9 installation and safe update.
{% /objectives %}

## Query before changing

```bash
dnf repolist
dnf info tree
rpm -q bash
rpm -qf /usr/bin/bash
rpm -ql bash
```

DNF resolves dependencies from enabled repositories. RPM queries the installed package database and can verify tracked metadata. `rpm -V package` reports differences, which may include intentional configuration changes. Read the output's field meanings and investigate; a difference is not automatic proof of compromise.

`sudo dnf install tree` installs a package and dependencies; `sudo dnf upgrade` applies available updates; `sudo dnf remove tree` proposes removal. Review the transaction, especially dependent removals, before approving. `dnf history` records transactions, but rollback is not guaranteed if old packages are unavailable or data schemas changed. Maintain backups and application rollback separately.

## Repository configuration

Repository files under `/etc/yum.repos.d` define IDs, URLs and trust settings. Keep `gpgcheck=1` for package signature verification and import keys only from verified sources. A valid package signature establishes signing identity, not that the signer is appropriate for your system. HTTPS transport and package-signing policy solve different problems.

RHEL repository access uses the organization's registration and content-access policy. `subscription-manager identity` and `subscription-manager repos --list-enabled` inspect that path when the tool is installed. Register through your approved interactive or activation-key workflow; do not paste account passwords or keys into published commands. Rocky Linux uses its own repositories and does not register as RHEL.

## Streams and availability

RHEL 9 Application Streams can include modules, but not every package is a module and available streams vary with repository and release. Use `dnf module list` to inspect before discussing enable/reset operations. Do not switch a database or language runtime stream without migration planning. A package being available in some internet repository does not make that repository an acceptable dependency for a supported server.

## Explore the model

{% flow-map ref="model" title="Software management: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch13.operations", "ch13.verification"] ref="quick" /%}


## Documentation

- [RHEL DNF guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index)
- [RHEL automated installation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/automatically_installing_rhel/index)
