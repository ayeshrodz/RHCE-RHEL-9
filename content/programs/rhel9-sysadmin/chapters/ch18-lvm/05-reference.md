---
title: 'Reference: Logical volume management'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**PV / VG:** Physical extents enter a capacity pool; inspect free space before allocation.

**Logical volume:** Allocates block capacity to a named device without implying filesystem growth.

**File system:** Uses the device; grow with its format-specific tool and verify retained data.

## Command reference

| Example | Use and limits |
| --- | --- |
| `pvs -o pv_name,vg_name,pv_size,pv_free` | Inspect physical membership and free capacity. |
| `vgs` | Inspect group capacity before allocation. |
| `lvs -o lv_name,vg_name,lv_size,lv_path` | Inspect allocated size and actual device paths. |
| `lvextend -L 1536M /dev/vgpractice/data` | Request an absolute desired size on the reviewed practice LV. |
| `xfs_growfs /srv/data` | Grow mounted XFS after block capacity is available. |
| `df -hT /srv/data` | Verify filesystem capacity independently of LV size. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch18/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Calculate needed free extents before a second desired-size growth. State why pooling another disk does not itself provide redundancy.


## Documentation

- [RHEL LVM guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_logical_volumes/index)
- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
