---
title: Images, isolation and persistence
kind: lesson
minutes: 10
---

{% lead %}A container runs processes from an image with isolated views of resources. Its writable layer is disposable; design data persistence before deploying a service.{% /lead %}

{% objectives %}
- Run and inspect rootless containers with intentional storage and ports.
- Use version-supported systemd integration and verify restart behavior.
{% /objectives %}

## Inspect the installed tools

Install Podman on the disposable VM with `sudo dnf install podman`. `podman version` and `podman info` show the engine and rootless/cgroup context. RHEL 9 minor releases carry different Podman versions, so use installed manuals and the versioned vendor guide. Ordinary `podman` and `sudo podman` have different container and image stores.

Use fully qualified image names from an approved registry. Inspect the tag, digest and publisher; a mutable tag can change. `podman pull`, `podman images` and `podman inspect` show what you retrieved. Pin a digest for a reproducible deployment after testing it. Registry availability and image CPU architecture are prerequisites, not assumptions to hide in a lab.

## Container lifecycle

`podman run` creates and starts a new container. `start` starts an existing one; `stop` requests a graceful exit; `rm` removes a stopped container. `podman ps -a` includes exited containers. `podman logs` reads configured output and `podman exec` runs a process inside a running container. A detached container can exit immediately if its main process ends.

A port mapping such as `127.0.0.1:8080:8080` binds only host loopback. `8080:8080` commonly binds more broadly. Check the image's actual service port and host listeners; a mapping does not make an application listen. Rootless users generally cannot bind low privileged ports under normal host policy.

## Persistent data and SELinux

Named volumes and bind mounts keep data outside the writable container layer. A bind option `:Z` relabels for private container use; `:z` allows shared use by multiple containers. Do not relabel system directories such as an entire home or `/etc` as a shortcut. Container UID/GID mapping can make host ownership surprising; inspect and use the image's documented user, volume policy or `podman unshare` deliberately rather than running everything as root.

Pass ordinary settings with environment variables but keep secrets out of published files, process arguments and image layers. For image creation, use a minimal Containerfile with a trusted FROM and explicit COPY. Build and test the resulting image, including non-root behavior and health, before substituting it into a managed service.

## Build a small local image

In a new student-owned project directory, write a fixture and a Containerfile:

```bash
printf '%s\n' built-content > marker.txt
```

```dockerfile
FROM registry.access.redhat.com/ubi9/ubi-minimal:latest
COPY marker.txt /opt/marker.txt
CMD ["/usr/bin/cat", "/opt/marker.txt"]
```

```bash
podman build -t localhost/kp-marker:1 .
podman run --rm localhost/kp-marker:1
```

The output should be `built-content`. Inspect the built image and explain why COPY captures the build-time file while a volume exposes runtime data. For a reproducible project, replace the mutable base tag with its approved digest after testing. Do not bake credentials or environment-specific secrets into image layers. This one-shot image exits normally; it is not a long-running service to put under a restart loop.


## Explore the model

{% flow-map ref="model" title="Containers with Podman: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch21.operations", "ch21.verification"] ref="quick" /%}


## Documentation

- [RHEL container guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/building_running_and_managing_containers/index)
