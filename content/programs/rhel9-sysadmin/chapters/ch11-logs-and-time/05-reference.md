---
title: 'Reference: Logs and time'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Event:** Carries source, boot and timestamp context; generate a known marker.

**Retention:** Keeps selected evidence across restart or reboot according to storage policy.

**Correlation:** Use synchronized clocks and explicit offsets to compare hosts.

## Command reference

| Example | Use and limits |
| --- | --- |
| `journalctl --list-boots` | Identify retained boot histories. |
| `journalctl -b -1 -t TAG` | Retrieve a tagged marker from the previous boot. |
| `journalctl --disk-usage` | Inspect retained journal storage use. |
| `timedatectl` | Inspect clock and timezone settings. |
| `chronyc tracking` | Inspect synchronization state and offset. |
| `chronyc sources -v` | Identify reachable and selected time sources. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch11/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Filter the marker by tag, boot and a time range, then explain why a wrong range can hide a valid event.


## Documentation

- [RHEL logs and time](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
