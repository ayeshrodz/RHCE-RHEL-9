---
title: 'Reference: Storage and file systems'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Partition:** A reviewed region of the confirmed disposable disk.

**File system:** Creates metadata and data layout; its UUID identifies that format instance.

**Mount:** Exposes the data at a path; verify live state and persistent fstab intent.

## Command reference

| Example | Use and limits |
| --- | --- |
| `lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS` | Map the actual root and secondary devices before writes. |
| `wipefs -n DEVICE` | Inspect signatures without removing them. |
| `blkid DEVICE` | Read the real filesystem UUID. |
| `findmnt --verify --verbose` | Check saved mount configuration before reboot. |
| `findmnt -T PATH` | Identify the filesystem actually providing a path. |
| `swapon --show` | Inspect active swap rather than a saved entry alone. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch17/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- On a separately reset spare, build an ext4 fixture and compare its resize and check tools with XFS. Never reformat the completed XFS mount in place.


## Documentation

- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
