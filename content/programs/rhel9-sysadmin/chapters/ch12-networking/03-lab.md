---
title: 'Exercise: Networking'
kind: lab
minutes: 40
---

{% lead %}
Create an isolated dummy-interface profile on clean servera using 192.0.2.10/24 and no default route. Prove the profile and live address independently, then diagnose the existing path to serverb.
{% /lead %}

{% lab id="sysadmin-12" title="Networking" objectives=["ch12.operations", "ch12.verification"] exercise="sysadmin-12" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Distinguish live addresses from persistent NetworkManager profiles.", "Diagnose reachability in layers without breaking management access."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-12
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Create an isolated dummy-interface profile on clean servera using 192.0.2.10/24 and no default route. Prove the profile and live address independently, then diagnose the existing path to serverb.

- Distinguish live addresses from persistent NetworkManager profiles.
- Diagnose reachability in layers without breaking management access.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-261828c75de9" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-12
cd ~/sysadmin-12
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-208070996c04" title="Capture the baseline" %}

On servera:
```bash
nmcli -f NAME,DEVICE connection show --active
ip -br address
ip route
getent hosts serverb.lab.example.com
```
Keep console access available. Do not edit the active management profile.

{% /task %}

{% task id="task-1864393dfa6d" title="Create the practice-only profile" %}

```bash
sudo nmcli connection add type dummy ifname kp-dummy con-name kp-dummy ipv4.method manual ipv4.addresses 192.0.2.10/24 ipv4.never-default yes ipv6.method disabled
sudo nmcli connection up kp-dummy
nmcli connection show kp-dummy
ip address show kp-dummy
```
The documentation address belongs only to the dummy device. Verify no new default route was added.

{% /task %}

{% task id="task-e208d506c381" title="Diagnose and verify persistence" %}

```bash
ip route get 172.25.250.11
ping -c 2 serverb.lab.example.com
ss -lnt
```
Save the profile/live-state comparison and your path diagnosis in workstation's `network-evidence.txt`. Reboot servera and confirm kp-dummy returns with its address before deleting the practice profile. A written report is not an automated reachability check.

{% /task %}

{% task id="task-37375f661844" title="Verify, vary and finish" %}

After evidence and grading, run sudo nmcli connection delete kp-dummy on servera, verify the dummy disappears, then reset the server if needed.

{% reveal title="Try a changed requirement" %}

Compare getent hosts with dig for a temporary /etc/hosts entry, then remove only your added entry.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-12" grade=true /%}

{% /task %}
{% /lab %}
