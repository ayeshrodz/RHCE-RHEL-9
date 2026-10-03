---
title: 'Reference: Getting help'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Question:** Describe the expected and observed behavior, including the host and exact version.

**Reference:** Use the command section, configuration section or vendor guide that answers the question.

**Experiment:** Test one hypothesis on a fixture and record evidence, limits and rollback.

## Command reference

| Example | Use and limits |
| --- | --- |
| `man 5 passwd` | Read the account-file format, not the password command. |
| `man -k KEYWORD` | Search manual descriptions; diagnose a missing index separately. |
| `rpm -qd PACKAGE` | List documentation tracked by the installed package. |
| `COMMAND --help` | Get a quick syntax reference for the installed command. |
| `rpm -q PACKAGE` | Record the installed version with the investigation. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch04/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Find the documentation for an unfamiliar systemctl option and distinguish the unit-file format from the systemctl command reference.


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
