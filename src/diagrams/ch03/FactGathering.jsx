import { useState } from 'react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('FactGathering', (copy) => {
  const MODES = copy.data.modes;

  function FactGathering() {
    const [sel, setSel] = useState(0);
    const m = MODES[sel];
    return (
      <div className="widget fg">
        <div className="segmented" role="tablist" aria-label={copy.text.label}>
          {MODES.map((x, i) => (
            <button key={x.label} role="tab" aria-selected={i === sel} className={i === sel ? 'is-active' : ''} onClick={() => setSel(i)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="fg-grid">
          <pre className="terminal fg-yaml">{m.yaml}</pre>
          <div>
            <p className="widget-label">{copy.text.widgetLabel}</p>
            <ol className="fg-timeline">
              {m.steps.map((s) => (
                <li key={s.name} className={`is-${s.kind}`}>
                  <span className="fg-dot" />
                  <span className="fg-name">
                    {copy.text.fgName}
                    {s.name}
                    {copy.text.fgName2}
                  </span>
                  <span className="fg-note">{s.note}</span>
                </li>
              ))}
            </ol>
            <p className={`fg-facts is-${m.facts}`}>
              {copy.text.p} {m.facts === 'all' ? copy.text.label2 : m.facts === 'none' ? 'empty' : copy.text.label3}
            </p>
          </div>
        </div>
        <p className="widget-caption fg-text">{m.text}</p>
      </div>
    );
  }
  return FactGathering;
});
