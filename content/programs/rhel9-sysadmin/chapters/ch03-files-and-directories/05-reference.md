---
title: 'Reference: Files and directories'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Directory entry:** Associates a name with an inode; a rename changes the name association.

**Inode:** Stores object metadata and data references; multiple hard links can refer to it.

**Symbolic link:** Stores a target path, which can become dangling independently of the link.

## Command reference

| Example | Use and limits |
| --- | --- |
| `pwd -P` | Show physical location after resolving directory links. |
| `cp -a source copy` | Copy a tree and request metadata preservation; privilege still constrains it. |
| `ls -li FILES` | Compare inode numbers and hard-link counts. |
| `readlink LINK` | Read the stored symbolic-link target. |
| `find . -type f -name "*.txt" -print` | Inspect a live selection before adding an action. |
| `stat FILE` | Inspect size, ownership and distinct timestamps. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch03/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Move a symlink to another directory. Predict how a relative target resolves, then repair it without using an absolute path.


## Documentation

- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
