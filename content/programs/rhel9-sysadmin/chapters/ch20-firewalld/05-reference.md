---
title: 'Reference: The firewall'
kind: summary
minutes: 5
---

{% lead %}
Use this page for retrieval after the lessons. For destructive or privileged work, return to the full procedure and its preconditions.
{% /lead %}

## The model to remember

**Caller and zone:** Determine the actual packet source and interface policy.

**Allowance:** Add the minimum service or port rule in runtime and saved policy deliberately.

**Remote probe:** Test the intended caller, denied variation and persistence after reload.

## Command reference

| Example | Use and limits |
| --- | --- |
| `firewall-cmd --get-active-zones` | Identify which zone handles interfaces and sources. |
| `firewall-cmd --info-service=http` | Inspect named port/protocol definitions. |
| `firewall-cmd --query-service=http` | Query live policy for the selected zone. |
| `firewall-cmd --permanent --query-service=http` | Query saved policy independently. |
| `curl --connect-timeout 5 http://servera.lab.example.com/` | Test the actual remote caller path from workstation. |

## Recall without the walkthrough

{% flashcards ref="recall" /%}

## Before you mark the chapter complete

- Explain both chapter objectives in your own words.
- Finish the [chapter lab](#/ch20/lab) and retain its actual verification results.
- Describe one failure cause and the correction that preserves access and security.
- On a resettable server, remove broad HTTP access and permit it only from a reviewed source subnet. Test a matching and a nonmatching caller.


## Documentation

- [RHEL firewall guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_firewalls_and_packet_filters/index)
