---
title: Persistent mounts and failure behavior
kind: lesson
minutes: 10
---

{% lead %}A mount makes a file system visible at a directory. Persistent configuration should identify the storage reliably and describe what happens when it is unavailable.{% /lead %}

{% objectives %}
- Identify blank secondary storage before partitioning.
- Create, persist and verify file systems and swap.
{% /objectives %}

## Live and saved state

`mount DEVICE DIRECTORY` activates a mount now. `/etc/fstab` supplies persistent records: source, mountpoint, type, options, dump flag and check order. UUIDs avoid depending solely on enumeration order. Obtain them with `blkid`, not from a screenshot or another VM.

A mounted file system hides the original contents below its mountpoint until unmounted. Verify `findmnt -T path` before writing application data; otherwise data may land on the root file system when the expected mount is absent. `df -hT` shows the format and capacity actually mounted.

## Verify before reboot

Back up fstab, add only the reviewed practice entry, and use:

```bash
sudo findmnt --verify --verbose
sudo systemctl daemon-reload
sudo mount /srv/data
findmnt /srv/data
```

The manager converts mount configuration into units; daemon-reload follows changed fstab. An unmount/remount test should not interrupt active users. `fuser -vm /srv/data` or `lsof` can help identify why a mount is busy. Do not reach immediately for lazy or forced unmount because those options change guarantees.

## Optional storage and required data

`nofail` allows boot to proceed when a mount fails. That is suitable only when the service can tolerate the missing data and checks that it did not write into an unmounted directory. `_netdev` identifies network-dependent mounting where appropriate. Read filesystem-specific options: `nodev`, `nosuid` and `noexec` address different behaviors and do not form a complete security boundary.

Choose fsck ordering according to the format and documented policy. XFS normally uses a final field of 0; do not expect generic boot-time fsck to repair it like ext4. Rehearse console recovery from a bad entry on a snapshot-backed VM before depending on it.

Layered options such as encryption, RAID, multipath, Stratis and VDO solve additional requirements. Identify the complete layering and recovery tools first; they are extensions rather than substitutes for basic partition and mount understanding.

## Check your understanding

{% quiz id="quick" objectives=["ch17.operations", "ch17.verification"] ref="quick" /%}


## Documentation

- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
