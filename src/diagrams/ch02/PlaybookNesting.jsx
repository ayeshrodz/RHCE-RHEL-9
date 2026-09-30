import { Diagram, Group, Node } from '../kit';

/** Playbook → plays → tasks → module, as nested boxes. */
export default function PlaybookNesting() {
  return (
    <Diagram
      height={262}
      title="How a playbook is structured"
      caption="A playbook is a YAML list of plays. Each play is a dictionary whose tasks key holds a list of tasks. Each task names one module and its arguments."
    >
      <Group x={8} y={8} w={664} h={246} tone="purple" label="site.yml: a list of plays" solid />

      <Group x={24} y={42} w={306} h={200} tone="blue" label="- name: Configure web servers" sub="hosts: web" />
      <Node x={40} y={76} w={274} h={48} tone="teal" title="- name: httpd is installed" sub="ansible.builtin.dnf" align="start" />
      <Node x={40} y={130} w={274} h={48} tone="teal" title="- name: index.html is present" sub="ansible.builtin.copy" align="start" />
      <Node x={40} y={184} w={274} h={48} tone="teal" title="- name: httpd is running" sub="ansible.builtin.service" align="start" />

      <Group x={350} y={42} w={306} h={200} tone="amber" label="- name: Configure databases" sub="hosts: db" />
      <Node x={366} y={76} w={274} h={48} tone="teal" title="- name: MariaDB is installed" sub="ansible.builtin.dnf" align="start" />
      <Node x={366} y={130} w={274} h={48} tone="teal" title="- name: MariaDB is running" sub="ansible.builtin.service" align="start" />
    </Diagram>
  );
}
