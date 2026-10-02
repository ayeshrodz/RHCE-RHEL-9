import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('LoopUnroller', (copy) => {
  const MODES = {
    list: {
      label: copy.text.label,
      items: ['postfix', 'dovecot'],
      render: (items) => formatCopy(copy.text.template, [items.map((i) => `    - ${i}`).join('\n')]),
      expand: (item) => ({ label: item, detail: formatCopy(copy.text.detail, [item]) }),
    },
    dicts: {
      label: copy.text.label2,
      items: ['jane:wheel', 'joe:root'],
      render: (items) =>
        formatCopy(copy.text.template2, [
          items
            .map((i) => {
              const [n, g = ''] = i.split(':');
              return `    - name: ${n}\n      groups: ${g}`;
            })
            .join('\n'),
        ]),
      expand: (item) => {
        const [n, g = ''] = item.split(':');
        return { label: formatCopy(copy.text.label3, [n, g]), detail: formatCopy(copy.text.detail2, [n, g]) };
      },
    },
  };

  function LoopUnroller() {
    const [mode, setMode] = useState(copy.data.initialSelection1);
    const [items, setItems] = useState(MODES.list.items);
    const [draft, setDraft] = useState('');
    const m = MODES[mode];

    const switchMode = (k) => {
      setMode(k);
      setItems(MODES[k].items);
      setDraft('');
    };
    const add = () => {
      const v = draft.trim();
      if (!v) return;
      setItems((l) => [...l, v]);
      setDraft('');
    };

    return (
      <div className="widget lu">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label4}>
            {Object.entries(MODES).map(([k, v]) => (
              <button
                key={k}
                role="radio"
                aria-checked={mode === k}
                className={mode === k ? 'is-active' : ''}
                onClick={() => switchMode(k)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lu-grid">
          <div>
            <pre className="terminal lu-yaml">{m.render(items)}</pre>
            <div className="lu-items">
              {items.map((it, i) => (
                <span key={`${it}-${i}`} className="lu-chip">
                  {it}
                  <button aria-label={formatCopy(copy.text.template3, [it])} onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>
                    <X size={11} />
                  </button>
                </span>
              ))}
              <form
                className="lu-add"
                onSubmit={(e) => {
                  e.preventDefault();
                  add();
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={mode === 'list' ? copy.text.placeholder : copy.text.placeholder2}
                  aria-label={copy.text.label5}
                  spellCheck={false}
                />
                <button type="submit" className="btn btn-sm" aria-label={copy.text.label6}>
                  <Plus size={13} />
                </button>
              </form>
            </div>
          </div>

          <div>
            <p className="widget-label">{copy.text.widgetLabel2}</p>
            <ol className="lu-runs">
              {items.map((it, i) => {
                const x = m.expand(it);
                return (
                  <li key={`${it}-${i}`}>
                    <span className="lu-n">{i + 1}</span>
                    <span>
                      <code>
                        {copy.text.code}
                        {x.label}
                      </code>
                      <span className="lu-detail">{x.detail}</span>
                    </span>
                  </li>
                );
              })}
              {items.length === 0 && <li className="term-muted">{copy.text.termMuted}</li>}
            </ol>
            <pre className="terminal lu-out">
              {formatCopy(copy.text.template4, [
                mode === 'list' ? 'Postfix and Dovecot are running' : 'Users exist and are in the correct groups',
              ])}
              {items.map((it) => formatCopy(copy.text.template5, [m.expand(it).label])).join('')}
            </pre>
          </div>
        </div>
      </div>
    );
  }
  return LoopUnroller;
});
