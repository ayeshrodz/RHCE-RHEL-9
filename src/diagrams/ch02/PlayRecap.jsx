import { useState } from 'react';

const COUNTERS = [
  {
    key: 'ok',
    value: 4,
    tone: 'term-ok',
    text: 'Tasks that ran successfully, including those that changed something. Gathering Facts counts here too.',
  },
  {
    key: 'changed',
    value: 3,
    tone: 'term-changed',
    text: 'Tasks that modified the host to reach the desired state. On an immediate second run this should drop to 0.',
  },
  {
    key: 'unreachable',
    value: 0,
    tone: '',
    text: 'Ansible could not connect at all: wrong hostname, SSH down, bad key or wrong remote_user. The host is dropped from the rest of the play.',
  },
  {
    key: 'failed',
    value: 0,
    tone: '',
    text: 'A task ran but returned an error. By default the rest of the play is skipped for that host.',
  },
  {
    key: 'skipped',
    value: 0,
    tone: '',
    text: 'Tasks that did not run because a condition (when:) was false. You will meet conditionals in chapter 4.',
  },
  { key: 'rescued', value: 0, tone: '', text: 'Failures that were caught and handled by a rescue section of a block (chapter 4).' },
  { key: 'ignored', value: 0, tone: '', text: 'Failures that were ignored because the task set ignore_errors: true (chapter 4).' },
];

/** Click each counter of a PLAY RECAP line to learn what it means. */
export default function PlayRecap() {
  const [sel, setSel] = useState('changed');
  const item = COUNTERS.find((c) => c.key === sel);
  return (
    <div className="widget recap">
      <p className="widget-label">PLAY RECAP: click a counter</p>
      <div className="terminal recap-line">
        <span>serverc.lab.example.com : </span>
        {COUNTERS.map((c) => (
          <button key={c.key} className={`recap-counter ${c.tone} ${sel === c.key ? 'is-active' : ''}`} onClick={() => setSel(c.key)}>
            {c.key}={c.value}
          </button>
        ))}
      </div>
      <p className="recap-explain">
        <strong>{item.key}</strong>: {item.text}
      </p>
    </div>
  );
}
