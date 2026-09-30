import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const START = ['# Example service settings', 'PermitRootLogin yes', 'MaxAuthTries 6', 'Banner none'];
const BEGIN = '# BEGIN ANSIBLE MANAGED BLOCK';
const END = '# END ANSIBLE MANAGED BLOCK';

const MODES = {
  append: {
    label: 'lineinfile',
    hint: 'No regexp: the line is appended unless that exact line is already in the file.',
    line: 'AllowGroups wheel',
    regexp: null,
  },
  replace: {
    label: 'lineinfile + regexp',
    hint: 'With regexp: the last line that matches is replaced by line. If nothing matches, the line is appended.',
    line: 'PermitRootLogin no',
    regexp: '^PermitRootLogin',
  },
  block: {
    label: 'blockinfile',
    hint: 'The block is wrapped in marker comments. On later runs Ansible finds the markers and updates what is between them.',
    line: 'Match Group admins\n  X11Forwarding no',
    regexp: null,
  },
};

function apply(mode, file, line, regexp) {
  if (mode === 'block') {
    const block = [BEGIN, ...line.split('\n'), END];
    const a = file.indexOf(BEGIN);
    const b = file.indexOf(END);
    if (a >= 0 && b > a) {
      const same = file.slice(a, b + 1).join('\n') === block.join('\n');
      const next = [...file.slice(0, a), ...block, ...file.slice(b + 1)];
      return { file: next, changed: !same, touched: same ? [] : block.map((_, i) => a + i) };
    }
    return { file: [...file, ...block], changed: true, touched: block.map((_, i) => file.length + i) };
  }
  if (regexp) {
    let re;
    try {
      re = new RegExp(regexp);
    } catch {
      return { file, changed: false, touched: [], error: 'That regular expression is not valid.' };
    }
    let idx = -1;
    file.forEach((l, i) => {
      if (re.test(l)) idx = i;
    });
    if (idx >= 0) {
      if (file[idx] === line) return { file, changed: false, touched: [] };
      const next = [...file];
      next[idx] = line;
      return { file: next, changed: true, touched: [idx] };
    }
  }
  if (file.includes(line)) return { file, changed: false, touched: [] };
  return { file: [...file, line], changed: true, touched: [file.length] };
}

/** Run lineinfile and blockinfile against a small file and watch what changes, and what a second run does. */
export default function FileEditSimulator() {
  const [mode, setMode] = useState('replace');
  const [file, setFile] = useState(START);
  const [line, setLine] = useState(MODES.replace.line);
  const [regexp, setRegexp] = useState(MODES.replace.regexp);
  const [touched, setTouched] = useState([]);
  const [log, setLog] = useState([]);
  const m = MODES[mode];

  const pick = (k) => {
    setMode(k);
    setLine(MODES[k].line);
    setRegexp(MODES[k].regexp);
    setTouched([]);
  };
  const run = () => {
    const r = apply(mode, file, line, regexp);
    setFile(r.file);
    setTouched(r.touched);
    setLog((l) => [...l.slice(-3), r.error ? { s: 'fail', t: r.error } : { s: r.changed ? 'changed' : 'ok', t: m.label }]);
  };
  const reset = () => {
    setFile(START);
    setTouched([]);
    setLog([]);
  };

  const yaml =
    mode === 'block'
      ? `ansible.builtin.blockinfile:
  path: /etc/example.conf
  block: |
${line
  .split('\n')
  .map((l) => `    ${l}`)
  .join('\n')}
  state: present`
      : `ansible.builtin.lineinfile:
  path: /etc/example.conf${regexp !== null ? `\n  regexp: '${regexp}'` : ''}
  line: ${line}
  state: present`;

  return (
    <div className="widget fes">
      <div className="verb-head">
        <p className="widget-label">Edit a file in place</p>
        <div className="segmented" role="radiogroup" aria-label="Module">
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k} role="radio" aria-checked={mode === k} className={mode === k ? 'is-active' : ''} onClick={() => pick(k)}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <p className="widget-sub">{m.hint}</p>

      <div className="fes-grid">
        <div>
          <div className="fes-fields">
            {regexp !== null && (
              <label>
                <span>regexp</span>
                <input value={regexp} onChange={(e) => setRegexp(e.target.value)} spellCheck={false} />
              </label>
            )}
            <label>
              <span>{mode === 'block' ? 'block' : 'line'}</span>
              {mode === 'block' ? (
                <textarea rows={3} value={line} onChange={(e) => setLine(e.target.value)} spellCheck={false} />
              ) : (
                <input value={line} onChange={(e) => setLine(e.target.value)} spellCheck={false} />
              )}
            </label>
          </div>
          <pre className="terminal fes-yaml">{yaml}</pre>
          <div className="fes-actions">
            <button className="btn btn-sm btn-primary" onClick={run} disabled={!line.trim()}>
              <Play size={13} /> Run the task
            </button>
            <button className="btn btn-sm btn-ghost" onClick={reset}>
              <RotateCcw size={13} /> Reset the file
            </button>
          </div>
        </div>

        <div>
          <p className="fes-path">/etc/example.conf on the managed host</p>
          <pre className="terminal fes-file" aria-live="polite">
            {file.map((l, i) => (
              <span key={i} className={touched.includes(i) ? 'is-touched' : ''}>
                {l || ' '}
                {'\n'}
              </span>
            ))}
          </pre>
          <div className="terminal fes-log">
            {log.length === 0 && <p className="term-muted">Run the task, then run it again.</p>}
            {log.map((r, i) => (
              <p key={i} className={`term-${r.s}`}>
                {r.s === 'fail' ? `failed: ${r.t}` : `${r.s}: [servera]  ${r.t}${r.s === 'ok' ? '  (nothing to do)' : ''}`}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
