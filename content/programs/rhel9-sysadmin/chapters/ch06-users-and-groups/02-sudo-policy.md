---
title: Use privilege as a scoped tool
kind: lesson
minutes: 10
---

{% lead %}Administrative access should be enough for the job and understandable to the reviewer. Validate policy before closing your working session.{% /lead %}

{% objectives %}
- Manage account membership and lifecycle using supported tools.
- Delegate administrative work and validate policy safely.
{% /objectives %}

## Switching identity

`su - user` creates a login-like environment for another identity; `sudo command` requests a command under policy. `sudo -i` opens a root login shell where allowed. Prefer a narrowly scoped command when you do not need a prolonged root session. `sudo -l` shows the caller's permitted operations. Normal sudo often authenticates the calling user's password, not root's.

The home-lab `student` account belongs to wheel and uses password-protected sudo. The `devops` lab identity has broader passwordless access for tooling. Those are isolated-lab conveniences, not a production policy recommendation.

## Edit sudoers with its checker

Use `sudo visudo -f /etc/sudoers.d/operators` to edit a drop-in. `visudo` checks syntax before installing the change. Choose a drop-in name without a dot or backup suffix because included-directory rules skip certain filenames. Protect the file as root-owned mode `0440`.

```text
%operators ALL=(root) /usr/bin/systemctl status chronyd
```

The group may query the named service under this rule. A sudoers rule is a command specification with argument matching, not an application sandbox. Commands that start pagers, editors, interpreters or arbitrary subcommands may permit more than their names suggest. Validate allowed and denied operations as the actual user; a successful root test proves nothing about delegated policy.

## Review total access

Permissions from multiple sudoers rules accumulate. A restrictive drop-in does not remove rights already granted by wheel. For a meaningful least-privilege exercise, use a practice account that is not in wheel. Avoid `NOPASSWD: ALL` as a shortcut. Use full paths and an explicit argument list; do not assume a wildcard pattern confines arbitrary arguments safely.

A read-only command may still expose confidential data. Review the output and the execution context as well as whether a command changes state. Keep your existing administrative session open while testing policy from a second session, and use the console if the policy change locks you out.

## Check your understanding

{% quiz id="quick" objectives=["ch06.operations", "ch06.verification"] ref="quick" /%}


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
