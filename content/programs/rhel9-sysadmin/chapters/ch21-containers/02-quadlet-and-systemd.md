---
title: A container service that survives logout
kind: lesson
minutes: 10
---

{% lead %}A background container alone is not a boot policy. Use systemd integration supported by your Podman version and verify its behavior after logout and reboot.{% /lead %}

{% objectives %}
- Run and inspect rootless containers with intentional storage and ports.
- Use version-supported systemd integration and verify restart behavior.
{% /objectives %}

## Quadlet source and generated unit

On RHEL 9 with Quadlet-capable Podman, a rootless `.container` definition under `~/.config/containers/systemd` generates a user `.service`. `systemctl --user daemon-reload` reruns generators. The definition describes the image, command, ports, volumes and ordinary systemd policy. Keep the source file; do not edit the generated transient unit.

```ini
[Container]
Image=registry.access.redhat.com/ubi9/ubi-minimal:latest
Exec=/usr/bin/sleep infinity
[Service]
Restart=on-failure
[Install]
WantedBy=default.target
```

Check the installed `podman-systemd.unit` manual and generator before proceeding. Older Podman releases without Quadlet may use generated systemd units for an existing container; consult that installed version's generate systemd manual. Do not mix an old copied unit workflow with unsupported new directives. Upgrade under an approved policy or use the documented compatibility path.

## Start and activate correctly

Quadlet-generated services use Install instructions in the source definition; do not use `systemctl --user enable` on a generated transient unit as though it were a normal authored service. Pre-pull the image and start the generated service after daemon-reload. Inspect `systemctl --user cat`, status and journal to see the actual unit.

Rootless user services ordinarily belong to a login lifecycle. `sudo loginctl enable-linger student` permits the user manager to run without an active login; review that policy rather than treating it as invisible setup. After logout and reboot, log in again and inspect the service and container. A direct lxc exec or su session may lack a usable user bus; use a normal authenticated login for user-systemd work.

## Operate and recover

Inspect failed image pulls, unsupported directives, missing user bus, cgroup requirements, volume ownership, SELinux and port conflicts. Pre-pulling prevents a short service-start timeout from masking slow registry access. `Restart=on-failure` handles some process failures, not every application readiness problem. Test useful application behavior independently of a running container.

Updating an image can change its data format. Preserve a recovery plan and backup before replacing it. A container's existence is not evidence that its workload serves the intended result.

## Check your understanding

{% quiz id="quick" objectives=["ch21.operations", "ch21.verification"] ref="quick" /%}


## Documentation

- [RHEL container guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/building_running_and_managing_containers/index)
