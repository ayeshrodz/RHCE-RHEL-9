---
title: Time zones and synchronized clocks
kind: lesson
minutes: 10
---

{% lead %}Two hosts can report different local times for the same instant. Correct clock synchronization and a recorded timezone make event ordering trustworthy.{% /lead %}

{% objectives %}
- Filter logs by host, boot, service and time.
- Make log retention and time synchronization observable.
{% /objectives %}

## Clock and presentation

`timedatectl` shows time settings and synchronization-related state. `timedatectl list-timezones` lists valid names; `timedatectl set-timezone UTC` changes presentation, not the underlying instant. A local timezone is appropriate when deliberately chosen, but incident reports should include the offset or use UTC.

```bash
timedatectl
date --iso-8601=seconds
```

The hardware clock and system clock are different stores. Avoid repeatedly setting time manually on a server using a synchronization daemon. Sudden clock jumps can affect logs, schedulers, authentication and applications.

## Chrony has state beyond active

RHEL 9 uses chronyd for normal time synchronization. `systemctl is-active chronyd` establishes that the daemon is running. `chronyc tracking` reports its synchronization state and offset; `chronyc sources -v` shows candidate sources and the selected source. A star marks the selected source; a question mark can indicate unreachable or unsuitable measurements.

Inspect `/etc/chrony.conf` and use authorized `server` or `pool` sources for your environment. NTP client traffic and DNS must reach those sources. A sealed home lab can have outbound access without permitting inbound administration; do not open an inbound NTP service merely to make a client synchronize. A daemon with no reachable source can be active and unsynchronized.

## Verify without falsifying evidence

Allow the daemon time to gather measurements. Investigate reachability, source configuration, DNS, clock offsets and VM behavior if it remains unsynchronized. `chronyc makestep` can force a time step under suitable policy, but first understand the effect on running workloads. Do not claim sync from a single service-state check or invent a local server that supplies authoritative time.

When collecting a log extract, record the hostname, boot ID, timezone and collection time. Those facts let another administrator compare events from multiple machines and recognize whether a clock problem changed apparent order.

## Check your understanding

{% quiz id="quick" objectives=["ch11.operations", "ch11.verification"] ref="quick" /%}


## Documentation

- [RHEL logs and time](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
