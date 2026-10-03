---
title: ACLs and effective access
kind: lesson
minutes: 10
---

{% lead %}ACLs express exceptions for named users and groups. The mask and inheritance rules decide whether those exceptions actually work.{% /lead %}

{% objectives %}
- Apply modes, ownership and special directory permissions.
- Explain effective ACL access and test it as the intended user.
{% /objectives %}

## Read the entire ACL

`getfacl path` shows the base entries, named entries and mask. `setfacl -m u:auditor:r-- file` adds access for a named user. The mask limits named-user, named-group and owning-group permissions. It does not limit the owner's entry or other entry. `getfacl` can show an effective permission that is narrower than the written entry.

```bash
sudo setfacl -m u:auditor:r-- /srv/team/report.txt
getfacl /srv/team/report.txt
```

The auditor still needs execute access through every parent directory. Granting file read without path traversal does not make it reachable. Avoid testing as root; switch to the intended user and attempt the exact operation.

## Default ACLs are creation policy

An access ACL controls the existing object. A default ACL on a directory supplies inherited entries for newly created children. It does not rewrite files that already exist. The creation mode requested by a program can still constrain inherited permissions: an application deliberately creating `0600` secrets must not be assumed to create group-readable files.

```bash
sudo setfacl -m d:g::rwx,d:m::rwx,d:o::--- /srv/team
getfacl /srv/team
```

Create a new file and directory, then inspect each. Setgid controls group inheritance, while default ACLs help control access inheritance. Use both when the collaboration requirement needs them.

## Diagnose before widening access

Inspect identity with `id`, the complete path with `namei -l`, mode and ACL with `ls -l` and `getfacl`, mount restrictions with `findmnt`, and mandatory policy with `ls -Z` and the audit log. A plus sign in a long listing signals an extended ACL. `chmod g...` on an ACL-bearing file changes the ACL mask rather than necessarily changing only one conceptual group entry.

Avoid `chmod 777`: it grants unrelated identities access, and it cannot repair a missing path, a read-only mount or SELinux denial. Preserve ACLs explicitly in archives or backups, and verify them after restore. Remove a named entry with `setfacl -x`; `-b` removes extended access ACL entries and deserves a review before use.

## Check your understanding

{% quiz id="quick" objectives=["ch07.operations", "ch07.verification"] ref="quick" /%}


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
