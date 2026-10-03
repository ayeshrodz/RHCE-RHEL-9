---
title: 'Exercise: Services and the boot process'
kind: lab
minutes: 40
---

{% lead %}
Create a small system service on clean servera. Prove its running and enabled states separately, diagnose an intentional executable-path fault, restore it, and verify it after a reboot.
{% /lead %}

{% lab id="sysadmin-09" title="Services and the boot process" objectives=["ch09.operations", "ch09.verification"] exercise="sysadmin-09" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Separate live service state from boot activation policy.", "Diagnose unit failures and rehearse console-based recovery."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-09
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Create a small system service on clean servera. Prove its running and enabled states separately, diagnose an intentional executable-path fault, restore it, and verify it after a reboot.

- Separate live service state from boot activation policy.
- Diagnose unit failures and rehearse console-based recovery.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-54e78cafaa6b" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-09
cd ~/sysadmin-09
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-941474dc26f3" title="Create a harmless service" %}

On servera, create a dedicated service identity first:
```bash
sudo useradd --system --no-create-home --shell /sbin/nologin kpheartbeat
```
Then create `/etc/systemd/system/kp-heartbeat.service` with sudoedit:
```ini
[Unit]
Description=Kernel Path heartbeat practice
[Service]
Type=simple
User=kpheartbeat
ExecStart=/usr/bin/sleep infinity
[Install]
WantedBy=multi-user.target
```
Run:
```bash
sudo systemd-analyze verify /etc/systemd/system/kp-heartbeat.service
sudo systemctl daemon-reload
sudo systemctl enable --now kp-heartbeat.service
systemctl is-active kp-heartbeat.service
systemctl is-enabled kp-heartbeat.service
```

{% /task %}

{% task id="task-9807358911ab" title="Introduce and diagnose one fault" %}

Change ExecStart to `/usr/bin/not-a-real-program infinity`, reload the manager and restart the service. Verify the failed state and read `journalctl -u kp-heartbeat -b --no-pager`. Restore `/usr/bin/sleep infinity`, verify the file, reload and restart. Use `systemctl reset-failed kp-heartbeat` only after fixing the cause. Capture a short explanation in workstation's `observations.txt`.

{% /task %}

{% task id="task-fb6f6030bae2" title="Check persistence" %}

Keep console access available, reboot servera, reconnect and check both active and enabled states. Inspect the new boot's journal. A before-reboot grade cannot establish persistence; repeat the application-state check afterward. Optional recovery practice belongs on a separate snapshot-backed VM, not your only accessible server.

{% /task %}

{% task id="task-b7603dd63ca6" title="Verify, vary and finish" %}

Record evidence, then reset servera. If cleaning manually, stop and disable kp-heartbeat, remove only its authored unit, daemon-reload and confirm it is absent.

{% reveal title="Try a changed requirement" %}

Disable the running service without stopping it. Predict the next boot, then re-enable and verify the prediction on a disposable VM.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-09" grade=true /%}

{% /task %}
{% /lab %}
