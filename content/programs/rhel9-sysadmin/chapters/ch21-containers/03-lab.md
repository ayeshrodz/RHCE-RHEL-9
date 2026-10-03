---
title: 'Exercise: Containers with Podman'
kind: lab
minutes: 60
---

{% lead %}
On clean servera, use student login to create a rootless Quadlet heartbeat with a mounted data fixture. Confirm the rootless store, mounted marker and user-service behavior across logout and reboot. This is a lifecycle lab, not a web-health test.
{% /lead %}

{% lab id="sysadmin-21" title="Containers with Podman" objectives=["ch21.operations", "ch21.verification"] exercise="sysadmin-21" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Run and inspect rootless containers with intentional storage and ports.", "Use version-supported systemd integration and verify restart behavior."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-21
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

On clean servera, use student login to create a rootless Quadlet heartbeat with a mounted data fixture. Confirm the rootless store, mounted marker and user-service behavior across logout and reboot. This is a lifecycle lab, not a web-health test.

- Run and inspect rootless containers with intentional storage and ports.
- Use version-supported systemd integration and verify restart behavior.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-9b606bb767ce" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-21
cd ~/sysadmin-21
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-a0c9419f9fd2" title="Check support and prepare data" %}

On servera through a normal student SSH session:
```bash
sudo dnf install podman
podman version
man podman-systemd.unit
mkdir -p ~/.config/containers/systemd ~/kp-container-data
printf '%s\n' container-ready > ~/kp-container-data/marker.txt
podman pull registry.access.redhat.com/ubi9/ubi-minimal:latest
```
If Quadlet is unavailable, use an approved update or the installed-version compatibility procedure before attempting this definition.

{% /task %}

{% task id="task-46734ae15511" title="Define and start the user service" %}

Create `~/.config/containers/systemd/kp-heartbeat.container`:
```ini
[Unit]
Description=Rootless container heartbeat
[Container]
Image=registry.access.redhat.com/ubi9/ubi-minimal:latest
ContainerName=kp-heartbeat
Exec=/usr/bin/sleep infinity
Volume=%h/kp-container-data:/data:Z
[Service]
Restart=on-failure
[Install]
WantedBy=default.target
```
Then:
```bash
systemctl --user daemon-reload
systemctl --user start kp-heartbeat.service
podman exec kp-heartbeat cat /data/marker.txt
podman info --format '{{.Host.Security.Rootless}}'
```
The marker must read container-ready and rootless must be true.

{% /task %}

{% task id="task-eea3b752292e" title="Test unattended lifecycle" %}

```bash
sudo loginctl enable-linger student
systemctl --user status kp-heartbeat.service --no-pager
journalctl --user -u kp-heartbeat.service --no-pager
```
Log out completely and reconnect to inspect continued operation. Reboot, reconnect and repeat the marker and status checks. Save rootless, logout and reboot observations in workstation's `container-evidence.txt`. The grader checks installed tooling and source files, not actual rootless service readiness.

{% /task %}

{% task id="task-f1c1702260a1" title="Verify, vary and finish" %}

Stop the user service, remove only the authored Quadlet, daemon-reload and confirm the container is gone. Disable student lingering if it was enabled only for this practice. Reset servera after preserving evidence.

{% reveal title="Try a changed requirement" %}

Inspect an approved web image, identify its unprivileged port, and serve a fixture on host loopback only. Test content, port binding and reboot as separate observations.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-21" grade=true /%}

{% /task %}
{% /lab %}
