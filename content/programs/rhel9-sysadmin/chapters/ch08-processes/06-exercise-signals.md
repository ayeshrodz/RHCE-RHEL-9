---
title: "Exercise: Stop a runaway process the right way"
kind: lab
minutes: 25
---

{% lead %}
Compare a clean shutdown with a forced one, pause and resume a CPU hog, and end all processes belonging to one user, previewing each step first.
{% /lead %}

{% lab
  objectives=["ch08.signals"]
  id="signals"
  title="Stop a runaway process the right way"
  hosts=["workstation","servera"]
  outcomes=["Send SIGTERM, SIGKILL, SIGSTOP and SIGCONT and see the difference.","Preview matches with pgrep before using pkill.","End all of one user's processes."] %}

  {% task id="task-ad7d36659974" title="Write a program that cleans up" %}
    On servera, create `~/cleanup.sh` with the content below, and make it executable. It creates a lock file and removes it when it receives SIGTERM.

```bash
#!/bin/bash
trap 'echo "cleaning up"; rm -f /tmp/work.lock; exit 0' TERM
touch /tmp/work.lock
while true; do sleep 1; done
```

    {% reveal title="Show solution" %}

```console
[student@workstation ~]$ ssh student@servera
[student@servera ~]$ vim cleanup.sh
[student@servera ~]$ chmod +x cleanup.sh
```
    {% /reveal %}
  {% /task %}

  {% task id="task-8dac31281941" title="Terminate politely" %}
    Run the script in the background, check the lock file exists, then end it with the default signal. Is the lock file gone?

    {% reveal title="Show solution" %}

```console
[student@servera ~]$ ./cleanup.sh &
[1] 4921
[student@servera ~]$ ls /tmp/work.lock
/tmp/work.lock
[student@servera ~]$ kill %1
[student@servera ~]$ Terminated
cleaning up
ls /tmp/work.lock
ls: cannot access '/tmp/work.lock': No such file or directory
```

    The trap caught SIGTERM and ran the cleanup. (Your prompt may appear before the message; press Enter.)
    {% /reveal %}
  {% /task %}

  {% task id="task-5ed67d239566" title="Force it and see what is left" %}
    Run the script again, this time ending it with signal 9. What stays behind? Remove it by hand.

    {% reveal title="Show solution" %}

```console
[student@servera ~]$ ./cleanup.sh &
[1] 4928
[student@servera ~]$ kill -9 %1
[student@servera ~]$ ls /tmp/work.lock
/tmp/work.lock
[1]+  Killed                  ./cleanup.sh
[student@servera ~]$ rm -f /tmp/work.lock
```

    SIGKILL cannot be caught, so no cleanup ran and the lock file is stale. A real service would refuse to start next time, believing it is still running.
    {% /reveal %}
  {% /task %}

  {% task id="task-393649a2d3b1" title="Pause and resume a CPU hog" %}
    Start `sha256sum /dev/zero &`, which uses all the CPU it can get. Look at it with `top -b -n1 -o %CPU | head -8`. Pause it with SIGSTOP, check the state in `ps`, resume it with SIGCONT, and then end it.

    {% reveal title="Show solution" %}

```console
[student@servera ~]$ sha256sum /dev/zero &
[1] 5016
[student@servera ~]$ top -b -n1 -o %CPU | sed -n 7,8p
    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   5016 student   20   0   12076   3828   3176 R  93.3   0.4   0:01.11 sha256s+
[student@servera ~]$ kill -STOP %1
[student@servera ~]$ ps -o pid,stat,pcpu,cmd -p 5016
    PID STAT %CPU CMD
   5016 T    70.0 sha256sum /dev/zero
[student@servera ~]$ kill -CONT %1
[student@servera ~]$ kill %1
```

    A stopped process keeps its memory but uses no CPU. The `%CPU` that `ps` shows is an average over the process's whole life, so it falls only gradually.
    {% /reveal %}
  {% /task %}

  {% task id="task-c8e211255521" title="End every process of one user" %}
    As root, create the user `bob` and start two `sleep` processes as him with `nohup`. Preview them with `pgrep`, count them, then end them with `pkill`, and confirm.

    {% reveal title="Show solution" %}

```console
[student@servera ~]$ sudo -i
[root@servera ~]# useradd -m bob
[root@servera ~]# su - bob -c 'nohup sleep 900 >/dev/null 2>&1 & nohup sleep 901 >/dev/null 2>&1 &'
[root@servera ~]# pgrep -u bob -a sleep
4986 sleep 900
4987 sleep 901
[root@servera ~]# pgrep -c -u bob sleep
2
[root@servera ~]# pkill -u bob sleep
[root@servera ~]# pgrep -u bob -a sleep
[root@servera ~]# echo $?
1
```

    `pgrep` printing nothing and exiting with status 1 means no process matched.
    {% /reveal %}
  {% /task %}

  {% task id="task-01dbf4b6e00c" title="Clean up" %}

```console
[root@servera ~]# userdel -r bob
[root@servera ~]# exit
[student@servera ~]$ rm -f cleanup.sh
[student@servera ~]$ exit
```

    If `userdel` says bob is still in use, wait a moment and run it again.
  {% /task %}
{% /lab %}
