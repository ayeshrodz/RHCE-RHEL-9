# Builds archives/acme.banner-1.0.tar.gz: a small, ready-made role to install with ansible-galaxy.
set -e
t=$(mktemp -d)
r="$t/acme.banner"
mkdir -p "$r/defaults" "$r/meta" "$r/tasks" archives
printf '%s\n' '---' 'galaxy_info:' '  author: RHCE Field Guide' '  description: Writes a login banner to /etc/issue' \
  '  license: MIT' '  min_ansible_version: "2.14"' 'dependencies: []' > "$r/meta/main.yml"
printf '%s\n' '---' 'banner_text: This system is managed by Ansible.' > "$r/defaults/main.yml"
printf '%s\n' '---' '- name: Login banner is in place' '  ansible.builtin.copy:' '    content: "{{ banner_text }}\n"' \
  '    dest: /etc/issue' '    owner: root' '    group: root' '    mode: "0644"' > "$r/tasks/main.yml"
tar czf archives/acme.banner-1.0.tar.gz -C "$t" acme.banner
rm -rf "$t"
echo "  created archives/acme.banner-1.0.tar.gz (a role to install)"
