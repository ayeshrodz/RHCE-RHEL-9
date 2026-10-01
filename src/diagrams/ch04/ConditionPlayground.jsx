import { useState } from 'react';

const HOSTS = [
  { name: 'servera', distribution: 'RedHat', major: '9', version: '9.0', mem: 960, vars: { my_service: 'httpd' } },
  { name: 'serverb', distribution: 'RedHat', major: '9', version: '9.0', mem: 3800, vars: {} },
  { name: 'fedora1', distribution: 'Fedora', major: '34', version: '34', mem: 1900, vars: { my_service: 'nginx' } },
];

const PRESETS = [
  {
    expr: `ansible_facts['distribution'] == "RedHat"`,
    test: (h) => h.distribution === 'RedHat',
    note: 'String comparison with a fact.',
  },
  {
    expr: `ansible_facts['memtotal_mb'] >= 2048`,
    test: (h) => h.mem >= 2048,
    note: 'Numeric comparison: no quotes around the number.',
  },
  {
    expr: 'my_service is defined',
    test: (h) => 'my_service' in h.vars,
    note: 'Runs only where the variable exists. Use “is not defined” for the opposite.',
  },
  {
    expr: `ansible_facts['distribution'] in supported_distros`,
    vars: 'supported_distros: [RedHat, Fedora]',
    test: () => true,
    note: 'True when the value appears in the list.',
  },
  {
    expr: `ansible_facts['distribution'] == "RedHat" and ansible_facts['memtotal_mb'] > 1024`,
    test: (h) => h.distribution === 'RedHat' && h.mem > 1024,
    note: 'and: both parts must be true.',
  },
  {
    expr: `(RedHat and major == "9") or (Fedora and major == "34")`,
    full: `>\n  ( ansible_facts['distribution'] == "RedHat" and\n    ansible_facts['distribution_major_version'] == "9" )\n  or\n  ( ansible_facts['distribution'] == "Fedora" and\n    ansible_facts['distribution_major_version'] == "34" )`,
    test: (h) => (h.distribution === 'RedHat' && h.major === '9') || (h.distribution === 'Fedora' && h.major === '34'),
    note: 'Parentheses group conditions; > lets a long condition span several lines.',
  },
  {
    expr: 'run_my_task',
    vars: 'run_my_task: "false"   # a string!',
    test: () => true,
    trap: true,
    note: 'Trap: the value is the string "false", and any non-empty string counts as true on this course’s core 2.14 home lab, so the task RUNS. Core 2.19 requires a boolean condition instead.',
  },
  {
    expr: 'run_my_task | bool',
    vars: 'run_my_task: "false"',
    test: () => false,
    note: 'The bool filter converts the string to a real Boolean, so "false" now means false.',
  },
];

/** Pick a condition and see which hosts would run the task and which would skip it. */
export default function ConditionPlayground() {
  const [sel, setSel] = useState(0);
  const p = PRESETS[sel];

  return (
    <div className="widget cp">
      <p className="widget-label">Pick a condition</p>
      <div className="cp-presets">
        {PRESETS.map((x, i) => (
          <button key={x.expr} className={`cp-preset ${i === sel ? 'is-active' : ''} ${x.trap ? 'is-trap' : ''}`} onClick={() => setSel(i)}>
            <code>{x.expr}</code>
          </button>
        ))}
      </div>

      <pre className="terminal cp-task">
        {p.vars ? `vars:\n  ${p.vars}\n\n` : ''}
        {`- name: Web server is installed\n  ansible.builtin.dnf:\n    name: httpd\n  when: ${p.full ?? p.expr}`}
      </pre>
      <p className={`cp-note ${p.trap ? 'is-trap' : ''}`}>{p.note}</p>

      <div className="cp-hosts" aria-live="polite">
        {HOSTS.map((h) => {
          const run = p.test(h);
          return (
            <div key={h.name} className={`cp-host ${run ? 'is-run' : 'is-skip'}`}>
              <p className="cp-host-name">{h.name}</p>
              <dl>
                <dt>distribution</dt>
                <dd>
                  {h.distribution} {h.version}
                </dd>
                <dt>memtotal_mb</dt>
                <dd>{h.mem}</dd>
                <dt>my_service</dt>
                <dd>{h.vars.my_service ?? <em>undefined</em>}</dd>
              </dl>
              <p className="cp-verdict">{run ? `changed: [${h.name}]` : `skipping: [${h.name}]`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
