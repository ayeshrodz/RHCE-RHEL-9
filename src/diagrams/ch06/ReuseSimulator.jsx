import { useState } from 'react';

const TASKS = ['Web package is present', 'Web service is started'];
const line = (name) => `TASK [${name}] ${'*'.repeat(Math.max(3, 56 - name.length))}`;

function simulate(kind, cond, loop) {
  const isImport = kind === 'import_tasks';
  if (isImport && loop) {
    return {
      list: null,
      run: [{ c: 'fail', t: "ERROR! You cannot use loops on 'import_tasks' statements. You should use 'include_tasks' instead." }],
      notes: [
        'An import is resolved while the playbook is being read, before any loop could run. The playbook is rejected without running anything.',
      ],
    };
  }
  if (isImport) {
    return {
      list: TASKS,
      run: TASKS.flatMap((n) => [
        { t: line(n) },
        cond === 'false' ? { c: 'muted', t: 'skipping: [servera]' } : { c: 'ok', t: 'ok: [servera]' },
      ]),
      notes: [
        'The two tasks were copied into the play when the playbook was parsed. The import line itself never appears in the output.',
        cond === 'none'
          ? 'ansible-navigator run --list-tasks can show them, and --start-at-task can start at one of them.'
          : 'The when was copied onto each imported task, so each task tests the condition for itself.',
      ],
    };
  }
  const items = loop ? ['httpd', 'nginx'] : [null];
  const run = [{ t: line('Web tasks') }];
  if (cond === 'false') run.push({ c: 'muted', t: 'skipping: [servera]' });
  else {
    items.forEach((it) =>
      run.push({ c: 'ok', t: `included: /home/student/project/tasks/web.yml for servera${it ? ` => (item=${it})` : ''}` }),
    );
    items.forEach(() => TASKS.forEach((n) => run.push({ t: line(n) }, { c: 'ok', t: 'ok: [servera]' })));
  }
  return {
    list: ['Web tasks'],
    run,
    notes: [
      'The include is a real task. The file is only read when the play reaches that task, host by host.',
      cond === 'false'
        ? 'The condition is tested once, on the include itself. It was false, so the file was never even opened.'
        : loop
          ? 'The file ran once per item. Each pass sees the current item, passed here as the variable pkg.'
          : '--list-tasks shows only the include, because the tasks inside are not known until it runs.',
    ],
  };
}

/** Switch between import_tasks and include_tasks, add a condition or a loop, and compare what Ansible does. */
export default function ReuseSimulator() {
  const [kind, setKind] = useState('import_tasks');
  const [cond, setCond] = useState('none');
  const [loop, setLoop] = useState(false);
  const r = simulate(kind, cond, loop);

  const yaml = `- name: Web tasks
  ansible.builtin.${kind}: tasks/web.yml${cond !== 'none' ? `\n  when: deploy_web          # deploy_web is ${cond}` : ''}${
    loop ? `\n  loop: [httpd, nginx]\n  vars:\n    pkg: "{{ item }}"` : ''
  }`;

  return (
    <div className="widget reuse">
      <p className="widget-label">import_tasks or include_tasks?</p>
      <div className="reuse-controls">
        <div className="segmented" role="radiogroup" aria-label="Keyword">
          {['import_tasks', 'include_tasks'].map((k) => (
            <button key={k} role="radio" aria-checked={kind === k} className={kind === k ? 'is-active' : ''} onClick={() => setKind(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="segmented" role="radiogroup" aria-label="Condition">
          {[
            ['none', 'no when'],
            ['true', 'when: true'],
            ['false', 'when: false'],
          ].map(([k, label]) => (
            <button key={k} role="radio" aria-checked={cond === k} className={cond === k ? 'is-active' : ''} onClick={() => setCond(k)}>
              {label}
            </button>
          ))}
        </div>
        <div className="segmented" role="radiogroup" aria-label="Loop">
          <button role="radio" aria-checked={!loop} className={!loop ? 'is-active' : ''} onClick={() => setLoop(false)}>
            no loop
          </button>
          <button role="radio" aria-checked={loop} className={loop ? 'is-active' : ''} onClick={() => setLoop(true)}>
            loop
          </button>
        </div>
      </div>

      <div className="reuse-grid">
        <div>
          <p className="reuse-cap">The task in your play</p>
          <pre className="terminal">{yaml}</pre>
          <p className="reuse-cap">--list-tasks shows</p>
          <pre className="terminal">{r.list ? r.list.map((t) => `  ${t}`).join('\n') : '  (nothing: the playbook does not load)'}</pre>
        </div>
        <div>
          <p className="reuse-cap">When the play runs</p>
          <div className="terminal reuse-run" aria-live="polite">
            {r.run.map((l, i) => (
              <p key={i} className={l.c ? `term-${l.c}` : ''}>
                {l.t}
              </p>
            ))}
          </div>
        </div>
      </div>
      <ul className="reuse-notes">
        {r.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
