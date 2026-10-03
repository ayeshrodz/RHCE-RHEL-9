---
title: Investigate denials before changing policy
kind: lesson
minutes: 10
---

{% lead %}A denial is evidence about a specific process and object. Use it to test a narrow explanation, not to generate an unrestricted allow rule.{% /lead %}

{% objectives %}
- Explain labels, modes, booleans and port policy.
- Correct the cause of a denial while keeping SELinux enforcing.
{% /objectives %}

## Find the attempted operation

Use `ausearch -m AVC,USER_AVC -ts recent` where audit records are available. `journalctl` can show related application and audit messages. Correlate process name, source domain, target type, class and operation with the failed request. First confirm the application attempted the path you intended and that discretionary permissions allow it.

A denial might result from a mislabeled file, an undocumented application path, a policy boolean, an incorrect port type or a truly unsupported action. `audit2why` can aid interpretation; blindly using `audit2allow` on unrelated accumulated events can grant excessive permissions and conceal the real misconfiguration.

## Booleans and port labels

`getsebool -a` lists policy switches; `semanage boolean -l` gives descriptions where tooling is installed. `setsebool -P NAME on` changes a documented boolean persistently. Enable only the behavior required by the service, and explain its wider scope.

`semanage port -l` shows service port types. An HTTP service using a nonstandard port may require `semanage port -a -t http_port_t -p tcp PORT`; if that port is already defined, investigate its current owner before considering `-m`. Port policy does not open the firewall and firewall allowance does not supply SELinux permission.

## Verify the smallest correction

After correcting a context mapping, apply restorecon and repeat the original request with SELinux enforcing. Check for fresh denials rather than interpreting old log messages as a continued failure. Verify persistent configuration and repeat after reboot where required.

The laboratory below deliberately gives a harmless web fixture an unsuitable label, observes a denied request, and repairs the mapping. It does not change the global mode or add a generated policy module. Collect the failed and successful requests so the causal result is visible.

## Check your understanding

{% quiz id="quick" objectives=["ch16.operations", "ch16.verification"] ref="quick" /%}


## Documentation

- [RHEL SELinux guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/index)
