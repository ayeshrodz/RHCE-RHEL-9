---
title: Installation and update as a lifecycle
kind: lesson
minutes: 10
---

{% lead %}A reproducible server starts with explicit installation choices and ends with a verified maintenance procedure, not just a completed installer.{% /lead %}

{% objectives %}
- Manage trusted repositories and package transactions.
- Plan a reproducible RHEL 9 installation and safe update.
{% /objectives %}

## Plan before deploying

Choose a supported RHEL 9 release, architecture, firmware path, trusted installation media, repository access, partition layout, hostname, network allocation and recovery access. Verify the media digest using the publisher's trusted reference. Decide on encryption, time sources, minimal packages and an administrative account. Keep SELinux enforcing and firewall policy intentional.

The cloud-image practice lab provides fast disposable machines. It is not a demonstration of every interactive Anaconda installation decision. Rehearse installation separately on a new VM with an empty virtual disk. Never attach an existing data disk to a practice installer unless you deliberately intend to preserve it and understand the partitioning plan.

## Kickstart expresses installation intent

A Kickstart file can record language, keyboard, timezone, repositories, storage, users and a package selection. Use RHEL 9 syntax and validate with `ksvalidator` from pykickstart when available. Validation checks syntax, not that a referenced disk or repository is correct. Generated `/root/anaconda-ks.cfg` can be a starting reference after installation; review it for machine-specific devices and credentials before reuse.

Keep secrets outside reusable examples. Storage directives that clear partitions must target only the intended installation disk. Test automated installation on a fresh disposable VM and verify the result: access, disks, mount policy, time, repositories, security and reboot. Do not treat a valid Kickstart file as proof of successful provisioning.

## Maintain with a rollback decision

Record running and installed kernel versions with `uname -r` and `rpm -q kernel`. An update may install a new kernel while the old kernel remains running until reboot. `dnf check-update` returns 100 when updates exist; that is a documented state, not a broken command. For a maintenance window, review changes, preserve backups, apply updates, reboot where required, and probe the application afterward.

A local repository can be created from trusted packages with `createrepo_c`, then served over an approved transport. It requires deliberate signing and lifecycle policy. It is an extension, not a reason to disable signature verification when the network is unavailable.

## Check your understanding

{% quiz id="quick" objectives=["ch13.operations", "ch13.verification"] ref="quick" /%}


## Documentation

- [RHEL DNF guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index)
- [RHEL automated installation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/automatically_installing_rhel/index)
