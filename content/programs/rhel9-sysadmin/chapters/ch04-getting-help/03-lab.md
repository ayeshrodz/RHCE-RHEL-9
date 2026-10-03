---
title: 'Exercise: Getting help'
kind: lab
minutes: 40
---

{% lead %}
Investigate how to copy a directory while preserving its structure, and how to locate account-file documentation without internet access. Produce a small evidence record with a tested example.
{% /lead %}

{% lab id="sysadmin-04" title="Getting help" objectives=["ch04.operations", "ch04.verification"] exercise="sysadmin-04" ownExercise=true hosts=["workstation"] outcomes=["Find installed command and configuration documentation.", "Use version-matched evidence when diagnosing an unfamiliar option."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-04
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Investigate how to copy a directory while preserving its structure, and how to locate account-file documentation without internet access. Produce a small evidence record with a tested example.

- Find installed command and configuration documentation.
- Use version-matched evidence when diagnosing an unfamiliar option.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-2b628dcab751" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-04
cd ~/sysadmin-04
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-83b32fd1be61" title="Find command and format references" %}

```bash
command -v man
man 1 cp
man 5 passwd
rpm -q coreutils man-db
```
If needed, install `man-db man-pages` on workstation first. Note the installed versions and which page answers each question.

{% /task %}

{% task id="task-9bfdd287d2d2" title="Test one documented option" %}

```bash
mkdir -p source/subdir
printf '%s\n' local-evidence > source/subdir/note.txt
cp -a source copied
cmp source/subdir/note.txt copied/subdir/note.txt
```
Explain why a non-root copy of a root-owned file cannot promise arbitrary ownership preservation.

{% /task %}

{% task id="task-045a38f67c4b" title="Write the investigation record" %}

Create `reference.txt` containing the strings `cp(1)` and `passwd(5)`, the package version, your explanation of `cp -a`, and the successful comparison result. Include one question that would still require a different manual section. Do not copy an entire manual page.

{% /task %}

{% task id="task-fccffc960372" title="Verify, vary and finish" %}

Archive the evidence and fixture. Keep documentation packages installed for the remaining program.

{% reveal title="Try a changed requirement" %}

Find the documentation for an unfamiliar systemctl option and distinguish the unit-file format from the systemctl command reference.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-04" grade=true /%}

{% /task %}
{% /lab %}
