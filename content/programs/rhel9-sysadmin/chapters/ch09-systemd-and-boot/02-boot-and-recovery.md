---
title: Boot, targets and recovery
kind: lesson
minutes: 10
---

{% lead %}Recovery starts before an outage: establish console access, know your boot path, and keep a tested way to restore configuration.{% /lead %}

{% objectives %}
- Separate live service state from boot activation policy.
- Diagnose unit failures and rehearse console-based recovery.
{% /objectives %}

## From firmware to services

Firmware selects a boot entry; the boot loader loads a kernel and initramfs; early userspace locates the root file system; systemd brings up targets and units. A failure before root is mounted requires different evidence from a daemon failure after login. RHEL 9 commonly uses Boot Loader Specification entries; inspect with `grubby --info=ALL` instead of assuming one hand-edited grub.cfg controls every system.

`systemctl get-default` shows the persistent default target. `set-default multi-user.target` changes future boots; `isolate target` changes the current unit set and can stop services or your session. Rescue and emergency modes provide progressively smaller environments, with behavior affected by authentication and boot configuration. Never experiment with isolation over your only SSH connection.

## Recovery must be authorized and local

For your disposable VM, take a snapshot and open its console before changing boot behavior. A root-password recovery workflow commonly interrupts the boot entry, appends `rd.break`, remounts `/sysroot` writable, enters it with `chroot`, changes the password and schedules SELinux relabeling:

```bash
mount -o remount,rw /sysroot
chroot /sysroot
passwd root
touch /.autorelabel
exit
exit
```

These commands are for the initramfs break shell, not a running-system SSH prompt. Firmware restrictions, encrypted storage, locked boot editing or image differences can change the procedure. If the target system does not expose that break environment, use its documented rescue-media path. Relabeling can take time; do not interrupt it. Verify SELinux enforcing and normal access afterward.

## Recover a bad persistent mount

A required fstab mount can make boot fail. Use the console or rescue environment to identify the failing unit and review `/etc/fstab`. Back up the file, correct the exact entry, run `findmnt --verify`, reload systemd where available, and test the mount before rebooting. `nofail` is an intentional availability choice for optional storage, not a blanket way to hide required data failures.

The regular lab below tests a service failure without breaking boot. Rehearse password and mount recovery separately on a snapshot-backed VM with console access; record those outcomes before relying on them operationally.

## Check your understanding

{% quiz id="quick" objectives=["ch09.operations", "ch09.verification"] ref="quick" /%}


## Documentation

- [RHEL systemd guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/index)
- [RHEL recovery reference](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
