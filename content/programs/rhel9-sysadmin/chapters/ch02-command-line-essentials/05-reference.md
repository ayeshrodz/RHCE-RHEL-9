---
title: 'Reference: Command-line essentials'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Bash:** Expands quotes, variables and patterns; opens redirections before executing a command.

**Program:** Receives the expanded argument list and three streams; reports an exit status.

**Report:** Contains only the stream you selected. A successful consumer does not prove its producer succeeded.

## Command reference

| Example | Use and limits |
| --- | --- |
| `type COMMAND` | Distinguish shell built-ins from external programs. |
| `printf "%s\n" "$value"` | Pass a variable as one quoted operand. |
| `COMMAND >out.txt 2>errors.txt` | Keep useful output and diagnostics separate. |
| `grep -E "^web[0-9]+$" hosts.txt` | Match the complete record using an extended expression. |
| `set -o pipefail` | Expose upstream failures in pipeline status. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch02/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Add web10 and web3; compare lexical order with sort -V and explain the difference.


## Documentation

- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
