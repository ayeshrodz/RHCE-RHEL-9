import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('YamlMultiline', (copy) => {
  const LINES = copy.data.lines;

  function YamlMultiline() {
    const [style, setStyle] = useState(copy.data.initialSelection1);
    const value = style === '|' ? LINES.join('\n') + '\n' : LINES.join(' ') + '\n';

    return (
      <div className="widget mline">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label}>
            <button role="radio" aria-checked={style === '|'} className={style === '|' ? 'is-active' : ''} onClick={() => setStyle('|')}>
              {copy.text.button}
            </button>
            <button role="radio" aria-checked={style === '>'} className={style === '>' ? 'is-active' : ''} onClick={() => setStyle('>')}>
              {copy.text.button2}
            </button>
          </div>
        </div>
        <div className="mline-grid">
          <div>
            <p className="mline-cap">{copy.text.mlineCap}</p>
            <pre className="terminal">{formatCopy(copy.text.template, [style, LINES.map((l) => `  ${l}`).join('\n')])}</pre>
          </div>
          <div>
            <p className="mline-cap">{copy.text.mlineCap2}</p>
            <pre className="terminal mline-value">
              {value
                .split('\n')
                .slice(0, -1)
                .map((l, i) => (
                  <span key={i}>
                    {l}
                    <span className="mline-nl">{copy.text.mlineNl}</span>
                    {'\n'}
                  </span>
                ))}
            </pre>
          </div>
        </div>
      </div>
    );
  }
  return YamlMultiline;
});
