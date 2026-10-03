---
title: Harden and transfer with a rollback path
kind: lesson
minutes: 10
---

{% lead %}SSH configuration changes can close your only administration path. Validate them and test a second connection before ending the first.{% /lead %}

{% objectives %}
- Verify remote-host identity and use key authentication.
- Validate SSH policy and transfer data without losing access.
{% /objectives %}

## Effective configuration matters

RHEL OpenSSH uses `/etc/ssh/sshd_config` and included drop-ins. Order matters: many settings use the first obtained value, so a later file may not override an earlier one. Match blocks can change settings for a particular connection. Inspect effective policy rather than judging one file alone.

```bash
sudo sshd -t
sudo sshd -T | grep -E 'permitrootlogin|passwordauthentication|pubkeyauthentication'
```

Use `sshd -T -C user=student,host=workstation,addr=172.25.250.9` when diagnosing conditional policy. Keep a console and a working authenticated session. Set `PermitRootLogin no` in an appropriately ordered drop-in, validate, reload sshd and test a fresh user login. Disable password access only after proving the required key-based accounts work; root denial does not establish that ordinary users can connect.

## Transfers use authenticated sessions

`scp file user@host:path` copies a named file. Modern OpenSSH scp commonly uses SFTP; older versions and compatibility flags can behave differently. Avoid relying on historical remote-shell wildcard behavior. `sftp user@host` provides an interactive transfer interface. `rsync -av source/ user@host:destination/` efficiently synchronizes content over SSH; a trailing slash means the contents of source rather than a new directory wrapper.

Use `rsync --dry-run` before synchronizing. `--delete` removes destination entries absent from the source and needs a separate review. Archive mode preserves several metadata fields but not automatically every ACL, extended attribute or owner when privileges do not permit it. Later backup labs add explicit metadata requirements.

## Verify from both ends

A successful transfer reports transport completion, not that your application can read the result. Compare checksums, inspect ownership and mode on the destination, and test as the actual service identity. Authentication, discretionary access, SELinux and network firewall are independent layers. Diagnose the failed layer rather than opening every permission at once.

## Check your understanding

{% quiz id="quick" objectives=["ch10.operations", "ch10.verification"] ref="quick" /%}


## Documentation

- [RHEL OpenSSH reference](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
