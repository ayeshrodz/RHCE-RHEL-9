import { useState } from 'react';
import { Check } from 'lucide-react';
import { Inline } from '@/components/interactive/inline';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('PrecedenceResolver', (copy) => {
  function PrecedenceResolver({ title, sub, items, fallback, note, winnerLabel = 'Used' }) {
    const [on, setOn] = useState(() => items.map((i) => !!i.on));
    const winner = on.findIndex(Boolean);

    return (
      <div className="widget prec">
        {title && <p className="widget-title">{title}</p>}
        {sub && (
          <p className="widget-sub">
            <Inline text={sub} />
          </p>
        )}
        <ol className="prec-list">
          {items.map((item, i) => {
            const state = i === winner ? 'is-winner' : on[i] ? 'is-ignored' : 'is-off';
            return (
              <li key={item.label} className={`prec-row ${state}`}>
                <button
                  className="prec-toggle"
                  role="switch"
                  aria-checked={on[i]}
                  onClick={() => setOn((o) => o.map((v, j) => (j === i ? !v : v)))}
                  aria-label={formatCopy(copy.text.template, [item.label, on[i] ? 'present' : 'absent'])}
                >
                  <span />
                </button>
                <span className="prec-rank">{i + 1}</span>
                <span className="prec-body">
                  <code className="prec-label">{item.label}</code>
                  <span className="prec-detail">
                    <Inline text={item.detail} />
                  </span>
                </span>
                <span className="prec-status">
                  {state === 'is-winner' ? (
                    <>
                      <Check size={13} strokeWidth={3} /> {winnerLabel}
                    </>
                  ) : state === 'is-ignored' ? (
                    'Ignored'
                  ) : (
                    copy.text.label
                  )}
                </span>
              </li>
            );
          })}
          {fallback && (
            <li className={`prec-row is-fallback ${winner === -1 ? 'is-winner' : 'is-off'}`}>
              <span className="prec-toggle-spacer" />
              <span className="prec-rank">{copy.text.precRank}</span>
              <span className="prec-body">
                <code className="prec-label">{fallback.label}</code>
                <span className="prec-detail">
                  <Inline text={fallback.detail} />
                </span>
              </span>
              <span className="prec-status">
                {winner === -1 ? (
                  <>
                    <Check size={13} strokeWidth={3} /> {winnerLabel}
                  </>
                ) : (
                  'Fallback'
                )}
              </span>
            </li>
          )}
        </ol>
        {note && (
          <p className="prec-note">
            <Inline text={note} />
          </p>
        )}
      </div>
    );
  }
  return PrecedenceResolver;
});
