---
title: Grow data and verify every layer
kind: lesson
minutes: 10
---

{% lead %}An enlarged logical volume does not automatically enlarge the file system inside it. Measure the block layer and filesystem layer independently.{% /lead %}

{% objectives %}
- Create and inspect PV, VG and LV storage layers.
- Grow a logical volume and its file system with independent verification.
{% /objectives %}

## Growth sequence

Check VG free extents, LV size, mount path, format and a data marker before starting. `lvextend -L +512M /dev/vgpractice/data` adds 512 MiB; `-L 1536M` requests an absolute final size. Confusing those forms can allocate much more or less than intended.

For a mounted XFS file system, grow using `xfs_growfs /srv/data`. For ext4, use `resize2fs` with the appropriate device and operating conditions. `lvextend -r` can coordinate resizing through supported tools; still verify both reported sizes and application access rather than trusting a convenience option.

```bash
sudo lvs
findmnt /srv/data
df -hT /srv/data
cat /srv/data/marker.txt
```

## Adding physical capacity

When the VG needs more space, inspect and initialize an additional disposable PV, then use `vgextend`. Increasing a virtual disk can require partition growth and `pvresize` before LVM sees the capacity. There is no single universal command for every layout. Work from the bottom up and verify after each change.

## Shrink and swap need different plans

Never `lvreduce` a mounted filesystem as a casual reversal of growth. XFS cannot shrink. Other formats may require offline filesystem shrinking before reducing the block device, with a backup and careful size alignment. Reducing the LV first can truncate filesystem data.

A swap LV requires `mkswap`, activation and persistent configuration just as a swap partition does. Resizing active swap follows a separate procedure and may cause memory pressure when deactivated. Do not practice it on a production workload merely because LVM permits the size edit.

## Verify persistence and repeatability

Use the LV's filesystem UUID in fstab, reload systemd, unmount/remount when safe, then reboot and check the marker and capacity. Re-running an additive lvextend allocates additional space; it is not idempotent. Record the desired final size and compare it before issuing a second growth command.

## Check your understanding

{% quiz id="quick" objectives=["ch18.operations", "ch18.verification"] ref="quick" /%}


## Documentation

- [RHEL LVM guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/index)
- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
