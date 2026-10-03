---
title: 'Reference: Software management'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Trusted source:** Approved repositories, transport and signing keys define package provenance.

**Transaction:** DNF resolves dependencies; review intended changes and rollback limits.

**Runtime:** Verify binaries, running kernel and application after required restarts.

## Command reference

| Example | Use and limits |
| --- | --- |
| `dnf repolist` | Inspect enabled package sources. |
| `rpm -qf PATH` | Identify the package owning a tracked file. |
| `rpm -V PACKAGE` | Inspect tracked differences and interpret them. |
| `dnf check-update` | Return 100 when updates are available. |
| `dnf history list` | Review transactions; not an application rollback guarantee. |
| `uname -r` | Identify the running kernel independently of installed packages. |
| `ksvalidator FILE` | Check installation syntax; does not verify target devices. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch13/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Use rpm -qf on a configuration file and distinguish its owning package from an intentional local configuration change.


## Documentation

- [RHEL DNF guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_software_with_the_dnf_tool/index)
- [RHEL automated installation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/automatically_installing_rhel/index)
