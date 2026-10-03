---
title: Physical capacity and logical allocation
kind: lesson
minutes: 10
---

{% lead %}LVM separates physical storage from the block device your file system uses. Track free space at each layer rather than assuming one size change reaches every layer.{% /lead %}

{% objectives %}
- Create and inspect PV, VG and LV storage layers.
- Grow a logical volume and its file system with independent verification.
{% /objectives %}

## Three layers

A physical volume supplies extents to a volume group. The volume group pools capacity. A logical volume allocates some extents and appears as a block device for a file system or swap. `/dev/VG/LV` provides a meaningful device path; device-mapper names can escape hyphens, so use LVM's reported paths instead of constructing them blindly.

```bash
sudo pvs -o pv_name,vg_name,pv_size,pv_free
sudo vgs
sudo lvs -o lv_name,vg_name,lv_size,lv_path
```

Before `pvcreate`, prove the intended device is the disposable spare with no existing data, mount or VG membership. An LVM signature is not permission to overwrite it. A whole blank disk or a suitable partition can be a PV; pick one deliberate approach for the exercise.

## Allocate and leave headroom

`pvcreate /dev/sdb` initializes a spare; `vgcreate vgpractice /dev/sdb` creates a group; `lvcreate -L 1G -n data vgpractice` allocates a logical volume. The commands write metadata and affect capacity. Create a filesystem only after checking the reported LV path. Do not consume all free extents if your exercise requires later growth or snapshot headroom.

A volume group can span physical devices. Losing one device can affect logical volumes across the group; a pooled capacity view does not provide redundancy automatically. Mirrored, RAID and thin configurations have additional behavior and monitoring requirements.

## Think beyond allocation

Thin pools and snapshots can provide flexible provisioning but require capacity monitoring. A snapshot is not a separately protected backup. Metadata backups created by LVM help recover layout, not overwritten application data. `vgcfgbackup` and `vgcfgrestore` must be understood before restoration, not used as generic data recovery.

For encrypted storage, identify whether encryption is above or below the LV and include unlock requirements in boot recovery. The basic lab intentionally uses simple thick allocation so you can observe each layer directly.

## Explore the model

{% flow-map ref="model" title="Logical volume management: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch18.operations", "ch18.verification"] ref="quick" /%}


## Documentation

- [RHEL LVM guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/index)
- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
