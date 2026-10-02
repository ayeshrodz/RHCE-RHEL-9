# Creates secret.yml: two commented-out variables, encrypted with Ansible Vault (password: redhat).
set -e
cat > secret.yml <<EOF
#username: ansibleuser1
#pwhash: $(openssl passwd -6 redhat)
EOF
pw=$(mktemp); echo redhat > "$pw"
ansible-vault encrypt --vault-password-file "$pw" secret.yml >/dev/null
rm -f "$pw"
echo "  created secret.yml (Vault password: redhat)"
