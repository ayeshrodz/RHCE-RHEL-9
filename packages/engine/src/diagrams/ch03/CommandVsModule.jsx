import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('CommandVsModule', (copy) => {
  const APPROACHES = [
    {
      title: copy.text.title,
      tone: 'red',
      code: copy.text.code,
      result: () => 'changed',
      why: copy.text.why,
    },
    {
      title: copy.text.title2,
      tone: 'amber',
      code: copy.text.code2,
      result: (n) => (n === 1 ? 'changed' : 'ok'),
      okLabel: copy.text.okLabel,
      why: copy.text.why2,
    },
    {
      title: copy.text.title3,
      tone: 'green',
      code: copy.text.code3,
      result: (n) => (n === 1 ? 'changed' : 'ok'),
      why: copy.text.why3,
    },
  ];

  function CommandVsModule() {
    const [runs, setRuns] = useState(0);
    return (
      <div className="widget cvm">
        <div className="cvm-head">
          <div className="cvm-intro">
            <p className="widget-title">{copy.text.widgetTitle}</p>
            <p className="widget-sub">{copy.text.widgetSub}</p>
          </div>
          <div className="cvm-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setRuns((r) => r + 1)}>
              <Play size={13} />
              {copy.text.btn}
              {runs ? `#${runs + 1}` : 'playbook'}
            </button>
            {runs > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={() => setRuns(0)} aria-label={copy.text.label}>
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="cvm-grid">
          {APPROACHES.map((a) => (
            <div key={a.title} className={`cvm-col t-${a.tone}`}>
              <p className="cvm-title">{a.title}</p>
              <pre className="cvm-code">{a.code}</pre>
              <div className="cvm-side">
                <div className="cvm-runs">
                  {Array.from({ length: runs }).map((_, i) => {
                    const r = a.result(i + 1);
                    return (
                      <span key={i} className={`cvm-run is-${r}`}>
                        {copy.text.span}
                        {i + 1} {r === 'ok' && a.okLabel ? a.okLabel : r}
                      </span>
                    );
                  })}
                  {runs === 0 && <span className="term-muted">{copy.text.termMuted}</span>}
                </div>
                {runs > 1 && <p className="cvm-why">{a.why}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return CommandVsModule;
});
