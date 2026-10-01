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

set -e
pack redhat rhel_system_roles
