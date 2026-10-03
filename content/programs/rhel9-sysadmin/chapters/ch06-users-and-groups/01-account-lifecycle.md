---
title: Accounts are identities, not just names
kind: lesson
minutes: 10
---

{% lead %}An account connects an identity to ownership, group membership and a login environment. Treat creation and removal as changes to access and data ownership.{% /lead %}

{% objectives %}
- Manage account membership and lifecycle using supported tools.
- Delegate administrative work and validate policy safely.
{% /objectives %}

## Where identity comes from

The kernel uses numeric user IDs and group IDs. Names make those IDs readable. `/etc/passwd` records local account properties; `/etc/shadow` holds protected password and aging information; `/etc/group` records local groups. Use `getent passwd name` and `getent group name` to query configured identity sources. A directory-backed account may exist without a local passwd entry. Do not edit these databases manually for routine work.

```bash
id student
getent passwd student
getent group wheel
```

A user has one primary group and can belong to supplementary groups. New processes inherit a membership set at login. Updating the database does not retroactively change an existing session. Reconnect before testing new access.

## Create and change deliberately

On a resettable server, the following creates a team and a member:

```bash
sudo groupadd operators
sudo useradd -m -s /bin/bash -G operators trainee
sudo passwd trainee
sudo usermod -aG wheel trainee
id trainee
```

`-aG` appends supplementary membership. `usermod -G` without `-a` replaces the supplementary set and can remove needed access. `-g` changes the primary group. Inspect `/etc/login.defs`, `useradd -D` and `/etc/skel` to understand defaults instead of assuming every system uses the same UID range or home contents.

## Password and account lifecycle

`chage -l trainee` reports aging policy. `chage -M 90 -W 7 trainee` sets maximum password age and warning period. `passwd -l` locks password authentication by altering the hash; it does not automatically revoke SSH keys, active sessions, service tokens or every other authentication mechanism. Offboarding needs a deliberate review of all access paths, account expiry, ownership and running processes.

A service account often uses `/sbin/nologin` and no interactive password. Do not use a service identity for routine administration. Before `userdel`, identify files owned by its UID, retain required data, and check jobs. `userdel -r` removes the home and mail spool, not every file owned elsewhere. Reusing a UID can unintentionally grant a new identity access to old files.

## Explore the model

{% flow-map ref="model" title="Users and groups: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch06.operations", "ch06.verification"] ref="quick" /%}


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
