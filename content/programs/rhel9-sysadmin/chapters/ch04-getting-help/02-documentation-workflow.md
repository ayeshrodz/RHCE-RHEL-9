---
title: Build a reliable evidence trail
kind: lesson
minutes: 10
---

{% lead %}An operational answer should connect the installed version, a trusted reference and an observed result. That makes it reproducible for the next administrator.{% /lead %}

{% objectives %}
- Find installed command and configuration documentation.
- Use version-matched evidence when diagnosing an unfamiliar option.
{% /objectives %}

## Use more than one documentation surface

`command --help` is a quick option list, not always a full explanation. GNU `info` manuals often explain concepts and examples in depth. `/usr/share/doc` contains package documentation, release notes and examples. `rpm -qd package` lists documentation tracked by a package; `rpm -ql package` lists all its files.

```bash
ls --help | less
rpm -q coreutils
rpm -qd coreutils
ls /usr/share/doc
```

If `info` is absent, use the manual or install the documentation viewer when repositories are available. A missing local document is an environment limitation, not permission to invent an option.

## Match the environment

Online references should match RHEL 9 and the installed software version. A distribution may backport a feature or fix without adopting an upstream version number. Consult vendor documentation and the installed manual before copying a latest-version example. This matters for NetworkManager, OpenSSH and Podman later in the program.

Read configuration precedence and reload instructions as well as syntax. A syntactically valid file in the wrong directory may have no effect. A daemon may continue using its previous configuration until it reloads. Use its supported validation command before applying changes.

## A five-question investigation

1. What exact command, host and version produced the symptom?
2. What did you expect, and what did the result show?
3. Which reference describes the relevant behavior?
4. What is the smallest safe test of your hypothesis?
5. How will you undo the test and record the result?

For an offline incident, local manuals and package docs remain available while network search does not. Export a short runbook with commands, expected conditions, rollback and references before an outage. Record useful diagnostics without passwords, private keys or unrestricted dumps of environment variables.

## Help that needs judgment

Search results, community answers and automated assistants can suggest hypotheses. Treat them as suggestions to verify: check version, privilege, destructiveness and the reference. A convincing explanation does not establish that a command exists on your installed system. A support bundle such as `sos report`, when installed, can contain sensitive host data; review and store it according to your team's policy rather than posting it publicly.

## Check your understanding

{% quiz id="quick" objectives=["ch04.operations", "ch04.verification"] ref="quick" /%}


## Documentation

- [RHEL basic system settings](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
