import { useState } from 'react';
import { Arrow, Diagram, Label, Node } from '../kit';

const files = {
  site: {
    tone: 'purple',
    name: 'site.yml',
    text: 'The entry point. It contains no tasks of its own: each line brings in a complete playbook, in order.',
    code: `- name: Web tier
  ansible.builtin.import_playbook: web.yml

- name: Database tier
  ansible.builtin.import_playbook: db.yml`,
  },
  web: {
    tone: 'blue',
    name: 'web.yml',
    text: 'An ordinary playbook you can also run by itself. Its play reuses two task files: one imported, one included in a loop.',
    code: `- name: Web servers are configured
  hosts: web
  tasks:
    - name: Packages
      ansible.builtin.import_tasks: tasks/install.yml
      vars:
        packages: [httpd, firewalld]

    - name: Firewall
      ansible.builtin.include_tasks: tasks/firewall.yml
      loop: [http, https]`,
  },
  db: {
    tone: 'blue',
    name: 'db.yml',
    text: 'A second playbook for another group of hosts. It reuses the same install.yml with a different package list.',
    code: `- name: Database servers are configured
  hosts: db
  tasks:
    - name: Packages
      ansible.builtin.import_tasks: tasks/install.yml
      vars:
        packages: [mariadb-server]`,
  },
  install: {
    tone: 'teal',
    name: 'tasks/install.yml',
    text: 'A task file: a plain list of tasks, with no hosts line and no tasks keyword. It says nothing about which packages; the caller passes them in.',
    code: `- name: Packages are installed
  ansible.builtin.dnf:
    name: "{{ packages }}"
    state: present`,
  },
  firewall: {
    tone: 'teal',
    name: 'tasks/firewall.yml',
    text: 'Another task file, written for one firewalld service at a time. Included in a loop, it runs once for each service, which it receives as item.',
    code: `- name: "{{ item }} is allowed"
  ansible.posix.firewalld:
    service: "{{ item }}"
    permanent: true
    immediate: true
    state: enabled`,
  },
};

/** A project split into playbooks and task files; select a file to read it. */
export default function ProjectMap() {
  const [sel, setSel] = useState('site');
  const n = (k) => ({ active: sel === k, dim: sel !== k, onClick: () => setSel(k), mono: true, tone: files[k].tone });
  const f = files[sel];

  return (
    <Diagram
      height={230}
      title="One project, five small files"
      expandable={false}
      below={
        <div className={`dg-info t-${f.tone}`} aria-live="polite">
          <p className="dg-info-title">{f.name}</p>
          <p className="dg-info-text">{f.text}</p>
          <pre className="terminal pm-code">{f.code}</pre>
        </div>
      }
    >
      <Node x={20} y={90} w={130} h={50} title="site.yml" sub="playbook of playbooks" {...n('site')} />
      <Node x={260} y={30} w={150} h={50} title="web.yml" sub="play: hosts web" {...n('web')} />
      <Node x={260} y={150} w={150} h={50} title="db.yml" sub="play: hosts db" {...n('db')} />
      <Node x={500} y={90} w={165} h={50} title="tasks/install.yml" sub="task file" {...n('install')} />
      <Node x={500} y={10} w={165} h={50} title="tasks/firewall.yml" sub="task file" {...n('firewall')} />

      <Arrow
        points={[
          [150, 105],
          [200, 105],
          [200, 55],
          [258, 55],
        ]}
        label="import_playbook"
        labelAt={0.2}
        labelDy={-46}
        hot={sel === 'site'}
      />
      <Arrow
        points={[
          [150, 125],
          [200, 125],
          [200, 175],
          [258, 175],
        ]}
        hot={sel === 'site'}
      />
      <Arrow
        points={[
          [410, 45],
          [498, 35],
        ]}
        label="include_tasks"
        labelDy={-9}
        hot={sel === 'web'}
        dashed
      />
      <Arrow
        points={[
          [410, 65],
          [455, 65],
          [455, 105],
          [498, 105],
        ]}
        hot={sel === 'web'}
      />
      <Arrow
        points={[
          [410, 175],
          [455, 175],
          [455, 125],
          [498, 125],
        ]}
        label="import_tasks"
        labelAt={0.2}
        labelDy={16}
        hot={sel === 'db'}
      />
      <Label x={342} y={222} muted size={11.5}>
        solid line: read when the playbook is parsed · dashed: read when the task runs
      </Label>
    </Diagram>
  );
}
