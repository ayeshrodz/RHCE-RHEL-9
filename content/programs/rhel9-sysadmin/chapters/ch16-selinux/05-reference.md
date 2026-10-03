---
title: 'Reference: SELinux'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Service domain:** The confined process attempts a specific operation.

**Object type:** The target label must match the documented service access model.

**Policy-correct result:** Apply persistent intent, retry under enforcing and inspect fresh evidence.

## Command reference

| Example | Use and limits |
| --- | --- |
| `getenforce` | Inspect current enforcement mode. |
| `ls -Z PATH` | Inspect the current object context. |
| `matchpathcon -V PATH` | Compare configured and current context. |
| `semanage fcontext -l` | Inspect persistent context mappings. |
| `restorecon -Rv PATH` | Apply reviewed configured labeling intent. |
| `ausearch -m AVC,USER_AVC -ts recent` | Correlate recent denials with the failed operation. |
| `semanage port -l` | Inspect service port types, independently of the firewall. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch16/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Compare matchpathcon before and after a temporary chcon change, then repair with restorecon rather than changing mode.


## Documentation

- [RHEL SELinux guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/index)
