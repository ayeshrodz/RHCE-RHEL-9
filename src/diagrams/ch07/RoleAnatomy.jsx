import { useState } from 'react';
import ProjectTree from '../ch03/ProjectTree';

const FILES = {
  'tasks/main.yml': {
    what: 'The work the role does: a plain list of tasks, like a task file. This is the only file a role really needs.',
    code: `---
- name: Web packages are installed
  ansible.builtin.dnf:
    name: httpd
    state: present

- name: Site configuration is in place
  ansible.builtin.template:
    src: site.conf.j2   # from templates/
    dest: /etc/httpd/conf.d/site.conf
  notify: restart httpd`,
  },
  'defaults/main.yml': {
    what: 'Default values for the role’s variables. They have the lowest precedence of all, so anyone using the role can override them. Put every setting a user might want to change here.',
    code: `---
web_site_title: Welcome
web_site_admin: root@localhost`,
  },
  'vars/main.yml': {
    what: 'Variables the role uses internally. They have high precedence and are not meant to be changed by whoever uses the role: inventory and play variables do not override them.',
    code: `---
web_site_conf_dir: /etc/httpd/conf.d`,
  },
  'handlers/main.yml': {
    what: 'Handlers that the role’s tasks can notify. They are available to the whole play once the role is loaded.',
    code: `---
- name: restart httpd
  ansible.builtin.service:
    name: httpd
    state: restarted`,
  },
  'templates/site.conf.j2': {
    what: 'Jinja2 templates. A template task in the role finds them by file name alone, with no path.',
    code: `# {{ ansible_managed }}
ServerAdmin {{ web_site_admin }}
ServerName {{ ansible_facts['fqdn'] }}`,
  },
  'files/robots.txt': {
    what: 'Static files. copy and similar modules in the role find them by file name alone.',
    code: `User-agent: *
Disallow: /private/`,
  },
  'meta/main.yml': {
    what: 'Information about the role: author, licence, supported platforms, and the other roles it depends on. Dependencies listed here run before this role.',
    code: `---
galaxy_info:
  author: your name
  description: Configures a simple web site
  license: MIT
  min_ansible_version: "2.14"
dependencies: []`,
  },
  'README.md': {
    what: 'What the role does, its variables and an example play. The first thing someone who wants to reuse the role will read.',
    code: `# web_site
Installs Apache and publishes a one-page site.

## Role variables
- web_site_title: page heading (default: Welcome)`,
  },
  'tests/test.yml': {
    what: 'A small inventory and playbook for trying the role by itself. Optional; many people delete this directory.',
    code: `---
- hosts: localhost
  roles:
    - web_site`,
  },
};

/** The standard role directory; select a file to see what belongs in it. */
export default function RoleAnatomy() {
  const [sel, setSel] = useState('tasks/main.yml');
  const f = FILES[sel];
  return (
    <div className="widget ra">
      <p className="widget-label">Anatomy of a role</p>
      <div className="ra-grid">
        <ProjectTree root="roles/web_site" paths={Object.keys(FILES)} onSelect={setSel} selected={sel} />
        <div className="ra-detail" aria-live="polite">
          <p className="ra-path">{sel}</p>
          <p className="ra-what">{f.what}</p>
          <pre className="terminal">{f.code}</pre>
        </div>
      </div>
    </div>
  );
}
