---
title: Measure before tuning
kind: lesson
minutes: 10
---

{% lead %}A useful performance investigation identifies the resource and workload before changing priority or a system profile.{% /lead %}

{% objectives %}
- Inspect process state and terminate the intended process safely.
- Distinguish resource symptoms from evidence for a tuning change.
{% /objectives %}

## Read several signals together

Load average measures runnable work and some uninterruptible waits; it is not CPU percentage. Interpret it alongside CPU count, utilization and I/O symptoms. `free -h` reports memory, including reclaimable cache and an estimate of available memory. Low free memory by itself does not establish pressure. `vmstat 1 5` gives repeated CPU, memory and I/O-related observations; its first row includes averages since boot, so compare later samples.

```bash
uptime
nproc
free -h
vmstat 1 5
```

`df -h` finds space pressure; `df -i` checks inode capacity. `ss -s` summarizes sockets. An application can be slow because of DNS, network latency, disk I/O, locks or dependencies even when CPU is idle. Record the time window and a baseline so comparisons refer to the same workload.

## Niceness controls scheduling preference

Nice values range from -20 to 19; a larger number is a lower CPU scheduling priority for ordinary scheduling classes. An unprivileged user can usually lower their own process priority but cannot arbitrarily raise it. `nice -n 10 command` starts a lower-priority job; `renice -n 15 -p PID` adjusts one. Niceness is not a CPU usage cap and is not a fix for an I/O wait.

## Tuned profiles are coordinated policy

When installed and running, `tuned-adm list`, `tuned-adm active` and `tuned-adm recommend` show profiles and a suggestion. Selecting a profile can change several system settings. Record the current profile first, understand the workload, select deliberately and compare useful measurements. Restore the original profile if the change does not help.

Install the `tuned` package on a disposable VM for experimentation, not as an unexplained performance fix. A virtual guest's reported metrics can reflect host contention. Escalate with evidence rather than presenting a single screenshot as proof of capacity. For advanced limits, study systemd resource controls and cgroups after learning the basic process model.

## Check your understanding

{% quiz id="quick" objectives=["ch08.operations", "ch08.verification"] ref="quick" /%}


## Documentation

- [RHEL performance guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/monitoring_and_managing_system_status_and_performance/index)
