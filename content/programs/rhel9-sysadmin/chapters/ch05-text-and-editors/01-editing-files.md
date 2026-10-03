---
title: View, edit and review
kind: lesson
minutes: 10
---

{% lead %}Configuration is text, but editing it is a system change. Learn to navigate a file, save deliberately and review a diff before asking a service to read it.{% /lead %}

{% objectives %}
- Edit and compare text without accidentally changing unrelated lines.
- Extract reliable reports using fields, sorting and regular expressions.
{% /objectives %}

## Read before editing

`less file` reads without loading everything into a terminal buffer. Search with `/`, move to the end with `G`, and quit with `q`. `head -n 20` and `tail -n 20` select a portion; `tail -F` follows a name across log rotation, while `tail -f` usually follows an open file descriptor. A live stream is incomplete evidence until you identify the time window and host.

```bash
head -n 5 /etc/passwd
wc -l /etc/passwd
less /etc/passwd
```

## Vim essentials

Run `vim settings.conf` on a practice copy. Normal mode is for movement and commands. `i` enters insert mode, Esc returns to normal, `:w` saves, `:q` quits, and `:q!` discards unsaved changes. `:wq` saves and quits. `u` undoes a change; Ctrl+R redoes it. `/text` searches, `n` repeats, `dd` deletes a line and `p` puts text after the cursor.

Keep the exact mode in mind: typing `:w` in insert mode adds text to the file. Use `:set number` when following line-oriented diagnostics. `:%s/old/new/gc` substitutes with confirmation; inspect the match range before changing a large file. Nano is a valid alternative for manual edits; understand saving, quitting and backup behavior for whichever editor you use.

## Review the change

Make a copy before editing and compare afterward:

```bash
cp -p settings.conf settings.conf.before
vim settings.conf
diff -u settings.conf.before settings.conf
```

Diff status 0 means identical; 1 means differences; values greater than 1 indicate trouble. Differences are expected during review. Do not treat status 1 as a failed edit.

For a privileged configuration, use `sudoedit` where your policy permits it and run the service's syntax checker before reload. A backup should preserve needed metadata; a world-readable copy of a secret configuration is a new leak. An editor can successfully save an invalid configuration, so save success and service validity are distinct checks.

## Explore the model

{% flow-map ref="model" title="Working with text: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch05.operations", "ch05.verification"] ref="quick" /%}


## Documentation

- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
