---
title: 'Reference: Working with text'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Input records:** Define delimiters and what an exact state value means.

**Selection:** Choose whole fields or anchored patterns; test a near match.

**Reviewed output:** Check row count, ordering and a diff before replacing any original.

## Command reference

| Example | Use and limits |
| --- | --- |
| `less FILE` | Read and search without editing. |
| `diff -u before after` | Review changes; status 1 means the files differ. |
| `cut -d: -f1 FILE` | Extract a delimiter-based field. |
| `awk -F: '$2 == "ready" {print $1}' FILE` | Compare an exact field rather than a substring. |
| `LC_ALL=C sort FILE` | Produce a deliberate bytewise order. |
| `sort FILE \| uniq -c` | Group equal records before counting adjacent duplicates. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch05/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Add an empty field and a comment line. State a parsing rule and make your report implement it.


## Documentation

- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
