---
title: "Exercise: Hunt the missing space"
kind: lab
minutes: 30
---

{% lead %}
Use up the space of one file system, find who is responsible, run out of inodes on another, and find a deleted file that still holds space. Work on the file systems from the previous exercise.
{% /lead %}

{% lab
  objectives=["ch17.maintenance"]
  id="space"
  title="Hunt the missing space"
  hosts=["workstation","servera"]
  outcomes=["Find large files with df and du.","Recognise and demonstrate inode exhaustion.","Find a deleted-but-open file with lsof +L1."] %}

  {% task id="task-ad866e16ee50" title="Check the starting point" %}
    On servera as root, make sure `/srv/data` (xfs) and `/srv/archive` (ext4) are mounted, and show their blocks and inodes.

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@servera
[student@servera ~]$ sudo -i
[root@servera ~]# mount -a
[root@servera ~]# df -h /srv/data /srv/archive
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb1       960M   39M  922M   5% /srv/data
/dev/sdb2       974M   24K  907M   1% /srv/archive
[root@servera ~]# df -i /srv/archive | tail -1
/dev/sdb2       65536    12  65524    1% /srv/archive
```

    The ext4 file system was created with 65536 inodes. XFS shows no fixed inode count in the same way.
    {% /reveal %}
  {% /task %}

  {% task id="task-61c157ccf681" title="Fill the data file system" %}
    Create an 800 MiB file `big.log` and three 50 MiB files `part1.tmp`, `part2.tmp`, `part3.tmp` in `/srv/data` with `fallocate -l SIZE FILE`. What happens to the third part? Then check `df`.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# fallocate -l 800M /srv/data/big.log
[root@servera ~]# for i in 1 2 3; do fallocate -l 50M /srv/data/part$i.tmp; done
fallocate: fallocate failed: No space left on device
[root@servera ~]# df -h /srv/data
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb1       960M  939M   22M  98% /srv/data
```

    The third 50 MiB request did not fit in the remaining space.
    {% /reveal %}
  {% /task %}

  {% task id="task-92ec4ebade0f" title="Find the culprit" %}
    Without looking at the names you used, find the biggest items in `/srv/data`, staying on this file system.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# du -xh --max-depth=1 /srv/data | sort -rh | head -3
900M	/srv/data
[root@servera ~]# du -ah /srv/data | sort -rh | head -4
900M	/srv/data
800M	/srv/data/big.log
50M	/srv/data/part2.tmp
50M	/srv/data/part1.tmp
```

    `--max-depth=1` showed only the total here because all files are directly in the directory; `-a` lists files individually. Then remove them: `rm /srv/data/part*.tmp /srv/data/big.log`.
    {% /reveal %}
  {% /task %}

  {% task id="task-2919ff93aecb" title="Run out of inodes" %}
    Remove the files, then create 65600 empty files in a new directory `/srv/archive/many`. What does `df -h` say, and what does `df -i` say? Can you create one more file?

    {% reveal title="Show solution" %}

```console
[root@servera ~]# rm /srv/data/part*.tmp /srv/data/big.log
[root@servera ~]# mkdir /srv/archive/many && cd /srv/archive/many
[root@servera many]# touch f{1..65600}
touch: cannot touch 'f65599': No space left on device
touch: cannot touch 'f65600': No space left on device
[root@servera many]# df -h /srv/archive | tail -1
/dev/sdb2       974M  1.5M  905M   1% /srv/archive
[root@servera many]# df -i /srv/archive | tail -1
/dev/sdb2       65536 65536      0  100% /srv/archive
[root@servera many]# touch newfile
touch: cannot touch 'newfile': No space left on device
[root@servera many]# cd; rm -rf /srv/archive/many
[root@servera ~]# df -i /srv/archive | tail -1
/dev/sdb2       65536    12  65524    1% /srv/archive
```

    The error is the same as for a full disk, but the cause is different: 905 MiB are free, and no inodes. Deleting the files fixed it.
    {% /reveal %}
  {% /task %}

  {% task id="task-6c1509adc9c4" title="A deleted file that still counts" %}
    Create a 200 MiB file `log.big` in `/srv/data`, keep it open with `tail -f log.big > /dev/null &`, delete the file, and compare `df` with `du`. Find the process with `lsof +L1`, stop it, and check again.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# dd if=/dev/zero of=/srv/data/log.big bs=1M count=200 2> /dev/null
[root@servera ~]# tail -f /srv/data/log.big > /dev/null &
[1] 1072
[root@servera ~]# rm /srv/data/log.big
[root@servera ~]# df -h /srv/data | tail -1; du -sh /srv/data
/dev/sdb1       960M  239M  722M  25% /srv/data
0	/srv/data
[root@servera ~]# lsof +L1 | grep srv/data
tail      1072 root    3r   REG   8,17 209715200     0  132 /srv/data/log.big (deleted)
[root@servera ~]# kill %1
[root@servera ~]# df -h /srv/data | tail -1
/dev/sdb1       960M   39M  922M   5% /srv/data
```

    `df` counted 200 MiB that `du` could not find. Stopping the process freed the space.
    {% /reveal %}
  {% /task %}

  {% task id="task-83cf3efe9e5d" title="Maintenance and clean up" %}
    Unmount `/srv/data`, check it with `xfs_repair -n`, set the label `datavol` with `xfs_admin -L`, and mount it again. Then undo everything from this chapter: remove the three fstab lines (restore your backup), unmount, turn off swap, wipe the signatures, and check that `sdb` is empty.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# umount /srv/data
[root@servera ~]# xfs_repair -n /dev/sdb1 | tail -2
Phase 7 - verify link counts...
No modify flag set, skipping filesystem flush and exiting.
[root@servera ~]# xfs_admin -L datavol /dev/sdb1
writing all SBs
new label = "datavol"
[root@servera ~]# mount /srv/data && blkid /dev/sdb1 | cut -c1-60
/dev/sdb1: LABEL="datavol" UUID="c64946eb-fc27-4485-8020-db4119b686eb"
[root@servera ~]# umount /srv/data /srv/archive; swapoff -a
[root@servera ~]# cp /root/fstab.bak /etc/fstab; systemctl daemon-reload
[root@servera ~]# wipefs -a /dev/sdb1 /dev/sdb2 /dev/sdb3 /dev/sdb > /dev/null
[root@servera ~]# rmdir /srv/data /srv/archive
[root@servera ~]# lsblk /dev/sdb
NAME MAJ:MIN RM SIZE RO TYPE MOUNTPOINTS
sdb    8:16   0   5G  0 disk
[root@servera ~]# findmnt --verify | tail -1
0 parse errors, 0 errors, 1 warning
[root@servera ~]# exit
[student@servera ~]$ exit
```

    `wipefs -a` erases the file system and partition-table signatures. You can also simply reset the servers with `rht-vmctl reset servers`.
    {% /reveal %}
  {% /task %}
{% /lab %}
