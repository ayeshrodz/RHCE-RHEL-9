import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, Laptop, Pencil, Server } from 'lucide-react';

const GOALS = [
  {
    id: 'copy',
    goal: 'Copy a file from the control node',
    module: 'ansible.builtin.copy',
    dir: 'push',
    yaml: `- name: Copy a file to managed hosts
  ansible.builtin.copy:
    src: files/users.txt
    dest: /home/devops/users.txt
    owner: devops
    group: devops
    mode: '0640'`,
    note: 'Overwrites the remote file when its content differs (force: true is the default). With force: false it only copies when the file is missing.',
  },
  {
    id: 'content',
    goal: 'Create a small file from text in the playbook',
    module: 'ansible.builtin.copy',
    dir: 'push',
    yaml: `- name: Banner text is in place
  ansible.builtin.copy:
    content: "Authorised users only.\\n"
    dest: /etc/issue`,
    note: 'content replaces src. Good for one or two lines; use a template for anything longer or host-specific.',
  },
  {
    id: 'template',
    goal: 'Deploy a file customised for each host',
    module: 'ansible.builtin.template',
    dir: 'push',
    yaml: `- name: Deploy a custom message of the day
  ansible.builtin.template:
    src: templates/motd.j2
    dest: /etc/motd
    owner: root
    group: root
    mode: '0644'`,
    note: 'The Jinja2 template is rendered on the control node with that host’s variables and facts, then copied. Covered in the next lesson.',
  },
  {
    id: 'attrs',
    goal: 'Set owner, permissions or SELinux type',
    module: 'ansible.builtin.file',
    dir: 'edit',
    yaml: `- name: SELinux type is set to samba_share_t
  ansible.builtin.file:
    path: /srv/share/report.txt
    owner: devops
    mode: '0644'
    setype: samba_share_t`,
    note: 'Works like chown, chmod and chcon on a file that already exists. copy and template accept the same attribute arguments.',
  },
  {
    id: 'touch',
    goal: 'Create an empty file or a directory',
    module: 'ansible.builtin.file',
    dir: 'edit',
    yaml: `- name: The secrets directory exists
  ansible.builtin.file:
    path: /etc/httpd/secrets
    state: directory      # or: touch, for an empty file
    owner: apache
    mode: '0500'`,
    note: 'state: directory creates missing parent directories too. state: touch behaves like the touch command and updates the timestamp.',
  },
  {
    id: 'link',
    goal: 'Create a symbolic link',
    module: 'ansible.builtin.file',
    dir: 'edit',
    yaml: `- name: /etc/issue.net points at /etc/issue
  ansible.builtin.file:
    src: /etc/issue
    dest: /etc/issue.net
    state: link
    force: true`,
    note: 'src is what the link points to, dest is the link itself. force: true replaces a regular file that is already at dest.',
  },
  {
    id: 'absent',
    goal: 'Remove a file or directory',
    module: 'ansible.builtin.file',
    dir: 'edit',
    yaml: `- name: The file does not exist
  ansible.builtin.file:
    path: /home/devops/users.txt
    state: absent`,
    note: 'Always write state explicitly, present or absent, so the intent is obvious to the next reader. On a directory, absent removes it and everything inside.',
  },
  {
    id: 'line',
    goal: 'Make sure one line is in a file',
    module: 'ansible.builtin.lineinfile',
    dir: 'edit',
    yaml: `- name: Root login over SSH is disabled
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PermitRootLogin'
    line: PermitRootLogin no
    state: present`,
    note: 'With regexp, the last matching line is replaced; without it, the line is appended if it is not already there.',
  },
  {
    id: 'block',
    goal: 'Insert several lines as one block',
    module: 'ansible.builtin.blockinfile',
    dir: 'edit',
    yaml: `- name: Lab hosts are listed
  ansible.builtin.blockinfile:
    path: /etc/hosts
    block: |
      172.25.250.10 servera.lab.example.com
      172.25.250.11 serverb.lab.example.com
    state: present`,
    note: 'The block is wrapped in marker comments so Ansible can find and update it on later runs.',
  },
  {
    id: 'fetch',
    goal: 'Pull a file back to the control node',
    module: 'ansible.builtin.fetch',
    dir: 'pull',
    yaml: `- name: Collect the secure log
  ansible.builtin.fetch:
    src: /var/log/secure
    dest: secure-backups
    flat: false`,
    note: 'copy in reverse. By default each host’s file is stored under dest/HOSTNAME/full/path, so files from different hosts never collide.',
  },
  {
    id: 'stat',
    goal: 'Check whether a file exists, or its checksum',
    module: 'ansible.builtin.stat',
    dir: 'read',
    yaml: `- name: Look at /etc/motd
  ansible.builtin.stat:
    path: /etc/motd
  register: motd

- ansible.builtin.debug:
    msg: "exists: {{ motd.stat.exists }}"`,
    note: 'Changes nothing. Register the result and read values such as stat.exists, stat.mode, stat.pw_name and stat.checksum.',
  },
  {
    id: 'sync',
    goal: 'Synchronise a whole directory tree',
    module: 'ansible.posix.synchronize',
    dir: 'push',
    yaml: `- name: Web content is synchronised
  ansible.posix.synchronize:
    src: web/
    dest: /var/www/html`,
    note: 'A wrapper around rsync, which must be installed on both ends. From the ansible.posix collection, not ansible.builtin.',
  },
];

const DIRS = {
  push: { icon: ArrowRight, text: 'control node → managed host', tone: 'push' },
  pull: { icon: ArrowLeft, text: 'managed host → control node', tone: 'pull' },
  edit: { icon: Pencil, text: 'changes a file in place on the managed host', tone: 'edit' },
  read: { icon: Eye, text: 'reads only; nothing changes', tone: 'read' },
};

/** Pick what you want to do to a file; see which module does it and what the task looks like. */
export default function FileModuleChooser() {
  const [id, setId] = useState('copy');
  const g = GOALS.find((x) => x.id === id);
  const d = DIRS[g.dir];
  const Icon = d.icon;

  return (
    <div className="widget fmc">
      <p className="widget-label">Which module do I need?</p>
      <div className="fmc-grid">
        <ul className="fmc-goals" role="listbox" aria-label="What do you want to do?">
          {GOALS.map((x) => (
            <li key={x.id}>
              <button role="option" aria-selected={x.id === id} className={x.id === id ? 'is-active' : ''} onClick={() => setId(x.id)}>
                {x.goal}
              </button>
            </li>
          ))}
        </ul>
        <div className="fmc-detail" aria-live="polite">
          <p className="fmc-module">{g.module}</p>
          <div className={`fmc-dir is-${d.tone}`}>
            <span className={g.dir === 'pull' ? 'is-target' : ''}>
              <Laptop size={14} /> control node
            </span>
            <Icon size={16} className="fmc-arrow" />
            <span className={g.dir === 'pull' ? '' : 'is-target'}>
              <Server size={14} /> managed host
            </span>
            <em>{d.text}</em>
          </div>
          <pre className="terminal fmc-yaml">{g.yaml}</pre>
          <p className="fmc-note">{g.note}</p>
        </div>
      </div>
    </div>
  );
}
