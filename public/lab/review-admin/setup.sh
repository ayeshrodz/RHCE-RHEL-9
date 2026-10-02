# Package an installed collection as a collection artifact (a tar.gz with MANIFEST.json at the top).
pack() {
  local ns=$1 name=$2 src ver
  for d in /usr/share/ansible/collections/ansible_collections ~/.ansible/collections/ansible_collections; do
    [ -f "$d/$ns/$name/MANIFEST.json" ] && src="$d/$ns/$name" && break
  done
  [ -n "$src" ] || { echo "  $ns.$name is not installed on workstation (see section 1.6)"; return 1; }
  ver=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['collection_info']['version'])" "$src/MANIFEST.json")
  local out="$PWD/$ns-$name-$ver.tar.gz"
  (cd "$src" && tar czf "$out" --exclude='*.pyc' --exclude=__pycache__ $(ls -A))
  echo "  created $ns-$name-$ver.tar.gz"
}

# Packages the system roles collection, and creates pass-vault.yml: the hashed password
# for webdev in the variable pwhash, encrypted with the vault password "redhat".
set -e
pack redhat rhel_system_roles
h=$(openssl passwd -6 -salt reviewsalt redhat)
printf -- '---\npwhash: %s\n' "$h" > pass-vault.yml
p=$(mktemp); printf 'redhat\n' > "$p"
ansible-vault encrypt --vault-password-file "$p" pass-vault.yml >/dev/null
rm -f "$p"
echo "  created pass-vault.yml (encrypted; the vault password is redhat)"
