---
title: Remote files and identity policy
kind: lesson
minutes: 10
---

{% lead %}NFS makes a remote filesystem visible locally. The network connection, export policy and file identity must all agree for access to work.{% /lead %}

{% objectives %}
- Mount a defined NFS export with suitable access policy.
- Configure and diagnose direct, indirect and wildcard automounts.
{% /objectives %}

## Server and client responsibilities

The server exports selected paths through `/etc/exports`; `exportfs -v` reports effective exports. The client mounts a specific server path. NFSv4 commonly uses TCP 2049, while NFSv3 can involve rpcbind and other services with additional firewall needs. Do not open a broad collection of ports without identifying the version and service arrangement.

An isolated-lab export might be:

```text
/srv/share 172.25.250.0/24(ro,sync,root_squash)
```

This grants the named lab subnet read-only access. `root_squash` maps client root to an unprivileged identity rather than allowing remote root to act as server root. Avoid `no_root_squash` as a convenience fix. Review the address scope and export options before `exportfs -rav` applies them.

## Ownership is an identity contract

Numeric IDs and NFS identity mapping can affect perceived ownership. A name that looks the same on two hosts need not correspond to the same identity. For shared write access, plan UID/GID or directory identity consistency. A read-only mount does not establish confidentiality: the export and network policy determine who can reach data.

SELinux client access and server export behavior depend on the workload and policy. A confined service reading an NFS mount may need its documented boolean. Inspect relevant booleans and denials; do not globally disable enforcing or turn on every NFS-related switch.

## Manual and persistent client mount

Install nfs-utils where needed, create a mountpoint, and test an explicit version when the requirement calls for it:

```bash
sudo mount -t nfs -o vers=4,ro serverb.lab.example.com:/srv/share /mnt/share
findmnt /mnt/share
```

An fstab entry can persist the mount. Evaluate network ordering, `_netdev`, retry behavior and whether boot may proceed without it. Hard mounts protect certain I/O guarantees but can leave workloads waiting during server outage; soft mounts have different failure and data risks. Choose according to workload rather than adding soft to silence a hang.

`showmount -e` is useful in some configurations but does not fully enumerate every NFSv4-only environment. A failed listing alone does not prove the intended NFSv4 mount is unavailable.

## Explore the model

{% flow-map ref="model" title="Network file systems and autofs: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch19.operations", "ch19.verification"] ref="quick" /%}


## Documentation

- [RHEL NFS guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/index)
- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
