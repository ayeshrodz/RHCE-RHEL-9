import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('CronBuilder', (copy) => {
  const FIELDS = copy.data.fields;

  const PRESETS = copy.data.presets;

  const DAYS = copy.data.days;

  const pad = (n) => String(n).padStart(2, '0');

  function describe(v) {
    const every = (x) => x === '*';
    let time;
    if (/^\*\/\d+$/.test(v.minute) && every(v.hour)) time = formatCopy(copy.text.template, [v.minute.slice(2)]);
    else if (every(v.minute) && every(v.hour)) time = copy.text.label;
    else if (/^\d+$/.test(v.minute) && /^\d+$/.test(v.hour)) time = formatCopy(copy.text.template2, [pad(v.hour), pad(v.minute)]);
    else if (/^\d+$/.test(v.minute) && every(v.hour)) time = formatCopy(copy.text.template3, [v.minute]);
    else time = formatCopy(copy.text.template4, [v.minute, v.hour]);
    const parts = [time];
    if (!every(v.day)) parts.push(formatCopy(copy.text.template5, [v.day]));
    if (!every(v.month)) parts.push(formatCopy(copy.text.template6, [v.month]));
    if (!every(v.weekday)) {
      const w =
        v.weekday === '1-5'
          ? copy.text.label2
          : /^\d$/.test(v.weekday)
            ? formatCopy(copy.text.template7, [DAYS[Number(v.weekday)]])
            : formatCopy(copy.text.template8, [v.weekday]);
      parts.push(w);
    }
    if (every(v.day) && every(v.month) && every(v.weekday) && !/^\*/.test(parts[0]) && !parts[0].startsWith('every'))
      parts.push(copy.text.label3);
    return parts.join(', ');
  }

  function CronBuilder() {
    const [v, setV] = useState(PRESETS[1].v);
    const [job, setJob] = useState(copy.text.initial);
    const set = (k, x) => setV((o) => ({ ...o, [k]: x.trim() || '*' }));
    const yaml = [
      copy.text.label4,
      copy.text.label5,
      copy.text.label6,
      copy.text.label7,
      ...FIELDS.filter((f) => v[f.key] !== '*').map((f) => formatCopy(copy.text.template9, [f.key, v[f.key]])),
      formatCopy(copy.text.template10, [job]),
      copy.text.label8,
    ].join('\n');

    return (
      <div className="widget cron">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="chip-row">
          {PRESETS.map((p) => (
            <button key={p.label} className="chip" onClick={() => setV(p.v)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="cron-fields">
          {FIELDS.map((f) => (
            <label key={f.key}>
              <span>{f.label}</span>
              <input value={v[f.key]} onChange={(e) => set(f.key, e.target.value)} spellCheck={false} aria-describedby={`cron-${f.key}`} />
              <small id={`cron-${f.key}`}>{f.hint}</small>
            </label>
          ))}
        </div>
        <label className="cron-job">
          <span>{copy.text.span}</span>
          <input value={job} onChange={(e) => setJob(e.target.value)} spellCheck={false} />
        </label>
        <p className="cron-say" aria-live="polite">
          {copy.text.cronSay}
          <strong>{describe(v)}</strong>
          {copy.text.cronSay2}
        </p>
        <div className="cron-grid">
          <div>
            <p className="cron-cap">{copy.text.cronCap}</p>
            <pre className="terminal">{yaml}</pre>
          </div>
          <div>
            <p className="cron-cap">{copy.text.cronCap2}</p>
            <pre className="terminal">{formatCopy(copy.text.template11, [FIELDS.map((f) => v[f.key]).join(' '), job])}</pre>
            <p className="cron-note">
              {copy.text.cronNote}
              <code>{copy.text.code}</code>
              {copy.text.cronNote2}
              <code>{copy.text.code2}</code>
              {copy.text.cronNote3}
              <code>{copy.text.code3}</code>
              {copy.text.cronNote4}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return CronBuilder;
});
