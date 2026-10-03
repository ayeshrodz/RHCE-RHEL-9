---
title: What you are building
kind: lesson
minutes: 10
---

{% lead %}
Every exercise in this path needs somewhere safe to run, and somewhere you can break and repair without fear. This chapter builds it on one Ubuntu machine at home: a `workstation` you work from and servers `servera` to `serverd` on `lab.example.com`, all Rocky Linux 9 virtual machines on a private network that nothing outside can connect into.
{% /lead %}

{% objectives %}
- Understand the lab's layout, addresses and accounts before you build anything.
- See exactly which traffic the sealed network allows and blocks.
- Check that your machine meets the requirements, and fill in your own lab values.
{% /objectives %}

{% callout type="note" title="Already built the Ansible lab?" %}
This is the same lab: the same network, the same project and the same machines. If you built it for the Ansible path, you do not need to rebuild it. The only difference is a handful of extra everyday tools (manual pages, `tree`, `tmux`, `dig`): add them in place with [Repair an existing lab](#/ch01/troubleshooting#repair-an-existing-lab), run the check in [section 1.7](#/ch01/snapshots-and-rht-vmctl), and retake the `clean` snapshot. Ansible being installed on workstation does no harm.
{% /callout %}

{% callout type="note" title="Tested end to end" %}
The network, firewall, profile, machines and reset tools here are the same ones the Ansible path uses, built and verified on real hardware with the versions listed below. The profile and workstation steps specific to this path were checked on a fresh VM in that same lab. Follow it in order the first time; afterwards, the [fast rebuild script](#/ch01/troubleshooting) does most of it in one go.
{% /callout %}

## The idea in one picture

Six VMs sit on a private network called `rhcebr0`. Inside that network they talk to each other freely, and they can reach the internet, so `dnf install` works. From outside, nobody can open a connection in: not your laptop, not your router, and not even the host itself. You step inside with `lxc exec` (which does not use the network at all), then SSH between the VMs as you would between real servers.

Pick a traffic flow to see its path and the firewall rule that decides it:

{% lab-network-map ref="lab-network-map" /%}

{% columns %}
{% column title="Allowed" tone="green" %}

- VM ↔ VM inside the lab (SSH, ping, HTTP, anything)
- VMs → internet (package installs, downloads)
- You → a VM through `lxc exec` or the LXD UI's Terminal tab
- VMs → the lab's own DHCP and DNS service

{% /column %}
{% column title="Blocked" tone="red" %}

- Any device on your local network → the lab
- The host itself → the lab (no ssh, no ping)
- The lab → your local network and any private or VPN ranges
- The lab → any service on the host other than DHCP/DNS

{% /column %}
{% /columns %}

## The address plan

The lab uses the network `172.25.250.0/24` and the domain `lab.example.com`, so every hostname and IP address in this path works unchanged.

| Name | IP | vCPU / RAM | Extra disk | Role |
| --- | --- | --- | --- | --- |
| (rhcebr0 gateway) | 172.25.250.254 | — | — | Lives on the host. Routes the lab to the internet; runs DHCP and DNS. |
| `utility` | 172.25.250.8 | 1 / 1 GiB | — | Web server for practice files (optional) |
| `workstation` | 172.25.250.9 | 2 / 2 GiB | — | The machine you work from. |
| `servera` | 172.25.250.10 | 1 / 1 GiB | 5 GiB | Server you administer |
| `serverb` | 172.25.250.11 | 1 / 1 GiB | 5 GiB | Server you administer |
| `serverc` | 172.25.250.12 | 1 / 1 GiB | 5 GiB | Server you administer |
| `serverd` | 172.25.250.13 | 1 / 1 GiB | 5 GiB | Server you administer |

## Accounts on every VM

| User | Password | Purpose |
| --- | --- | --- |
| `student` | `student` | Your everyday login. sudo with a password. |
| `root` | `redhat` | The administrator account |

The users, groups and permissions chapters have you create more accounts of your own.

## Where each step happens

Every step in this chapter is labelled with where you run it:

{% cards cols=3 %}
  {% card title="Host" tone="purple" %}
    A terminal on the Ubuntu host.
  {% /card %}
  {% card title="LXD UI" tone="blue" %}
    The LXD web interface in your browser.
  {% /card %}
  {% card title="VM" tone="green" %}
    Inside a lab VM, usually as `student` on workstation.
  {% /card %}
{% /cards %}

## Your lab values

A few values differ on every home network. The instructions write them as placeholders, highlighted in amber: `<HOST_LAN_IP>`, `<HOST_USER>` and `<ROUTER_IP>`. Enter yours once here and every command in this path shows (and copies) your real values instead:

{% reader-variables /%}

| Placeholder | Meaning | How to find it |
| --- | --- | --- |
| `<HOST_LAN_IP>` | The Ubuntu host's address on your local network | `hostname -I` on the host |
| `<HOST_USER>` | Your login name on the Ubuntu host | `whoami` on the host |
| `<ROUTER_IP>` | Your local network's default gateway | `ip route \| grep default` |

Everything else, including the `172.25.250.0/24` network, the hostnames and the `student` password, is the same for everyone.

## Why the host has two IP addresses

Your Ubuntu host keeps its normal address on your local network, `<HOST_LAN_IP>`. When you create the lab network, LXD builds a virtual switch called `rhcebr0` inside the host and gives the host a **second** address on it: `172.25.250.254`. That second address is the lab's **gateway**.

{% diagram ref="two-addresses" /%}

{% callout type="tip" title="Think of your home router" %}
Your router works the same way: a public address towards your internet provider, and a private one (often `192.168.x.1`) towards your devices, which use it as their way out. Here the VMs use 172.25.250.254 as their way out, and the host forwards their traffic through `<HOST_LAN_IP>`.
{% /callout %}

The gateway can't be removed: without it the VMs would get no addresses (DHCP), couldn't find each other by name (DNS), and couldn't install packages. What you *can* do, and what the seal does, is make it **one-way**: traffic may leave the lab, but nothing, including the host, may start a connection into it.

| Host interface | Address | Faces |
| --- | --- | --- |
| Your ethernet / Wi-Fi card | `<HOST_LAN_IP>` | Your local network and the internet. Unchanged. |
| `rhcebr0` (virtual, created by LXD) | 172.25.250.254 | The lab VMs only. Gateway, DHCP and DNS. |

## What you need

| | Minimum | Recommended | Tested on |
| --- | --- | --- | --- |
| Operating system | Ubuntu Server LTS, x86_64, with snap support | | Ubuntu Server 26.04.1 LTS |
| CPU | 4 threads with Intel VT-x or AMD-V | 4+ cores | Intel Core i5-7500, 4 cores / 4 threads, 3.4 GHz |
| Memory | 12 GB | 16 GB or more | 32 GB (30 GiB usable) |
| Free disk | 40 GB | 100 GB or more (SSD) | 200 GiB ZFS pool on a loop file |
| Network | A fixed address on your LAN and internet access | Wired | Wi-Fi (USB adapter) on a `/16` home LAN. The lab is routed with NAT, not bridged, so Wi-Fi works. |

With all six VMs running idle, the tested host measured:

| Resource | Lab stopped | Lab running | What it means |
| --- | --- | --- | --- |
| Host RAM available | 26 GiB | 22 GiB | The whole lab costs about **4 GiB** at idle |
| Configured RAM limits | 7 GiB in total | | The ceiling if every VM is busy; size the host for this plus the OS |
| CPU | — | load average 0.12 (4 cores) | 7 vCPUs on 4 cores is fine for exercises |
| Storage pool used | 2.19 GiB of 192.81 GiB | | All VMs, the image and the `clean` snapshots; ZFS stores only what's written |

{% callout type="note" title="How the minimums were chosen" %}
**Memory:** 7 GiB of VM limits plus room for Ubuntu, LXD and the ZFS cache puts the floor at 12 GB. 16 GB leaves headroom for a browser with the LXD UI, or other workloads.

**Disk:** the lab itself is small, but snapshots grow as VMs change, and the storage chapters write to the 5 GiB extra disks. The ZFS pool is a sparse file that only takes space as it fills, so a smaller disk works.
{% /callout %}

## Tested versions

Newer patch releases should behave the same. If something differs, compare against this table first.

| Layer | Component | Version | How it's pinned |
| --- | --- | --- | --- |
| Host | Ubuntu Server | 26.04.1 LTS, kernel 7.0.0-34-generic | — |
| | LXD (snap) | 5.21.8 LTS, rev 40958 | `--channel=5.21/stable` + `snap refresh --hold` |
| | nftables | Ubuntu 26.04 package | — |
| Guest image | `images:rockylinux/9/cloud` | build 20260929_0805 | Optional local copy: `rocky9-lab` |
| | Rocky Linux | 9.8 (Blue Onyx) | — |
| All VMs | SELinux | Enforcing, selinux-policy 38.1.75 | Added by the profile; the image ships without it |
| | firewalld, chrony | Running | Added by the profile, as on a RHEL server |

{% callout type="important" title="How this differs from a RHEL server" %}
- **Rocky Linux 9 instead of RHEL 9.** Rocky is a free rebuild of RHEL, so packages, paths, services and commands match. The one visible difference is the release name: `/etc/os-release` says Rocky, not Red Hat. There is no subscription to register, so `dnf` works straight away.
- **The extra disk is `/dev/sdb`**, not `/dev/vdb`: use `sdb` in the storage chapters.
- **Virtual machines, not containers.** Each VM has its own kernel, systemd and boot process, so the chapters on boot, services, SELinux and storage behave as on real servers.
- **You are not logged in as root.** Use `student` with `sudo` for everyday work, and root only where an exercise asks for it.
{% /callout %}

## The build at a glance

{% build-roadmap ref="build-roadmap" /%}
