import { useState } from 'react';

const FIELDS = [
  { key: 'minute', label: 'minute', hint: '0–59' },
  { key: 'hour', label: 'hour', hint: '0–23' },
  { key: 'day', label: 'day', hint: '1–31' },
  { key: 'month', label: 'month', hint: '1–12' },
  { key: 'weekday', label: 'weekday', hint: '0–6, Sun = 0' },
];

const PRESETS = [
  { label: 'every 5 minutes', v: { minute: '*/5', hour: '*', day: '*', month: '*', weekday: '*' } },
  { label: '02:30 every night', v: { minute: '30', hour: '2', day: '*', month: '*', weekday: '*' } },
  { label: 'weekdays at 09:00', v: { minute: '0', hour: '9', day: '*', month: '*', weekday: '1-5' } },
  { label: 'first of the month', v: { minute: '0', hour: '0', day: '1', month: '*', weekday: '*' } },
  { label: 'Sundays 23:15', v: { minute: '15', hour: '23', day: '*', month: '*', weekday: '0' } },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad = (n) => String(n).padStart(2, '0');

function describe(v) {
  const every = (x) => x === '*';
  let time;
  if (/^\*\/\d+$/.test(v.minute) && every(v.hour)) time = `every ${v.minute.slice(2)} minutes`;
  else if (every(v.minute) && every(v.hour)) time = 'every minute';
  else if (/^\d+$/.test(v.minute) && /^\d+$/.test(v.hour)) time = `at ${pad(v.hour)}:${pad(v.minute)}`;
  else if (/^\d+$/.test(v.minute) && every(v.hour)) time = `at minute ${v.minute} of every hour`;
  else time = `at minute ${v.minute}, hour ${v.hour}`;
  const parts = [time];
  if (!every(v.day)) parts.push(`on day ${v.day} of the month`);
  if (!every(v.month)) parts.push(`in month ${v.month}`);
  if (!every(v.weekday)) {
    const w =
      v.weekday === '1-5' ? 'Monday to Friday' : /^\d$/.test(v.weekday) ? `on ${DAYS[Number(v.weekday)]}` : `on weekdays ${v.weekday}`;
    parts.push(w);
  }
  if (every(v.day) && every(v.month) && every(v.weekday) && !/^\*/.test(parts[0]) && !parts[0].startsWith('every')) parts.push('every day');
  return parts.join(', ');
}

/** Build a cron schedule and see it as a crontab line and as an ansible.builtin.cron task. */
export default function CronBuilder() {
  const [v, setV] = useState(PRESETS[1].v);
  const [job, setJob] = useState('tar czf /tmp/app.tgz -C /srv app');
  const set = (k, x) => setV((o) => ({ ...o, [k]: x.trim() || '*' }));
  const yaml = [
    '- name: Archive app data',
    '  ansible.builtin.cron:',
    '    name: Archive app data',
    '    user: appadmin',
    ...FIELDS.filter((f) => v[f.key] !== '*').map((f) => `    ${f.key}: "${v[f.key]}"`),
    `    job: ${job}`,
    '    state: present',
  ].join('\n');

  return (
    <div className="widget cron">
      <p className="widget-label">Cron schedule builder</p>
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
        <span>job</span>
        <input value={job} onChange={(e) => setJob(e.target.value)} spellCheck={false} />
      </label>
      <p className="cron-say" aria-live="polite">
        Runs <strong>{describe(v)}</strong>.
      </p>
      <div className="cron-grid">
        <div>
          <p className="cron-cap">The task</p>
          <pre className="terminal">{yaml}</pre>
        </div>
        <div>
          <p className="cron-cap">What lands in appadmin's crontab</p>
          <pre className="terminal">{`#Ansible: Archive app data\n${FIELDS.map((f) => v[f.key]).join(' ')} ${job}`}</pre>
          <p className="cron-note">
            Fields you leave out default to <code>*</code>. The <code>#Ansible:</code> comment is how the module finds its own entry again,
            so the <code>name</code> must stay the same.
          </p>
        </div>
      </div>
    </div>
  );
}
