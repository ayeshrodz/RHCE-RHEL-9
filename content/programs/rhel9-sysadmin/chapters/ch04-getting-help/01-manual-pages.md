---
title: Read the manual with a question
kind: lesson
minutes: 10
---

{% lead %}Documentation becomes useful when you bring a specific question. Learn how a manual page tells you what is required, optional and version-dependent.{% /lead %}

{% objectives %}
- Find installed command and configuration documentation.
- Use version-matched evidence when diagnosing an unfamiliar option.
{% /objectives %}

## Get local documentation ready

Minimal cloud images may contain documentation files without the `man` command. On workstation check `command -v man`; if absent, install `man-db` and `man-pages` with `sudo dnf install man-db man-pages`. Some programs ship their manuals in their own package. Installing man-pages does not install every program's reference.

`man ls` opens a reference in a pager. Use `/pattern` to search, `n` for the next match, `N` for the previous one, and `q` to quit. The NAME section tells you purpose; SYNOPSIS describes allowed syntax; DESCRIPTION and OPTIONS explain behavior; EXIT STATUS defines results; FILES and SEE ALSO connect commands to configuration and related tools.

```bash
man ls
man 5 passwd
man 1 passwd
man -f passwd
```

Section 1 covers user commands, 5 file formats, and 8 administration commands. `passwd(1)` and `passwd(5)` answer different questions. Specify the section when ambiguity matters. Square brackets in a synopsis mean optional input; an ellipsis means repetition. Do not type those notation marks as literal arguments.

## Search by purpose

`apropos permission` and `man -k permission` search manual-page descriptions. They rely on a local index; if it is empty, an administrator can rebuild it with `mandb`. An empty keyword result does not prove a command has no documentation. Try its exact name and inspect package files before looking online.

## Verify a claim

Find the meaning of `cp -a`, then check whether the current user's privileges allow all metadata to be preserved. Write down the manual section and the installed package version alongside the conclusion. A reference describes requested behavior; your small experiment demonstrates what happened in this environment.

Do not start with a root command merely because an online answer uses sudo. Read the option's effect and test it on a harmless fixture first.

## Explore the model

{% flow-map ref="model" title="Getting help: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch04.operations", "ch04.verification"] ref="quick" /%}


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
