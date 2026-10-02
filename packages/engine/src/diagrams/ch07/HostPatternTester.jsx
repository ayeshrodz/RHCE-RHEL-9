import { useMemo, useState } from 'react';
import { parseInventory } from '@/lib/inventory';
import { matchPattern, orderedHosts } from '@/lib/hostPattern';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('HostPatternTester', (copy) => {
  const INVENTORY = copy.data.inventory;

  const PRESETS = copy.data.presets;

  const OPS = copy.data.ops;

  const short = (h) => h.split('.')[0];

  function HostPatternTester() {
    const inv = useMemo(() => parseInventory(INVENTORY), []);
    const everyone = useMemo(() => orderedHosts(inv, 'all'), [inv]);
    const [pattern, setPattern] = useState(copy.data.initialSelection1);
    const result = useMemo(() => matchPattern(inv, pattern), [inv, pattern]);
    const needsQuotes = /^[*!&~[]/.test(pattern.trim());
    const shellQuotes = /[*!&~[\]]/.test(pattern);

    return (
      <div className="widget hp">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="hp-grid">
          <pre className="terminal hp-inv">{INVENTORY}</pre>
          <div>
            <label className="hp-field">
              <span>{copy.text.span}</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                aria-label={copy.text.label}
              />
            </label>
            <div className="chip-row hp-presets">
              {PRESETS.map((p) => (
                <button key={p} className={`chip ${p === pattern ? 'is-active' : ''}`} onClick={() => setPattern(p)}>
                  {p}
                </button>
              ))}
            </div>

            <div className="hp-hosts" aria-live="polite">
              {everyone.map((h) => (
                <span key={h} className={`hp-host ${result.hosts.includes(h) ? 'is-on' : ''}`}>
                  {short(h)}
                </span>
              ))}
            </div>
            <p className="hp-count">
              {result.error
                ? result.error
                : result.hosts.length
                  ? formatCopy(copy.text.template, [result.hosts.length, everyone.length])
                  : copy.text.label2}
            </p>

            {!result.error && result.terms.length > 0 && (
              <ol className="hp-terms">
                {[
                  ...result.terms.filter((t) => !t.op),
                  ...result.terms.filter((t) => t.op === '&'),
                  ...result.terms.filter((t) => t.op === '!'),
                ].map((t, i) => (
                  <li key={i}>
                    <code>{t.raw}</code> {OPS[t.op]}{' '}
                    {t.warning ? <em>{copy.text.em}</em> : <strong>{t.hosts.map(short).join(', ') || 'nothing'}</strong>}
                    {t.how && !t.warning && (
                      <span>
                        {copy.text.span2}
                        {t.how}
                        {copy.text.span3}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {result.warnings?.map((w) => (
              <p key={w} className="hp-warn">
                {copy.text.hpWarn}
                {w}
              </p>
            ))}
            {!result.error && (needsQuotes || shellQuotes) && (
              <p className="hp-quote">
                {needsQuotes && (
                  <>
                    {copy.text.hpQuote}
                    <code>{formatCopy(copy.text.template2, [pattern.trim()])}</code>
                    {copy.text.hpQuote2}{' '}
                  </>
                )}
                {copy.text.hpQuote3}
                <code>{formatCopy(copy.text.template3, [pattern.trim()])}</code>
                {copy.text.hpQuote4}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return HostPatternTester;
});
