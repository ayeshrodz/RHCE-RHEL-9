---
title: 'Reference: Archives and file transfer'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Retained source:** Capture stable data with an explicit content and metadata policy.

**Protected archive:** Store the archive and trusted digest separately from a writable live tree.

**Restore rehearsal:** Extract to an empty destination, compare metadata and test intended access.

## Command reference

| Example | Use and limits |
| --- | --- |
| `tar -czf backup.tar.gz -C source .` | Archive relative content with gzip compression. |
| `tar -tzf backup.tar.gz` | Inspect stored paths before extraction. |
| `sha256sum -c backup.sha256` | Compare bytes against the retained reference digest. |
| `tar --acls --xattrs --selinux -xzf ARCHIVE -C restore` | Request metadata restoration into an empty destination. |
| `rsync -av --dry-run --itemize-changes source/ mirror/` | Review synchronization without altering destination data. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch14/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Create an ACL on a source file and compare getfacl before and after a restore that includes --acls.


## Documentation

- [GNU tar manual](https://www.gnu.org/software/tar/manual/tar.html)
- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
