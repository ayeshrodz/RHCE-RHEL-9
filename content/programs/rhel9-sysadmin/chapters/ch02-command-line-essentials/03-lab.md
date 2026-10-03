---
title: 'Exercise: Command-line essentials'
kind: lab
minutes: 40
---

{% lead %}
Produce a repeatable report from a small host list. Keep useful output and errors separate, and explain the difference between literal text, a glob, and a regular expression.
{% /lead %}

{% lab id="sysadmin-02" title="Command-line essentials" objectives=["ch02.operations", "ch02.verification"] exercise="sysadmin-02" ownExercise=true hosts=["workstation"] outcomes=["Run commands and inspect their exit status.", "Predict quoting, expansion and redirection before running a command."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-02
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Produce a repeatable report from a small host list. Keep useful output and errors separate, and explain the difference between literal text, a glob, and a regular expression.

- Run commands and inspect their exit status.
- Predict quoting, expansion and redirection before running a command.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-1a0b90341a6b" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-02
cd ~/sysadmin-02
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-5d1ed55f1a60" title="Prepare and predict" %}

Run as student on workstation. In the exercise directory, create input:
```bash
printf '%s\n' web2 db1 web1 web1 web1-old > hosts.txt
```
Before running a filter, write down which lines `^web[0-9]+$` should match.

{% /task %}

{% task id="task-bd22386f8bed" title="Build the report" %}

Keep only whole web host names, sort them and remove duplicates. The finished report must contain exactly `web1` and `web2`, one per line.
{% reveal title="One solution" %}
```bash
grep -E '^web[0-9]+$' hosts.txt | sort -u > report.txt
```
{% /reveal %}
Compare `grep -F 'web1' hosts.txt`: why does that also match `web1-old`?

{% /task %}

{% task id="task-62a8fab348cd" title="Separate error and output" %}

```bash
ls /etc /does-not-exist > listing.txt 2> errors.txt
printf 'ls status=%s\n' "$?"
wc -l report.txt
cat report.txt
cat errors.txt
```
The missing directory must produce a nonzero status and an error file. Explain why the valid listing is still produced.

{% /task %}

{% task id="task-bce6b092d84f" title="Verify, vary and finish" %}

Keep the report if useful, then archive the exercise directory. No host configuration changed.

{% reveal title="Try a changed requirement" %}

Add web10 and web3; compare lexical order with sort -V and explain the difference.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-02" grade=true /%}

{% /task %}
{% /lab %}
