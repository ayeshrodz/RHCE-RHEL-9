---
title: 'Exercise: Secure remote access'
kind: lab
minutes: 40
---

{% lead %}
Set up a passphrase-protected practice key from workstation to clean servera, transfer a report, and deny root SSH login while keeping the student access path working.
{% /lead %}

{% lab id="sysadmin-10" title="Secure remote access" objectives=["ch10.operations", "ch10.verification"] exercise="sysadmin-10" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Verify remote-host identity and use key authentication.", "Validate SSH policy and transfer data without losing access."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-10
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Set up a passphrase-protected practice key from workstation to clean servera, transfer a report, and deny root SSH login while keeping the student access path working.

- Verify remote-host identity and use key authentication.
- Validate SSH policy and transfer data without losing access.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-1aa216baedb1" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-10
cd ~/sysadmin-10
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-65d5a145676d" title="Establish trust and authentication" %}

Compare servera's host fingerprint through the console. On workstation:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/kp-practice
ssh-copy-id -i ~/.ssh/kp-practice.pub student@servera.lab.example.com
ssh -i ~/.ssh/kp-practice student@servera.lab.example.com id
```
Do not overwrite an existing practice key; pick a fresh name if repeating.

{% /task %}

{% task id="task-741a46d8763f" title="Transfer and compare" %}

```bash
printf '%s\n' remote-ready > report.txt
scp -i ~/.ssh/kp-practice report.txt student@servera.lab.example.com:remote-report.txt
sha256sum report.txt
ssh -i ~/.ssh/kp-practice student@servera.lab.example.com sha256sum remote-report.txt
```
The two content digests must match. Preserve the private key on workstation only.

{% /task %}

{% task id="task-ef8a32190dcb" title="Validate a root-login restriction" %}

On servera create `/etc/ssh/sshd_config.d/00-kp-practice.conf` containing `PermitRootLogin no`. Check `sudo sshd -t` and `sudo sshd -T`, then `sudo systemctl reload sshd`. Keep your first session while testing a second student login. Record effective policy, transfer digest and login result in `observations.txt` on workstation. Do not disable all password authentication in this lab.

{% /task %}

{% task id="task-04d0761d43fe" title="Verify, vary and finish" %}

Reset servera after evidence. Remove the dedicated practice key and its agent identity when no longer needed; do not remove unrelated keys or known_hosts entries.

{% reveal title="Try a changed requirement" %}

Use an SSH client Host entry for the practice identity, then inspect ssh -G to verify the resulting user and key path.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-10" grade=true /%}

{% /task %}
{% /lab %}
