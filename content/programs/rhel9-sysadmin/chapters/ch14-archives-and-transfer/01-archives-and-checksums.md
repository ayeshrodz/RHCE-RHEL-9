---
title: Archives, compression and integrity
kind: lesson
minutes: 10
---

{% lead %}A backup is useful only when you can restore the right content and metadata. Inspect the archive before trusting it and rehearse extraction into an empty destination.{% /lead %}

{% objectives %}
- Create and inspect archives with explicit metadata policy.
- Prove restored data and synchronize safely.
{% /objectives %}

## Archive and compression are different

Tar combines directory trees into one archive. Compression reduces size. `tar -cf` creates an uncompressed archive; `-czf` uses gzip, `-cjf` bzip2, and `-cJf` xz when those compressors are installed. `tar -tf` lists entries; `-xf` extracts. A naming suffix is a convention, not proof of the file's format.

```bash
tar -czf backup.tar.gz -C source .
tar -tzf backup.tar.gz
mkdir restore
tar -xzf backup.tar.gz -C restore
```

`-C` sets the working directory for following archive operands and avoids recording unnecessary absolute paths. Inspect unfamiliar archives for path traversal and unexpected absolute paths. Extract as an unprivileged user into an empty directory, not over your live `/etc`.

## Metadata needs an explicit decision

`--acls --xattrs --selinux` asks GNU tar to record additional access and security metadata. Preserving arbitrary ownership requires sufficient privilege; a normal-user restore is not a demonstration of privileged metadata recovery. Sensitive archives themselves need protected permissions and storage.

A checksum such as `sha256sum backup.tar.gz` detects changed bytes when compared with a trusted saved digest. If an attacker can replace both archive and digest, the checksum does not authenticate origin. Verify publisher signatures or use an independently protected reference when authenticity matters.

## Restore checks

List expected paths, compare contents, inspect modes and required ACLs, check ownership and labels where applicable, then test the application as its real identity. A successful archive command does not prove a file was stable while it was being read. Databases need application-aware backup procedures or a consistent snapshot. A VM snapshot is convenient rollback, not an independently retained backup against loss of the host storage.

## Explore the model

{% flow-map ref="model" title="Archives and file transfer: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch14.operations", "ch14.verification"] ref="quick" /%}


## Documentation

- [GNU tar manual](https://www.gnu.org/software/tar/manual/tar.html)
- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
