import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('CheckModeSim', (copy) => {
  const star = (s) => formatCopy(copy.text.template, [s, '*'.repeat(Math.max(3, 70 - s.length))]);

  function CheckModeSim() {
    const [check, setCheck] = useState(true);
    const [diff, setDiff] = useState(true);

    const lines = [];
    const add = (t, c = '') => lines.push({ t, c });
    add(star(copy.text.label));
    if (diff) {
      add(copy.text.label2, 'muted');
      add(copy.text.label3, 'muted');
      add(copy.text.label4, 'muted');
      add(copy.text.label5, 'ok');
      add(copy.text.label6, 'ok');
    }
    add(copy.text.label7, 'changed');
    add('');
    add(star(copy.text.label8));
    add(check ? copy.text.label9 : copy.text.label10, check ? 'muted' : 'changed');
    add('');
    add(star(copy.text.label11));
    add(copy.text.label12, 'changed');
    add('');
    add(formatCopy(copy.text.template2, [check ? 2 : 3, check ? 2 : 3, check ? 1 : 0]));

    const notes = check ? [copy.text.label13, copy.text.label14, copy.text.label15, copy.text.label16] : [copy.text.label17];
    if (diff) notes.push(copy.text.label18);

    return (
      <div className="widget cms">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="cms-toggles">
            <label>
              <input type="checkbox" checked={check} onChange={() => setCheck((v) => !v)} /> <code>{copy.text.code}</code>
            </label>
            <label>
              <input type="checkbox" checked={diff} onChange={() => setDiff((v) => !v)} /> <code>{copy.text.code2}</code>
            </label>
          </div>
        </div>
        <pre className="terminal cms-cmd">{formatCopy(copy.text.template3, [check ? ' --check' : '', diff ? ' --diff' : ''])}</pre>
        <div className="terminal cms-out" aria-live="polite">
          {lines.map((l, i) => (
            <p key={i} className={l.c ? `term-${l.c}` : ''}>
              {l.t || ' '}
            </p>
          ))}
        </div>
        <ul className="cms-notes">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    );
  }
  return CheckModeSim;
});
