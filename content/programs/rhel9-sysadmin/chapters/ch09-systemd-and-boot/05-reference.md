---
title: 'Reference: Services and the boot process'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Unit file:** Defines process identity, executable and startup relationships.

**Manager state:** Tracks running, failed, enabled and masked conditions separately.

**Application evidence:** Confirms useful work now and again after a new boot.

## Command reference

| Example | Use and limits |
| --- | --- |
| `systemctl is-active UNIT` | Observe current runtime state. |
| `systemctl is-enabled UNIT` | Observe startup activation policy. |
| `systemctl cat UNIT` | Inspect vendor definition and administrator overrides. |
| `journalctl -u UNIT -b` | Read unit evidence from the current boot. |
| `systemd-analyze verify UNITFILE` | Check unit syntax and references before activation. |
| `systemctl daemon-reload` | Reread manager definitions; does not restart the application. |
| `systemctl get-default` | Inspect persistent default target. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch09/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- Disable the running service without stopping it. Predict the next boot, then re-enable and verify the prediction on a disposable VM.


## Documentation

- [RHEL systemd guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/index)
- [RHEL recovery reference](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/index)
