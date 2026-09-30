# Creates a self-signed certificate for serverb: server.key and server.crt.
set -e
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -subj "/CN=serverb.lab.example.com" \
  -addext "subjectAltName=DNS:serverb.lab.example.com,DNS:serverb" \
  -keyout server.key -out server.crt 2>/dev/null
chmod 0600 server.key
echo "  created server.key and server.crt (self-signed, for serverb.lab.example.com)"
