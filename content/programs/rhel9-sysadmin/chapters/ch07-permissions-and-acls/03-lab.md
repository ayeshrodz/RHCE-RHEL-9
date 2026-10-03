---
title: 'Exercise: Permissions and ACLs'
kind: lab
minutes: 40
---

{% lead %}
Build /srv/team on clean servera. Team members can collaborate; auditor can traverse the directory and read a report but cannot alter it. New team entries inherit the team group.
{% /lead %}

{% lab id="sysadmin-07" title="Permissions and ACLs" objectives=["ch07.operations", "ch07.verification"] exercise="sysadmin-07" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Apply modes, ownership and special directory permissions.", "Explain effective ACL access and test it as the intended user."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-07
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Build /srv/team on clean servera. Team members can collaborate; auditor can traverse the directory and read a report but cannot alter it. New team entries inherit the team group.

- Apply modes, ownership and special directory permissions.
- Explain effective ACL access and test it as the intended user.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-58390edcab92" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-07
cd ~/sysadmin-07
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-3078df1390fc" title="Create a permission fixture" %}

```bash
sudo groupadd operators
sudo useradd -m -G operators trainee
sudo useradd -m auditor
sudo install -d -o root -g operators -m 2770 /srv/team
sudo -u trainee sh -c 'umask 0007; printf "%s\n" ready > /srv/team/report.txt'
```
Verify the report's group and explain which operation the directory write bit controls.

{% /task %}

{% task id="task-c0347d74d26c" title="Add the read-only exception" %}

```bash
sudo setfacl -m u:auditor:--x /srv/team
sudo setfacl -m u:auditor:r-- /srv/team/report.txt
sudo setfacl -m d:g::rwx,d:m::rwx,d:o::--- /srv/team
getfacl /srv/team /srv/team/report.txt
sudo -u auditor cat /srv/team/report.txt
sudo -u auditor sh -c 'printf "%s\n" changed >> /srv/team/report.txt'
```
The last operation must be denied. Read `getfacl` again before guessing at a correction.

{% /task %}

{% task id="task-359b0e350fee" title="Prove inheritance and record it" %}

```bash
sudo -u trainee touch /srv/team/new.txt
stat -c '%G %a %n' /srv/team/new.txt
namei -l /srv/team/report.txt
```
Write the observed group, ACL mask and failed auditor write to `observations.txt` on workstation. As a variation, reduce the report's mask to `---`, observe the denied read, then restore mask `rw-` before grading.

{% /task %}

{% task id="task-0a014c1c2a3a" title="Verify, vary and finish" %}

Record the ACL evidence before resetting servera. The typed grader checks the directory mode and report; verify ACL behavior manually as auditor.

{% reveal title="Try a changed requirement" %}

Give auditor a named rw- entry but an r-- mask. Explain the effective read-only result without deleting the ACL.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-07" grade=true /%}

{% /task %}
{% /lab %}
