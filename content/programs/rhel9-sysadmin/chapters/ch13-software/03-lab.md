---
title: 'Exercise: Software management'
kind: lab
minutes: 40
---

{% lead %}
On clean servera, review repository access, install tree, query its provenance, and distinguish running kernel state from installed packages. Create an installation and maintenance checklist without reinstalling an existing VM.
{% /lead %}

{% lab id="sysadmin-13" title="Software management" objectives=["ch13.operations", "ch13.verification"] exercise="sysadmin-13" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Manage trusted repositories and package transactions.", "Plan a reproducible RHEL 9 installation and safe update."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-13
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

On clean servera, review repository access, install tree, query its provenance, and distinguish running kernel state from installed packages. Create an installation and maintenance checklist without reinstalling an existing VM.

- Manage trusted repositories and package transactions.
- Plan a reproducible RHEL 9 installation and safe update.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-40dfadded6a4" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-13
cd ~/sysadmin-13
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-103ccc156ca7" title="Record the source and transaction" %}

```bash
dnf repolist
sudo dnf install tree
rpm -q tree
rpm -qf /usr/bin/tree
rpm -V tree
```
Review the proposed transaction before accepting it. Do not add a new third-party repository for this exercise.

{% /task %}

{% task id="task-82f1d2730bfe" title="Inspect updates and runtime" %}

```bash
uname -r
rpm -q kernel
dnf check-update
printf 'check-update status=%s\n' "$?"
dnf history list
```
Explain status 100 if updates are available. Do not apply a full-system upgrade during this narrow lab.

{% /task %}

{% task id="task-a857688e4c46" title="Write a deployment checklist" %}

Create `maintenance.txt` on workstation. Include trusted media and signatures, target disk identification, console access, SELinux, repository access, backup, reboot and application verification. State which steps were actually tested and which remain a separate fresh-VM installation rehearsal.

{% /task %}

{% task id="task-6e3307321c91" title="Verify, vary and finish" %}

Record the installed checkpoint, then reset servera or review sudo dnf remove tree. A removal transaction can include dependencies; inspect it before accepting.

{% reveal title="Try a changed requirement" %}

Use rpm -qf on a configuration file and distinguish its owning package from an intentional local configuration change.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-13" grade=true /%}

{% /task %}
{% /lab %}
