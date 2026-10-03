---
title: 'Exercise: Review and practice'
kind: lab
minutes: 60
---

{% lead %}
Deliver an internal status page on clean servera with enforcing security, persistent service startup and a managed operator identity. Back up the good page, introduce wrong content, restore it, and hand over verified local, remote and reboot evidence.
{% /lead %}

{% lab id="sysadmin-22" title="Review and practice" objectives=["ch22.operations", "ch22.verification"] exercise="sysadmin-22" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Deliver a service with access, persistence and recovery evidence.", "Investigate one fault systematically and produce a usable handover."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-22
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Deliver an internal status page on clean servera with enforcing security, persistent service startup and a managed operator identity. Back up the good page, introduce wrong content, restore it, and hand over verified local, remote and reboot evidence.

- Deliver a service with access, persistence and recovery evidence.
- Investigate one fault systematically and produce a usable handover.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-7ec90235387c" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-22
cd ~/sysadmin-22
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-1253b414213b" title="Write and fulfill the contract" %}

Requirements on servera:
- Local `statusops` group and `statusowner` user; no unrestricted extra sudo grant.
- `/var/www/html/index.html` contains exactly `operations-ready` and is root-owned, readable by httpd and correctly labeled.
- httpd is installed, active and enabled; HTTP is allowed in the active interface zone at runtime and permanently.
- SELinux remains enforcing; existing SSH management access is preserved.
Use earlier chapters as references. From workstation save a successful remote HTTP response to `remote-before.txt`.

{% /task %}

{% task id="task-e9cb482bff73" title="Back up, fault and recover" %}

On servera:
```bash
sudo tar --acls --xattrs --selinux -czf /root/kp-status-backup.tar.gz -C /var/www/html index.html
sudo sha256sum /root/kp-status-backup.tar.gz
printf '%s\n' wrong-content | sudo tee /var/www/html/index.html
```
From workstation, HTTP succeeds but the expected content check must fail. Diagnose that distinction. Restore first to an empty staging directory and compare before replacing the one intended live page; reapply restorecon and repeat the original remote check. Record the archive digest and recovery outcome in `handover.txt`.

{% /task %}

{% task id="task-99800bc8ed97" title="Reboot and hand over" %}

Reboot servera with console access available. Verify service active/enabled, enforcing mode, remote body and permanent firewall policy. In `handover.txt` record versions, purpose, identity/access decisions, changed files, start/stop/reload commands, backup, restore and rollback. Include at least the words `reboot`, `restore`, and `SELinux` in the record because those checks are required, and describe the actual observations rather than merely naming them.

{% /task %}

{% task id="task-0bbb21e217ff" title="Verify, vary and finish" %}

Export the grade and handover before resetting servera. Retain the recovery record separately from the disposable VM.

{% reveal title="Try a changed requirement" %}

Move the status page to a custom root and identify the Apache, directory access and persistent SELinux changes before making them.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-22" grade=true /%}

{% /task %}
{% /lab %}
