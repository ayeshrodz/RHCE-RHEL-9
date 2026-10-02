import { useState } from 'react';
import { ArrowUp, Check } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('VariablePrecedence', (copy) => {
  const LEVELS = copy.data.levels;

  const DEFAULT_ON = [true, false, false, true, false, true, false, false];

  function VariablePrecedence() {
    const [on, setOn] = useState(DEFAULT_ON);
    const [values, setValues] = useState(() => LEVELS.map((l) => l.value));
    const winner = on.lastIndexOf(true);

    return (
      <div className="widget vprec">
        <div className="vprec-head">
          <div>
            <p className="widget-title">
              {copy.text.widgetTitle}
              <code>{copy.text.code}</code>
              {copy.text.widgetTitle2}
            </p>
            <p className="widget-sub">{copy.text.widgetSub}</p>
          </div>
          <div className={`vprec-result ${winner < 0 ? 'is-undef' : ''}`}>
            <span className="widget-label">
              {copy.text.label}
              {copy.text.widgetLabel}
            </span>
            <strong>{winner < 0 ? 'undefined' : values[winner] || '""'}</strong>
            {winner >= 0 && (
              <span className="vprec-from">
                {copy.text.vprecFrom}
                {LEVELS[winner].where.toLowerCase()}
              </span>
            )}
          </div>
        </div>

        <div className="vprec-body">
          <div className="vprec-axis" aria-hidden="true">
            <ArrowUp size={14} />
            <span>{copy.text.span}</span>
          </div>
          <ol className="vprec-list" reversed>
            {LEVELS.map((level, i) => ({ level, i }))
              .reverse()
              .map(({ level, i }) => {
                const state = i === winner ? 'is-winner' : on[i] ? 'is-overridden' : 'is-off';
                return (
                  <li key={level.where} className={`vprec-row ${state}`}>
                    <button
                      className="prec-toggle"
                      role="switch"
                      aria-checked={on[i]}
                      aria-label={formatCopy(copy.text.template, [level.where, on[i] ? 'defined' : 'not defined'])}
                      onClick={() => setOn((o) => o.map((v, j) => (j === i ? !v : v)))}
                    >
                      <span />
                    </button>
                    <span className="vprec-where">
                      <span>{level.where}</span>
                      <code>{level.example}</code>
                    </span>
                    <input
                      className="vprec-value"
                      value={values[i]}
                      disabled={!on[i]}
                      onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                      aria-label={formatCopy(copy.text.template2, [level.where])}
                    />
                    <span className="vprec-status">
                      {state === 'is-winner' ? (
                        <>
                          <Check size={13} strokeWidth={3} />
                          {copy.text.vprecStatus}
                        </>
                      ) : state === 'is-overridden' ? (
                        'overridden'
                      ) : (
                        copy.text.label2
                      )}
                    </span>
                  </li>
                );
              })}
          </ol>
        </div>
      </div>
    );
  }
  return VariablePrecedence;
});
