import { useState } from 'react';

// The play as someone might write it, deliberately out of running order.
const WRITTEN = [
  { id: 'tasks', label: 'tasks:', lines: ['    - name: a normal task', '      notify: h2'] },
  { id: 'post', label: 'post_tasks:', lines: ['    - name: a post task'] },
  { id: 'pre', label: 'pre_tasks:', lines: ['    - name: a pre task', '      notify: h2'] },
  { id: 'roles', label: 'roles:', lines: ['    - role: r1   # notifies h1'] },
  { id: 'handlers', label: 'handlers:', lines: ['    - name: h2'] },
];

const RUN = [
  { src: 'pre', text: 'TASK [a pre task]', note: 'pre_tasks always run first, wherever they are written.' },
  { src: 'handlers', text: 'RUNNING HANDLER [h2]', note: 'Handlers notified by pre_tasks run now, before any role starts.', handler: true },
  {
    src: 'roles',
    text: 'TASK [r1 : role task]',
    note: 'Roles run next, in the order they are listed. Task names are prefixed with the role name.',
  },
  { src: 'tasks', text: 'TASK [a normal task]', note: 'Then the play’s own tasks.' },
  {
    src: 'roles',
    text: 'RUNNING HANDLER [r1 : h1]',
    note: 'Handlers notified by roles and tasks run together, after tasks.',
    handler: true,
  },
  {
    src: 'handlers',
    text: 'RUNNING HANDLER [h2]',
    note: 'h2 was notified again by the normal task, so it runs a second time here.',
    handler: true,
  },
  { src: 'post', text: 'TASK [a post task]', note: 'post_tasks run last. Handlers they notify would run after them.' },
];

/** A play written in one order and run in another: select a step to see which section it comes from. */
export default function PlayOrder() {
  const [step, setStep] = useState(0);
  const cur = RUN[step];
  return (
    <div className="widget po">
      <p className="widget-label">Written order and running order</p>
      <div className="po-grid">
        <div>
          <p className="po-cap">The play, as written</p>
          <pre className="terminal po-yaml">
            <span>{'- hosts: web\n'}</span>
            {WRITTEN.map((b) => (
              <span key={b.id} className={b.id === cur.src ? 'is-hot' : ''}>
                {`  ${b.label}\n${b.lines.join('\n')}\n`}
              </span>
            ))}
          </pre>
        </div>
        <div>
          <p className="po-cap">What runs, in order</p>
          <ol className="po-run">
            {RUN.map((r, i) => (
              <li key={i}>
                <button
                  className={`${i === step ? 'is-active' : ''} ${r.handler ? 'is-handler' : ''}`}
                  onClick={() => setStep(i)}
                  aria-pressed={i === step}
                >
                  <span className="po-n">{i + 1}</span>
                  {r.text}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="po-note" aria-live="polite">
        {cur.note}
      </p>
    </div>
  );
}
