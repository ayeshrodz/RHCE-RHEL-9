---
title: 'Exercise: Storage and file systems'
kind: lab
minutes: 60
---

{% lead %}
On clean servera, identify its blank secondary disk, create a 1 GiB XFS practice partition and mount it at /srv/data by UUID. Retain a marker across unmount/remount and reboot. All disk writes target only the confirmed disposable spare.
{% /lead %}

{% lab id="sysadmin-17" title="Storage and file systems" objectives=["ch17.operations", "ch17.verification"] exercise="sysadmin-17" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Identify blank secondary storage before partitioning.", "Create, persist and verify file systems and swap."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-17
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

On clean servera, identify its blank secondary disk, create a 1 GiB XFS practice partition and mount it at /srv/data by UUID. Retain a marker across unmount/remount and reboot. All disk writes target only the confirmed disposable spare.

- Identify blank secondary storage before partitioning.
- Create, persist and verify file systems and swap.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-1eca1e2c5835" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-17
cd ~/sysadmin-17
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-9f1fd6025635" title="Prove the disk is disposable" %}

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
findmnt /
sudo wipefs -n /dev/sdb
sudo pvs
sudo dnf install parted xfsprogs
```
Proceed only when `/dev/sdb` is the blank 5 GiB lab disk with no mounts or LVM use. If your spare has another name, substitute the inspected name in every command. Stop rather than erase an unexplained signature.

{% /task %}

{% task id="task-ca8db1a6fcda" title="Create the file system and live mount" %}

```bash
sudo parted -s /dev/sdb mklabel gpt
sudo parted -s /dev/sdb mkpart data xfs 1MiB 1025MiB
sudo udevadm settle
lsblk /dev/sdb
sudo mkfs.xfs /dev/sdb1
sudo install -d -m 0755 /srv/data
sudo mount /dev/sdb1 /srv/data
printf '%s\n' storage-ready | sudo tee /srv/data/marker.txt
sudo blkid /dev/sdb1
```
These commands destroy any prior partitioning on the chosen spare. Never apply them to sda.

{% /task %}

{% task id="task-50d8516263d9" title="Persist and test" %}

Back up `/etc/fstab`, then add your actual UUID in an entry shaped as:
```text
UUID=YOUR-ACTUAL-UUID /srv/data xfs defaults 0 0
```
The literal placeholder must not be saved. Run `sudo findmnt --verify --verbose`, `sudo systemctl daemon-reload`, `sudo umount /srv/data` and `sudo mount /srv/data`. Verify `findmnt /srv/data` and the marker. Reboot with console access available and repeat both checks; record observations on workstation.

{% /task %}

{% task id="task-e62079c794b9" title="Practice swap on a disposable file" %}

On servera, first inspect `findmnt -T /` and `swapon --show`. This extension uses a supported ext4 or XFS root filesystem and an absent `/swapfile`; stop if a file already exists there or the root format is unsupported. The file is disposable and all current work must be retained before reset.
```bash
sudo test ! -e /swapfile
sudo dd if=/dev/zero of=/swapfile bs=1M count=128 status=progress
sudo chmod 0600 /swapfile
sudo mkswap /swapfile
sudo restorecon /swapfile
sudo swapon /swapfile
swapon --show
```
Proceed with file creation only after the absence check succeeds. Add `/swapfile none swap defaults 0 0` to the backed-up fstab, verify the file, then in the final reboot check confirm the file appears in `swapon --show`. The filesystem, allocation method, mode and actual activation all matter. Record the result before the host reset; do not apply this recipe to an unreviewed production root filesystem.

{% /task %}

{% task id="task-ef0b07294aa6" title="Verify, vary and finish" %}

Record evidence, then use the chapter 1 host reset that restores both servera and servera-disk2. A VM-only snapshot does not restore its external spare disk.

{% reveal title="Try a changed requirement" %}

On a separately reset spare, build an ext4 fixture and compare its resize and check tools with XFS. Never reformat the completed XFS mount in place.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-17" grade=true /%}

{% /task %}
{% /lab %}
