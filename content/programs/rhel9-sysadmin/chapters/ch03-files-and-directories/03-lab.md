---
title: 'Exercise: Files and directories'
kind: lab
minutes: 40
---

{% lead %}
Create a small service handover tree, preserve a copy, and demonstrate which link survives a rename. All changes stay inside the project directory.
{% /lead %}

{% lab id="sysadmin-03" title="Files and directories" objectives=["ch03.operations", "ch03.verification"] exercise="sysadmin-03" ownExercise=true hosts=["workstation"] outcomes=["Navigate and manipulate files without confusing names with contents.", "Diagnose links, timestamps and file searches."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-03
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Create a small service handover tree, preserve a copy, and demonstrate which link survives a rename. All changes stay inside the project directory.

- Navigate and manipulate files without confusing names with contents.
- Diagnose links, timestamps and file searches.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-f188478805c4" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-03
cd ~/sysadmin-03
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-68fdae64af86" title="Create the handover tree" %}

```bash
mkdir -p handover/{incoming,archive}
printf '%s\n' ready > handover/incoming/status.txt
cp -p handover/incoming/status.txt handover/archive/status.txt
ln handover/incoming/status.txt handover/hard-status.txt
ln -s incoming/status.txt handover/current
```
Explain why the symlink target starts with `incoming`, not `handover/incoming`.

{% /task %}

{% task id="task-674f80152ee9" title="Observe names and objects" %}

```bash
ls -li handover/incoming/status.txt handover/hard-status.txt
readlink handover/current
mv handover/incoming/status.txt handover/incoming/renamed.txt
cat handover/hard-status.txt
test -e handover/current
printf 'target exists status=%s\n' "$?"
```
The hard link still reads `ready`; the symlink is dangling. Restore its target by renaming the file back.

{% /task %}

{% task id="task-e663b2f28424" title="Search and compare" %}

```bash
find handover -type f -name '*.txt' -print
cmp handover/incoming/status.txt handover/archive/status.txt
stat handover/incoming/status.txt
```
Write the explanation of the two link types to `observations.txt`. The comparison must succeed. Do not delete files as part of the search.

{% /task %}

{% task id="task-de66f4af47af" title="Verify, vary and finish" %}

Archive the project; all names, links and copies were local to it.

{% reveal title="Try a changed requirement" %}

Move a symlink to another directory. Predict how a relative target resolves, then repair it without using an absolute path.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-03" grade=true /%}

{% /task %}
{% /lab %}
