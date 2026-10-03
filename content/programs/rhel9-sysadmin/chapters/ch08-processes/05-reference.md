---
title: 'Reference: Processes'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Workload:** Define the process, workload and time window you are investigating.

**Measurements:** Read CPU, memory, I/O and network evidence together.

**Change:** Choose one justified priority or profile change, compare results and retain rollback.

## Command reference

| Example | Use and limits |
| --- | --- |
| `ps -o pid,ppid,user,stat,ni,comm -p PID` | Inspect the precise process before signaling. |
| `jobs -l` | Show this shell job table; it is not global. |
| `kill -TERM PID` | Request graceful termination of the verified target. |
| `renice -n 15 -p PID` | Lower ordinary CPU scheduling preference; not a usage cap. |
| `free -h` | Inspect available memory rather than free memory alone. |
| `tuned-adm active` | Inspect the active coordinated tuning profile. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch08/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Start another sleep under the same shell, suspend and resume it, and distinguish a stopped job from an exited process.


## Documentation

- [RHEL performance guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/monitoring_and_managing_system_status_and_performance/index)
