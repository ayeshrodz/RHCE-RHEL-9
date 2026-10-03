---
title: Schedule with an observable result
kind: lesson
minutes: 10
---

{% lead %}A scheduled command runs without your interactive environment. Give it explicit paths, a suitable identity and a result you can inspect.{% /lead %}

{% objectives %}
- Write small scripts with explicit input and failure behavior.
- Choose and verify cron, at or systemd timer scheduling.
{% /objectives %}

## Cron and at

A user crontab has five time fields followed by a command: minute, hour, day of month, month, day of week. `/etc/cron.d` adds a user field. `crontab -e` edits the current user's schedule. A minimal PATH, missing working directory, special percent handling and absent shell initialization can make a command fail even when it worked interactively. Use absolute paths and deliberate output handling.

`at` queues one-off jobs if atd is running and access policy permits the user. `atq` lists queued jobs and `atrm` removes one by ID. Record the queue ID and inspect the actual result after the scheduled time; a queued job is not completed work.

Anacron covers periodic jobs that may have been missed while a machine was off. It is not a precise minute-level scheduler. Service and permission requirements differ by environment; inspect installed packages and enabled daemons.

## Timers separate trigger from work

A systemd timer activates a matching service. `OnCalendar` uses calendar expressions; monotonic settings such as `OnBootSec` use elapsed time. A `Persistent=true` calendar timer can catch up a missed activation after downtime. `systemd-analyze calendar EXPRESSION` helps inspect calendar interpretation.

```ini
[Timer]
OnCalendar=hourly
Persistent=true
```

Use a oneshot service for a short task that should exit. Do not leave it active with RemainAfterExit if repeated activation should rerun it without additional handling. `systemctl list-timers --all` shows triggers; `journalctl -u task.service` and the task's output show execution. Enabling a timer does not prove its task succeeded.

## Design for repetition

Make tasks safe to run twice, bound runtime and prevent overlap if concurrent instances could damage data. `flock` can coordinate a lock when used deliberately. Log both useful success evidence and errors; avoid endlessly growing output files. Verify the schedule's timezone and behavior around restarts. Preserve the job's owner and environment in the runbook so another administrator can reproduce it manually.

## Check your understanding

{% quiz id="quick" objectives=["ch15.operations", "ch15.verification"] ref="quick" /%}


## Documentation

- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
- [RHEL systemd guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/index)
