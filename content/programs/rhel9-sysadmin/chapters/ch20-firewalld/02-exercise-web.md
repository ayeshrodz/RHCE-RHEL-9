---
title: "Exercise: Publish a web server through the firewall"
kind: lab
minutes: 25
---

{% lead %}
Start a web server on servera and find out why serverb cannot reach it. Then open exactly what is needed, one layer at a time, and prove each step from the client.
{% /lead %}

{% lab
  objectives=["ch20.zones"]
  id="web"
  title="Publish a web server through the firewall"
  hosts=["workstation","servera","serverb"]
  outcomes=["Read the active zone and its services.","Allow a service permanently and verify it from another host.","Tell a closed firewall from a missing service."] %}

  {% task id="task-d13fed178054" title="Start a web server" %}
    On servera as root, install `httpd`, put the line `hello from servera` in `/var/www/html/index.html`, and start and enable the service. Test it locally with `curl`.

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@servera
[student@servera ~]$ sudo -i
[root@servera ~]# dnf install -y httpd > /dev/null
[root@servera ~]# echo "hello from servera" > /var/www/html/index.html
[root@servera ~]# systemctl enable --now httpd
Created symlink /etc/systemd/system/multi-user.target.wants/httpd.service → /usr/lib/systemd/system/httpd.service.
[root@servera ~]# curl -s http://localhost/
hello from servera
```
    {% /reveal %}
  {% /task %}

  {% task id="task-78d0e2258f6f" title="Try it from serverb" %}
    On serverb, fetch `http://servera/` with `curl -sS -m 3`. What message do you get, and what does it tell you about the web server itself?

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@serverb
[student@serverb ~]$ curl -sS -m 3 http://servera/
curl: (7) Failed to connect to servera port 80: No route to host
```

    "No route to host" while ping works is the firewall's rejection. The web server is fine (it answered locally).
    {% /reveal %}
  {% /task %}

  {% task id="task-3af97eaf954b" title="Read the firewall" %}
    On servera: is firewalld running, which zone is active, and what does it allow?

    {% reveal title="Show solution" %}

```console
[root@servera ~]# firewall-cmd --state
running
[root@servera ~]# firewall-cmd --get-active-zones
public
  interfaces: enp1s0
[root@servera ~]# firewall-cmd --list-services
cockpit dhcpv6-client ssh
```

    The zone is `public` and `http` is not among its services. (On your lab the interface name may differ.)
    {% /reveal %}
  {% /task %}

  {% task id="task-84566187fa7f" title="Open the http service permanently" %}
    Add the service, load it, check that it is in both stores, and test from serverb again.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# firewall-cmd --permanent --add-service=http
success
[root@servera ~]# firewall-cmd --reload
success
[root@servera ~]# firewall-cmd --query-service=http; firewall-cmd --permanent --query-service=http
yes
yes
[student@serverb ~]$ curl -s -m 3 http://servera/
hello from servera
```
    {% /reveal %}
  {% /task %}

  {% task id="task-86d473fe0257" title="A second port" %}
    Make httpd also listen on port 8080 (a file `/etc/httpd/conf.d/extra.conf` with `Listen 8080`) and restart it. Before you touch the firewall, predict what serverb gets on port 8080, then test. Finally allow `8080/tcp` permanently and test again.

    {% reveal title="Show solution" %}

```console
[root@servera ~]# echo "Listen 8080" > /etc/httpd/conf.d/extra.conf
[root@servera ~]# systemctl restart httpd
[root@servera ~]# ss -tlnp | grep httpd | cut -c1-48
LISTEN 0      511                *:80              *:*
LISTEN 0      511                *:8080            *:*
[student@serverb ~]$ curl -sS -m 3 http://servera:8080/
curl: (7) Failed to connect to servera port 8080: No route to host
[root@servera ~]# firewall-cmd --permanent --add-port=8080/tcp; firewall-cmd --reload
success
success
[student@serverb ~]$ curl -s -m 3 http://servera:8080/
hello from servera
```

    Port 8080 is permitted by SELinux for web servers, so only the firewall stood in the way.
    {% /reveal %}
  {% /task %}

  {% task id="task-dd89882e76b1" title="Clean up" %}

```console
[root@servera ~]# firewall-cmd --permanent --remove-service=http; firewall-cmd --permanent --remove-port=8080/tcp; firewall-cmd --reload
success
success
success
[root@servera ~]# rm /etc/httpd/conf.d/extra.conf; systemctl restart httpd
[root@servera ~]# exit
```
  {% /task %}
{% /lab %}
