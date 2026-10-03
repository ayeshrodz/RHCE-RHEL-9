---
title: 'Exercise: Working with text'
kind: lab
minutes: 40
---

{% lead %}
Edit a small service configuration, then build an exact report of ready hosts. Preserve the original and show a reviewable diff.
{% /lead %}

{% lab id="sysadmin-05" title="Working with text" objectives=["ch05.operations", "ch05.verification"] exercise="sysadmin-05" ownExercise=true hosts=["workstation"] outcomes=["Edit and compare text without accidentally changing unrelated lines.", "Extract reliable reports using fields, sorting and regular expressions."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-05
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Edit a small service configuration, then build an exact report of ready hosts. Preserve the original and show a reviewable diff.

- Edit and compare text without accidentally changing unrelated lines.
- Extract reliable reports using fields, sorting and regular expressions.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-1c28e91d6b24" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-05
cd ~/sysadmin-05
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-a18b5c9983a1" title="Create an editable fixture" %}

```bash
cat > settings.conf <<'EOF'
listen=127.0.0.1
port=8080
EOF
cp -p settings.conf settings.conf.before
```
Change only `port=8080` to `port=8081` in Vim or Nano. Keep the listen value unchanged.

{% /task %}

{% task id="task-e407ab2e1435" title="Build a field-based report" %}

```bash
printf '%s\n' 'web2:ready' 'db1:down' 'web1:ready' 'web1:ready' > status.txt
awk -F: '$2 == "ready" {print $1}' status.txt | LC_ALL=C sort -u > ready.txt
diff -u settings.conf.before settings.conf > changes.diff
```
Diff returns 1 because the intended edit is present. Verify two unique host names in `ready.txt`.

{% /task %}

{% task id="task-b39a06e5f70d" title="Review and explain" %}

Read `changes.diff`. It must show only the port-line change, not a replaced whole file. Add `web3:not-ready` to the fixture and repeat the report: an exact field comparison must exclude it. Compare that behavior with an unanchored grep for `ready`.

{% /task %}

{% task id="task-8b978c090946" title="Verify, vary and finish" %}

Archive the before file, diff and report together. No actual service configuration was changed.

{% reveal title="Try a changed requirement" %}

Add an empty field and a comment line. State a parsing rule and make your report implement it.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-05" grade=true /%}

{% /task %}
{% /lab %}
