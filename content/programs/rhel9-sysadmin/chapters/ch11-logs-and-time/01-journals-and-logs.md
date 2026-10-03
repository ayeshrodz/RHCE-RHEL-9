---
title: Find and retain useful events
kind: lesson
minutes: 10
---

{% lead %}A log entry is useful when you know its source and time context. Preserve enough history to investigate the previous boot as well as the current symptom.{% /lead %}

{% objectives %}
- Filter logs by host, boot, service and time.
- Make log retention and time synchronization observable.
{% /objectives %}

## Ask a narrow question

```bash
sudo journalctl -b -p warning --no-pager
sudo journalctl -u sshd --since '1 hour ago' --no-pager
sudo journalctl --list-boots
```

`-b` selects a boot, `-u` a unit, and `--since` a time boundary. `-p warning` includes that severity and more severe events, not only warning. `journalctl -f` follows new entries. `-o short-iso` produces useful timestamped output. Access to all system events may require elevated privileges or configured journal group membership.

Use `logger -t kp-practice 'service check complete'` to create a harmless event and retrieve it with `journalctl -t kp-practice`. The journal stores structured fields; service and boot filters are more precise than an unbounded grep of every message.

## Storage and persistence

With the usual Storage=auto policy, a journal can remain under `/run/log/journal` if persistent storage is absent. `/run` does not survive a reboot. To request persistence explicitly, an administrator can add `/etc/systemd/journald.conf.d/10-persistent.conf` with a Journal section and `Storage=persistent`, create the persistent directory with the supported tmpfiles rules, then restart journald and run `journalctl --flush`.

Set retention to match capacity and incident needs. `journalctl --disk-usage` shows consumption; vacuum operations remove archived history and are irreversible data deletion. Do not vacuum during an investigation before saving required evidence. Persistence must be tested by querying the previous boot after a reboot, not merely by reading a configuration line.

## Traditional logs and rotation

rsyslog routes syslog messages to configured destinations, including traditional files under `/var/log` when installed and enabled. Do not assume every minimal image has `/var/log/messages`. Inspect the services and configuration. `logrotate` manages rotations for text files; `logrotate -d /etc/logrotate.conf` diagnoses rules without performing rotation. Journal retention has its own controls.

A service can log secrets if configured badly. Keep incident extracts narrow, preserve original timestamps, and redact credentials before sharing. A missing event may reflect the wrong boot, clock, service, severity, retention or logging destination rather than the absence of an incident.

## Explore the model

{% flow-map ref="model" title="Logs and time: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch11.operations", "ch11.verification"] ref="quick" /%}


## Documentation

- [RHEL logs and time](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
