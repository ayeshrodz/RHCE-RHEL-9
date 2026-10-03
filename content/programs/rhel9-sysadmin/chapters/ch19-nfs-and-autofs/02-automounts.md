---
title: Mount on demand with autofs
kind: lesson
minutes: 10
---

{% lead %}An automount defines when a path should trigger a mount. Seeing the directory alone does not establish that remote data is currently mounted.{% /lead %}

{% objectives %}
- Mount a defined NFS export with suitable access policy.
- Configure and diagnose direct, indirect and wildcard automounts.
{% /objectives %}

## Indirect and direct maps

A master-map entry such as `/mnt/team /etc/auto.team --timeout=60` associates a parent path with an indirect map. A map line `docs -fstype=nfs,ro serverb.lab.example.com:/srv/share` triggers `/mnt/team/docs`. A direct map uses `/-` in the master and full target paths as keys. Prefer a `.autofs` drop-in under `/etc/auto.master.d` when supported, keeping your entries separate from package configuration.

```text
# /etc/auto.master.d/kp.autofs
/mnt/team /etc/auto.team --timeout=60
```

A wildcard map uses `*` as the key and `&` to substitute the requested key into a remote path. That can serve per-user directories, but only when server exports, identity and directory permissions support the intended access. It is not a replacement for home-directory authorization.

## Observe triggering and expiry

Restart or reload autofs according to the installed daemon's requirements after a map change. `automount -m` shows interpreted maps. Access a mapped child, then inspect `findmnt`; the trigger causes work that an idle mount listing may not show. A parent autofs mount and a triggered NFS child are different objects.

Move your shell out of the mapped path and stop programs holding it open before expecting idle expiry. Timing is approximate and busy use can prevent unmounting. Do not mark a timeout experiment failed solely because your own shell is keeping the directory active.

## Diagnose in layers

Inspect the master-map filename and suffix, map key, server name, export path, name resolution, NFS version, firewall, ownership, SELinux and logs. Test an explicit manual mount to separate NFS problems from map problems. A spelling error in a map can look like a missing remote directory even though the server is healthy.

For persistent or on-demand designs, test server interruption only on disposable machines and retain console control. Record what callers experience during failure and recovery, not merely that the happy-path mount worked.

## Check your understanding

{% quiz id="quick" objectives=["ch19.operations", "ch19.verification"] ref="quick" /%}


## Documentation

- [RHEL NFS guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_using_network_file_services/index)
- [RHEL file systems guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/managing_file_systems/index)
