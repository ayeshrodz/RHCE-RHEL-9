# Publishes the web-motd project, with two commits of history, as a shared Git remote on workstation.
set -e
repo=~/git-repos/ops/web-motd.git
rm -rf "$repo"; mkdir -p "$(dirname "$repo")"
git init -q --bare -b main "$repo"
t=$(mktemp -d); trap 'rm -rf "$t"' EXIT
git init -q -b main "$t/w"; cd "$t/w"
git config user.name "Operations team"; git config user.email "ops@lab.example.com"
mkdir -p templates
cat > ansible.cfg <<'EOF'
[defaults]
inventory = ./inventory
remote_user = devops
interpreter_python = auto_silent

[privilege_escalation]
become = true
become_method = sudo
become_user = root
become_ask_pass = false
EOF
cat > inventory <<'EOF'
[web]
servera.lab.example.com
serverb.lab.example.com
EOF
cat > motd.yml <<'EOF'
---
- name: Message of the day is deployed
  hosts: web
  tasks:
    - name: /etc/motd comes from the template
      ansible.builtin.template:
        src: templates/motd.j2
        dest: /etc/motd
        owner: root
        group: root
        mode: "0644"
EOF
printf 'Welcome to {{ inventory_hostname }}.\n' > templates/motd.j2
printf '# web-motd\n\nDeploys /etc/motd to the web servers.\n\nRun it with: ansible-navigator run motd.yml -m stdout\n' > README.md
git add -A; git commit -q -m "Add the MOTD project"
printf 'Welcome to {{ inventory_hostname }}.\nThis host is managed by Ansible: local changes to this file are overwritten.\n' > templates/motd.j2
git commit -q -am "Warn that the MOTD is managed"
git remote add origin "$repo"; git push -q origin main
echo "  published the web-motd project at $repo (branch: main, 2 commits)"
