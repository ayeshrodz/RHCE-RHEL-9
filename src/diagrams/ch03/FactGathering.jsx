import { useState } from 'react';

const MODES = [
  {
    label: 'default',
    yaml: `- name: Default behaviour
  hosts: webservers
  tasks:
    - name: Show the kernel
      ansible.builtin.debug:
        var: ansible_facts['kernel']`,
    steps: [
      { name: 'Gathering Facts', note: 'setup runs automatically', kind: 'setup' },
      { name: 'Show the kernel', note: '"5.14.0-70.13.1.el9_0.x86_64"', kind: 'ok' },
    ],
    facts: 'all',
    text: 'Every play starts with an automatic Gathering Facts task that runs ansible.builtin.setup on each host. All facts are available to every task.',
  },
  {
    label: 'gather_facts: false',
    yaml: `- name: Faster play without facts
  hosts: webservers
  gather_facts: false
  tasks:
    - name: Show the kernel
      ansible.builtin.debug:
        var: ansible_facts['kernel']`,
    steps: [{ name: 'Show the kernel', note: 'VARIABLE IS NOT DEFINED!', kind: 'fail' }],
    facts: 'none',
    text: 'No setup step, so the play starts faster and puts less load on hosts. Useful when you do not need facts, or when hosts cannot run setup yet. Any task that reads a fact finds it undefined.',
  },
  {
    label: 'false + setup task',
    yaml: `- name: Gather facts later
  hosts: webservers
  gather_facts: false
  tasks:
    - name: Install Python bindings first
      ansible.builtin.dnf:
        name: python3-libselinux
    - name: Manually gather facts
      ansible.builtin.setup:
    - name: Show the kernel
      ansible.builtin.debug:
        var: ansible_facts['kernel']`,
    steps: [
      { name: 'Install Python bindings first', note: 'no facts yet', kind: 'ok' },
      { name: 'Manually gather facts', note: 'setup runs now', kind: 'setup' },
      { name: 'Show the kernel', note: '"5.14.0-70.13.1.el9_0.x86_64"', kind: 'ok' },
    ],
    facts: 'all',
    text: 'Turn off automatic gathering, prepare the host, then run ansible.builtin.setup as a normal task whenever you are ready. You can also re-run setup later to refresh facts.',
  },
  {
    label: 'gather_subset',
    yaml: `- name: Only hardware facts
  hosts: webservers
  gather_facts: false
  tasks:
    - name: Collect only hardware facts
      ansible.builtin.setup:
        gather_subset:
          - hardware
    # '!hardware' would mean: everything except hardware`,
    steps: [{ name: 'Collect only hardware facts', note: 'setup: gather_subset=hardware', kind: 'setup' }],
    facts: 'subset',
    text: 'setup can collect a subset instead of everything. List subsets such as hardware or network, or prefix one with ! to gather everything except that subset. A minimal core set of facts is always collected either way.',
  },
];

/** Compare the ways a play can (or cannot) gather facts. */
export default function FactGathering() {
  const [sel, setSel] = useState(0);
  const m = MODES[sel];
  return (
    <div className="widget fg">
      <div className="segmented" role="tablist" aria-label="Fact gathering mode">
        {MODES.map((x, i) => (
          <button key={x.label} role="tab" aria-selected={i === sel} className={i === sel ? 'is-active' : ''} onClick={() => setSel(i)}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="fg-grid">
        <pre className="terminal fg-yaml">{m.yaml}</pre>
        <div>
          <p className="widget-label">What runs</p>
          <ol className="fg-timeline">
            {m.steps.map((s) => (
              <li key={s.name} className={`is-${s.kind}`}>
                <span className="fg-dot" />
                <span className="fg-name">TASK [{s.name}]</span>
                <span className="fg-note">{s.note}</span>
              </li>
            ))}
          </ol>
          <p className={`fg-facts is-${m.facts}`}>
            ansible_facts:{' '}
            {m.facts === 'all'
              ? 'fully populated'
              : m.facts === 'none'
                ? 'empty'
                : 'hardware facts, plus a small core set that is always gathered'}
          </p>
        </div>
      </div>
      <p className="widget-caption fg-text">{m.text}</p>
    </div>
  );
}
