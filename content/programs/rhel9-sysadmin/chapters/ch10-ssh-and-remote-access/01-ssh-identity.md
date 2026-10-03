---
title: Trust and authenticate the connection
kind: lesson
minutes: 10
---

{% lead %}SSH first identifies the server, then authenticates the user. A working login needs both decisions, and neither should be bypassed to silence an error.{% /lead %}

{% objectives %}
- Verify remote-host identity and use key authentication.
- Validate SSH policy and transfer data without losing access.
{% /objectives %}

## Host keys and user keys

The server's host key identifies the remote machine. Your known_hosts file remembers trusted keys. At first connection, compare the displayed fingerprint with one obtained through the lab console or another trusted channel. `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the server reports one fingerprint when that key type exists. A changed-key warning can mean a rebuilt VM or an intercepted connection: investigate before removing an entry.

```bash
ssh student@servera.lab.example.com hostname
ssh -v student@servera.lab.example.com
```

Verbose output helps separate DNS, connection, key-exchange and authentication errors. Review it before sharing because it can reveal identity and environment information.

A user's private key stays on the client. Its public key goes into the target account's authorized_keys. Generate a separate practice key with a passphrase:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/kp-practice
ssh-copy-id -i ~/.ssh/kp-practice.pub student@servera.lab.example.com
ssh -i ~/.ssh/kp-practice student@servera.lab.example.com id
```

If cryptographic policy such as FIPS mode excludes that algorithm, choose a supported RSA key according to the platform's policy. Do not weaken system crypto policy to make an example work.

## Protect storage and scope

`~/.ssh` should normally be `0700`, private keys `0600`, and authorized_keys `0600`, owned by the account. Check SELinux labels if sshd refuses an otherwise valid key. `ssh-agent` can cache an unlocked key for the session; use `ssh-add` and review loaded identities. Avoid unnecessary agent forwarding.

Client configuration in `~/.ssh/config` can specify a host, user and identity file. Use `IdentitiesOnly yes` to limit offered keys when appropriate. A key without a passphrase can be appropriate for a tightly controlled isolated tool identity, but it requires explicit storage and access policy. Do not distribute a private key to make several machines share a login.

## Explore the model

{% flow-map ref="model" title="Secure remote access: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch10.operations", "ch10.verification"] ref="quick" /%}


## Documentation

- [RHEL OpenSSH reference](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
