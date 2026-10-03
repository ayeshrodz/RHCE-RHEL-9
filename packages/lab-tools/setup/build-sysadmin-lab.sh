#!/usr/bin/env bash
# Builds the system administration practice lab: workstation, servera and serverb.
# Same network, project and names as the Ansible lab, with fewer machines.
set -euo pipefail

# Network (Phase 03)
lxc network create rhcebr0 --project default \
  ipv4.address=172.25.250.254/24 ipv4.nat=true \
  ipv4.dhcp.ranges=172.25.250.100-172.25.250.199 \
  ipv6.address=none dns.domain=lab.example.com
lxc network set rhcebr0 --project default \
  raw.dnsmasq="$(printf 'host-record=content.example.com,172.25.250.8\nhost-record=materials.example.com,172.25.250.8')"

# Project (Phase 05)
lxc project create rhce -c features.images=false -c features.profiles=true \
  -c features.storage.volumes=true -c features.networks=false
lxc project switch rhce

# Profile (Phase 06)
lxc profile edit default < sysadmin-profile.yaml

# Disks and VMs (Phases 07–08)
declare -A IP=( [workstation]=9 [servera]=10 [serverb]=11 )
for vm in workstation servera serverb; do
  lxc init "${IMAGE:-images:rockylinux/9/cloud}" "$vm" --vm    # IMAGE=rocky9-lab to use a frozen copy
  lxc config device override "$vm" eth0 ipv4.address=172.25.250.${IP[$vm]}
  if [[ $vm == server* ]]; then
    lxc storage volume create default "$vm-disk2" --type=block size=5GiB
    lxc config device add "$vm" disk2 disk pool=default source="$vm-disk2"
  fi
done
lxc config set workstation limits.cpu=2 limits.memory=2GiB

sudo systemctl restart rhce-isolate     # make sure the seal is on before first boot
lxc start --all
sleep 240                                # first boot + the SELinux relabel reboot
lxc list
