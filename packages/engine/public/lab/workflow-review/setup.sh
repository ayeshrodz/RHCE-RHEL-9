# Publishes the web-status project as a shared Git remote on workstation.
# The playbook works on older engines but has problems ansible-lint reports.
set -e
repo=~/git-repos/ops/web-status.git
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
serverb.lab.example.com
EOF
cat > site.yml <<'EOF'
---
- name: Status page is published
  hosts: web
  tasks:
    - name: Web server is installed
      dnf:
        name: httpd
        state: present

    - name: Status page is deployed
      ansible.builtin.template:
        src: templates/index.html.j2
        dest: /var/www/html/index.html
        mode: 0644

    - name: Web server is running
      ansible.builtin.service:
        name: httpd
        state: started
        enabled: yes
EOF
cat > templates/index.html.j2 <<'EOF'
<h1>Status: {{ inventory_hostname }}</h1>
<p>Deployed from Git.</p>
EOF
printf '# web-status\n\nPublishes a status page on the web servers.\n' > README.md
git add -A; git commit -q -m "Add the status page project"
git remote add origin "$repo"; git push -q origin main
echo "  published the web-status project at $repo (branch: main)"
