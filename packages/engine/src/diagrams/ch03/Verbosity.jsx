import { useState } from 'react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('Verbosity', (copy) => {
  const LEVELS = copy.data.levels;

  function Verbosity() {
    const [lvl, setLvl] = useState(1);
    const cur = LEVELS[lvl];
    return (
      <div className="widget verb">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label}>
            {LEVELS.map((l, i) => (
              <button key={l.flag} role="radio" aria-checked={i === lvl} className={i === lvl ? 'is-active' : ''} onClick={() => setLvl(i)}>
                {l.flag}
              </button>
            ))}
          </div>
        </div>
        <p className="verb-text">{cur.text}</p>
        <div className="terminal">
          <p className="term-muted">
            {copy.text.termMuted}
            {lvl ? cur.flag : ''}
          </p>
          {cur.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <p className="widget-caption">{copy.text.widgetCaption}</p>
      </div>
    );
  }
  return Verbosity;
});
