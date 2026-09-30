import { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';

const TASKS = [
  { key: 'pkg', name: 'Ensure httpd package is present', drift: 'Someone removed httpd' },
  { key: 'page', name: 'Ensure index.html is present', drift: 'Someone edited index.html' },
  { key: 'svc', name: 'Ensure httpd is started', drift: 'Someone stopped httpd' },
];
const FRESH = { pkg: false, page: false, svc: false };

/**
 * Simulated playbook runs against one host. Shows that a second run changes
 * nothing, and that Ansible repairs drift on the next run.
 */
export default function IdempotencyDemo() {
  const [host, setHost] = useState(FRESH);
  const [runs, setRuns] = useState([]);
  const [count, setCount] = useState(0);

  const run = () => {
    const results = TASKS.map((t) => ({ name: t.name, status: host[t.key] ? 'ok' : 'changed' }));
    setHost({ pkg: true, page: true, svc: true });
    setCount((c) => c + 1);
    setRuns((r) => [...r, { n: count + 1, results }].slice(-3));
  };

  const drift = (key) => {
    setHost((h) => ({ ...h, [key]: false }));
    setRuns((r) => [...r, { drift: TASKS.find((t) => t.key === key).drift }].slice(-3));
  };

  const reset = () => {
    setHost(FRESH);
    setRuns([]);
    setCount(0);
  };

  const inSync = Object.values(host).every(Boolean);

  return (
    <div className="widget idem">
      <div className="idem-top">
        <div className="idem-host">
          <p className="widget-label">servera right now</p>
          <ul>
            <li className={host.pkg ? 'is-ok' : ''}>httpd installed</li>
            <li className={host.page ? 'is-ok' : ''}>index.html correct</li>
            <li className={host.svc ? 'is-ok' : ''}>httpd running</li>
          </ul>
          <span className={`idem-state ${inSync ? 'is-ok' : 'is-drift'}`}>
            {inSync ? 'Matches the playbook' : 'Differs from the playbook'}
          </span>
        </div>
        <div className="idem-actions">
          <button className="btn btn-primary" onClick={run}>
            <Play size={14} /> Run the playbook
          </button>
          <div className="idem-drift">
            <p className="widget-label">
              <Zap size={12} /> Cause drift
            </p>
            {TASKS.map((t) => (
              <button key={t.key} className="btn btn-sm" onClick={() => drift(t.key)} disabled={!host[t.key]}>
                {t.drift}
              </button>
            ))}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={reset}>
            <RotateCcw size={13} /> Fresh host
          </button>
        </div>
      </div>

      <div className="terminal" aria-live="polite">
        {runs.length === 0 && <p className="term-muted">$ ansible-navigator run -m stdout site.yml # press “Run the playbook”</p>}
        {runs.map((r, i) =>
          r.drift ? (
            <p key={i} className="term-drift">
              ⚡ {r.drift} on servera
            </p>
          ) : (
            <div key={i} className="term-run">
              <p className="term-muted">$ ansible-navigator run -m stdout site.yml # run {r.n}</p>
              <p>PLAY [Web server is configured] ****</p>
              <p className="term-ok">ok: [servera] Gathering Facts</p>
              {r.results.map((t) => (
                <p key={t.name} className={t.status === 'ok' ? 'term-ok' : 'term-changed'}>
                  {t.status}: [servera] {t.name}
                </p>
              ))}
              <p>
                PLAY RECAP servera : <span className="term-ok">ok={r.results.length + 1}</span>{' '}
                <span className={r.results.some((t) => t.status === 'changed') ? 'term-changed' : ''}>
                  changed={r.results.filter((t) => t.status === 'changed').length}
                </span>{' '}
                failed=0
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
