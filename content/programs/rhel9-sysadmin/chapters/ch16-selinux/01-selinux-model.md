---
title: Mandatory policy alongside file permissions
kind: lesson
minutes: 10
---

{% lead %}SELinux constrains what a process may do even when ordinary permissions allow it. A correct fix satisfies both access models.{% /lead %}

{% objectives %}
- Explain labels, modes, booleans and port policy.
- Correct the cause of a denial while keeping SELinux enforcing.
{% /objectives %}

## Context and mode

A context includes user, role, type and range. For routine service administration, the process domain and object type are usually the most useful first clues. `ps -eZ` shows process contexts; `ls -Z path` shows object labels. `getenforce` reports the current mode; `sestatus` includes persistent configuration and policy information.

Enforcing blocks disallowed actions and records denials. Permissive records would-be denials without enforcing them. Disabled removes the policy mechanism. Do not teach disabling as the remedy for service failures. A temporary diagnostic change has security consequences and must not substitute for a policy-correct result.

```bash
getenforce
ls -Zd /var/www/html
ps -eZ | grep httpd
```

The current mode and `/etc/selinux/config` can disagree until the next boot. Verify both, and avoid switching a previously disabled system to enforcing without the distribution's relabel/reboot procedure and console access.

## Label intent and current label

Moving a file can retain its existing label, while copying can produce labels influenced by the destination and operation. A file arriving from a home directory may be labeled as user data even if it now sits below a web root. `restorecon` applies configured file-context expectations.

`chcon` changes the current label. `semanage fcontext -a -t httpd_sys_content_t '/srv/site(/.*)?'` records persistent policy intent for a custom path; `restorecon -Rv /srv/site` applies it to existing files. A later relabel can undo a one-off chcon but should honor the configured mapping. `matchpathcon -V path` compares expected and current labels.

Do not label every application directory as web content. Choose the service's documented type and read/write needs. Ownership, ACLs and mount policy still apply after the label is corrected.

## Explore the model

{% flow-map ref="model" title="SELinux: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch16.operations", "ch16.verification"] ref="quick" /%}


## Documentation

- [RHEL SELinux guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/index)
