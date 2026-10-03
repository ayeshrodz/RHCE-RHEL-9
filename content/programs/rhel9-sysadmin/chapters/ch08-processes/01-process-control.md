---
title: Processes, jobs and signals
kind: lesson
minutes: 10
---

{% lead %}A process is a running program with an identity, resources and a parent. A shell job is the shell's way of tracking one or more of those processes.{% /lead %}

{% objectives %}
- Inspect process state and terminate the intended process safely.
- Distinguish resource symptoms from evidence for a tuning change.
{% /objectives %}

## Identify before signaling

`ps -ef` gives a snapshot. `ps -o pid,ppid,user,stat,ni,comm -p PID` selects useful fields for one process. `pgrep -a pattern` finds matching names and arguments; verify the result before using `pkill`, which may match more than your intended job. `top` shows changing utilization. `/proc/PID` exposes per-process kernel information subject to access controls.

States help explain symptoms: running/runnable, sleeping, uninterruptible sleep, stopped, and zombie are different. A zombie has exited but awaits parent reaping; signaling it does not recover a busy resource. Uninterruptible I/O waits may not react immediately even to a kill request.

## Foreground and background

```bash
sleep 600 &
practice_pid=$!
jobs -l
ps -o pid,ppid,stat,ni,comm -p "$practice_pid"
```

`$!` records the most recent background PID. `fg` brings a job into the foreground; Ctrl+Z stops a foreground job, and `bg` resumes it in the background. Job identifiers such as `%1` belong to this shell, while PIDs identify processes system-wide. Another shell does not share your job table.

## Ask for a clean shutdown

`kill -TERM PID` requests termination and allows a program to clean up. `kill -KILL PID` cannot be caught and should follow diagnosis and a reasonable graceful wait, not be your default. Ctrl+C sends SIGINT to the foreground process group. A signal request succeeding only means the request was sent; inspect whether the process exited.

A service manager may restart a process you kill directly. For a managed daemon, use `systemctl stop service` when the desired operation is to stop the service. For your own practice job, use the exact captured PID and confirm it disappears. PID values can be reused later: do not save one and assume it identifies the same process indefinitely.

## Explore the model

{% flow-map ref="model" title="Processes: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch08.operations", "ch08.verification"] ref="quick" /%}


## Documentation

- [RHEL performance guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/monitoring_and_managing_system_status_and_performance/index)
