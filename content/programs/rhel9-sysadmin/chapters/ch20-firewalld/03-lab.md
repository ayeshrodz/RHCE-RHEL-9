---
title: 'Exercise: The firewall'
kind: lab
minutes: 60
---

{% lead %}
Run a harmless Apache page on clean servera. Verify it locally, allow HTTP at runtime, prove access from workstation, then persist only that allowance and test it after reload and reboot.
{% /lead %}

{% lab id="sysadmin-20" title="The firewall" objectives=["ch20.operations", "ch20.verification"] exercise="sysadmin-20" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Apply zone policy in runtime and permanent configuration.", "Verify allowed and denied service access from another host."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-20
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Run a harmless Apache page on clean servera. Verify it locally, allow HTTP at runtime, prove access from workstation, then persist only that allowance and test it after reload and reboot.

- Apply zone policy in runtime and permanent configuration.
- Verify allowed and denied service access from another host.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-1827650e7ba7" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-20
cd ~/sysadmin-20
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-7d7cbb0f4056" title="Establish service readiness" %}

On servera:
```bash
sudo dnf install httpd
printf '%s\n' firewall-ready | sudo tee /var/www/html/index.html
sudo restorecon /var/www/html/index.html
sudo systemctl enable --now httpd
curl -fsS http://127.0.0.1/
sudo firewall-cmd --get-active-zones
```
Use the active zone of the lab interface; the commands below use the default only if it is that active zone. Otherwise add --zone with its inspected name.

{% /task %}

{% task id="task-14e865963638" title="Compare runtime and saved policy" %}

```bash
sudo firewall-cmd --add-service=http
sudo firewall-cmd --query-service=http
sudo firewall-cmd --permanent --query-service=http
```
From workstation test `curl --connect-timeout 5 http://servera.lab.example.com/`. Observe runtime-only access, reload on servera, then test again. If the baseline already allowed HTTP permanently, remove only that disposable-lab HTTP rule before demonstrating the difference; keep SSH allowed.

{% /task %}

{% task id="task-351fdf19f928" title="Persist and prove the intended result" %}

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
sudo firewall-cmd --query-service=http
sudo firewall-cmd --permanent --query-service=http
```
Repeat the remote request and record it in `observations.txt`. Reboot and test from workstation again. A localhost grader probe does not establish remote firewall behavior.

{% /task %}

{% task id="task-1f8e21b841ce" title="Verify, vary and finish" %}

Keep the remote-test evidence, then reset servera. A manual cleanup removes only the authored HTTP allowance and fixture, preserving SSH and unrelated policy.

{% reveal title="Try a changed requirement" %}

On a resettable server, remove broad HTTP access and permit it only from a reviewed source subnet. Test a matching and a nonmatching caller.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-20" grade=true /%}

{% /task %}
{% /lab %}
