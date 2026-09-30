import { useMemo, useState } from 'react';
import { expandRange } from '@/lib/inventory';

const PRESETS = [
  'server[01:20].example.com',
  'server[1:20].example.com',
  '[a:c].dns.example.com',
  'washington[1:2].example.com',
  '192.168.[4:7].[0:255]',
  'node[0:30:10].example.com',
];

const SHOW = 24;

/** Type a host pattern and see exactly which hosts it expands to. */
export default function RangeExpander() {
  const [pattern, setPattern] = useState(PRESETS[0]);
  const { hosts, error, truncated } = useMemo(() => expandRange(pattern.trim() || ' '), [pattern]);
  const head = hosts.slice(0, SHOW);
  const hidden = hosts.length - head.length;

  return (
    <div className="widget ranges">
      <p className="widget-title">Try a host range</p>
      <p className="widget-sub">
        Ranges are written <code>[START:END]</code> and are inclusive. Numbers or single letters work, and you can use more than one range
        in a pattern.
      </p>
      <input
        className="ranges-input"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        spellCheck={false}
        aria-label="Host pattern"
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
            Matches <strong>{hosts.length.toLocaleString()}</strong> {hosts.length === 1 ? 'host' : 'hosts'}
            {truncated && ' (stopped counting at 5,000)'}
            {hosts.length > SHOW && `, first ${SHOW} shown`}
          </p>
          <div className="ranges-list">
            {head.map((h) => (
              <code key={h}>{h}</code>
            ))}
            {hidden > 0 && (
              <span className="term-muted">
                …and {hidden.toLocaleString()} more, ending with {hosts[hosts.length - 1]}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
