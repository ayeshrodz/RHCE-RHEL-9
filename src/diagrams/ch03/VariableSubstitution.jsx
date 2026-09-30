import { useState } from 'react';

/**
 * Edit variable values and watch Ansible substitute them into a task.
 * Toggle the quotes off to see the YAML error that trips everyone up once.
 */
export default function VariableSubstitution() {
  const [vars, setVars] = useState({ user: 'joe', home: '/home/joe' });
  const [quoted, setQuoted] = useState(true);
  const set = (k) => (e) => setVars((v) => ({ ...v, [k]: e.target.value }));
  const q = (s) => (quoted ? `"${s}"` : s);

  return (
    <div className="widget vsub">
      <div className="vsub-grid">
        <div>
          <p className="widget-label">vars:</p>
          {Object.keys(vars).map((k) => (
            <label key={k} className="vsub-var">
              <code>{k}:</code>
              <input value={vars[k]} onChange={set(k)} spellCheck={false} aria-label={`Value of ${k}`} />
            </label>
          ))}
        </div>
        <div>
          <div className="verb-head">
            <p className="widget-label">task you write</p>
            <label className="vsub-toggle">
              <input type="checkbox" checked={quoted} onChange={(e) => setQuoted(e.target.checked)} /> quote the value
            </label>
          </div>
          <pre className="terminal">
            {`- name: Create the user {{ user }}\n  ansible.builtin.user:\n    name: ${q('{{ user }}')}\n    home: ${q('{{ home }}')}`}
          </pre>
        </div>
      </div>

      <p className="widget-label vsub-out-label">{quoted ? 'What Ansible runs' : 'What Ansible says'}</p>
      {quoted ? (
        <pre className="terminal vsub-out">
          <span className="term-muted">TASK [Create the user {vars.user}] ****</span>
          {'\n'}
          <span className="term-changed">
            changed: [servera] =&gt; user “{vars.user}” with home {vars.home}
          </span>
        </pre>
      ) : (
        <pre className="terminal vsub-out">
          <span className="term-fail">ERROR! Syntax Error while loading YAML.</span>
          {'\n  found unacceptable key (unhashable type: ‘AnsibleMapping’)\n\n'}
          {'    name: {{ user }}\n          ^ here\n'}
          <span className="term-muted">
            {
              'We could be wrong, but this one looks like it might be an issue with\nmissing quotes. Always quote template expression brackets when they\nstart a value.'
            }
          </span>
        </pre>
      )}
      <p className="widget-caption">
        {quoted
          ? 'The task name can use {{ }} freely because the value starts with text. A value that starts with {{ must be quoted.'
          : 'Without quotes, YAML reads the opening { as the start of a dictionary, before Ansible ever sees the variable.'}
      </p>
    </div>
  );
}
