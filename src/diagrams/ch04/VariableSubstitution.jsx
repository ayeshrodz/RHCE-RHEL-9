import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('VariableSubstitution', (copy) => {
  function VariableSubstitution() {
    const [vars, setVars] = useState({ user: 'joe', home: '/home/joe' });
    const [quoted, setQuoted] = useState(true);
    const set = (k) => (e) => setVars((v) => ({ ...v, [k]: e.target.value }));
    const q = (s) => (quoted ? `"${s}"` : s);

    return (
      <div className="widget vsub">
        <div className="vsub-grid">
          <div>
            <p className="widget-label">{copy.text.widgetLabel}</p>
            {Object.keys(vars).map((k) => (
              <label key={k} className="vsub-var">
                <code>
                  {k}
                  {copy.text.code}
                </code>
                <input value={vars[k]} onChange={set(k)} spellCheck={false} aria-label={formatCopy(copy.text.template, [k])} />
              </label>
            ))}
          </div>
          <div>
            <div className="verb-head">
              <p className="widget-label">{copy.text.widgetLabel2}</p>
              <label className="vsub-toggle">
                <input type="checkbox" checked={quoted} onChange={(e) => setQuoted(e.target.checked)} />
                {copy.text.vsubToggle}
              </label>
            </div>
            <pre className="terminal">{formatCopy(copy.text.template2, [q('{{ user }}'), q('{{ home }}')])}</pre>
          </div>
        </div>

        <p className="widget-label vsub-out-label">{quoted ? copy.text.label : copy.text.label2}</p>
        {quoted ? (
          <pre className="terminal vsub-out">
            <span className="term-muted">
              {copy.text.termMuted}
              {vars.user}
              {copy.text.termMuted2}
            </span>
            {'\n'}
            <span className="term-changed">
              {copy.text.termChanged}
              {vars.user}
              {copy.text.termChanged2}
              {vars.home}
            </span>
          </pre>
        ) : (
          <pre className="terminal vsub-out">
            <span className="term-fail">{copy.text.termFail}</span>
            {copy.text.label3}
            {copy.text.label4}
            <span className="term-muted">{copy.text.label5}</span>
          </pre>
        )}
        <p className="widget-caption">{quoted ? copy.text.label6 : copy.text.label7}</p>
      </div>
    );
  }
  return VariableSubstitution;
});
