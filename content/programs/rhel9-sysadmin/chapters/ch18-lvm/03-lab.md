---
title: 'Exercise: Logical volume management'
kind: lab
minutes: 60
---

{% lead %}
On a freshly reset servera and blank spare disk, create a 1 GiB XFS logical volume in vgpractice, mount it at /srv/data, then grow it to 1536 MiB while preserving a marker.
{% /lead %}

{% lab id="sysadmin-18" title="Logical volume management" objectives=["ch18.operations", "ch18.verification"] exercise="sysadmin-18" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Create and inspect PV, VG and LV storage layers.", "Grow a logical volume and its file system with independent verification."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-18
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

On a freshly reset servera and blank spare disk, create a 1 GiB XFS logical volume in vgpractice, mount it at /srv/data, then grow it to 1536 MiB while preserving a marker.

- Create and inspect PV, VG and LV storage layers.
- Grow a logical volume and its file system with independent verification.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-6f93f9981ce4" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-18
cd ~/sysadmin-18
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-bfa67c9d16ce" title="Verify and allocate the layers" %}

Repeat the blank-disk checks from chapter 17: lsblk, findmnt, wipefs -n and pvs. Stop if the spare still contains the previous exercise. After a correct host-and-disk reset:
```bash
sudo pvcreate /dev/sdb
sudo vgcreate vgpractice /dev/sdb
sudo lvcreate -L 1G -n data vgpractice
sudo lvs -o lv_name,vg_name,lv_size,lv_path
sudo mkfs.xfs /dev/vgpractice/data
sudo mkdir -p /srv/data
sudo mount /dev/vgpractice/data /srv/data
printf '%s\n' lvm-ready | sudo tee /srv/data/marker.txt
```

{% /task %}

{% task id="task-09dc7385686b" title="Grow to a reviewed final size" %}

```bash
sudo vgs
sudo lvextend -L 1536M /dev/vgpractice/data
sudo xfs_growfs /srv/data
sudo lvs
df -hT /srv/data
cat /srv/data/marker.txt
```
Explain why both commands are required and why rerunning an additive growth command would be a different change.

{% /task %}

{% task id="task-6192df3c33f3" title="Persist and retain evidence" %}

Obtain the filesystem UUID with `sudo blkid /dev/vgpractice/data`, add its real UUID fstab entry, validate with findmnt --verify, daemon-reload and test unmount/remount. Reboot and inspect the mount, LV size, filesystem size and marker. Record all four observations in `observations.txt` on workstation.

{% /task %}

{% task id="task-f7f292726462" title="Verify, vary and finish" %}

Retain evidence, then restore both servera and its external spare disk using the chapter 1 reset. Do not leave the VG on a spare used by the next storage exercise.

{% reveal title="Try a changed requirement" %}

Calculate needed free extents before a second desired-size growth. State why pooling another disk does not itself provide redundancy.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-18" grade=true /%}

{% /task %}
{% /lab %}
