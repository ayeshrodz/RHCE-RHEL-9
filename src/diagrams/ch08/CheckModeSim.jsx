import { useState } from 'react';

const star = (s) => `${s} ${'*'.repeat(Math.max(3, 70 - s.length))}`;

/** Toggle --check and --diff and compare what the same play reports. */
export default function CheckModeSim() {
  const [check, setCheck] = useState(true);
  const [diff, setDiff] = useState(true);

  const lines = [];
  const add = (t, c = '') => lines.push({ t, c });
  add(star('TASK [Message of the day is in place]'));
  if (diff) {
    add('--- before: /etc/motd', 'muted');
    add('+++ after: …/motd.j2', 'muted');
    add('@@ -0,0 +1,2 @@', 'muted');
    add('+This is servera.lab.example.com.', 'ok');
    add('+Contact: ops@example.com', 'ok');
  }
  add('changed: [servera.lab.example.com]', 'changed');
  add('');
  add(star('TASK [Report uptime]'));
  add(check ? 'skipping: [servera.lab.example.com]' : 'changed: [servera.lab.example.com]', check ? 'muted' : 'changed');
  add('');
  add(star('RUNNING HANDLER [restart chronyd]'));
  add('changed: [servera.lab.example.com]', 'changed');
  add('');
  add(`servera.lab.example.com    : ok=${check ? 2 : 3}    changed=${check ? 2 : 3}    skipped=${check ? 1 : 0}`);

  const notes = check
    ? [
        'Nothing on servera changed. Every changed line means “would change”.',
        'The command task was skipped: Ansible cannot know what a command would do, so check mode does not run it.',
        'The handler is reported because the template would have notified it; it did not really restart anything.',
        'Check mode cannot see every failure. A template task without privilege escalation still reports “changed” here, and only fails with “Destination /etc not writable” in a real run.',
      ]
    : ['This is a real run: the file was written, the command ran and the handler restarted the service.'];
  if (diff) notes.push('--diff shows the lines each file task adds (+) or removes (−). It works with or without --check.');

  return (
    <div className="widget cms">
      <div className="verb-head">
        <p className="widget-label">Preview a change</p>
        <div className="cms-toggles">
          <label>
            <input type="checkbox" checked={check} onChange={() => setCheck((v) => !v)} /> <code>--check</code>
          </label>
          <label>
            <input type="checkbox" checked={diff} onChange={() => setDiff((v) => !v)} /> <code>--diff</code>
          </label>
        </div>
      </div>
      <pre className="terminal cms-cmd">{`ansible-navigator run -m stdout motd.yml${check ? ' --check' : ''}${diff ? ' --diff' : ''}`}</pre>
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
