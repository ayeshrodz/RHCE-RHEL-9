---
title: Links, searches and timestamps
kind: lesson
minutes: 10
---

{% lead %}A directory name points to an object. Links make that distinction visible, and searches let you select objects using explicit criteria.{% /lead %}

{% objectives %}
- Navigate and manipulate files without confusing names with contents.
- Diagnose links, timestamps and file searches.
{% /objectives %}

## Hard and symbolic links

A hard link is another directory entry for the same inode on the same file system. Editing either name changes the same content. Removing one name leaves the object while another link or open file still references it. Ordinary users cannot hard-link directories, and hard links cannot cross file systems.

A symbolic link is its own object containing a path. Its target can be a directory or a different file system. A relative target is resolved from the link's directory, not your current directory. If the target name disappears, the link remains but is dangling.

```bash
printf '%s\n' ready > original.txt
ln original.txt hard.txt
ln -s original.txt soft.txt
ls -li original.txt hard.txt soft.txt
readlink soft.txt
```

Notice the matching inode numbers of the hard-linked names. `stat soft.txt` describes the link; `stat -L soft.txt` follows it. A symlink does not grant permission to its target. Ownership, directory traversal and later SELinux policy still apply.

## Select before acting

`find` walks live directory trees. Quote its name patterns:

```bash
find . -type f -name '*.txt' -print
find /etc -maxdepth 1 -type f -name '*.conf' -print
```

`find . -mtime +7` selects files by completed 24-hour periods, not a calendar date. `-mmin` selects in minutes. Modification time tracks content; change time tracks inode metadata changes, not creation. Access-time updates depend on mount policy. Avoid assuming every filesystem provides a portable creation timestamp.

Before adding `-delete` or `-exec`, inspect the exact selection. Use `-exec command {} +` to pass names directly rather than parsing `ls`; filenames can contain spaces and newlines. `find ... -print0` pairs with `xargs -0` when needed.

## Indexed search has a different promise

`locate` or `plocate`, when installed, searches a database. Its results can lag recent creation or deletion, and database permissions can hide paths. `find` is slower over a large tree but observes the current tree. Diagnose a missing result by checking the search root, pattern, permissions and whether the search is live or indexed.

Try renaming `original.txt`: predict which link still reads content and explain why before inspecting it.

## Check your understanding

{% quiz id="quick" objectives=["ch03.operations", "ch03.verification"] ref="quick" /%}


## Documentation

- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
