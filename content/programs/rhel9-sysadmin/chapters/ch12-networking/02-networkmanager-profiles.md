---
title: Persistent profiles and reversible changes
kind: lesson
minutes: 10
---

{% lead %}NetworkManager profiles are saved intentions. The kernel's live network state is their current application; modifying one does not guarantee the other changed.{% /lead %}

{% objectives %}
- Distinguish live addresses from persistent NetworkManager profiles.
- Diagnose reachability in layers without breaking management access.
{% /objectives %}

## Identify the profile and device

```bash
nmcli device status
nmcli -f NAME,UUID,TYPE,DEVICE connection show
nmcli -f GENERAL,IP4,IP6 device show
```

A profile name is not necessarily the device name. The home lab may expose a device such as enp5s0 even when LXD calls its NIC eth0. Inspect rather than copying a name from another host.

For a reviewed static profile, `nmcli connection modify NAME ipv4.method manual ipv4.addresses ADDRESS/PREFIX ipv4.gateway GATEWAY ipv4.dns DNS` changes saved values. Use the actual allocated values. DHCP uses `ipv4.method auto`; it can coexist with explicitly chosen additions depending on the profile. Activation or a supported reapply is needed for live changes. Bringing a profile up may drop SSH.

## RHEL 9 storage format

NetworkManager uses keyfile profiles under `/etc/NetworkManager/system-connections` for current profile creation. Older ifcfg configurations may still be present depending on the minor release and migration history. Prefer nmcli and inspect the installed version rather than teaching edits to network-scripts as the main method. Protect secrets and profile permissions; configuration files can include credentials.

`ip address add` changes kernel state directly and is useful for a controlled experiment, but is not a complete persistence workflow. Verify the saved profile, live state, reconnection and the next boot when persistence is required.

## Keep management recoverable

Before touching the active management profile, record its name and settings, open the console, and plan rollback. NetworkManager checkpoint support can provide timed rollback; read your installed nmcli device checkpoint syntax before using it. A clone with autoconnect disabled is a safer first exercise: it can store static intentions without altering the working NIC.

The lab uses a dummy device and a documentation-only address so the original management route stays available. This is a networking experiment, not a new route into the sealed practice network.

## Check your understanding

{% quiz id="quick" objectives=["ch12.operations", "ch12.verification"] ref="quick" /%}


## Documentation

- [RHEL networking guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/index)
