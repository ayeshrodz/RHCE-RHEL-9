---
title: Paths and safe file operations
kind: lesson
minutes: 10
---

{% lead %}A file path is a route through directories. Start by identifying the route and its destination; then choose the smallest operation that changes it.{% /lead %}

{% objectives %}
- Navigate and manipulate files without confusing names with contents.
- Diagnose links, timestamps and file searches.
{% /objectives %}

## The hierarchy has a purpose

`/` is the root directory. `/etc` holds host configuration, `/var` changing service data and logs, `/home` ordinary users' home directories, `/usr` distribution software, `/run` runtime state, and `/tmp` temporary files. `/root` is root's home, not the root directory. RHEL 9 uses symbolic links such as `/bin` into `/usr`; inspect them rather than assuming separate stores. `/proc` and `/sys` expose kernel information rather than ordinary disk files.

An absolute path starts with `/`. A relative path starts from the current working directory. `.` is that directory and `..` its parent. `~` expands to your home only where Bash recognizes tilde expansion. Quote names with spaces. `pwd -P` shows the physical location after symbolic links are resolved.

```bash
pwd
ls -ld / /etc /var /run
mkdir -p ~/file-practice/incoming
cd ~/file-practice
printf '%s\n' 'service ready' > incoming/status.txt
cp -p incoming/status.txt status-copy.txt
```

## Predict before copying or removing

`cp source directory/` places a file inside an existing directory. `cp source new-name` gives it that name. With multiple sources the destination must be a directory. `cp -a` copies trees while attempting to preserve metadata and links; normal users cannot preserve every owner or security attribute. `mv` renames on one file system but may copy and remove across file systems. Neither is a backup if your only copy disappears.

`mkdir -p` creates missing ancestors. `rmdir` removes only an empty directory. `rm` unlinks names; there is no automatic recycle bin on a server. Prefer a named practice directory, `ls` the intended operands first, and avoid root for user-file work. Interactive options can help but do not replace path verification.

## Inspect the object

`ls -la` shows hidden names and metadata. `file` estimates file format; an extension does not establish it. `stat` shows inode, timestamps, owner, mode and size. `du -sh directory` estimates allocated space; `ls -l` reports logical file length. A sparse file can have a large logical size and consume much less disk space. `df -h` reports the mounted file system's capacity, which is a different question.

Make a copy, edit it, and use `cmp` or `diff -u` to prove which content changed. Names and timestamps alone cannot establish equality.

## Explore the model

{% flow-map ref="model" title="Files and directories: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch03.operations", "ch03.verification"] ref="quick" /%}


## Documentation

- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
