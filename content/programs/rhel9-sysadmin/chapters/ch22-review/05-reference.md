---
title: 'Reference: Review and practice'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Contract:** Define access, content, persistence and recovery conditions before implementation.

**Evidence:** Connect each condition to configuration, live observation and a useful client operation.

**Handover:** Record the correction, restore proof, rollback and remaining limitations.

## Command reference

| Example | Use and limits |
| --- | --- |
| `systemctl status httpd --no-pager` | Check runtime service evidence. |
| `curl -fsS http://servera.lab.example.com/` | Verify intended remote content, not only status. |
| `ls -Z /var/www/html/index.html` | Inspect the live document label. |
| `sha256sum ARCHIVE` | Record a digest before the controlled fault. |
| `journalctl -u httpd -b` | Correlate recovery evidence with the current boot. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch22/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Move the status page to a custom root and identify the Apache, directory access and persistent SELinux changes before making them.


## Documentation

- [RHEL documentation index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9)
