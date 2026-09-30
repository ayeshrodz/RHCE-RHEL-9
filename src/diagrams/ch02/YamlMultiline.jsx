import { useState } from 'react';

const LINES = ['Example Company', '123 Main Street', 'Atlanta, GA 30303'];

/** Compare YAML's literal (|) and folded (>) block styles. */
export default function YamlMultiline() {
  const [style, setStyle] = useState('|');
  const value = style === '|' ? LINES.join('\n') + '\n' : LINES.join(' ') + '\n';

  return (
    <div className="widget mline">
      <div className="verb-head">
        <p className="widget-label">Multi-line strings</p>
        <div className="segmented" role="radiogroup" aria-label="Block style">
          <button role="radio" aria-checked={style === '|'} className={style === '|' ? 'is-active' : ''} onClick={() => setStyle('|')}>
            | keep newlines
          </button>
          <button role="radio" aria-checked={style === '>'} className={style === '>' ? 'is-active' : ''} onClick={() => setStyle('>')}>
            &gt; fold into one line
          </button>
        </div>
      </div>
      <div className="mline-grid">
        <div>
          <p className="mline-cap">YAML you write</p>
          <pre className="terminal">{`address: ${style}\n${LINES.map((l) => `  ${l}`).join('\n')}`}</pre>
        </div>
        <div>
          <p className="mline-cap">String Ansible gets</p>
          <pre className="terminal mline-value">
            {value
              .split('\n')
              .slice(0, -1)
              .map((l, i) => (
                <span key={i}>
                  {l}
                  <span className="mline-nl">↵</span>
                  {'\n'}
                </span>
              ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
