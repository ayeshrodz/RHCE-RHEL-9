---
title: Map storage layers before writing
kind: lesson
minutes: 10
---

{% lead %}Formatting the wrong device destroys data. Establish disk identity and usage before every partition, file-system or swap creation command.{% /lead %}

{% objectives %}
- Identify blank secondary storage before partitioning.
- Create, persist and verify file systems and swap.
{% /objectives %}

## Inspect the complete map

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
findmnt /
sudo blkid
sudo wipefs -n /dev/sdb
```

The lab's spare disk is normally `/dev/sdb`; a classroom or another VM may expose `/dev/vdb`. Device names are examples, not authority. Confirm the disk's size, no mounts, no signatures and no LVM use. Also inspect `pvs`, `vgs` and `lvs` before deciding it is unused. A mounted root disk must never be the target of a practice formatting command. Stop if any evidence disagrees with the expected blank secondary disk.

A disk contains a partition table, which identifies regions. A region can hold a file system, swap or an LVM physical volume. GPT is the normal choice for new modern layouts; MBR has older size and partition constraints. `parted` and `fdisk` can edit tables; inspect the resulting boundaries and alignment. In the lab you will create a GPT and one small practice partition on the confirmed blank disk.

## File systems have different operations

`mkfs.xfs DEVICE`, `mkfs.ext4 DEVICE` and `mkfs.vfat DEVICE` create different formats and destroy previous contents. Install the appropriate tools first; vfat tools come from dosfstools. XFS is a common RHEL default, but this cloud lab's root file system can be ext4. Inspect, do not infer.

XFS grows while mounted using `xfs_growfs MOUNTPOINT` and cannot be shrunk. ext4 uses `resize2fs DEVICE` for growth and supports carefully planned offline shrinking. Never use a repair tool on an actively mounted read/write file system. Recovery starts with a backup and format-specific procedure.

## Swap is another use of storage

`mkswap` writes a swap signature; `swapon` activates it and `swapon --show` verifies it. Persistent swap uses an fstab entry. A swap file requires a filesystem-supported allocation method and mode 0600; sparse files and copy-on-write layouts need care. Swap is not a replacement for capacity analysis or a guarantee against memory pressure.

## Explore the model

{% flow-map ref="model" title="Storage and file systems: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch17.operations", "ch17.verification"] ref="quick" /%}


## Documentation

- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
