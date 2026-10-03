---
title: 'Reference: Networking'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Saved profile:** Contains persistent address, route, DNS and activation policy.

**Live interface:** Has the currently applied link and IP state in the kernel.

**Destination test:** Checks route, lookup and the actual service protocol from the client.

## Command reference

| Example | Use and limits |
| --- | --- |
| `ip -br address` | Inspect live interface addresses. |
| `ip route get DESTINATION` | Inspect the selected route for a specific destination. |
| `getent hosts NAME` | Resolve through the configured system lookup path. |
| `nmcli connection show` | Inspect saved profiles and their associations. |
| `nmcli device status` | Identify actual guest interface names. |
| `ss -lntp` | Inspect TCP listeners and bind addresses. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch12/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Compare getent hosts with dig for a temporary /etc/hosts entry, then remove only your added entry.


## Documentation

- [RHEL networking guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/index)
