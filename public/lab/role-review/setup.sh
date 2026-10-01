# Package an installed collection as a collection artifact (a tar.gz with MANIFEST.json at the top).
pack() {
  local ns=$1 name=$2 src ver
  for d in /usr/share/ansible/collections/ansible_collections ~/.ansible/collections/ansible_collections; do
    [ -f "$d/$ns/$name/MANIFEST.json" ] && src="$d/$ns/$name" && break
  done
  [ -n "$src" ] || { echo "  $ns.$name is not installed on workstation (see section 0.6)"; return 1; }
  ver=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['collection_info']['version'])" "$src/MANIFEST.json")
  local out="$PWD/$ns-$name-$ver.tar.gz"
  (cd "$src" && tar czf "$out" --exclude='*.pyc' --exclude=__pycache__ $(ls -A))
  echo "  created $ns-$name-$ver.tar.gz"
}

# Publishes the infra.apache role in a Git repository on workstation, tagged v1.4,
# and packages the system roles collection as an archive.
set -e
pack redhat rhel_system_roles
repo=~/git-repos/infra/apache.git
rm -rf "$repo"; mkdir -p "$(dirname "$repo")"
git init -q --bare -b main "$repo"
t=$(mktemp -d); trap 'rm -rf "$t"' EXIT
git init -q -b main "$t/w"; cd "$t/w"
git config user.name "Infrastructure team"; git config user.email "infra@lab.example.com"
mkdir -p defaults handlers meta tasks templates
printf -- '---\napache_packages:\n  - httpd\n  - firewalld\n' > defaults/main.yml
cat > meta/main.yml <<'EOF'
---
galaxy_info:
  author: Infrastructure team
  description: The production Apache web server configuration
  license: MIT
  min_ansible_version: "2.14"
dependencies: []
EOF
cat > tasks/main.yml <<'EOF'
---
- name: Apache Package is installed
  ansible.builtin.dnf:
    name: "{{ apache_packages }}"
    state: present

- name: Apache Service is started
  ansible.builtin.service:
    name: httpd
    state: started
    enabled: true

- name: Firewall Service is started
  ansible.builtin.service:
    name: firewalld
    state: started
    enabled: true

- name: http is allowed
  ansible.posix.firewalld:
    service: http
    permanent: true
    state: enabled
  notify: restart firewalld

- name: Production page is in place
  ansible.builtin.template:
    src: index.html.j2
    dest: /var/www/html/index.html
    mode: "0644"
EOF
cat > handlers/main.yml <<'EOF'
---
- name: restart firewalld
  ansible.builtin.service:
    name: firewalld
    state: restarted

- name: restart apache
  ansible.builtin.service:
    name: httpd
    state: restarted
EOF
cat > templates/index.html.j2 <<'EOF'
This is the production server on {{ ansible_facts['fqdn'] }}
EOF
git add -A; git commit -q -m "apache role"; git tag v1.3
printf '# infra.apache\n\nThe production Apache configuration. Handlers: `restart apache`, `restart firewalld`.\n' > README.md
git add -A; git commit -q -m "Document the handlers"; git tag v1.4
git remote add origin "$repo"; git push -q origin main --tags
echo "  published the infra.apache role at file://$repo (tags: v1.3, v1.4)"
