---
title: 'Exercise: Processes'
kind: lab
minutes: 40
---

{% lead %}
Investigate one disposable sleep process and collect a small resource baseline. Demonstrate priority adjustment and graceful termination without touching a system daemon.
{% /lead %}

{% lab id="sysadmin-08" title="Processes" objectives=["ch08.operations", "ch08.verification"] exercise="sysadmin-08" ownExercise=true hosts=["workstation"] outcomes=["Inspect process state and terminate the intended process safely.", "Distinguish resource symptoms from evidence for a tuning change."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-08
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Investigate one disposable sleep process and collect a small resource baseline. Demonstrate priority adjustment and graceful termination without touching a system daemon.

- Inspect process state and terminate the intended process safely.
- Distinguish resource symptoms from evidence for a tuning change.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-a2c0b4558037" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-08
cd ~/sysadmin-08
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-154d93318233" title="Start and identify your process" %}

```bash
nice -n 10 sleep 600 &
practice_pid=$!
printf '%s\n' "$practice_pid" > practice.pid
ps -o pid,ppid,user,stat,ni,comm -p "$practice_pid" > process.txt
```
Confirm that it belongs to student and runs sleep. Do not use broad pkill patterns.

{% /task %}

{% task id="task-99640d3e1d99" title="Observe and adjust" %}

```bash
renice -n 15 -p "$practice_pid"
ps -o pid,ni,comm -p "$practice_pid"
{ uptime; nproc; free -h; vmstat 1 3; } > baseline.txt
```
Explain in `observations.txt` why niceness is not a utilization cap and why available memory matters.

{% /task %}

{% task id="task-f5c1e2251a96" title="End the exact job" %}

```bash
kill -TERM "$practice_pid"
wait "$practice_pid"
ps -p "$practice_pid"
```
Wait can report a signal-related nonzero status. The final ps should show no matching process. Record the observed exit, not just that kill returned successfully.

{% /task %}

{% task id="task-225bba73045a" title="Verify, vary and finish" %}

Confirm the practice sleep has exited, then archive the project. Do not leave background jobs or tuning changes behind.

{% reveal title="Try a changed requirement" %}

Start another sleep under the same shell, suspend and resume it, and distinguish a stopped job from an exited process.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-08" grade=true /%}

{% /task %}
{% /lab %}
