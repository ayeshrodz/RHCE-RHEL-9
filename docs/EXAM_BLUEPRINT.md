# Red Hat Certified Engineer (EX294): Exam Blueprint & Study Guide

This document outlines the official curriculum, test topology, grading criteria, and preparation strategy for the **Red Hat Certified Engineer (RHCE / EX294)** exam on **Red Hat Enterprise Linux 9** and **Ansible Automation Platform 2**.

---

## 1. Exam Specifications

- **Exam Code:** EX294
- **Associated Course:** Red Hat System Administration III: Linux Automation with Ansible (RH294)
- **Platform:** Red Hat Enterprise Linux 9 / Ansible Automation Platform 2.2
- **Duration:** 4 Hours
- **Format:** 100% Practical, performance-based exam on live multi-node systems.
- **Passing Score:** 210 / 300 (70%)

---

## 2. Classroom & Exam Lab Topology

All exam exercises operate within a standardized multi-node virtual network:

```text
                               +-----------------------------+
                               |  utility.lab.example.com    |
                               |  (Package & Image Registry) |
                               +--------------+--------------+
                                              |
        +-------------------------------------+-------------------------------------+
        |                                     |                                     |
+-------+---------------+             +-------+---------------+             +-------+---------------+
|  workstation          |             |  servera              |             |  serverb              |
|  (Control Node)       |             |  (Managed Node)       |             |  (Managed Node)       |
|  student / ansible    |             |  RHEL 9 / Python 3.9  |             |  RHEL 9 / Python 3.9  |
+-----------------------+             +-----------------------+             +-----------------------+
        |                                     |                                     |
        +-------------------------------------+-------------------------------------+
        |                                     |
+-------+---------------+             +-------+---------------+
|  serverc              |             |  serverd              |
|  (Managed Node)       |             |  (Managed Node)       |
|  RHEL 9 / Python 3.9  |             |  RHEL 9 / Python 3.9  |
+-----------------------+             +-----------------------+
```

### Standard Credentials & Setup
- **Control Node:** `workstation.lab.example.com`
- **Managed Nodes:** `servera.lab.example.com` through `serverd.lab.example.com`
- **Classroom User:** `student` (Password: `student`)
- **Root Password:** `redhat`
- **Automation User:** Configured with passwordless sudo (`NOPASSWD: ALL`).

---

## 3. Curriculum Syllabus Mapping (10 Chapters)

| # | Chapter Title | Core Competencies |
| :--- | :--- | :--- |
| **01** | **Introducing Ansible** | Agentless architecture, IaC, AAP 2 components, `ansible-navigator`, Execution Environments (`podman`), pulling and inspecting images. |
| **02** | **Implementing Playbooks** | Static INI inventories, groups, child groups (`:children`), host ranges, `ansible.cfg` precedence hierarchy, privilege escalation (`[privilege_escalation]`), multi-play YAML playbooks. |
| **03** | **Managing Variables & Facts** | Variable precedence rules, `host_vars/` and `group_vars/` directories, system facts gathering (`setup` module), Ansible Vault (`ansible-vault create/encrypt/edit`). |
| **04** | **Implementing Task Control** | Loops (`loop`), conditionals (`when`), handlers (`notify`/`listen`), error handling (`ignore_errors`, `failed_when`, `block`/`rescue`/`always`). |
| **05** | **Deploying Files to Hosts** | File manipulation (`copy`, `file`, `lineinfile`, `blockinfile`), Jinja2 templating (`template`), template filters and variables. |
| **06** | **Managing Complex Plays** | Host selection patterns, task delegation (`delegate_to`), static importing (`import_tasks`, `import_playbook`) vs dynamic including (`include_tasks`). |
| **07** | **Roles & Collections** | Role directory layout (`tasks`, `handlers`, `vars`, `defaults`, `meta`), downloading collections with `ansible-galaxy`, leveraging RHEL System Roles (`timesync`, `network`, `firewall`). |
| **08** | **Troubleshooting Ansible** | Playbook debugging, syntax checks (`--syntax-check`), check mode (`--check --diff`), variable inspection (`debug` module), reading navigator artifacts. |
| **09** | **Automating Linux Admin** | Managing RPMs/dnf, users/groups, cron jobs, storage (LVM, partitions, filesystems, mount points), SELinux booleans and file contexts, firewall rules. |
| **10** | **Comprehensive Review** | End-to-end exam simulation labs testing full playbook execution and idempotency. |

---

## 4. The 5 Golden Rules for Passing EX294

1. **Test for Idempotency Every Single Time:**
   Automated grading scripts run your playbook twice. If the second run reports `changed > 0` or fails, you lose marks for that question. Always run your playbooks a second time and verify `changed=0`.

2. **Always Work in the Specified Directory:**
   The exam instructions will state the working directory (e.g., `/home/student/ansible/`). All files (`ansible.cfg`, `inventory`, playbooks) must reside exactly where requested.

3. **Disable Password Prompts in `ansible.cfg`:**
   Ensure `ask_pass = false` and `become_ask_pass = false` so automated scripts do not stall waiting for interactive keyboard input.

4. **Master Built-in Documentation:**
   The exam environment is isolated with no access to external search engines. Use:
   ```bash
   ansible-navigator doc -s <module_name> -m stdout
   ```
   to get immediate, valid YAML syntax snippets.

5. **Verify Python SELinux Bindings on Targets:**
   SELinux is `Enforcing` across all exam nodes. Ensure `python3-libselinux` is present if you encounter file permission or context failures.
