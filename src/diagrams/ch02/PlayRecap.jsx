import { useState } from 'react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('PlayRecap', (copy) => {
  const COUNTERS = copy.data.counters;

  function PlayRecap() {
    const [sel, setSel] = useState(copy.data.initialSelection1);
    const item = COUNTERS.find((c) => c.key === sel);
    return (
      <div className="widget recap">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="terminal recap-line">
          <span>{copy.text.span}</span>
          {COUNTERS.map((c) => (
            <button key={c.key} className={`recap-counter ${c.tone} ${sel === c.key ? 'is-active' : ''}`} onClick={() => setSel(c.key)}>
              {c.key}
              {copy.text.button}
              {c.value}
            </button>
          ))}
        </div>
        <p className="recap-explain">
          <strong>{item.key}</strong>
          {copy.text.recapExplain}
          {item.text}
        </p>
      </div>
    );
  }
  return PlayRecap;
});
