import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('ReuseSimulator', (copy) => {
  const TASKS = copy.data.tasks;

  const line = (name) => formatCopy(copy.text.template, [name, '*'.repeat(Math.max(3, 56 - name.length))]);

  function simulate(kind, cond, loop) {
    const isImport = kind === 'import_tasks';
    if (isImport && loop) {
      return {
        list: null,
        run: [{ c: 'fail', t: copy.text.t }],
        notes: [copy.text.label],
      };
    }
    if (isImport) {
      return {
        list: TASKS,
        run: TASKS.flatMap((n) => [{ t: line(n) }, cond === 'false' ? { c: 'muted', t: copy.text.t2 } : { c: 'ok', t: copy.text.t3 }]),
        notes: [copy.text.label2, cond === 'none' ? copy.text.label3 : copy.text.label4],
      };
    }
    const items = loop ? ['httpd', 'nginx'] : [null];
    const run = [{ t: line(copy.text.label5) }];
    if (cond === 'false') run.push({ c: 'muted', t: copy.text.t4 });
    else {
      items.forEach((it) => run.push({ c: 'ok', t: formatCopy(copy.text.t5, [it ? ` => (item=${it})` : '']) }));
      items.forEach(() => TASKS.forEach((n) => run.push({ t: line(n) }, { c: 'ok', t: copy.text.t6 })));
    }
    return {
      list: [copy.text.label6],
      run,
      notes: [copy.text.label7, cond === 'false' ? copy.text.label8 : loop ? copy.text.label9 : copy.text.label10],
    };
  }

  function ReuseSimulator() {
    const [kind, setKind] = useState(copy.data.initialSelection1);
    const [cond, setCond] = useState(copy.data.initialSelection2);
    const [loop, setLoop] = useState(false);
    const r = simulate(kind, cond, loop);

    const yaml = formatCopy(copy.text.template2, [
      kind,
      cond !== 'none' ? `\n  when: deploy_web          # deploy_web is ${cond}` : '',
      loop ? `\n  loop: [httpd, nginx]\n  vars:\n    pkg: "{{ item }}"` : '',
    ]);

    return (
      <div className="widget reuse">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="reuse-controls">
          <div className="segmented" role="radiogroup" aria-label={copy.text.label11}>
            {['import_tasks', 'include_tasks'].map((k) => (
              <button key={k} role="radio" aria-checked={kind === k} className={kind === k ? 'is-active' : ''} onClick={() => setKind(k)}>
                {k}
              </button>
            ))}
          </div>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label12}>
            {[
              ['none', copy.text.label13],
              ['true', copy.text.label14],
              ['false', copy.text.label15],
            ].map(([k, label]) => (
              <button key={k} role="radio" aria-checked={cond === k} className={cond === k ? 'is-active' : ''} onClick={() => setCond(k)}>
                {label}
              </button>
            ))}
          </div>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label16}>
            <button role="radio" aria-checked={!loop} className={!loop ? 'is-active' : ''} onClick={() => setLoop(false)}>
              {copy.text.button}
            </button>
            <button role="radio" aria-checked={loop} className={loop ? 'is-active' : ''} onClick={() => setLoop(true)}>
              {copy.text.button2}
            </button>
          </div>
        </div>

        <div className="reuse-grid">
          <div>
            <p className="reuse-cap">{copy.text.reuseCap}</p>
            <pre className="terminal">{yaml}</pre>
            <p className="reuse-cap">{copy.text.reuseCap2}</p>
            <pre className="terminal">
              {r.list ? r.list.map((t) => formatCopy(copy.text.template3, [t])).join('\n') : copy.text.label17}
            </pre>
          </div>
          <div>
            <p className="reuse-cap">{copy.text.reuseCap3}</p>
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
  return ReuseSimulator;
});
