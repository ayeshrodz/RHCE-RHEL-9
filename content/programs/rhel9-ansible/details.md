---
title: "RHEL 9: Platform and versions"
eyebrow: Your learning environment
description: Understand where your automation runs, choose a practice environment, and check the versions behind each result.
---

## Choose your practice path

Kernel Path teaches Ansible through short lessons, browser activities, and real Linux tasks. This track targets **Red Hat Enterprise Linux 9**. You can practise with the free home lab or follow the clearly marked classroom commands.

{% cards %}
  {% card title="Free home lab" kicker="Start here for independent practice" tone="teal" %}
    Rocky Linux 9 virtual machines on LXD, community collections, and tools installed on workstation. Chapter 1 builds the environment and provides reset points. The platform requires no account; your learning progress stays in this browser.
  {% /card %}
  {% card title="Classroom reference" kicker="RHEL 9 with AAP 2.2" tone="purple" %}
    Older classroom examples use Ansible Automation Platform 2.2 and an execution environment containing core 2.13. Follow those commands when you have that environment. Classroom lab helpers and private registry images are supplied by that environment.
  {% /card %}
{% /cards %}

Both paths teach inventories, playbooks, variables, roles, and desired system state. **Choose Home lab or Classroom in an exercise's environment switch** before copying setup commands. That switch changes the displayed instructions; it does not install software or change your machines.

## Follow the execution path

The **control node** starts the automation. An **execution environment (EE)** is a container containing its engine, collections, and dependencies. The **managed hosts** receive tasks over SSH. The container's operating system can differ from the hosts it manages.

Choose a path, then select a diagram step to see what happens there.

{% tabs %}
  {% tab label="Home lab" %}
    {% flow-map
      title="Home lab execution path"
      caption="Navigator uses the tools installed on workstation; managed hosts still receive tasks over SSH."
      ref="flow-map" /%}
  {% /tab %}
  {% tab label="Classroom reference" %}
    {% flow-map
      title="Classroom execution path"
      caption="Navigator starts an EE container on the control node; that container runs the automation against RHEL 9 hosts."
      ref="flow-map-2" /%}
  {% /tab %}
{% /tabs %}

AAP 2.2's supported execution environment builds on core 2.13 and adds supported collections. See the [AAP 2.2 execution environment documentation](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.2/html/creating_and_consuming_execution_environments/assembly-publishing-exec-env) for the reference image model.

## Compare the versions

These are **different stacks**. An AAP release, a navigator release, an Ansible engine release, and a managed host's OS version describe different parts of the system.

| Component | Free home-lab baseline | Classroom reference |
| --- | --- | --- |
| Operating system | Rocky Linux 9; VM checks recorded on 9.8 | RHEL 9 examples |
| Automation engine | ansible-core 2.14; VM checks recorded on 2.14.18 | core 2.13 inside the AAP 2.2 EE |
| Navigator | 26.9.0 in its own Python environment | The version supplied by the classroom |
| Collections | Pinned on workstation: ansible.posix 1.5.4 and community.general 9.5.13 | Collections provided by the selected EE |
| Execution environment | Disabled for the baseline; chapter 12 runs projects in a community image | Enabled; image provided by the classroom registry |

The home-lab versions above are the documented baseline checked on **2 October 2026**. They describe selected verified lab runs, rather than complete validation of every exercise. Use compatible collection versions: installing the newest collection can raise its required core version.

{% reveal title="Show the role of controller, hub, and utility" %}
Automation controller schedules and manages jobs; automation hub distributes collections and EE images. They are part of the wider platform, but these exercises run from workstation. In the home lab, the optional utility VM serves practice files; it is not an installed private automation hub. A classroom utility host may provide a registry and other training services.
{% /reveal %}

## Check what will actually run

Run these from your **exercise directory on workstation** before investigating a version mismatch. They inspect your tools and configuration without running a playbook against managed hosts.

```bash {% title="workstation: inspect the local tools" %}
ansible --version
ansible-navigator --version
ansible-galaxy collection list
ansible-navigator settings --effective --mode stdout
```

- **`ansible --version`:** check the core version, executable location, Python, and selected configuration file. This reports the local engine.
- **Navigator version:** identifies the command-line tool; a newer navigator does not make the local core newer.
- **Collection list:** shows both versions and installation paths. Project collections may override system-installed ones.
- **Effective settings:** combines defaults, settings files, environment variables, and CLI options. Check `execution-environment.enabled` and, when enabled, the selected image. The [navigator settings documentation](https://docs.ansible.com/projects/navigator/settings/) explains these controls.

{% reveal title="Show how to inspect an enabled execution environment" %}
When your configured EE image is available and execution environments are enabled, inspect the engine and collections **inside it**:

```bash {% title="workstation: inspect the selected EE" %}
ansible-navigator exec --mode stdout -- ansible --version
ansible-navigator exec --mode stdout -- ansible-galaxy collection list
```

These commands may pull the configured image if it is missing. The output inside the container can differ from the local commands above. Chapter 12 shows how to choose a public image for a project in [the development-container lesson](#/ch12/development-containers).
{% /reveal %}

## Turn practice into reliable skills

RHEL 9 administration gives your playbooks a concrete goal: packages installed with DNF, services managed by systemd, access controlled through users and permissions, and systems protected by firewalld and SELinux. Browser activities help you reason about those tasks; the VM exercises let you verify their real effects.

For each exercise, check the required state, run the playbook again, and explain any remaining changes. Perform reboot checks when the task requires persistence. Try Challenge mode once you can complete the guided procedure.

For certification planning, read the RHCE exam's published objectives on the Red Hat website, and check which product version applies when you book. This independent community platform provides practice evidence, without guaranteeing an exam result.

## Choose your next step

{% cards cols=3 %}
  {% card title="Build your lab" kicker="Practical setup" tone="teal" %}
    [Start chapter 1](#/ch01) to create the VMs, install the tools, and prepare a clean reset point.
  {% /card %}
  {% card title="Learn the foundations" kicker="Core automation skills" tone="amber" %}
    [Start chapter 2](#/ch02) to understand the architecture and follow your first automation tasks.
  {% /card %}
  {% card title="Extend your workflow" kicker="After the foundations" tone="purple" %}
    [Start chapter 12](#/ch12) to keep projects in Git and run them from development containers.
  {% /card %}
{% /cards %}
