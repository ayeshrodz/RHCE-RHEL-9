import { useState } from 'react';
import { Arrow, Diagram, Group, InfoPanel, Node } from '../kit';

const info = {
  inventory: {
    tone: 'amber',
    title: 'Inventory',
    text: 'The list of managed hosts, organised into groups such as webservers or production. It can be a static text file or generated on the fly by a dynamic inventory plug-in.',
  },
  config: {
    tone: 'gray',
    title: 'ansible.cfg and ansible-navigator.yml',
    text: 'Project settings: where the inventory lives, which user to connect as, whether to escalate with sudo, and which execution environment image ansible-navigator should use.',
  },
  play1: {
    tone: 'purple',
    title: 'Play',
    text: 'A play maps a set of hosts from the inventory to an ordered list of tasks. A playbook is a YAML file containing one or more plays, and Ansible runs them top to bottom.',
  },
  play2: {
    tone: 'purple',
    title: 'Playbook with several plays',
    text: 'Each play can target different hosts and use different settings. Here the second play targets the database servers after the first finishes with the web servers.',
  },
  modules: {
    tone: 'teal',
    title: 'Modules',
    text: 'Each task calls one module, a small program (usually Python) that knows how to reach one kind of desired state: a package installed, a file present, a service running. Ansible copies it to the host, runs it, reads the JSON result, then removes it.',
  },
  linux: {
    tone: 'green',
    title: 'Linux managed host',
    text: 'Needs no agent. It must accept SSH from the control node, have Python 3.8 or later for most modules, and give the remote user a way (usually sudo) to become root.',
  },
  windows: {
    tone: 'blue',
    title: 'Windows managed host',
    text: 'Managed over WinRM with modules from the ansible.windows collection. Needs PowerShell 3.0+, .NET Framework 4.0+, and PowerShell remoting configured. Not covered in depth on the exam.',
  },
  network: {
    tone: 'gray',
    title: 'Network device',
    text: 'Routers and switches usually cannot run Python, so their modules run on the control node and talk to the device using CLI over SSH, XML over SSH, or an HTTP(S) API.',
  },
};

/** Clickable map of the Ansible architecture. */
export default function ArchitectureMap() {
  const [sel, setSel] = useState(null);
  const pick = (k) => () => setSel((s) => (s === k ? null : k));
  const n = (k) => ({ active: sel === k, dim: sel && sel !== k, onClick: pick(k) });

  return (
    <Diagram
      height={372}
      title="Ansible architecture"
      caption="Ansible runs from one control node and reaches out to managed hosts over standard protocols."
      below={<InfoPanel item={info[sel]} />}
    >
      <Group x={10} y={10} w={400} h={352} tone="gray" label="Control node" sub="Ansible lives here" />
      <Node x={28} y={46} w={176} h={58} tone="amber" title="Inventory" sub="which hosts" {...n('inventory')} />
      <Node x={216} y={46} w={176} h={58} tone="gray" title="ansible.cfg" sub="how to connect" {...n('config')} />

      <Group x={28} y={120} w={364} h={160} tone="purple" label="Playbook (YAML)" sub="runs top to bottom" />
      <Node x={44} y={154} w={332} h={52} tone="purple" title="Play 1  ·  hosts: webservers" sub="task → task → task" {...n('play1')} />
      <Node x={44} y={214} w={332} h={52} tone="purple" title="Play 2  ·  hosts: dbservers" sub="task → task" {...n('play2')} />

      <Node x={28} y={294} w={364} h={54} tone="teal" title="Modules" sub="ansible.builtin.dnf, .copy, .service …" {...n('modules')} />

      <Group x={450} y={10} w={220} h={352} tone="green" label="Managed hosts" sub="no agent" />
      <Node x={466} y={46} w={188} h={58} tone="green" title="servera" sub="RHEL 9 · Python 3" {...n('linux')} />
      <Node x={466} y={122} w={188} h={58} tone="green" title="serverb" sub="RHEL 9 · Python 3" {...n('linux')} />
      <Node x={466} y={198} w={188} h={58} tone="blue" title="win1" sub="Windows · PowerShell" {...n('windows')} />
      <Node x={466} y={274} w={188} h={58} tone="gray" title="core-switch" sub="network device" {...n('network')} />

      {[
        [75, 'SSH'],
        [151, 'SSH'],
        [227, 'WinRM'],
        [303, 'SSH / API'],
      ].map(([y, label]) => (
        <Arrow
          key={y}
          points={[
            [412, y],
            [464, y],
          ]}
          label={label}
          hot={sel === 'modules'}
        />
      ))}
    </Diagram>
  );
}
