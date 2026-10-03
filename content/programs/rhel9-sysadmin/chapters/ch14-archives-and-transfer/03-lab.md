---
title: 'Exercise: Archives and file transfer'
kind: lab
minutes: 40
---

{% lead %}
Back up a small service-data tree, verify its digest and restore into an empty directory. Compare restored contents and file mode, then preview a synchronization without deletion.
{% /lead %}

{% lab id="sysadmin-14" title="Archives and file transfer" objectives=["ch14.operations", "ch14.verification"] exercise="sysadmin-14" ownExercise=true hosts=["workstation"] outcomes=["Create and inspect archives with explicit metadata policy.", "Prove restored data and synchronize safely."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-14
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Back up a small service-data tree, verify its digest and restore into an empty directory. Compare restored contents and file mode, then preview a synchronization without deletion.

- Create and inspect archives with explicit metadata policy.
- Prove restored data and synchronize safely.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-4b18ae741bc9" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-14
cd ~/sysadmin-14
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-4facf6bbf7e3" title="Prepare and archive" %}

```bash
mkdir -p source/conf
printf '%s\n' retained-data > source/conf/status.txt
chmod 0640 source/conf/status.txt
tar --acls --xattrs --selinux -czf backup.tar.gz -C source .
sha256sum backup.tar.gz > backup.sha256
tar -tzf backup.tar.gz
```
This is a student-owned fixture, not a root ownership rehearsal.

{% /task %}

{% task id="task-b6da445392f2" title="Verify and restore" %}

```bash
sha256sum -c backup.sha256
mkdir restore
tar --acls --xattrs --selinux -xzf backup.tar.gz -C restore
cmp source/conf/status.txt restore/conf/status.txt
stat -c '%a %n' restore/conf/status.txt
```
Inspect contents and mode after extraction. If the archive already exists from a previous attempt, start with a new project or empty restore directory.

{% /task %}

{% task id="task-bdb250f23267" title="Preview and document" %}

```bash
rsync -av --dry-run --itemize-changes source/ mirror/
rsync -av source/ mirror/
```
Create `restore-notes.txt` stating digest result, comparison result, mode, the limits of this unprivileged test and why no deletion option was used. Change the original only after preserving the archive, and prove you can still restore the retained version.

{% /task %}

{% task id="task-88922b93c21d" title="Verify, vary and finish" %}

Archive the backup and restore evidence if wanted. All data is within the project; no remote or system configuration changed.

{% reveal title="Try a changed requirement" %}

Create an ACL on a source file and compare getfacl before and after a restore that includes --acls.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-14" grade=true /%}

{% /task %}
{% /lab %}
