---
title: Zones and two configuration stores
kind: lesson
minutes: 10
---

{% lead %}A firewall decides which traffic crosses a boundary. Choose the boundary and intended callers before opening a service.{% /lead %}

{% objectives %}
- Apply zone policy in runtime and permanent configuration.
- Verify allowed and denied service access from another host.
{% /objectives %}

## Active zones determine the policy

`firewall-cmd --get-active-zones` shows zones selected by interfaces or sources. `--get-default-zone` gives the fallback. A rule in an inactive zone may not affect the traffic you test. Source-based assignments can direct a subset of clients to another zone; reason about the packet source and interface rather than reading only one configuration file.

```bash
sudo firewall-cmd --state
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --get-default-zone
sudo firewall-cmd --list-all
```

A firewalld service is a named definition of ports and protocols, not the systemd daemon itself. `--info-service=http` reports the definition. Allowing http does not start a web server. Starting httpd does not open a firewall rule. Check both layers.

## Runtime and permanent policy

Ordinary changes affect runtime state. `--permanent` changes saved configuration and usually does not alter runtime immediately. `--reload` replaces runtime with permanent state, which can remove temporary changes. Use explicit queries for both stores before expecting a reboot or reload to retain policy.

```bash
sudo firewall-cmd --add-service=http
sudo firewall-cmd --query-service=http
sudo firewall-cmd --permanent --query-service=http
```

This runtime-only addition can disappear after reload. Persist only the intended changes; `--runtime-to-permanent` copies all current runtime policy and can capture unrelated temporary allowances.

## Narrow allowances

Use a documented service definition when it matches the workload; otherwise specify a port and transport, such as `8080/tcp`. A rich rule can restrict a service to a source subnet. A zone with a source assignment can express a trust boundary, but placing a source in a broadly permissive zone can grant more than one intended service.

Preserve the administrative access rule and console path before changing interface zones. Never disable the entire firewall as the standard fix for a failed application request.

## Explore the model

{% flow-map ref="model" title="The firewall: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch20.operations", "ch20.verification"] ref="quick" /%}


## Documentation

- [RHEL firewall guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_firewalls_and_packet_filters/index)
