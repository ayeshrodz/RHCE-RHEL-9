import { useState } from 'react';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('AdminModuleFinder', (copy) => {
  const AREAS = copy.data.areas;

  function AdminModuleFinder() {
    const [area, setArea] = useState(copy.data.initialSelection1);
    const [idx, setIdx] = useState(0);
    const items = AREAS[area];
    const [goal, module, yaml] = items[Math.min(idx, items.length - 1)];

    return (
      <div className="widget amf">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label}>
            {Object.keys(AREAS).map((a) => (
              <button
                key={a}
                role="radio"
                aria-checked={area === a}
                className={area === a ? 'is-active' : ''}
                onClick={() => {
                  setArea(a);
                  setIdx(0);
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="amf-grid">
          <ul className="amf-goals" role="listbox" aria-label={copy.text.label2}>
            {items.map(([g], i) => (
              <li key={g}>
                <button role="option" aria-selected={i === idx} className={i === idx ? 'is-active' : ''} onClick={() => setIdx(i)}>
                  {g}
                </button>
              </li>
            ))}
          </ul>
          <div aria-live="polite">
            <p className="amf-module">{module}</p>
            <pre className="terminal amf-yaml">{yaml}</pre>
            <p className="amf-hint">
              {copy.text.amfHint}
              <code>
                {copy.text.code}
                {module}
                {copy.text.code2}
              </code>
            </p>
          </div>
        </div>
        <p className="amf-sr" hidden>
          {goal}
        </p>
      </div>
    );
  }
  return AdminModuleFinder;
});
