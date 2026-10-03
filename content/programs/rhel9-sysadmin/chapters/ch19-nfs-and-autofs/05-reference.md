---
title: 'Reference: Network file systems and autofs'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Export:** Defines server path, permitted clients and read/write identity policy.

**Map:** Associates a requested local key with a remote export.

**Triggered mount:** Remote access happens on demand; test the real child and its failure behavior.

## Command reference

| Example | Use and limits |
| --- | --- |
| `exportfs -v` | Inspect effective server exports and options. |
| `automount -m` | Inspect interpreted maps. |
| `cat /mnt/team/docs/readme.txt` | Trigger a mapped child and verify useful content. |
| `findmnt -T /mnt/team/docs/readme.txt` | Distinguish the real NFS child from its autofs parent. |
| `journalctl -u autofs -b` | Diagnose map and mount failures from this boot. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch19/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Create a direct map for the same export and explain how its key differs from the indirect docs key.


## Documentation

- [RHEL NFS guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/index)
- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
