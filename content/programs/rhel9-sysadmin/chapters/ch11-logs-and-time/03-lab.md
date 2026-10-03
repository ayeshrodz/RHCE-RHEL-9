---
title: 'Exercise: Logs and time'
kind: lab
minutes: 40
---

{% lead %}
Make servera journal storage persistent, emit a tagged event, and retrieve it after a reboot. Inspect chrony independently and report whether it has actually selected a source.
{% /lead %}

{% lab id="sysadmin-11" title="Logs and time" objectives=["ch11.operations", "ch11.verification"] exercise="sysadmin-11" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Filter logs by host, boot, service and time.", "Make log retention and time synchronization observable."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-11
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Make servera journal storage persistent, emit a tagged event, and retrieve it after a reboot. Inspect chrony independently and report whether it has actually selected a source.

- Filter logs by host, boot, service and time.
- Make log retention and time synchronization observable.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-55be83438844" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-11
cd ~/sysadmin-11
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-8303d70d16c4" title="Configure journal persistence" %}

On servera:
```bash
sudo mkdir -p /etc/systemd/journald.conf.d
printf '%s\n' '[Journal]' 'Storage=persistent' | sudo tee /etc/systemd/journald.conf.d/10-persistent.conf
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
sudo systemctl restart systemd-journald
sudo journalctl --flush
logger -t kp-practice 'persistent event before reboot'
sudo journalctl -t kp-practice --no-pager
```

{% /task %}

{% task id="task-137051b77909" title="Collect time evidence" %}

```bash
hostname
timedatectl
chronyc tracking
chronyc sources -v
```
Write the selected source, or explicitly say none was selected. Record a timezone and collection timestamp in workstation's `time-evidence.txt`. Running chronyd alone is insufficient.

{% /task %}

{% task id="task-d745afb277e1" title="Check the prior boot" %}

Reboot servera, reconnect, then:
```bash
sudo journalctl --list-boots
sudo journalctl -b -1 -t kp-practice --no-pager
```
The previous-boot event must be present. Save its text in workstation's `previous-boot.txt`. If absent, diagnose storage mode and flush before repeating; do not substitute a new current-boot event.

{% /task %}

{% task id="task-e731ba84cf64" title="Verify, vary and finish" %}

Keep narrow evidence extracts, then reset servera. Do not delete incident history as a cleanup shortcut.

{% reveal title="Try a changed requirement" %}

Filter the marker by tag, boot and a time range, then explain why a wrong range can hide a valid event.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-11" grade=true /%}

{% /task %}
{% /lab %}
