# Creates an SSH key pair for each user in files/: userN.key (private) and userN.key.pub.
set -e
mkdir -p files
for n in 1 2 3 4 5; do
  rm -f "files/user$n.key" "files/user$n.key.pub"
  ssh-keygen -q -t ed25519 -N '' -C "user$n" -f "files/user$n.key"
done
echo "  created files/user1.key.pub ... files/user5.key.pub (and their private keys)"
