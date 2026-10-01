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

# Builds the collection archives this exercise installs: gls.utils (written here),
# and copies of the system roles and community.general collections from workstation.
set -e
t=$(mktemp -d); trap 'rm -rf "$t"' EXIT
c="$t/gls/utils"
mkdir -p "$c/plugins/modules" "$c/roles/backup/tasks" "$c/roles/backup/defaults" "$c/roles/backup/meta" \
  "$c/roles/restore/tasks" "$c/roles/restore/defaults" "$c/roles/restore/meta" "$c/meta"
cat > "$c/galaxy.yml" <<'EOF'
namespace: gls
name: utils
version: 0.0.1
readme: README.md
authors:
  - Curriculum Developer
description: Backup and restore roles, and a connection test module
license:
  - MIT
EOF
printf -- '---\nrequires_ansible: ">=2.14"\n' > "$c/meta/runtime.yml"
printf '# gls.utils\n\nRoles: `backup`, `restore`. Module: `newping`.\n' > "$c/README.md"
cat > "$c/plugins/modules/newping.py" <<'EOF'
#!/usr/bin/python
# A connection test module, written for this exercise.

DOCUMENTATION = r"""
module: newping
short_description: Try to connect to host, verify a usable python and return C(pong) on success
description:
  - A trivial test module. It returns C(pong) when Ansible can log in to the host and run Python there.
  - It does not make sense in a real playbook, but is useful to check that a collection's modules are found.
options:
  data:
    description: The value to return in C(ping). If set to C(crash), the module fails on purpose.
    type: str
    default: pong
author: Curriculum Developer
"""

EXAMPLES = r"""
- name: Check that the host answers
  gls.utils.newping:
    data: pong
"""

RETURN = r"""
ping:
  description: The value of the data option.
  returned: success
  type: str
  sample: pong
"""

from ansible.module_utils.basic import AnsibleModule


def main():
    module = AnsibleModule(argument_spec=dict(data=dict(type="str", default="pong")), supports_check_mode=True)
    if module.params["data"] == "crash":
        module.fail_json(msg="newping was asked to fail")
    module.exit_json(changed=False, ping=module.params["data"])


if __name__ == "__main__":
    main()
EOF
for r in backup restore; do
  printf -- '---\ngalaxy_info:\n  author: Curriculum Developer\n  description: %s files and directories\n  license: MIT\n  min_ansible_version: "2.14"\ndependencies: []\n' "$r" > "$c/roles/$r/meta/main.yml"
  printf -- '---\nbackup_dir: /var/backups/gls\nbackup_id: backup\n' > "$c/roles/$r/defaults/main.yml"
done
printf -- '---\nbackup_dir: /var/backups/gls\nbackup_id: backup\nbackup_files: []\n' > "$c/roles/backup/defaults/main.yml"
cat > "$c/roles/backup/README.md" <<'EOF'
backup
======

This role backs up the files and directories listed in the `backup_files` variable.
The backup is identified by a name (`backup_id`) and can be restored with the `gls.utils.restore` role.
If a backup with the same name already exists, the role does nothing.

Requirements
------------

None

Role Variables
--------------

- `backup_id`: the name of the backup.
- `backup_files`: the list of files and directories to save.
- `backup_dir`: where backups are kept (default `/var/backups/gls`).
EOF
cat > "$c/roles/backup/tasks/main.yml" <<'EOF'
---
- name: Ensure the backup directory exists
  ansible.builtin.file:
    path: "{{ backup_dir }}"
    state: directory
    mode: "0700"

- name: Ensure the backup exists
  ansible.builtin.command:
    cmd: "tar czf {{ backup_dir }}/{{ backup_id }}.tar.gz {{ backup_files | join(' ') }}"
    creates: "{{ backup_dir }}/{{ backup_id }}.tar.gz"
EOF
printf 'restore\n=======\n\nRestores a backup made by `gls.utils.backup`, identified by `backup_id`.\n' > "$c/roles/restore/README.md"
cat > "$c/roles/restore/tasks/main.yml" <<'EOF'
---
- name: Ensure the backup is restored
  ansible.builtin.command:
    cmd: "tar xzf {{ backup_dir }}/{{ backup_id }}.tar.gz -C /"
EOF
ansible-galaxy collection build "$c" --output-path . >/dev/null
echo "  created gls-utils-0.0.1.tar.gz"
pack redhat rhel_system_roles
pack community general
v=$(ls redhat-rhel_system_roles-*.tar.gz); g=$(ls community-general-*.tar.gz)
printf -- '---\ncollections:\n  - name: /home/student/role-collections/%s\n  - name: /home/student/role-collections/%s\n' "$v" "$g" > requirements.yml
