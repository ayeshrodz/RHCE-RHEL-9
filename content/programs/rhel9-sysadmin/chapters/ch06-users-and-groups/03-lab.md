---
title: 'Exercise: Users and groups'
kind: lab
minutes: 40
---

{% lead %}
On clean servera, create the operators group and trainee account without wheel membership. Grant only the demonstrated service-status command, and prove membership and policy from a fresh session.
{% /lead %}

{% lab id="sysadmin-06" title="Users and groups" objectives=["ch06.operations", "ch06.verification"] exercise="sysadmin-06" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Manage account membership and lifecycle using supported tools.", "Delegate administrative work and validate policy safely."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-06
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

On clean servera, create the operators group and trainee account without wheel membership. Grant only the demonstrated service-status command, and prove membership and policy from a fresh session.

- Manage account membership and lifecycle using supported tools.
- Delegate administrative work and validate policy safely.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-4fae39f0043e" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-06
cd ~/sysadmin-06
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-f863227a99f6" title="Create the identities" %}

On servera as student:
```bash
sudo groupadd operators
sudo useradd -m -s /bin/bash -G operators trainee
sudo passwd trainee
sudo chage -M 90 -W 7 trainee
id trainee
sudo chage -l trainee
```
Choose a lab-only password interactively. Check that trainee is not in wheel.

{% /task %}

{% task id="task-77dbee23fd88" title="Create and validate policy" %}

Use `sudo visudo -f /etc/sudoers.d/operators` and enter:
```text
%operators ALL=(root) /usr/bin/systemctl status chronyd
```
Then:
```bash
sudo chown root:root /etc/sudoers.d/operators
sudo chmod 0440 /etc/sudoers.d/operators
sudo visudo -cf /etc/sudoers.d/operators
```
Retain your student session.

{% /task %}

{% task id="task-cb0fd181a4a6" title="Test permitted and denied work" %}

```bash
sudo su - trainee
sudo -l
sudo /usr/bin/systemctl status chronyd --no-pager
```
The extra `--no-pager` argument is deliberately outside the exact rule and should be denied. Run the exact permitted command next, then try stopping chronyd: it must be denied. Exit the trainee shell. Record both outcomes on workstation in `observations.txt`.

{% /task %}

{% task id="task-ab220c7de076" title="Verify, vary and finish" %}

On the host, reset servera after recording results. On another disposable VM, remove the practice drop-in and account only after reviewing owned files.

{% reveal title="Try a changed requirement" %}

Create a second user and show that database membership and an already-open shell can disagree until a fresh login.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-06" grade=true /%}

{% /task %}
{% /lab %}
