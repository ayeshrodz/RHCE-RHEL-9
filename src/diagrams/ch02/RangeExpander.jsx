import { useMemo, useState } from 'react';
import { expandRange } from '@/lib/inventory';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('RangeExpander', (copy) => {
  const PRESETS = copy.data.presets;

  const SHOW = 24;

  function RangeExpander() {
    const [pattern, setPattern] = useState(PRESETS[0]);
    const { hosts, error, truncated } = useMemo(() => expandRange(pattern.trim() || ' '), [pattern]);
    const head = hosts.slice(0, SHOW);
    const hidden = hosts.length - head.length;

    return (
      <div className="widget ranges">
        <p className="widget-title">{copy.text.widgetTitle}</p>
        <p className="widget-sub">
          {copy.text.widgetSub}
          <code>{copy.text.code}</code>
          {copy.text.widgetSub2}
        </p>
        <input
          className="ranges-input"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          aria-label={copy.text.label}
        />
        <div className="chip-row ranges-presets">
          {PRESETS.map((p) => (
            <button key={p} className={`pill ${p === pattern ? 'pill-accent' : ''}`} onClick={() => setPattern(p)}>
              {p}
            </button>
          ))}
        </div>

        {error ? (
          <p className="ranges-error">{error}</p>
        ) : (
          <>
            <p className="ranges-count">
              {copy.text.rangesCount}
              <strong>{hosts.length.toLocaleString()}</strong> {hosts.length === 1 ? 'host' : 'hosts'}
              {truncated && copy.text.label2}
              {hosts.length > SHOW && formatCopy(copy.text.template, [SHOW])}
            </p>
            <div className="ranges-list">
              {head.map((h) => (
                <code key={h}>{h}</code>
              ))}
              {hidden > 0 && (
                <span className="term-muted">
                  {copy.text.termMuted}
                  {hidden.toLocaleString()}
                  {copy.text.termMuted2}
                  {hosts[hosts.length - 1]}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
  return RangeExpander;
});
