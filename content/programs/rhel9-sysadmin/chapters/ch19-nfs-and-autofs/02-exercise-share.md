---
title: "Exercise: Export and mount a directory"
kind: lab
minutes: 30
---

{% lead %}
Make serverb an NFS server for one directory, open the firewall for it, and mount the share on servera. Then see what a read-only export and a read-only mount do.
{% /lead %}

{% lab
  objectives=["ch19.nfs"]
  id="share"
  title="Export and mount a directory"
  hosts=["workstation","servera","serverb"]
  outcomes=["Export a directory with exportfs.","Open NFS in the firewall.","Mount it on a client and check the result."] %}

  {% task id="task-6d627eeb3294" title="Prepare the server" %}
    On serverb as root (`sudo -i`), make sure `nfs-utils` is installed, create `/srv/shared` with a file `hello.txt` containing `shared file`, and find your lab network (the network of `ip -br addr show enp5s0`).

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@serverb
[student@serverb ~]$ sudo -i
[root@serverb ~]# dnf install -y nfs-utils
...output omitted...
Complete!
[root@serverb ~]# mkdir -p /srv/shared
[root@serverb ~]# echo "shared file" > /srv/shared/hello.txt
[root@serverb ~]# ip -br addr show enp5s0
enp5s0           UP             172.25.250.11/24 fe80::216:3eff:fe04:a5a7/64
```

    The network here is `172.25.250.0/24` (the address with the host part zeroed). Use the network of your own lab in the next task.
    {% /reveal %}
  {% /task %}

  {% task id="task-043134ef0721" title="Export it" %}
    Put one line in `/etc/exports` that shares `/srv/shared` read-write and synchronous with your lab network. Enable and start `nfs-server`, publish the exports, and show them with their options.

    {% reveal title="Show solution" %}

```console
[root@serverb ~]# echo '/srv/shared  172.25.250.0/24(rw,sync)' > /etc/exports
[root@serverb ~]# systemctl enable --now nfs-server
Created symlink /etc/systemd/system/multi-user.target.wants/nfs-server.service → /usr/lib/systemd/system/nfs-server.service.
[root@serverb ~]# exportfs -rav
exporting 172.25.250.0/24:/srv/shared
[root@serverb ~]# exportfs -v
/srv/shared   	172.25.250.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
[root@serverb ~]# systemctl is-active nfs-server; ss -tln | grep 2049
active
LISTEN 0      4096         0.0.0.0:2049       0.0.0.0:*
```
    {% /reveal %}
  {% /task %}

  {% task id="task-63faa6ba7534" title="Try to mount: the firewall says no" %}
    On servera, install `nfs-utils` if needed, create `/mnt/shared`, and mount `serverb:/srv/shared`. What happens, even though `ping serverb` works?

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@servera
[student@servera ~]$ sudo -i
[root@servera ~]# mkdir -p /mnt/shared
[root@servera ~]# ping -c 1 serverb | tail -2
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.134/0.134/0.134/0.000 ms
[root@servera ~]# mount -t nfs serverb:/srv/shared /mnt/shared
mount.nfs: No route to host
```

    The host is reachable, but the server's firewall rejects port 2049: "No route to host" is the usual sign of a firewall that is not letting the service in.
    {% /reveal %}
  {% /task %}

  {% task id="task-8547d4812de1" title="Open the firewall and mount" %}
    On serverb, add the `nfs` service permanently, reload, and check. Then mount again on servera and look at the result.

    {% reveal title="Show solution" %}

```console
[root@serverb ~]# firewall-cmd --permanent --add-service=nfs
success
[root@serverb ~]# firewall-cmd --reload
success
[root@serverb ~]# firewall-cmd --list-services
cockpit dhcpv6-client nfs ssh
[root@servera ~]# mount -t nfs serverb:/srv/shared /mnt/shared
[root@servera ~]# df -hT /mnt/shared
Filesystem          Type  Size  Used Avail Use% Mounted on
serverb:/srv/shared nfs4   20G  1.7G   18G   9% /mnt/shared
[root@servera ~]# cat /mnt/shared/hello.txt
shared file
[root@servera ~]# nfsstat -m
/mnt/shared from serverb:/srv/shared
 Flags:	rw,relatime,vers=4.2,rsize=131072,wsize=131072,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=172.25.250.10,local_lock=none,addr=172.25.250.11
```

    NFS version 4.2 was negotiated.
    {% /reveal %}
  {% /task %}

  {% task id="task-4b93dcb329e8" title="Writing as root" %}
    As root on servera, try to create a file in the share. What happens, and what is the owner of `/srv/shared` on serverb?

    {% reveal title="Show solution" %}

```console
[root@servera ~]# touch /mnt/shared/rootfile
touch: cannot touch '/mnt/shared/rootfile': Permission denied
[root@servera ~]# ls -ld /mnt/shared
drwxr-xr-x. 2 root root 38 Oct  3 18:47 /mnt/shared
```

    The directory belongs to root with mode 755, and the server treats the client's root as the unprivileged user `nobody` (root_squash), who has no write permission. The next lesson fixes ownership the right way.
    {% /reveal %}
  {% /task %}

  {% task id="task-5acc0f700ecb" title="Read-only, from either side" %}
    Unmount, then mount the share read-only (`-o ro`) and try to write. Then export it read-only on the server instead (change `rw` to `ro`, run `exportfs -rav`), mount normally, and try again.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# umount /mnt/shared
[root@servera ~]# mount -t nfs -o ro serverb:/srv/shared /mnt/shared
[root@servera ~]# touch /mnt/shared/x
touch: cannot touch '/mnt/shared/x': Read-only file system
[root@servera ~]# umount /mnt/shared
[root@serverb ~]# sed -i 's/(rw,sync)/(ro,sync)/' /etc/exports; exportfs -rav
exporting 172.25.250.0/24:/srv/shared
[root@servera ~]# mount -t nfs serverb:/srv/shared /mnt/shared; mount | grep -o 'nfs4 (r[ow]'
nfs4 (ro
[root@servera ~]# umount /mnt/shared
[root@serverb ~]# sed -i 's/(ro,sync)/(rw,sync)/' /etc/exports; exportfs -rav
exporting 172.25.250.0/24:/srv/shared
```

    "Read-only file system" is the message in both cases; `mount` shows which side decided. Leave the server exporting read-write, and the share unmounted, for the next exercises.
    {% /reveal %}
  {% /task %}
{% /lab %}
