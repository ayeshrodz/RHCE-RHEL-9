---
title: 'Exercise: SELinux'
kind: lab
minutes: 40
---

{% lead %}
Serve a custom document root on clean servera with SELinux enforcing. Intentionally mislabel it, observe the failed request and denial, then persist the correct context and prove successful access.
{% /lead %}

{% lab id="sysadmin-16" title="SELinux" objectives=["ch16.operations", "ch16.verification"] exercise="sysadmin-16" ownExercise=true hosts=["workstation", "servera.lab.example.com"] outcomes=["Explain labels, modes, booleans and port policy.", "Correct the cause of a denial while keeping SELinux enforcing."] %}

{% lab-notes %}

**Prerequisites and environment:** Complete the two lessons in this chapter and the [practice lab](#/ch01/overview). Run user-file commands as student on workstation; a task explicitly names server commands. Start from clean servera. Save previous work before using the host-and-disk reset. Keep console access available. Use the optional helper setup in the [environment reference](#/platform) for automated feedback. Its transport does not change the subject of this Linux administration exercise.

Run the manual checks in each task, then grade before cleanup:

```bash
lab grade sysadmin-16
```

The grader observes only its listed checks. Written evidence is not proof of machine state; manually verify the requested failure, client-operation and lifecycle results.

{% /lab-notes %}

{% lab-challenge %}

Serve a custom document root on clean servera with SELinux enforcing. Intentionally mislabel it, observe the failed request and denial, then persist the correct context and prove successful access.

- Explain labels, modes, booleans and port policy.
- Correct the cause of a denial while keeping SELinux enforcing.
- Record actual results, diagnose one mismatch, and preserve the required final state until grading.

{% /lab-challenge %}

{% task id="task-1a6b897ac270" title="Prepare the project" %}

On workstation, after installing the optional home-lab helper:

```bash
lab start sysadmin-16
cd ~/sysadmin-16
```

Without the helper, create this directory yourself. For host checks, the starter inventory contains only the required disposable hosts. Commands shown in tasks are the work you perform; the helper does not configure servers or reset them.

{% /task %}

{% task id="task-73983fac2a44" title="Prepare the service and fixture" %}

On servera:
```bash
sudo dnf install httpd policycoreutils-python-utils audit
sudo install -d -m 0755 /srv/site
printf '%s\n' policy-ready | sudo tee /srv/site/index.html
```
Create `/etc/httpd/conf.d/kp-site.conf`:
```apache
DocumentRoot /srv/site
<Directory /srv/site>
    Require all granted
</Directory>
```
Run `sudo httpd -t`, then `sudo systemctl enable --now httpd`. Verify getenforce reports Enforcing.

{% /task %}

{% task id="task-9994c0bfe506" title="Observe a controlled denial" %}

```bash
sudo chcon -Rt user_home_t /srv/site
curl -i http://127.0.0.1/
sudo ausearch -m AVC,USER_AVC -ts recent
```
If discretionary permissions, configuration or another issue fails first, correct that layer before attributing the request to SELinux. Record the failed status and relevant AVC in workstation's `observations.txt`.

{% /task %}

{% task id="task-31f060018796" title="Persist and apply the correction" %}

```bash
sudo semanage fcontext -a -t httpd_sys_content_t '/srv/site(/.*)?'
sudo restorecon -Rv /srv/site
ls -Zd /srv/site /srv/site/index.html
curl -fsS http://127.0.0.1/
getenforce
```
The body must contain `policy-ready` with enforcing retained. Run restorecon again and reboot/retest. If repeating on an existing mapping, inspect it and use an appropriate modification rather than adding duplicates.

{% /task %}

{% task id="task-266575e75d6f" title="Verify, vary and finish" %}

Preserve the before/after evidence, then reset servera. Manual cleanup must remove the authored web configuration and its specific fcontext rule before restorecon and restart.

{% reveal title="Try a changed requirement" %}

Compare matchpathcon before and after a temporary chcon change, then repair with restorecon rather than changing mode.

Record the original result first. A changed fixture can intentionally fail its original grader.

{% /reveal %}

{% lab-finish exercise="sysadmin-16" grade=true /%}

{% /task %}
{% /lab %}
