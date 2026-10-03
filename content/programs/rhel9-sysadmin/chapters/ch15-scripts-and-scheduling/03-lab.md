---
title: 'Exercise: Scripts and scheduling'
kind: lab
minutes: 40
---

{% lead %}
Write a safe argument-checking script on workstation. On clean servera, schedule a separate harmless timestamp task with a systemd timer and observe actual execution, including after reboot.
{% /lead %}

{% lab id="sysadmin-15" title="Scripts and scheduling" objectives=["ch15.operations", "ch15.verification"] exercise="sysadmin-15" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Write small scripts with explicit input and failure behavior.", "Choose and verify cron, at or systemd timer scheduling."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-15
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Write a safe argument-checking script on workstation. On clean servera, schedule a separate harmless timestamp task with a systemd timer and observe actual execution, including after reboot.

- Write small scripts with explicit input and failure behavior.
- Choose and verify cron, at or systemd timer scheduling.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-256b37e9941c" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-15
cd ~/sysadmin-15
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-6b79a9938b70" title="Write and test a small script" %}

Create `count-lines.sh` from the argument-checking example in the lesson. Then:
```bash
bash -n count-lines.sh
chmod 0750 count-lines.sh
printf '%s\n' one two > sample.txt
./count-lines.sh sample.txt > count.txt
./count-lines.sh
```
No-argument invocation must fail with a usage message, while the valid result is 2.

{% /task %}

{% task id="task-52018a7a5ab1" title="Define the scheduled task" %}

On servera create `/etc/systemd/system/kp-stamp.service`:
```ini
[Unit]
Description=Practice timestamp
[Service]
Type=oneshot
ExecStart=/usr/bin/date --iso-8601=seconds
StandardOutput=append:/var/log/kp-stamp.log
```
And `/etc/systemd/system/kp-stamp.timer`:
```ini
[Unit]
Description=Practice timestamp schedule
[Timer]
OnBootSec=30s
OnUnitActiveSec=1min
[Install]
WantedBy=timers.target
```
Validate both units, daemon-reload and enable/start the timer. Run only on the disposable server.

{% /task %}

{% task id="task-3ab3405b8e7d" title="Observe rather than assume" %}

```bash
sudo systemd-analyze verify /etc/systemd/system/kp-stamp.service /etc/systemd/system/kp-stamp.timer
sudo systemctl daemon-reload
sudo systemctl enable --now kp-stamp.timer
systemctl list-timers --all kp-stamp.timer
sudo journalctl -u kp-stamp.service --no-pager
sudo cat /var/log/kp-stamp.log
```
Wait until an execution has occurred, then reboot and verify a new timestamp. Write failure-input and timer execution observations to `observations.txt` on workstation.

{% /task %}

{% task id="task-529372721659" title="Verify, vary and finish" %}

On servera stop/disable the timer, remove only its two authored units and log, daemon-reload, or reset the server. Keep the tested script in the archived project.

{% reveal title="Try a changed requirement" %}

Express an hourly calendar trigger, inspect systemd-analyze calendar, and explain how Persistent changes a missed-run case.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-15" grade=true /%}

{% /task %}
{% /lab %}
