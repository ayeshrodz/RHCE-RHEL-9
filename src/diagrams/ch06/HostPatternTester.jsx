import { useMemo, useState } from 'react';
import { parseInventory } from '@/lib/inventory';
import { matchPattern, orderedHosts } from '@/lib/hostPattern';

const INVENTORY = `[web]
servera.lab.example.com
serverb.lab.example.com

[db]
serverc.lab.example.com
serverd.lab.example.com

[staging]
servera.lab.example.com
serverc.lab.example.com

[production]
serverb.lab.example.com
serverd.lab.example.com

[site:children]
web
db`;

const PRESETS = [
  'all',
  'web',
  'web,db',
  'web,!staging',
  'web,&production',
  'prod*',
  '*.lab.example.com',
  '~server[ab]',
  'db[0]',
  'site[1:2]',
  '!staging',
];

const OPS = { '': 'add', '&': 'keep only hosts also in', '!': 'remove' };
const short = (h) => h.split('.')[0];

/** Type a host pattern and see which hosts of a small inventory it selects, term by term. */
export default function HostPatternTester() {
  const inv = useMemo(() => parseInventory(INVENTORY), []);
  const everyone = useMemo(() => orderedHosts(inv, 'all'), [inv]);
  const [pattern, setPattern] = useState('web,!staging');
  const result = useMemo(() => matchPattern(inv, pattern), [inv, pattern]);
  const needsQuotes = /^[*!&~[]/.test(pattern.trim());
  const shellQuotes = /[*!&~[\]]/.test(pattern);

  return (
    <div className="widget hp">
      <p className="widget-label">Host pattern tester</p>
      <div className="hp-grid">
        <pre className="terminal hp-inv">{INVENTORY}</pre>
        <div>
          <label className="hp-field">
            <span>hosts:</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              aria-label="Host pattern"
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
                ? `${result.hosts.length} of ${everyone.length} hosts selected`
                : 'No hosts matched: the play would be skipped.'}
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
                  {t.warning ? (
                    <em>nothing: no host or group has this name</em>
                  ) : (
                    <strong>{t.hosts.map(short).join(', ') || 'nothing'}</strong>
                  )}
                  {t.how && !t.warning && <span> ({t.how})</span>}
                </li>
              ))}
            </ol>
          )}
          {result.warnings?.map((w) => (
            <p key={w} className="hp-warn">
              [WARNING]: {w}
            </p>
          ))}
          {!result.error && (needsQuotes || shellQuotes) && (
            <p className="hp-quote">
              {needsQuotes && (
                <>
                  In a playbook, quote it: <code>{`hosts: '${pattern.trim()}'`}</code>.{' '}
                </>
              )}
              On the command line, quote it for the shell: <code>{`--limit '${pattern.trim()}'`}</code>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
