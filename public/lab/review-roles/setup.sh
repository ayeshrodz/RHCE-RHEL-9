# Builds archives/acme.motd-1.0.tar.gz: a ready-made role to install with ansible-galaxy.
set -e
t=$(mktemp -d)
r="$t/acme.motd"
mkdir -p "$r/defaults" "$r/meta" "$r/tasks" archives
printf '%s\n' '---' 'galaxy_info:' '  author: RHCE Field Guide' '  description: Writes /etc/motd' \
  '  license: MIT' '  min_ansible_version: "2.14"' 'dependencies: []' > "$r/meta/main.yml"
printf '%s\n' '---' 'motd_text: Welcome.' > "$r/defaults/main.yml"
printf '%s\n' '---' '- name: Message of the day is in place' '  ansible.builtin.copy:' '    content: "{{ motd_text }}\n"' \
  '    dest: /etc/motd' '    mode: "0644"' > "$r/tasks/main.yml"
tar czf archives/acme.motd-1.0.tar.gz -C "$t" acme.motd
rm -rf "$t"
echo "  created archives/acme.motd-1.0.tar.gz (a role to install)"
