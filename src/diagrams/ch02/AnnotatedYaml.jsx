import { useState } from 'react';

/** Light-weight YAML colouring, enough for short teaching snippets. */
function colour(line) {
  const m = line.match(/^(\s*)(-\s+)?([\w.]+)(:)(.*)$/);
  if (line.trim().startsWith('#')) return <span className="y-comment">{line}</span>;
  if (!m) {
    const d = line.match(/^(\s*)(-\s+)(.*)$/);
    if (d)
      return (
        <>
          {d[1]}
          <span className="y-dash">{d[2]}</span>
          <span className="y-val">{d[3]}</span>
        </>
      );
    return <span className={line.trim() === '---' ? 'y-doc' : ''}>{line}</span>;
  }
  const [, indent, dash, key, colon, rest] = m;
  const isModule = key.includes('.');
  return (
    <>
      {indent}
      {dash && <span className="y-dash">{dash}</span>}
      <span className={isModule ? 'y-module' : 'y-key'}>{key}</span>
      <span className="y-punct">{colon}</span>
      <span className="y-val">{rest}</span>
    </>
  );
}

/**
 * Click a line (or a highlighted region) to see what it means.
 * notes: [{ lines: [from, to], title, text }]  (1-based, inclusive)
 */
export default function AnnotatedYaml({ code, notes, title = 'site.yml' }) {
  const lines = code.replace(/\n$/, '').split('\n');
  const [active, setActive] = useState(0);
  const note = notes[active];
  // The most specific (shortest) note covering a line wins when ranges nest.
  const noteFor = (n) => {
    let best = -1;
    notes.forEach((x, i) => {
      if (n < x.lines[0] || n > x.lines[1]) return;
      if (best < 0 || x.lines[1] - x.lines[0] < notes[best].lines[1] - notes[best].lines[0]) best = i;
    });
    return best;
  };

  return (
    <div className="widget ayaml">
      <div className="ayaml-grid">
        <div className="ayaml-code">
          <div className="code-head">
            <span className="code-label is-file">{title}</span>
            <span className="ayaml-hint">click a line</span>
          </div>
          <pre>
            {lines.map((line, i) => {
              const n = i + 1;
              const idx = noteFor(n);
              const on = n >= note.lines[0] && n <= note.lines[1];
              const depth = Math.floor(line.match(/^\s*/)[0].length / 2);
              return (
                <button
                  key={i}
                  className={`ayaml-line ${on ? 'is-on' : ''} ${idx < 0 ? 'is-plain' : ''}`}
                  onClick={() => idx >= 0 && setActive(idx)}
                  tabIndex={idx >= 0 ? 0 : -1}
                >
                  <span className="ayaml-num">{n}</span>
                  <span className="ayaml-text">
                    {Array.from({ length: depth }).map((_, d) => (
                      <span key={d} className="ayaml-guide">
                        {'  '}
                      </span>
                    ))}
                    {colour(line.slice(depth * 2)) || ' '}
                  </span>
                </button>
              );
            })}
          </pre>
        </div>
        <div className="ayaml-note" aria-live="polite">
          <p className="widget-label">
            Lines {note.lines[0]}
            {note.lines[1] !== note.lines[0] && `–${note.lines[1]}`}
          </p>
          <p className="ayaml-note-title">{note.title}</p>
          <p className="ayaml-note-text">{note.text}</p>
          <div className="ayaml-steps">
            {notes.map((x, i) => (
              <button key={i} className={i === active ? 'is-active' : ''} onClick={() => setActive(i)} aria-label={x.title} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
