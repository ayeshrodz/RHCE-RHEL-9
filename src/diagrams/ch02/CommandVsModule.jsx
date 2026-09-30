import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const APPROACHES = [
  {
    title: 'shell',
    tone: 'red',
    code: `- name: Non-idempotent approach
  ansible.builtin.shell:
    cmd: echo "nameserver 192.0.2.1" > /etc/resolv.conf`,
    result: () => 'changed',
    why: 'Rewrites the file on every run, even when it is already correct.',
  },
  {
    title: 'command + creates',
    tone: 'amber',
    code: `- name: Initialize the database
  ansible.builtin.command:
    cmd: /opt/bin/makedb.sh
    creates: /opt/db/database.db`,
    result: (n) => (n === 1 ? 'changed' : 'ok'),
    okLabel: 'ok (did not run)',
    why: 'Runs only while /opt/db/database.db is missing; afterwards it reports ok without running. Better, but only as good as the file check.',
  },
  {
    title: 'copy module',
    tone: 'green',
    code: `- name: Idempotent approach
  ansible.builtin.copy:
    dest: /etc/resolv.conf
    content: "nameserver 192.0.2.1\\n"`,
    result: (n) => (n === 1 ? 'changed' : 'ok'),
    why: 'Compares the content first and only writes when it differs.',
  },
];

/** Run the same three tasks repeatedly and watch which ones keep reporting changed. */
export default function CommandVsModule() {
  const [runs, setRuns] = useState(0);
  return (
    <div className="widget cvm">
      <div className="cvm-head">
        <div>
          <p className="widget-title">Run it again… and again</p>
          <p className="widget-sub">Three ways to get the same end state. Only one of them is honest about whether it changed anything.</p>
        </div>
        <div className="cvm-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setRuns((r) => r + 1)}>
            <Play size={13} /> Run {runs ? `#${runs + 1}` : 'playbook'}
          </button>
          {runs > 0 && (
            <button className="btn btn-sm btn-ghost" onClick={() => setRuns(0)} aria-label="Reset">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="cvm-grid">
        {APPROACHES.map((a) => (
          <div key={a.title} className={`cvm-col t-${a.tone}`}>
            <p className="cvm-title">{a.title}</p>
            <pre className="cvm-code">{a.code}</pre>
            <div className="cvm-side">
              <div className="cvm-runs">
                {Array.from({ length: runs }).map((_, i) => {
                  const r = a.result(i + 1);
                  return (
                    <span key={i} className={`cvm-run is-${r}`}>
                      #{i + 1} {r === 'ok' && a.okLabel ? a.okLabel : r}
                    </span>
                  );
                })}
                {runs === 0 && <span className="term-muted">not run yet</span>}
              </div>
              {runs > 1 && <p className="cvm-why">{a.why}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
