---
title: "RHEL 9: Environment and practice"
eyebrow: Your learning environment
description: The practice lab this path uses, how an exercise works from start to grade, and the versions behind every example.
---

## What this path teaches

This path teaches the everyday work of a Linux system administrator on **Red Hat Enterprise Linux 9**: the shell and files, users and permissions, processes and services, networking, software, storage, security and containers. It assumes no Linux experience. Each chapter explains one idea at a time, draws it, lets you try the commands, and then has you do the real thing on a practice lab.

## The practice lab

[Chapter 1](#/ch01/overview) builds three Rocky Linux 9 virtual machines on one Ubuntu computer: **workstation**, where you work, and **servera** and **serverb**, which you administer. They sit on a private network that nothing outside can reach, with SELinux enforcing and firewalld running, as on a RHEL server. Each server has an empty second disk for the storage chapters.

{% cards %}
  {% card title="Building a lab for the first time" kicker="Start here" tone="teal" %}
    Follow chapter 1 from the start. It takes about two hours, and every step is checked as you go.
  {% /card %}
  {% card title="Already have the Ansible lab" kicker="No new lab needed" tone="purple" %}
    The Ansible path's lab is a superset of this one and runs every exercise here unchanged. Chapter 1's overview lists the three small updates it needs.
  {% /card %}
{% /cards %}

Rocky Linux is a free rebuild of RHEL 9, so commands, packages, paths and services match. Where RHEL behaves differently (registering a system for updates, for example), the lesson says so.

## How an exercise works

Exercises use the same commands in either lab:

{% steps %}
  {% step title="Reset the servers" %}
    On the Ubuntu host: `rht-vmctl reset servers`. Every exercise assumes clean servers.
  {% /step %}
  {% step title="Start" %}
    On workstation: `lab start NAME`. It creates `~/NAME` with the exercise brief and any starter files.
  {% /step %}
  {% step title="Work" %}
    Follow the tasks. Each one shows where it runs (workstation or a server, and as which user) and has its solution behind a button.
  {% /step %}
  {% step title="Grade" %}
    `lab grade NAME` reads your result on the servers and prints PASS or FAIL for each requirement. It never changes anything, so grade as often as you like.
  {% /step %}
  {% step title="Finish" %}
    `lab finish NAME` puts the folder away in `~/lab-archive/`.
  {% /step %}
{% /steps %}

`lab grade` logs in to each server as root with the SSH key chapter 1 sets up. A PASS means the grader saw the required result; a FAIL names the requirement it did not see. Some results can't be read from a file, such as "the change survives a reboot" or "a user can't do this": the tasks ask you to try those yourself, and say exactly what you should see.

## Your progress

Lessons, quizzes and exercises you complete are saved in this browser only. There are no accounts. [Your progress page](#/progress) shows what is left, and can export your progress to a file and import it on another computer.

## Versions behind the examples

| Component | Version on the practice lab |
| --- | --- |
| Rocky Linux | 9.8 |
| Kernel | 5.14.0 |
| systemd | 252 |
| SELinux policy | 38.1 |
| Podman | 5.x |

Every command and every piece of output in this path was run on that lab. A newer minor release of RHEL 9 or Rocky 9 should behave the same; if your output differs, compare versions first.

## References

- [RHEL 9 documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9)
- [RHEL 9: configuring basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
- [GNU Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
