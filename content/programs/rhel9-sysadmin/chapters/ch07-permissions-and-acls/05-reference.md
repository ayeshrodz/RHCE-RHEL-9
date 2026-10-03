---
title: 'Reference: Permissions and ACLs'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Path traversal:** Every parent directory must permit the identity to search it.

**Selected ACL entries:** Owner, named identity and matching groups are evaluated with their defined ordering.

**Effective access:** The mask limits the group class; SELinux and mount policy may constrain it further.

## Command reference

| Example | Use and limits |
| --- | --- |
| `namei -l PATH` | Inspect traversal permissions for every component. |
| `chmod 2770 DIRECTORY` | Request group-inheriting collaboration mode; does not guarantee child write access. |
| `getfacl PATH` | Read entries, mask and effective access. |
| `setfacl -m u:USER:r-- FILE` | Add a named-user entry subject to the group-class mask. |
| `umask` | Inspect the mask used by this shell for new objects. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch07/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Give auditor a named rw- entry but an r-- mask. Explain the effective read-only result without deleting the ACL.


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
