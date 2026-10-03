---
title: Manage units and service failures
kind: lesson
minutes: 10
---

{% lead %}systemd manages services and their relationships. Ask separately whether a service is running now and whether it will be started at boot.{% /lead %}

{% objectives %}
- Separate live service state from boot activation policy.
- Diagnose unit failures and rehearse console-based recovery.
{% /objectives %}

## Runtime and startup policy

`systemctl start name` changes current state; `enable name` adds startup links described by the unit's Install section. `enable --now` does both. `stop` does not necessarily disable; `disable` does not necessarily stop. A static unit lacks ordinary enable instructions but can still start as a dependency. A masked unit is linked to `/dev/null` and cannot be activated until unmasked.

```bash
systemctl is-active chronyd
systemctl is-enabled chronyd
systemctl status chronyd --no-pager
systemctl cat chronyd
```

An enabled service can fail. A disabled service can be running. Do not infer application readiness from either single state. Use the application's own probe as well as the service state.

## Inspect failures in context

`systemctl --failed` lists failed units. `journalctl -u name -b` filters one unit in the current boot. Check executable paths, permissions, environment, missing mounts, port conflicts and configuration syntax. A process exit code and the journal often distinguish a bad configuration from an access denial.

The manager reads distribution units under `/usr/lib/systemd/system`; administrator overrides live under `/etc/systemd/system`. Use `systemctl edit name` for a drop-in rather than editing the package's file. Resetting a list setting such as ExecStart may require an empty assignment before its replacement; consult the installed unit reference.

## Custom unit basics

A service file has Unit, Service and often Install sections. Use absolute executable paths and define the least privileged User and Group suitable for the job. systemd does not invoke a shell for ExecStart automatically; shell redirection and pipelines are not ordinary command-line syntax here. Use an explicit script only when one is actually needed.

`systemd-analyze verify /etc/systemd/system/name.service` checks unit structure. `systemctl daemon-reload` rereads unit files; it does not restart the service. A daemon's `reload` operation concerns its application configuration, not the manager's unit definitions. Verify each layer after a change.

## Explore the model

{% flow-map ref="model" title="Services and the boot process: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch09.operations", "ch09.verification"] ref="quick" /%}


## Documentation

- [RHEL systemd guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/index)
- [RHEL recovery reference](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
