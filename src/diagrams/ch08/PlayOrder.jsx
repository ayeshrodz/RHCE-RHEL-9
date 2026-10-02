import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('PlayOrder', (copy) => {
  const WRITTEN = copy.data.written;

  const RUN = copy.data.run;

  function PlayOrder() {
    const [step, setStep] = useState(0);
    const cur = RUN[step];
    return (
      <div className="widget po">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="po-grid">
          <div>
            <p className="po-cap">{copy.text.poCap}</p>
            <pre className="terminal po-yaml">
              <span>{copy.text.label}</span>
              {WRITTEN.map((b) => (
                <span key={b.id} className={b.id === cur.src ? 'is-hot' : ''}>
                  {formatCopy(copy.text.template, [b.label, b.lines.join('\n')])}
                </span>
              ))}
            </pre>
          </div>
          <div>
            <p className="po-cap">{copy.text.poCap2}</p>
            <ol className="po-run">
              {RUN.map((r, i) => (
                <li key={i}>
                  <button
                    className={`${i === step ? 'is-active' : ''} ${r.handler ? 'is-handler' : ''}`}
                    onClick={() => setStep(i)}
                    aria-pressed={i === step}
                  >
                    <span className="po-n">{i + 1}</span>
                    {r.text}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="po-note" aria-live="polite">
          {cur.note}
        </p>
      </div>
    );
  }
  return PlayOrder;
});
