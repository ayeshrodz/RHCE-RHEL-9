import { useState } from 'react';
import { ArrowUp, Check } from 'lucide-react';

// Simplified order from the course, lowest precedence first.
const LEVELS = [
  { where: 'Inventory group variable', example: '[webservers:vars]\npackage=httpd', value: 'httpd' },
  { where: 'group_vars/ file', example: 'group_vars/webservers', value: 'httpd-core' },
  { where: 'Inventory host variable', example: 'servera package=nginx', value: 'nginx' },
  { where: 'host_vars/ file', example: 'host_vars/servera', value: 'lighttpd' },
  { where: 'Host fact', example: 'gathered by setup', value: '(fact)' },
  { where: 'Play variable', example: 'vars: / vars_files:', value: 'apache' },
  { where: 'Task variable', example: 'vars: on one task', value: 'caddy' },
  { where: 'Extra variable', example: '-e "package=tomcat"', value: 'tomcat' },
];
const DEFAULT_ON = [true, false, false, true, false, true, false, false];

/** Toggle where `package` is defined and see which definition wins. */
export default function VariablePrecedence() {
  const [on, setOn] = useState(DEFAULT_ON);
  const [values, setValues] = useState(() => LEVELS.map((l) => l.value));
  const winner = on.lastIndexOf(true);

  return (
    <div className="widget vprec">
      <div className="vprec-head">
        <div>
          <p className="widget-title">
            Where is <code>package</code> defined?
          </p>
          <p className="widget-sub">Switch definitions on and off, or edit their values. The highest one that is set wins.</p>
        </div>
        <div className={`vprec-result ${winner < 0 ? 'is-undef' : ''}`}>
          <span className="widget-label">{'{{ package }}'} is</span>
          <strong>{winner < 0 ? 'undefined' : values[winner] || '""'}</strong>
          {winner >= 0 && <span className="vprec-from">from {LEVELS[winner].where.toLowerCase()}</span>}
        </div>
      </div>

      <div className="vprec-body">
        <div className="vprec-axis" aria-hidden="true">
          <ArrowUp size={14} />
          <span>higher precedence</span>
        </div>
        <ol className="vprec-list" reversed>
          {LEVELS.map((level, i) => ({ level, i }))
            .reverse()
            .map(({ level, i }) => {
              const state = i === winner ? 'is-winner' : on[i] ? 'is-overridden' : 'is-off';
              return (
                <li key={level.where} className={`vprec-row ${state}`}>
                  <button
                    className="prec-toggle"
                    role="switch"
                    aria-checked={on[i]}
                    aria-label={`${level.where}: ${on[i] ? 'defined' : 'not defined'}`}
                    onClick={() => setOn((o) => o.map((v, j) => (j === i ? !v : v)))}
                  >
                    <span />
                  </button>
                  <span className="vprec-where">
                    <span>{level.where}</span>
                    <code>{level.example}</code>
                  </span>
                  <input
                    className="vprec-value"
                    value={values[i]}
                    disabled={!on[i]}
                    onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                    aria-label={`Value from ${level.where}`}
                  />
                  <span className="vprec-status">
                    {state === 'is-winner' ? (
                      <>
                        <Check size={13} strokeWidth={3} /> wins
                      </>
                    ) : state === 'is-overridden' ? (
                      'overridden'
                    ) : (
                      'not set'
                    )}
                  </span>
                </li>
              );
            })}
        </ol>
      </div>
    </div>
  );
}
