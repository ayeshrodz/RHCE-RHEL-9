---
title: Permission decisions and shared directories
kind: lesson
minutes: 10
---

{% lead %}Permissions govern operations on objects and their parent directories. A writable file in an inaccessible directory is still unreachable.{% /lead %}

{% objectives %}
- Apply modes, ownership and special directory permissions.
- Explain effective ACL access and test it as the intended user.
{% /objectives %}

## File and directory bits differ

For files, read permits reading content, write permits modifying it, and execute permits execution if the format and other policy allow it. For directories, read permits listing names, execute permits traversing and looking up entries, and write permits changing entries when combined with traversal. Deleting a file generally depends on its parent directory's permissions rather than the file's write bit.

The applicable permission class is selected: owner first, then a matching group, otherwise other. Classes are not combined to rescue a denied owner. Root and special capabilities can bypass many discretionary checks; SELinux is an additional policy layer.

```bash
ls -ld /srv
namei -l /srv/team/report.txt
stat -c '%U %G %a %n' /srv/team
```

`namei -l` displays path-component permissions and is useful for a traversal failure.

## Symbolic and numeric modes

`chmod u=rw,g=r,o= file` sets `0640`. The octal values read=4, write=2 and execute=1 combine per class. `chmod g+w file` changes one bit while retaining others. `chown user:group file` changes owner and group; only authorized identities can change ownership.

`umask` removes bits from the creation mode requested by a program. Ordinary files generally start from `0666`, directories from `0777`. With mask `0027`, those commonly become `0640` and `0750`. A mask does not add execute bits or rewrite existing files.

## Collaborative directories

A setgid directory, such as mode `2770`, makes new entries inherit the directory's group. It does not guarantee group write permission: the creator's mask or default ACL still matters. A sticky directory allows users to create entries but restricts removing or renaming other users' entries, subject to owner and privileged exceptions; `/tmp` normally uses this pattern.

Setuid on an executable can change effective identity. Understand and inventory it, but do not add setuid to a tool merely to avoid writing an access policy. Recursive chmod can make ordinary data executable or remove needed directory traversal. Choose object types and test representative cases.

## Explore the model

{% flow-map ref="model" title="Permissions and ACLs: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch07.operations", "ch07.verification"] ref="quick" /%}


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
