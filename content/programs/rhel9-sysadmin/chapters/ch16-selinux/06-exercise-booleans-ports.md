---
title: "Exercise: Flip a switch and label a port"
kind: lab
minutes: 30
---

{% lead %}
Two more reasons for a service to be refused by SELinux, and their proper fixes: Apache publishing a user's `public_html` directory (a boolean), and Apache listening on port 82 (a port label).
{% /lead %}

{% lab
  objectives=["ch16.booleans"]
  id="booleans-ports"
  title="Flip a switch and label a port"
  hosts=["workstation","servera"]
  outcomes=["Find and change an httpd boolean permanently.","Label a port for httpd and start the service on it.","Review local SELinux customisations."] %}

  {% task id="task-338fabc53204" title="Prepare httpd and a user page" %}
    On servera as root (`sudo -i`), install `httpd`, `audit` and `setroubleshoot-server` if they are not there (`dnf install -y …`), start `auditd`, create the user `bob` with a page `/home/bob/public_html/index.html` (home mode 711, directory 755, file 644), and enable user directories by editing `/etc/httpd/conf.d/userdir.conf`: comment out `UserDir disabled` and add `UserDir public_html`. Start httpd.

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@servera
[student@servera ~]$ sudo -i
[root@servera ~]# dnf install -y httpd audit setroubleshoot-server > /dev/null
[root@servera ~]# systemctl enable --now auditd
[root@servera ~]# useradd -m bob
[root@servera ~]# mkdir -p /home/bob/public_html
[root@servera ~]# echo "bob page" > /home/bob/public_html/index.html
[root@servera ~]# chmod 711 /home/bob; chmod 755 /home/bob/public_html; chmod 644 /home/bob/public_html/index.html
[root@servera ~]# sed -i 's/^\s*UserDir disabled/#UserDir disabled/; s/^\s*#\s*UserDir public_html/    UserDir public_html/' /etc/httpd/conf.d/userdir.conf
[root@servera ~]# grep -n "UserDir public_html" /etc/httpd/conf.d/userdir.conf
24:    UserDir public_html
[root@servera ~]# systemctl enable --now httpd
```
    {% /reveal %}
  {% /task %}

  {% task id="task-4860cc481235" title="See it fail" %}
    Request `http://localhost/~bob/`. Check the label of the page, and read the denial.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# curl -s -o /dev/null -w "bob:%{http_code}\n" http://localhost/~bob/
bob:403
[root@servera ~]# ls -Z /home/bob/public_html/index.html
unconfined_u:object_r:httpd_user_content_t:s0 /home/bob/public_html/index.html
[root@servera ~]# grep AVC /var/log/audit/audit.log | tail -1 | cut -c1-300
type=AVC msg=audit(1791050805.392:163): avc:  denied  { getattr } for  pid=2522 comm="httpd" path="/home/bob/public_html/index.html" dev="sda2" ino=256668 scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:httpd_user_content_t:s0 tclass=file permissive=0
```

    The label is already the right one for web content in a home directory (`httpd_user_content_t`). The page is blocked because Apache is not allowed to use home directories at all, a feature controlled by a boolean.
    {% /reveal %}
  {% /task %}

  {% task id="task-d411067568cf" title="Find and flip the switch" %}
    Find the boolean about home directories, show its state, and turn it on permanently. Test again.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# getsebool -a | grep httpd_enable_homedirs
httpd_enable_homedirs --> off
[root@servera ~]# setsebool -P httpd_enable_homedirs on
[root@servera ~]# getsebool httpd_enable_homedirs
httpd_enable_homedirs --> on
[root@servera ~]# curl -s http://localhost/~bob/
bob page
[root@servera ~]# semanage boolean -l -C
SELinux boolean                State  Default Description

httpd_enable_homedirs          (on   ,   on)  Allow httpd to enable homedirs
```
    {% /reveal %}
  {% /task %}

  {% task id="task-7acd7236eda1" title="Listen on port 82" %}
    Change `Listen 80` to `Listen 82` in `/etc/httpd/conf/httpd.conf` and restart httpd. What happens, and where do you see why?

    {% reveal title="Show solution" %}

```console
[root@servera ~]# sed -i 's/^Listen 80$/Listen 82/' /etc/httpd/conf/httpd.conf
[root@servera ~]# systemctl restart httpd
Job for httpd.service failed because the control process exited with error code.
See "systemctl status httpd.service" and "journalctl -xeu httpd.service" for details.
[root@servera ~]# journalctl -u httpd -n 4 --no-pager | cut -c40-
httpd[1713]: (13)Permission denied: AH00072: make_sock: could not bind to address [::]:82
httpd[1713]: (13)Permission denied: AH00072: make_sock: could not bind to address 0.0.0.0:82
httpd[1713]: no listening sockets available, shutting down
httpd[1713]: AH00015: Unable to open logs
```
    {% /reveal %}
  {% /task %}

  {% task id="task-0d4f75013864" title="Label the port" %}
    List the ports allowed for `http_port_t`, add TCP port 82, restart, and test `http://localhost:82/`.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# semanage port -l | grep ^http_port_t
http_port_t                    tcp      80, 81, 443, 488, 8008, 8009, 8443, 9000
[root@servera ~]# semanage port -a -t http_port_t -p tcp 82
[root@servera ~]# systemctl restart httpd
[root@servera ~]# systemctl is-active httpd
active
[root@servera ~]# curl -s -o /dev/null -w "port82:%{http_code}\n" http://localhost:82/
port82:200
[root@servera ~]# semanage port -l -C
SELinux Port Type              Proto    Port Number

http_port_t                    tcp      82
```
    {% /reveal %}
  {% /task %}

  {% task id="task-2fccc677c5a9" title="Put everything back" %}

```console
[root@servera ~]# semanage port -d -t http_port_t -p tcp 82
[root@servera ~]# setsebool -P httpd_enable_homedirs off
[root@servera ~]# sed -i 's/^Listen 82$/Listen 80/' /etc/httpd/conf/httpd.conf
[root@servera ~]# systemctl disable --now httpd
[root@servera ~]# userdel -r bob
[root@servera ~]# exit
[student@servera ~]$ exit
```
  {% /task %}
{% /lab %}
