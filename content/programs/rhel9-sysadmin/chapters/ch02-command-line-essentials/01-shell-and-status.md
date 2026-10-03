---
title: Meet the shell
kind: lesson
minutes: 10
---

{% lead %}The shell turns the line you type into a program invocation. Knowing which part Bash handles helps you explain an unexpected result instead of repeating it.{% /lead %}

{% objectives %}
- Run commands and inspect their exit status.
- Predict quoting, expansion and redirection before running a command.
{% /objectives %}

## Know where you are

A terminal gives you a session; Bash is one program running inside it. A prompt usually names the user, host and working directory. `$` conventionally means a regular user; `#` usually means root. A customized prompt is not proof of privilege. Verify identity and location before changing files:

```bash
id
hostname
pwd
printf '%s\n' "$SHELL"
```

`$SHELL` records the configured login shell, which may differ from a shell you started manually. `ps -p $$ -o comm=` identifies the current shell process. A command normally has a program name, options and operands: `ls -l /etc` invokes `ls`, requests a long listing, and supplies `/etc` as the operand. Use `type cd` and `type ls` to distinguish built-ins from external commands. `cd` must change the shell's own directory; an independent process cannot change its parent's directory.

Tab completion reduces typing errors. Press Tab twice to see alternatives; use Ctrl+A and Ctrl+E for the start and end of a line, Ctrl+U to clear back to the start, and Ctrl+R to search history. Ctrl+C interrupts a foreground job. Do not paste unfamiliar lines from history without checking the host and paths. Passwords and tokens should never appear in command arguments or history.

## Success is a result you inspect

Every command reports an exit status: zero conventionally means success, and a nonzero number means another outcome. Read it immediately; another command replaces `$?`.

```bash
test -d /etc
printf 'status=%s\n' "$?"
command -v bash
```

`cmd1 && cmd2` runs the second command only after success. `cmd1 || cmd2` runs it after failure. A semicolon runs both regardless. Avoid relying on visible output: `test` is intentionally silent. Later scripts will use status to decide whether a backup should proceed.

## Variables and the environment

`site=lab` creates a shell variable; `export site` also supplies it to child processes. `env` shows exported values. Quote expansions: `printf '%s\n' "$site"`. An unset expansion and an empty string often look alike; use `declare -p site` when investigating. `PATH` lists directories searched for commands in order. Do not add the current directory to PATH: a downloaded executable could shadow a trusted command.

Before continuing, predict whether `false && printf 'done\n'` prints anything, then run it and explain the status. The shell's behavior is the concept; the command is evidence.

## Explore the model

{% flow-map ref="model" title="Command-line essentials: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch02.operations", "ch02.verification"] ref="quick" /%}


## Documentation

- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
