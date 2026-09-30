# Creates files/htpasswd with one permitted user: guest / redhat.
set -e
printf 'guest:%s\n' "$(openssl passwd -apr1 redhat)" > files/htpasswd
echo "  created files/htpasswd (user guest, password redhat)"
