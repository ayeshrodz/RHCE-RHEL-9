import { useState } from 'react';

const OUTPUTS = ['Users created', 'Password missing for user joe', 'Success: schema upgraded'];

const FAILED_WHEN = [
  { label: 'not set', expr: null, eval: null },
  {
    label: "'Password missing' in result.stdout",
    expr: `"'Password missing' in result.stdout"`,
    eval: (rc, out) => out.includes('Password missing'),
  },
  { label: 'false', expr: 'false', eval: () => false },
];
const CHANGED_WHEN = [
  { label: 'not set', expr: null, eval: null },
  { label: 'false', expr: 'false', eval: () => false },
  { label: "'Success' in result.stdout", expr: `"'Success' in result.stdout"`, eval: (rc, out) => out.includes('Success') },
];

/**
 * A command task whose exit code and output you choose. Add failed_when,
 * changed_when and ignore_errors and see how Ansible reports it.
 */
export default function TaskOutcome() {
  const [rc, setRc] = useState(0);
  const [out, setOut] = useState(OUTPUTS[1]);
  const [fw, setFw] = useState(0);
  const [cw, setCw] = useState(0);
  const [ignore, setIgnore] = useState(false);

  const failedRule = FAILED_WHEN[fw];
  const changedRule = CHANGED_WHEN[cw];
  // command module defaults: non-zero rc means failed; otherwise always "changed".
  const failed = failedRule.eval ? failedRule.eval(rc, out) : rc !== 0;
  const changed = !failed && (changedRule.eval ? changedRule.eval(rc, out) : true);
  const status = failed ? (ignore ? 'failed, ignored' : 'failed') : changed ? 'changed' : 'ok';

  const yaml = [
    '- name: Run user creation script',
    '  ansible.builtin.command: /usr/local/bin/create_users.sh',
    '  register: result',
    failedRule.expr && `  failed_when: ${failedRule.expr}`,
    changedRule.expr && `  changed_when: ${changedRule.expr}`,
    ignore && '  ignore_errors: true',
    '  notify: restart app',
  ]
    .filter(Boolean)
    .join('\n');

  const recap = {
    ok: failed ? 0 : 1,
    changed: changed ? 1 : 0,
    failed: failed && !ignore ? 1 : 0,
    ignored: failed && ignore ? 1 : 0,
  };

  return (
    <div className="widget to">
      <div className="to-grid">
        <div className="to-inputs">
          <p className="widget-label">The script returns</p>
          <div className="to-row">
            <span>exit code</span>
            <div className="segmented">
              {[0, 1].map((v) => (
                <button key={v} className={rc === v ? 'is-active' : ''} onClick={() => setRc(v)}>
                  rc={v}
                </button>
              ))}
            </div>
          </div>
          <div className="to-row">
            <span>stdout</span>
            <select value={out} onChange={(e) => setOut(e.target.value)} aria-label="Script output">
              {OUTPUTS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <p className="widget-label to-gap">Task keywords</p>
          <div className="to-row">
            <span>failed_when</span>
            <select value={fw} onChange={(e) => setFw(Number(e.target.value))} aria-label="failed_when">
              {FAILED_WHEN.map((o, i) => (
                <option key={o.label} value={i}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="to-row">
            <span>changed_when</span>
            <select value={cw} onChange={(e) => setCw(Number(e.target.value))} aria-label="changed_when">
              {CHANGED_WHEN.map((o, i) => (
                <option key={o.label} value={i}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <label className="vsub-toggle to-ignore">
            <input type="checkbox" checked={ignore} onChange={(e) => setIgnore(e.target.checked)} /> ignore_errors: true
          </label>
        </div>

        <div>
          <pre className="terminal to-yaml">{yaml}</pre>
          <div className={`to-result is-${failed ? (ignore ? 'ignored' : 'failed') : changed ? 'changed' : 'ok'}`} aria-live="polite">
            <p className="to-status">{status}</p>
            <ul>
              <li>{failed && !ignore ? 'The rest of the play is skipped for this host.' : 'The play continues with the next task.'}</li>
              <li>{changed ? 'The restart app handler is notified.' : 'No handler is notified (only changed tasks notify).'}</li>
            </ul>
            <p className="to-recap">
              ok={recap.ok} changed={recap.changed} failed={recap.failed} ignored={recap.ignored}
            </p>
          </div>
        </div>
      </div>
      <p className="widget-caption">
        failed_when and changed_when replace Ansible’s own judgement of the result. They change how the task is reported, not what the
        command did.
      </p>
    </div>
  );
}
