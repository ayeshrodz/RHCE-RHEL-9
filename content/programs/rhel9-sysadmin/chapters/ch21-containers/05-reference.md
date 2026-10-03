---
title: 'Reference: Containers with Podman'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Image:** Trusted immutable content plus a documented runtime command and user.

**Container and data:** Disposable process state with deliberate persistent volume ownership and labels.

**User service:** Quadlet generation and lingering define unattended lifecycle; test the actual workload.

## Command reference

| Example | Use and limits |
| --- | --- |
| `podman version` | Establish supported features before choosing the workflow. |
| `podman info` | Inspect rootless and cgroup context. |
| `podman ps -a` | Include exited containers in diagnosis. |
| `podman inspect NAME` | Inspect image, runtime and mount configuration. |
| `systemctl --user daemon-reload` | Regenerate units from user Quadlet source. |
| `journalctl --user -u UNIT` | Inspect the correct user manager journal. |
| `loginctl show-user student -p Linger` | Observe unattended user-manager activation policy. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch21/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Inspect an approved web image, identify its unprivileged port, and serve a fixture on host loopback only. Test content, port binding and reboot as separate observations.


## Documentation

- [RHEL container guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/building_running_and_managing_containers/index)
