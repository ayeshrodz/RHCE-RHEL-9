import { useState } from 'react';
import { Arrow, Diagram, Group, InfoPanel, Node } from '../kit';

const info = {
  core: {
    tone: 'teal',
    title: 'Ansible Core',
    text: 'The engine: the YAML automation language, loops and conditionals, the command-line tools, and the small ansible.builtin collection. AAP 2.2 ships Ansible Core 2.13.',
  },
  collections: {
    tone: 'purple',
    title: 'Ansible Content Collections',
    text: 'Bundles of related modules, roles and plug-ins that ship separately from the core, so they can be updated on their own schedule. AAP includes more than 120 Red Hat certified collections; many community ones live on Ansible Galaxy.',
  },
  ee: {
    tone: 'teal',
    title: 'Automation execution environment',
    text: 'A container image holding Ansible Core, collections, Python libraries and any other dependencies. The same image runs your playbook on your laptop and in production, so “works on my machine” stops being a problem. Examples: ee-supported-rhel8, ee-minimal-rhel8.',
  },
  navigator: {
    tone: 'amber',
    title: 'Automation content navigator',
    text: 'The ansible-navigator command. It replaces ansible-playbook, ansible-inventory, ansible-config and ansible-doc with one tool, and runs your playbooks inside an execution environment. This is the tool you use throughout the course.',
  },
  controller: {
    tone: 'coral',
    title: 'Automation controller',
    text: 'Formerly Red Hat Ansible Tower. A web UI and REST API to run automation centrally, share SSH credentials without revealing them, schedule jobs, control who may run what, and log every run. Installing it is outside the scope of this course.',
  },
  hub: {
    tone: 'blue',
    title: 'Automation hub',
    text: 'Red Hat’s content service at console.redhat.com, and optionally a private hub in your organisation. It serves certified collections and execution environment images to ansible-galaxy, ansible-navigator and controller.',
  },
  builder: {
    tone: 'gray',
    title: 'ansible-builder',
    text: 'Builds custom execution environment images when the supported ones do not contain a collection or Python library you need.',
  },
};

/** Clickable map of Ansible Automation Platform 2 components. */
export default function PlatformComponents() {
  const [sel, setSel] = useState(null);
  const n = (k) => ({
    active: sel === k,
    dim: sel && sel !== k && !(sel === 'ee' && (k === 'core' || k === 'collections')),
    onClick: () => setSel((s) => (s === k ? null : k)),
  });

  return (
    <Diagram
      height={340}
      title="Red Hat Ansible Automation Platform 2 components"
      caption="Execution environments sit at the centre: the same container image is used by developers and by production."
      below={<InfoPanel item={info[sel]} />}
    >
      <Node x={250} y={10} w={180} h={56} tone="blue" title="Automation hub" sub="certified content, images" {...n('hub')} />
      <Arrow
        points={[
          [340, 66],
          [340, 106],
        ]}
        label="pull"
        labelAnchor="start"
        labelDx={8}
        labelDy={4}
      />

      <g onClick={() => setSel((s) => (s === 'ee' ? null : 'ee'))} style={{ cursor: 'pointer' }}>
        <Group
          x={220}
          y={108}
          w={240}
          h={152}
          tone="teal"
          label="Execution environment"
          sub="container"
          solid
          active={sel === 'ee'}
          dim={sel && !['ee', 'core', 'collections'].includes(sel)}
        />
      </g>
      <Node x={238} y={146} w={204} h={46} tone="teal" title="Ansible Core 2.13" {...n('core')} />
      <Node x={238} y={200} w={204} h={46} tone="purple" title="Content collections" {...n('collections')} />

      <Node x={10} y={154} w={170} h={62} tone="amber" title="ansible-navigator" sub="develop and test" {...n('navigator')} />
      <Arrow
        points={[
          [180, 185],
          [218, 185],
        ]}
      />
      <Node x={500} y={154} w={170} h={62} tone="coral" title="Automation controller" sub="run at scale" {...n('controller')} />
      <Arrow
        points={[
          [500, 185],
          [462, 185],
        ]}
      />

      <Node x={250} y={282} w={180} h={50} tone="gray" title="ansible-builder" sub="build custom images" {...n('builder')} />
      <Arrow
        points={[
          [340, 282],
          [340, 262],
        ]}
      />
    </Diagram>
  );
}
