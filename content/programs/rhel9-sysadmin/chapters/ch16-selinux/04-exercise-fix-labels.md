---
title: "Exercise: Fix a 403 caused by a label"
kind: lab
minutes: 30
---

{% lead %}
Serve a page from a new directory with Apache, watch it fail, prove that SELinux is the cause, and fix the label in the permanent way. Then see how `cp`, `mv` and `chcon` behave.
{% /lead %}

{% lab
  objectives=["ch16.contexts"]
  id="fix-labels"
  title="Fix a 403 caused by a label"
  hosts=["workstation","servera"]
  outcomes=["Find that a wrong type blocks httpd.","Use semanage fcontext and restorecon for a permanent fix.","Compare cp, mv and chcon."] %}

  {% task id="task-89e066f27a14" title="Install and configure httpd" %}
    On servera as root (`sudo -i`), install `httpd` and the audit tools (`audit`, `setroubleshoot-server`), start `auditd`, create `/srv/web/index.html` containing `Hello from /srv/web`, and tell Apache to serve `/srv/web` with a file `/etc/httpd/conf.d/web.conf`. Start httpd.

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@servera
[student@servera ~]$ sudo -i
[root@servera ~]# dnf install -y httpd audit setroubleshoot-server > /dev/null
[root@servera ~]# systemctl enable --now auditd
[root@servera ~]# mkdir -p /srv/web
[root@servera ~]# echo "Hello from /srv/web" > /srv/web/index.html
[root@servera ~]# cat > /etc/httpd/conf.d/web.conf <<'EOT'
DocumentRoot "/srv/web"
<Directory "/srv/web">
    Require all granted
</Directory>
EOT
[root@servera ~]# systemctl enable --now httpd
Created symlink /etc/systemd/system/multi-user.target.wants/httpd.service → /usr/lib/systemd/system/httpd.service.
```
    {% /reveal %}
  {% /task %}

  {% task id="task-108264cdfa5b" title="See it fail" %}
    Request the page with `curl`. What status do you get? What are the permissions and the SELinux label of the file?

    {% reveal title="Show solution" %}

```console
[root@servera ~]# curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
403
[root@servera ~]# ls -lZ /srv/web/index.html
-rw-r--r--. 1 root root unconfined_u:object_r:var_t:s0 20 Oct  3 18:04 /srv/web/index.html
```

    The mode is `644`: everyone can read the file. The label is `var_t`.
    {% /reveal %}
  {% /task %}

  {% task id="task-adca47359486" title="Is it SELinux?" %}
    Switch to permissive mode, repeat the request, and switch back to enforcing. Then read the denial in the audit log.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# setenforce 0
[root@servera ~]# curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
200
[root@servera ~]# setenforce 1
[root@servera ~]# curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
403
[root@servera ~]# grep AVC /var/log/audit/audit.log | tail -1 | cut -c1-260
type=AVC msg=audit(1791050689.067:107): avc:  denied  { getattr } for  pid=1376 comm="httpd" path="/srv/web/index.html" dev="sda2" ino=262722 scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:var_t:s0 tclass=file permissive=0
```

    It works in permissive mode, so SELinux was the cause. The record says: `httpd_t` was refused access to a file of type `var_t`.
    {% /reveal %}
  {% /task %}

  {% task id="task-ea7a8c38b19b" title="Fix it permanently" %}
    Find the type the policy gives `/var/www/html`, add a rule for `/srv/web` and everything below it, apply it, and check the page.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# ls -dZ /var/www/html
system_u:object_r:httpd_sys_content_t:s0 /var/www/html
[root@servera ~]# semanage fcontext -a -t httpd_sys_content_t "/srv/web(/.*)?"
[root@servera ~]# restorecon -Rv /srv/web
Relabeled /srv/web from unconfined_u:object_r:var_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
Relabeled /srv/web/index.html from unconfined_u:object_r:var_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
[root@servera ~]# curl -s http://localhost/
Hello from /srv/web
```
    {% /reveal %}
  {% /task %}

  {% task id="task-710eb2019bfb" title="Copy versus move" %}
    Create two small files in `/tmp`. `cp` one into `/srv/web` and `mv` the other. Compare their labels and the HTTP status of each. Repair the one that fails.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# echo "second" > /tmp/second.html; echo "moved" > /tmp/moved.html
[root@servera ~]# cp /tmp/second.html /srv/web/copy.html
[root@servera ~]# mv /tmp/moved.html /srv/web/moved.html
[root@servera ~]# ls -Z /srv/web/copy.html /srv/web/moved.html
unconfined_u:object_r:httpd_sys_content_t:s0 /srv/web/copy.html
              unconfined_u:object_r:user_tmp_t:s0 /srv/web/moved.html
[root@servera ~]# curl -s -o /dev/null -w "copy:%{http_code}\n" http://localhost/copy.html
copy:200
[root@servera ~]# curl -s -o /dev/null -w "moved:%{http_code}\n" http://localhost/moved.html
moved:403
[root@servera ~]# restorecon -v /srv/web/moved.html
Relabeled /srv/web/moved.html from unconfined_u:object_r:user_tmp_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
[root@servera ~]# curl -s -o /dev/null -w "moved:%{http_code}\n" http://localhost/moved.html
moved:200
```
    {% /reveal %}
  {% /task %}

  {% task id="task-6e39fb1e07f0" title="chcon is not permanent" %}
    Set the type of `copy.html` to `user_home_t` with `chcon`, check that the page now fails, and repair it with `restorecon`. Why would `chcon -t httpd_sys_content_t` on a wrongly labelled file not be a proper fix?

    {% reveal title="Show solution" %}

```console
[root@servera ~]# chcon -t user_home_t /srv/web/copy.html
[root@servera ~]# curl -s -o /dev/null -w "copy:%{http_code}\n" http://localhost/copy.html
copy:403
[root@servera ~]# restorecon -Rv /srv/web
Relabeled /srv/web/copy.html from unconfined_u:object_r:user_home_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
```

    `chcon` records no rule. A `restorecon` or relabel would reset the file to whatever the rules say: with no rule for `/srv/web`, that would be `var_t` again. A rule from `semanage fcontext` makes the label permanent.
    {% /reveal %}
  {% /task %}

  {% task id="task-e5747f243852" title="Clean up" %}

```console
[root@servera ~]# semanage fcontext -d "/srv/web(/.*)?"
[root@servera ~]# systemctl disable --now httpd
[root@servera ~]# rm -rf /srv/web /etc/httpd/conf.d/web.conf /tmp/second.html
[root@servera ~]# exit
[student@servera ~]$ exit
```
  {% /task %}
{% /lab %}
