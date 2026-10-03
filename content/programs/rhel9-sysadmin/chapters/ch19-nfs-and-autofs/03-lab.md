---
title: 'Exercise: Network file systems and autofs'
kind: lab
minutes: 60
---

{% lead %}
On clean serverb, export a read-only fixture to the lab subnet. On clean servera, mount it through an indirect autofs map and prove the content comes from an NFS child mount.
{% /lead %}

{% lab id="sysadmin-19" title="Network file systems and autofs" objectives=["ch19.operations", "ch19.verification"] exercise="sysadmin-19" ownExercise=true hosts=["workstation", "servera.lab.example.com", "serverb.lab.example.com"] outcomes=["Mount a defined NFS export with suitable access policy.", "Configure and diagnose direct, indirect and wildcard automounts."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera and serverb. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-19
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

On clean serverb, export a read-only fixture to the lab subnet. On clean servera, mount it through an indirect autofs map and prove the content comes from an NFS child mount.

- Mount a defined NFS export with suitable access policy.
- Configure and diagnose direct, indirect and wildcard automounts.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-220ab63d5a54" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-19
cd ~/sysadmin-19
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-c404c8209951" title="Prepare the provider on serverb" %}

```bash
sudo dnf install nfs-utils
sudo install -d -m 0755 /srv/share
printf '%s\n' nfs-ready | sudo tee /srv/share/readme.txt
printf '%s\n' '/srv/share 172.25.250.0/24(ro,sync,root_squash)' | sudo tee /etc/exports.d/kp.exports
sudo exportfs -rav
sudo systemctl enable --now nfs-server
sudo firewall-cmd --permanent --add-service=nfs
sudo firewall-cmd --reload
sudo exportfs -v
```
Keep enforcing. Inspect a relevant denial if the server cannot read its fixture.

{% /task %}

{% task id="task-4c8238ec2a3c" title="Configure the consumer on servera" %}

```bash
sudo dnf install nfs-utils autofs
printf '%s\n' '/mnt/team /etc/auto.team --timeout=60' | sudo tee /etc/auto.master.d/kp.autofs
printf '%s\n' 'docs -fstype=nfs,ro,vers=4 serverb.lab.example.com:/srv/share' | sudo tee /etc/auto.team
sudo systemctl enable --now autofs
sudo systemctl restart autofs
sudo automount -m
cat /mnt/team/docs/readme.txt
findmnt -T /mnt/team/docs/readme.txt
```
The content must be nfs-ready and the child filesystem nfs4, not just an autofs parent.

{% /task %}

{% task id="task-63b555e7b27d" title="Verify policy and lifecycle" %}

Try creating a file through the read-only client path; it must fail. Leave the mapped tree, observe idle expiry, trigger it again, then reboot the client and repeat the access check. Save the mount source, format, read-only result and reboot observation to workstation's `nfs-evidence.txt`. The typed content check triggers access; it does not prove expiry or outage recovery.

{% /task %}

{% task id="task-609d973d2104" title="Verify, vary and finish" %}

Leave all mapped paths, save evidence, then reset both servera and serverb. Manual cleanup must remove only the authored map and export and review remaining active users.

{% reveal title="Try a changed requirement" %}

Create a direct map for the same export and explain how its key differs from the indirect docs key.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-19" grade=true /%}

{% /task %}
{% /lab %}
