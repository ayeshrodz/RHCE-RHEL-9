import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('ModeCalculator', (copy) => {
  const WHO = copy.data.who;

  const BITS = ['r', 'w', 'x'];

  const PRESETS = copy.data.presets;

  const fromOctal = (s) => {
    const n = parseInt(s, 8);
    return Array.from({ length: 9 }, (_, i) => Boolean(n & (1 << (8 - i))));
  };

  const lsString = (bits, prefix = '-') => prefix + bits.map((b, i) => (b ? BITS[i % 3] : '-')).join('');

  function ModeCalculator() {
    const [bits, setBits] = useState(() => fromOctal('0644'));
    const digits = [0, 1, 2].map((w) => bits.slice(w * 3, w * 3 + 3).reduce((n, b, i) => n + (b ? [4, 2, 1][i] : 0), 0));
    const octal = `0${digits.join('')}`;
    const symbolic = WHO.map(
      ([k], w) =>
        `${k}=${bits
          .slice(w * 3, w * 3 + 3)
          .map((b, i) => (b ? BITS[i] : ''))
          .join('')}`,
    ).join(',');

    // mode: 644 (no leading zero, no quotes) is read by YAML as the decimal number 644.
    const asDecimal = parseInt(digits.join(''), 10);
    const wrongBits = Array.from({ length: 12 }, (_, i) => Boolean(asDecimal & (1 << (11 - i))));
    const wrongOctal = asDecimal.toString(8).padStart(4, '0');
    const wrongLs = (() => {
      const p = wrongBits.slice(3);
      const chars = p.map((b, i) => (b ? BITS[i % 3] : '-'));
      if (wrongBits[0]) chars[2] = p[2] ? 's' : 'S';
      if (wrongBits[1]) chars[5] = p[5] ? 's' : 'S';
      if (wrongBits[2]) chars[8] = p[8] ? 't' : 'T';
      return `-${chars.join('')}`;
    })();

    const toggle = (i) => setBits((b) => b.map((v, j) => (j === i ? !v : v)));

    return (
      <div className="widget mode">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="group" aria-label={copy.text.label}>
            {PRESETS.map((p) => (
              <button key={p} className={p === octal ? 'is-active' : ''} onClick={() => setBits(fromOctal(p))}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mode-grid">
          <table className="mode-table">
            <thead>
              <tr>
                <th />
                <th>{copy.text.th}</th>
                <th>{copy.text.th2}</th>
                <th>{copy.text.th3}</th>
                <th>{copy.text.th4}</th>
              </tr>
            </thead>
            <tbody>
              {WHO.map(([k, label], w) => (
                <tr key={k}>
                  <th scope="row">{label}</th>
                  {BITS.map((b, i) => {
                    const idx = w * 3 + i;
                    return (
                      <td key={b}>
                        <button
                          className={`mode-bit ${bits[idx] ? 'is-on' : ''}`}
                          role="switch"
                          aria-checked={bits[idx]}
                          aria-label={formatCopy(copy.text.template, [label, b])}
                          onClick={() => toggle(idx)}
                        >
                          {bits[idx] ? b : '-'}
                        </button>
                      </td>
                    );
                  })}
                  <td className="mode-digit">{digits[w]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mode-out" aria-live="polite">
            <p className="mode-ls">{lsString(bits)}</p>
            <pre className="terminal">{formatCopy(copy.text.template2, [octal, symbolic])}</pre>
            <p className="mode-hint">
              {copy.text.modeHint}
              <code>{copy.text.code}</code>
              {copy.text.modeHint2}
            </p>
          </div>
        </div>

        <div className="mode-warn">
          <AlertTriangle size={15} />
          <p>
            {copy.text.p}
            <code>
              {copy.text.code2}
              {digits.join('')}
            </code>
            {copy.text.p2}
            <strong>{copy.text.strong}</strong>
            {copy.text.p3} {asDecimal}
            {copy.text.p4}
            <code>{wrongOctal}</code>
            {copy.text.p5}
            <code>{wrongLs}</code>
            {copy.text.p6}{' '}
            <code>
              {copy.text.code3}
              {octal}
              {copy.text.code4}
            </code>
            {copy.text.p7}
          </p>
        </div>
      </div>
    );
  }
  return ModeCalculator;
});
