---
title: 'Reference: Users and groups'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Identity database:** Resolves a name to numeric IDs and records configured group membership.

**Login session:** Inherits group membership and environment at session creation.

**Sudo policy:** Authorizes particular commands; test it as the intended caller.

## Command reference

| Example | Use and limits |
| --- | --- |
| `getent passwd USER` | Query configured identity sources. |
| `id USER` | Inspect numeric identity and database group membership. |
| `usermod -aG GROUP USER` | Append supplementary membership; use only with reviewed administrative intent. |
| `chage -l USER` | Inspect account aging policy. |
| `visudo -f /etc/sudoers.d/NAME` | Edit a scoped policy with syntax validation. |
| `sudo -l` | Inspect permissions as the intended caller. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch06/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Create a second user and show that database membership and an already-open shell can disagree until a fresh login.


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
