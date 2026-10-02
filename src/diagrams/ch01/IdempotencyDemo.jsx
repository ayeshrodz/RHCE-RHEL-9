import { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('IdempotencyDemo', (copy) => {
  const TASKS = copy.data.tasks;

  const FRESH = { pkg: false, page: false, svc: false };

  function IdempotencyDemo() {
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
            <p className="widget-label">{copy.text.widgetLabel}</p>
            <ul>
              <li className={host.pkg ? 'is-ok' : ''}>{copy.text.li}</li>
              <li className={host.page ? 'is-ok' : ''}>{copy.text.li2}</li>
              <li className={host.svc ? 'is-ok' : ''}>{copy.text.li3}</li>
            </ul>
            <span className={`idem-state ${inSync ? 'is-ok' : 'is-drift'}`}>{inSync ? copy.text.label : copy.text.label2}</span>
          </div>
          <div className="idem-actions">
            <button className="btn btn-primary" onClick={run}>
              <Play size={14} />
              {copy.text.btn}
            </button>
            <div className="idem-drift">
              <p className="widget-label">
                <Zap size={12} />
                {copy.text.widgetLabel2}
              </p>
              {TASKS.map((t) => (
                <button key={t.key} className="btn btn-sm" onClick={() => drift(t.key)} disabled={!host[t.key]}>
                  {t.drift}
                </button>
              ))}
            </div>
            <button className="btn btn-sm btn-ghost" onClick={reset}>
              <RotateCcw size={13} />
              {copy.text.btn2}
            </button>
          </div>
        </div>

        <div className="terminal" aria-live="polite">
          {runs.length === 0 && <p className="term-muted">{copy.text.termMuted}</p>}
          {runs.map((r, i) =>
            r.drift ? (
              <p key={i} className="term-drift">
                {copy.text.termDrift}
                {r.drift}
                {copy.text.termDrift2}
              </p>
            ) : (
              <div key={i} className="term-run">
                <p className="term-muted">
                  {copy.text.termMuted2}
                  {r.n}
                </p>
                <p>{copy.text.p}</p>
                <p className="term-ok">{copy.text.termOk}</p>
                {r.results.map((t) => (
                  <p key={t.name} className={t.status === 'ok' ? 'term-ok' : 'term-changed'}>
                    {t.status}
                    {copy.text.p2}
                    {t.name}
                  </p>
                ))}
                <p>
                  {copy.text.p3}
                  <span className="term-ok">
                    {copy.text.termOk2}
                    {r.results.length + 1}
                  </span>{' '}
                  <span className={r.results.some((t) => t.status === 'changed') ? 'term-changed' : ''}>
                    {copy.text.span}
                    {r.results.filter((t) => t.status === 'changed').length}
                  </span>{' '}
                  {copy.text.p4}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }
  return IdempotencyDemo;
});
