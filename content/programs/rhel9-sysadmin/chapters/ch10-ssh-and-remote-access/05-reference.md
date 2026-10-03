---
title: 'Reference: Secure remote access'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Server identity:** Verify the host-key fingerprint before accepting a new or changed host.

**User identity:** Authenticate with a protected private key; store its public half on the server.

**Access test:** Validate policy, open a new connection, and verify the intended operation.

## Command reference

| Example | Use and limits |
| --- | --- |
| `ssh-keygen -lf HOSTKEY.pub` | Compare host identity through a trusted channel. |
| `ssh -v USER@HOST` | Diagnose connection and authentication stages. |
| `ssh-copy-id -i KEY.pub USER@HOST` | Install the public half of an authorized identity. |
| `sshd -t` | Validate server configuration syntax. |
| `sshd -T` | Inspect effective server policy; add connection context for Match rules. |
| `rsync -av --dry-run source/ HOST:destination/` | Preview transport and destination shape before applying it. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch10/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Use an SSH client Host entry for the practice identity, then inspect ssh -G to verify the resulting user and key path.


## Documentation

- [RHEL OpenSSH reference](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
