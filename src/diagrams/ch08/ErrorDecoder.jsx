import { useState } from 'react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('ErrorDecoder', (copy) => {
  const ERRORS = copy.data.errors;

  const STAGES = copy.data.stages;

  function ErrorDecoder() {
    const [stage, setStage] = useState(copy.data.initialSelection1);
    const [open, setOpen] = useState(0);
    const list = ERRORS.map((e, i) => ({ ...e, i })).filter((e) => stage === 'All' || e.stage === stage);

    return (
      <div className="widget ed">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label}>
            {STAGES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={stage === s}
                className={stage === s ? 'is-active' : ''}
                onClick={() => setStage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <ul className="ed-list">
          {list.map((e) => (
            <li key={e.i} className={open === e.i ? 'is-open' : ''}>
              <button onClick={() => setOpen(open === e.i ? -1 : e.i)} aria-expanded={open === e.i}>
                <span className="ed-stage">{e.stage}</span>
                <code className="ed-msg">{e.msg}</code>
              </button>
              {open === e.i && (
                <div className="ed-body">
                  <p>
                    <strong>{copy.text.strong}</strong>
                    {e.cause}
                  </p>
                  <p>
                    <strong>{copy.text.strong2}</strong>
                    {e.fix}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return ErrorDecoder;
});
