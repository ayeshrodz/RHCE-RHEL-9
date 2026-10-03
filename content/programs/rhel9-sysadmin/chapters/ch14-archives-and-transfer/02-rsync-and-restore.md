---
title: Synchronize without deleting surprises
kind: lesson
minutes: 10
---

{% lead %}Synchronization and backup solve related but different problems. Synchronizing a deletion can faithfully destroy the only retained copy.{% /lead %}

{% objectives %}
- Create and inspect archives with explicit metadata policy.
- Prove restored data and synchronize safely.
{% /objectives %}

## Destination shape matters

`rsync -av source/ destination/` copies contents into destination. Omitting the source trailing slash usually creates a source directory under the destination. Preview the paths with `--dry-run --itemize-changes` before applying a command to operational data.

```bash
rsync -av --dry-run --itemize-changes source/ mirror/
rsync -av source/ mirror/
```

Archive mode preserves recursive structure and several common attributes. Add `-A` for ACLs and `-X` for extended attributes when required and supported; ownership preservation depends on privilege and remote mapping. `-H` preserves hard-link relationships and may use more memory. SELinux labeling requires a deliberate policy: a restored custom label may not be the correct label for a new destination.

## Delete only with reviewed intent

`--delete` removes destination names absent from the source. A wrong source path, missing mount, or empty input can cause large deletion. Verify mounts and root paths, review the dry run, and keep an independent retained copy before enabling it. Do not add deletion merely to make two trees look identical in a beginner exercise.

Rsync over SSH provides encrypted transport and remote authentication. It does not make destination data immutable or establish retention. Use versioned backups, access separation and restore rehearsals according to the importance of the data.

## Plan recovery beyond a copy

A useful recovery note identifies source, timestamp, archive digest, application consistency method, restore destination, metadata requirements and tests. State recovery-point and recovery-time expectations in plain terms: how much recent work can be lost, and how long service can be unavailable. Keep the recovery procedure reachable when the original host is down.

When a restore test fails, distinguish missing content from failed application access. Compare the archive listing, the extracted paths, permissions, mount state and SELinux context. Do not repeatedly extract over live data without understanding which layer is wrong.

## Check your understanding

{% quiz id="quick" objectives=["ch14.operations", "ch14.verification"] ref="quick" /%}


## Documentation

- [GNU tar manual](https://www.gnu.org/software/tar/manual/tar.html)
- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
