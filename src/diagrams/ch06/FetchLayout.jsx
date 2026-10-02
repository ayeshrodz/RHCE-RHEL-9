import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('FetchLayout', (copy) => {
  const HOSTS = copy.data.hosts;

  function FetchLayout() {
    const [flat, setFlat] = useState(false);
    const tree = flat
      ? formatCopy(copy.text.template, [HOSTS.length])
      : formatCopy(copy.text.template2, [
          HOSTS.map((h, i) => {
            const last = i === HOSTS.length - 1;
            const bar = last ? ' ' : '│';
            return `${last ? '└' : '├'}── ${h}/
${bar}   └── var/
${bar}       └── log/
${bar}           └── secure`;
          }).join('\n'),
        ]);

    return (
      <div className="widget fetch">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label}>
            <button role="radio" aria-checked={!flat} className={!flat ? 'is-active' : ''} onClick={() => setFlat(false)}>
              {copy.text.button}
            </button>
            <button role="radio" aria-checked={flat} className={flat ? 'is-active' : ''} onClick={() => setFlat(true)}>
              {copy.text.button2}
            </button>
          </div>
        </div>
        <div className="fetch-grid">
          <pre className="terminal">{formatCopy(copy.text.template3, [flat ? '/' : '', flat])}</pre>
          <pre className="terminal" aria-live="polite">
            {tree}
          </pre>
        </div>
        {flat ? (
          <p className="fetch-note is-warn">
            <AlertTriangle size={14} />
            <span>
              {copy.text.span}
              <code>{copy.text.code}</code>
              {copy.text.span2}
              <code>{copy.text.code2}</code>
              {copy.text.span3}
              <code>{copy.text.label2}</code>
              {copy.text.span4}
            </span>
          </p>
        ) : (
          <p className="fetch-note">
            <span>
              {copy.text.span5}
              <code>{copy.text.code3}</code>
              {copy.text.span6}
            </span>
          </p>
        )}
      </div>
    );
  }
  return FetchLayout;
});
