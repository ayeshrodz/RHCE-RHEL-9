#!/usr/bin/env python3
"""Compare taught simulation cases with an installed Ansible runtime in a temporary project."""
from pathlib import Path
import subprocess
import tempfile
import json
import sys

with tempfile.TemporaryDirectory(prefix='playbook-path-ansible-') as temp:
    project = Path(temp)
    (project/'inventory').write_text('[local]\nlocalhost ansible_connection=local port=8080\n[local:vars]\nport=80\n')
    (project/'ansible.cfg').write_text('[defaults]\ninventory=./inventory\nretry_files_enabled=False\n')
    (project/'toggle.yml').write_text('''- ansible.builtin.set_fact:
    run_flag: false
- ansible.builtin.set_fact:
    include_result: ran
''')
    (project/'toggle-import.yml').write_text('''- ansible.builtin.set_fact:
    run_flag: false
- ansible.builtin.set_fact:
    import_result: ran
''')
    (project/'roles/minimal/defaults').mkdir(parents=True)
    (project/'roles/minimal/defaults/main.yml').write_text('role_title: defaults-only\n')
    (project/'checks.yml').write_text('''- hosts: local
  gather_facts: false
  vars:
    port: 8443
    host: servera
    left: {x: 1, y: 2}
    right: {y: 2, x: 1}
    run_flag: true
    handler_runs: 0
  roles: [minimal]
  tasks:
    - ansible.builtin.copy:
        content: same
        dest: ''' + str(project/'idempotent.txt') + '''
        mode: '0600'
      register: first_copy
    - ansible.builtin.copy:
        content: same
        dest: ''' + str(project/'idempotent.txt') + '''
        mode: '0600'
      register: second_copy
    - ansible.builtin.assert:
        that:
          - not second_copy.changed
          - port == 8443
          - role_title == 'defaults-only'
          - left == right
          - "('Welcome ' ~ (host | upper)) == 'Welcome SERVERA'"
          - "(missing | default('safe')) == 'safe'"
    - ansible.builtin.debug:
        msg: first notification
      changed_when: true
      notify: Count handler
    - ansible.builtin.debug:
        msg: second notification
      changed_when: true
      notify: Count handler
    - ansible.builtin.include_tasks: toggle.yml
      when: run_flag
    - ansible.builtin.assert:
        that: include_result == 'ran'
    - ansible.builtin.set_fact:
        run_flag: true
    - ansible.builtin.import_tasks: toggle-import.yml
      when: run_flag
    - ansible.builtin.assert:
        that: import_result is not defined
    - name: Ordinary failure is rescued and always runs
      block:
        - ansible.builtin.fail:
            msg: deliberate practice failure
      rescue:
        - ansible.builtin.set_fact:
            rescued: true
      always:
        - ansible.builtin.set_fact:
            always_ran: true
    - ansible.builtin.debug:
        msg: PUBLIC_TEST_OUTPUT_SHOULD_BE_HIDDEN
      no_log: true
  handlers:
    - name: Count handler
      ansible.builtin.set_fact:
        handler_runs: "{{ handler_runs | int + 1 }}"
  post_tasks:
    - ansible.builtin.assert:
        that:
          - handler_runs | int == 1
          - rescued
          - always_ran
''')
    result = subprocess.run(['ansible-playbook','checks.yml'], cwd=project, text=True, capture_output=True)
    if result.returncode or 'PUBLIC_TEST_OUTPUT_SHOULD_BE_HIDDEN' in result.stdout:
        print(result.stdout[-8000:]); print(result.stderr[-2000:]); raise SystemExit(1)
    (project/'undefined.yml').write_text('- hosts: local\n  gather_facts: false\n  tasks:\n    - ansible.builtin.debug:\n        msg: conditional\n      when: missing\n')
    undefined = subprocess.run(['ansible-playbook','undefined.yml'], cwd=project, text=True, capture_output=True)
    assert undefined.returncode != 0 and 'undefined' in (undefined.stdout + undefined.stderr)
    (project/'hosts.ini').write_text('[web]\nweb1\nweb2\n[staging]\nweb2\n[db]\ndb1\n')
    for pattern, expected in [('web',['web1','web2']),('web,!staging',['web1'])]:
        selected=subprocess.run(['ansible',pattern,'-i','hosts.ini','--list-hosts'],cwd=project,text=True,capture_output=True,check=True)
        actual=[line.strip() for line in selected.stdout.splitlines()[1:] if line.strip()]
        assert sorted(actual)==expected,selected.stdout
    version = subprocess.run(['ansible','--version'],text=True,capture_output=True,check=True).stdout.splitlines()[0]
    print(json.dumps({'runtime':version,'passed':['idempotency','variable precedence','defaults-only role','template equality/filter/default','handler coalescing and timing','include/import conditions','rescue/always','no_log output','undefined conditional rejection','inventory selection/exclusion']}))
