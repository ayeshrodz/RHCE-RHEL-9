import { useState } from 'react';

const LEVELS = [
  {
    flag: 'default',
    text: 'Play and task names with ok / changed per host.',
    lines: ['TASK [Latest httpd version installed] ****', 'changed: [servera.lab.example.com]'],
  },
  {
    flag: '-v',
    text: 'Adds each task’s result.',
    lines: [
      'changed: [servera.lab.example.com] => {"changed": true, "msg": "", "rc": 0,',
      '    "results": ["Installed: httpd-2.4.53-7.el9.x86_64", …]}',
    ],
  },
  {
    flag: '-vv',
    text: 'Adds the task configuration: which file and line the task came from.',
    lines: ['task path: /home/student/playdemo/webserver.yml:5', 'changed: [servera.lab.example.com] => {"changed": true, …}'],
  },
  {
    flag: '-vvv',
    text: 'Adds connection details: the SSH user, the commands used to reach the host.',
    lines: [
      '<servera.lab.example.com> ESTABLISH SSH CONNECTION FOR USER: devops',
      '<servera.lab.example.com> SSH: EXEC ssh -C -o ControlMaster=auto …',
    ],
  },
  {
    flag: '-vvvv',
    text: 'Adds connection plug-in debugging: users used to run scripts on the host and what was executed.',
    lines: [
      '<servera.lab.example.com> SSH: EXEC ssh -vvv -C -o ControlMaster=auto …',
      'debug1: Reading configuration data /etc/ssh/ssh_config …',
    ],
  },
];

/** Slide through -v levels to see what extra output each one adds. */
export default function Verbosity() {
  const [lvl, setLvl] = useState(1);
  const cur = LEVELS[lvl];
  return (
    <div className="widget verb">
      <div className="verb-head">
        <p className="widget-label">Output verbosity</p>
        <div className="segmented" role="radiogroup" aria-label="Verbosity level">
          {LEVELS.map((l, i) => (
            <button key={l.flag} role="radio" aria-checked={i === lvl} className={i === lvl ? 'is-active' : ''} onClick={() => setLvl(i)}>
              {l.flag}
            </button>
          ))}
        </div>
      </div>
      <p className="verb-text">{cur.text}</p>
      <div className="terminal">
        <p className="term-muted">$ ansible-navigator run -m stdout webserver.yml {lvl ? cur.flag : ''}</p>
        {cur.lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <p className="widget-caption">Illustrative, abridged output. Each level includes everything from the levels before it.</p>
    </div>
  );
}
