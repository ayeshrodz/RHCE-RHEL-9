---
title: Expansion, streams and pipelines
kind: lesson
minutes: 10
---

{% lead %}You can combine small tools into useful work once you control which text the shell expands and where each stream goes.{% /lead %}

{% objectives %}
- Run commands and inspect their exit status.
- Predict quoting, expansion and redirection before running a command.
{% /objectives %}

## Quote for the intended meaning

Single quotes preserve literal text; double quotes preserve spaces while allowing variable and command substitution. Unquoted variables can split into words and expand filename patterns. Try the following in an empty practice directory:

```bash
label='night shift'
printf '<%s>\n' "$label"
printf '<%s>\n' $label
printf '%s\n' '$label' "$label"
```

The unquoted expansion supplies two arguments. Globs such as `*.log`, `file?.txt` and `[ab]*` match names before the program runs. They are not regular expressions: a grep expression matches text inside files. If a glob finds no match under ordinary Bash defaults, the pattern stays literal. Hidden files do not normally match `*`. Use `--` before an operand that begins with a hyphen, for example `ls -- -notes`.

## Three streams

Standard input is descriptor 0, standard output 1, and standard error 2. `>` truncates an output file before the command runs; `>>` appends. `<` supplies input from a file. `2>` redirects errors. A pipeline connects stdout to the next program's stdin; stderr still goes to the terminal unless redirected.

```bash
printf '%s\n' alpha beta alpha > names.txt
sort names.txt | uniq -c > counts.txt
ls /etc /missing > listing.txt 2> errors.txt
```

Never write `sort names.txt > names.txt`: Bash truncates the input first. Write to a separate temporary output, inspect it, and then replace the original.

## Order changes meaning

`command > result.txt 2>&1` sends stdout to a file, then sends stderr to the same destination. `command 2>&1 > result.txt` first makes stderr follow the original stdout, so errors remain on the terminal. `|&` is Bash shorthand for piping both streams.

A pipeline normally reports the final command's status. In a script, `set -o pipefail` makes a failing upstream stage observable. This still needs deliberate error handling; an expected grep no-match status is not automatically an incident.

## Match text deliberately

`grep -F` searches literal strings. `grep -E '^web[0-9]+$' names.txt` uses an extended regular expression with line anchors and repetition. Quote patterns so the shell cannot interpret them. Test on sample lines containing near misses, such as `web1-old`, before filtering an operational file.

## Check your understanding

{% quiz id="quick" objectives=["ch02.operations", "ch02.verification"] ref="quick" /%}


## Documentation

- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
