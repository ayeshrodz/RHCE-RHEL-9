---
title: Prepare workstation
kind: lab
minutes: 15
---

{% lead %}
Phases 10 and 11: turn workstation into the machine you work from, check you can reach every server by name and by SSH, and optionally add the utility server that serves practice files. There is nothing to install beyond a few everyday tools, and no special control software.
{% /lead %}

Everything in Phase 10 happens on workstation as `student`. Get there with:

```bash {% title="Ubuntu host" %}
lxc exec workstation -- su - student
```

{% lab
  objectives=["ch01.lab-tools"]
  id="workstation"
  title="Phase 10 · Prepare workstation (~10 min)"
  hosts=["workstation"]
  outcomes=["Check the everyday tools are installed.","Set up vim and tmux with sensible defaults.","Reach every server by name and log in over SSH."] %}
  {% task id="task-5a1d2f6e7b30" legacyIndex=1 title="VM: check the everyday tools" %}
    The lab profile installed these on every VM. Check that they are there on workstation:

```bash {% title="student@workstation" %}
rpm -q man-db man-pages tree tmux bind-utils lsof nano vim-enhanced
man --version | head -1
```

    Every line should show a package version. If one says *not installed*, follow [Repair an existing lab](#/ch01/troubleshooting#repair-an-existing-lab).
  {% /task %}

  {% task id="task-0c9e84b3d1a7" legacyIndex=2 title="VM: bring workstation up to date" %}

```bash {% title="student@workstation" %}
sudo dnf -y upgrade                  # password: student
```
  {% /task %}

  {% task id="task-3e7b5c0a9f12" legacyIndex=3 title="VM: set up vim and tmux" %}
    Four spaces instead of tabs, line numbers and highlighted search, so editing files in the later chapters is comfortable. Each command writes one small file:

```bash {% title="student@workstation: writes ~/.vimrc" %}
printf '%s\n' 'set number' 'set autoindent' 'set tabstop=4' 'set shiftwidth=4' 'set expandtab' 'set hlsearch' > ~/.vimrc
```

```bash {% title="student@workstation: writes ~/.tmux.conf" %}
printf '%s\n' 'set -g mouse on' 'set -g history-limit 10000' > ~/.tmux.conf
```
  {% /task %}

  {% task id="task-8d4f1a2c6e95" legacyIndex=4 title="VM: reach every server" %}
    The lab's DNS knows every machine by its full name, and the search domain lets you use the short name too. Servers accept password logins, as a fresh training server does. The password for `student` is `student`.

```bash {% title="student@workstation" %}
getent hosts servera.lab.example.com     # 172.25.250.10 servera.lab.example.com
ping -c2 serverb                         # short names work
ssh -o StrictHostKeyChecking=accept-new student@servera hostname
# servera.lab.example.com
```

    Then check the rest, entering the password each time:

```bash {% title="student@workstation" %}
for h in servera serverb serverc serverd; do
  ssh -o StrictHostKeyChecking=accept-new student@$h 'echo $(hostname): $(getenforce)'
done
```

    Each server should answer with its own name and `Enforcing`. Typing the password every time is expected: the SSH chapter replaces it with keys.
  {% /task %}

  {% task id="task-b2c6e0f4a813" legacyIndex=5 title="VM: don't create practice files yet" %}
    Leave workstation as it is for now. Your first practice folder comes in [section 1.8](#/ch01/daily-use), *after* the `clean` snapshot, so the baseline contains the tools but none of your work.
  {% /task %}
{% /lab %}

{% lab
  objectives=["ch01.lab-tools"]
  id="utility"
  title="Phase 11 · The utility server, optional (~10 min)"
  hosts=["utility.lab.example.com","workstation"]
  outcomes=["Serve practice files over HTTP for \"download this from utility\" style tasks."] %}
  {% task id="task-6f0a3d8b2c47" legacyIndex=1 title="LXD UI: create utility" %}
    Create it as in section 1.5: name `utility`, `ipv4.address: 172.25.250.8`, no `disk2`. `content.example.com` and `materials.example.com` already point here, from the network's `raw.dnsmasq` lines.
  {% /task %}

  {% task id="task-e1b5c9a07d36" legacyIndex=2 title="VM: install a web server and the practice files" %}

```bash {% title="Ubuntu host" %}
lxc exec utility -- bash
```

```bash {% title="utility, as root" %}
dnf install -y httpd
mkdir -p /var/www/html/files && cd /var/www/html/files
systemctl enable --now httpd
firewall-cmd --permanent --add-service=http && firewall-cmd --reload   # firewalld is on, as in RHEL

printf 'Practice files for the Kernel Path lab.\nServed by utility.lab.example.com.\n' > README
printf '%s\n' 'name,job,shell' 'bob,developer,/bin/bash' 'fred,manager,/bin/bash' 'susan,developer,/bin/zsh' > users.csv
seq 1 200 | sed 's/^/2026-01-01 12:00:00 request /' > access.log
tar czf archive.tar.gz README users.csv access.log
ls
```
  {% /task %}

  {% task id="task-4c8e2b6d0a59" legacyIndex=3 title="VM: check it from workstation" %}

```bash {% title="student@workstation" %}
curl http://utility.lab.example.com/files/
curl -s http://materials.example.com/files/README
```
  {% /task %}
{% /lab %}
