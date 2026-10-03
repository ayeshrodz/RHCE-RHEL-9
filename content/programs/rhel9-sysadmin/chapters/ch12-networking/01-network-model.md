---
title: Addresses, routes and name resolution
kind: lesson
minutes: 10
---

{% lead %}A successful connection needs a usable address, a route, a resolved destination when using names, and an available service. Test each dependency separately.{% /lead %}

{% objectives %}
- Distinguish live addresses from persistent NetworkManager profiles.
- Diagnose reachability in layers without breaking management access.
{% /objectives %}

## Prefixes describe networks

An IPv4 address such as `172.25.250.10/24` has a 24-bit network prefix. Hosts on that local subnet can usually communicate directly; other destinations need a route, often a default gateway. Do not select an address without checking allocation and conflicts. IPv6 uses longer hexadecimal addresses and prefixes; link-local addresses typically begin with `fe80::` and may need an interface scope when used directly. Brackets surround IPv6 literals in URL authorities.

```bash
ip -br link
ip -br address
ip route
ip -6 route
ip route get 172.25.250.11
```

An interface can be up without having the right address. A valid local address does not establish internet access. `ip route get` shows how the kernel would route one destination.

## Resolve through the real lookup path

`getent hosts serverb.lab.example.com` uses the configured Name Service Switch path, which can include files and DNS. `dig name` directly diagnoses DNS and may disagree with `/etc/hosts`. Check `/etc/nsswitch.conf`, the NetworkManager DNS configuration and `/etc/resolv.conf` ownership before editing generated resolver files.

A short name relies on a search domain or local file entry. FQDNs reduce that ambiguity. `hostnamectl` inspects persistent hostname policy; changing it does not automatically create a DNS record.

## Test the intended protocol

`ping` tests ICMP reachability when permitted, not an HTTP application or SSH login. `ss -lntp` shows TCP listeners and addresses: a service bound only to 127.0.0.1 cannot accept remote connections. `curl` tests HTTP behavior. A refused TCP connection differs from a timeout: investigate listener state, routes and firewalls using the evidence, without treating either result as an absolute diagnosis.

A systematic sequence is link, address, route, name lookup, listener, local request, remote request, and security policy. Record what passed and failed; change one layer at a time.

## Explore the model

{% flow-map ref="model" title="Networking: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch12.operations", "ch12.verification"] ref="quick" /%}


## Documentation

- [RHEL networking guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/index)
