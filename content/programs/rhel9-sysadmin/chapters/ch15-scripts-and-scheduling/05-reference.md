---
title: 'Reference: Scripts and scheduling'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Script contract:** Validate input and define useful success and failure outputs.

**Trigger:** Choose user cron, one-off at or a timer according to timing and catch-up needs.

**Execution evidence:** Inspect the task result, output and behavior across reboot.

## Command reference

| Example | Use and limits |
| --- | --- |
| `bash -n SCRIPT` | Check parsing without executing the script. |
| `test -r FILE` | Inspect readability; test as the relevant identity. |
| `crontab -e` | Edit the current user schedule. |
| `atq` | Inspect pending one-off jobs, not completed work. |
| `systemd-analyze calendar EXPRESSION` | Inspect calendar interpretation. |
| `systemctl list-timers --all` | Inspect triggers separately from service execution. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch15/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Express an hourly calendar trigger, inspect systemd-analyze calendar, and explain how Persistent changes a missed-run case.


## Documentation

- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
- [RHEL systemd guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/index)
