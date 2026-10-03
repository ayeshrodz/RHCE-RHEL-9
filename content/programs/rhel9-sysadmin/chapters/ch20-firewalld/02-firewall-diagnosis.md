---
title: Verify reachability, not just a rule
kind: lesson
minutes: 10
---

{% lead %}A policy listing shows configured intent. A remote request tests whether the actual caller reaches the intended application under that policy.{% /lead %}

{% objectives %}
- Apply zone policy in runtime and permanent configuration.
- Verify allowed and denied service access from another host.
{% /objectives %}

## Establish the baseline

First verify the service listens on the expected address and port using `ss -lntp`. Then test its local endpoint. A successful localhost request does not cross the same path as a remote request and cannot prove the interface zone is correct.

Use a client on another lab VM to test both the allowed service and a deliberate denied case. Read the response: an HTTP 403 demonstrates a reached application refusing a request, while a timeout may reflect a dropped packet, route failure or another unreachable dependency. A refused connection can result from no listener or explicit rejection. These are clues, not complete diagnoses by themselves.

## Source and interface policy

Record client source address, server interface, active zone and the named rule. A rule restricted to `192.0.2.0/24` will not permit the lab's `172.25.250.0/24` callers unless another rule applies. Verify total zone policy: adding a narrow rich rule while a broad http allowance remains does not make access narrow.

Review IPv4 and IPv6 behavior. An IPv4-only restriction does not automatically define IPv6 policy. Do not accidentally publish a service on all available addresses because only one protocol family was tested.

## SELinux remains separate

A network rule permits traffic; SELinux can govern the daemon's ability to bind the port or read content. Discretionary permissions still matter. Test a local listener and application before modifying firewall policy, and keep enforcing throughout the lab.

A rollout should include the intended policy, live query, permanent query, fresh client request, reload/reboot test and rollback. Keep a copy of the original active-zone output so you can restore assignments intentionally rather than guessing a default.

## Check your understanding

{% quiz id="quick" objectives=["ch20.operations", "ch20.verification"] ref="quick" /%}


## Documentation

- [RHEL firewall guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_firewalls_and_packet_filters/index)
