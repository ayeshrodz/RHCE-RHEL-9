import CodeEditor from '@/components/interactive/CodeEditor';
import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('FileEditSimulator', (copy) => {
  const START = copy.data.start;

  const BEGIN = copy.data.begin;

  const END = copy.data.end;

  const MODES = copy.data.modes;

  function apply(mode, file, line, regexp) {
    if (mode === 'block') {
      const block = [BEGIN, ...line.split('\n'), END];
      const a = file.indexOf(BEGIN);
      const b = file.indexOf(END);
      if (a >= 0 && b > a) {
        const same = file.slice(a, b + 1).join('\n') === block.join('\n');
        const next = [...file.slice(0, a), ...block, ...file.slice(b + 1)];
        return { file: next, changed: !same, touched: same ? [] : block.map((_, i) => a + i) };
      }
      return { file: [...file, ...block], changed: true, touched: block.map((_, i) => file.length + i) };
    }
    if (regexp) {
      let re;
      try {
        re = new RegExp(regexp);
      } catch {
        return { file, changed: false, touched: [], error: copy.text.error };
      }
      let idx = -1;
      file.forEach((l, i) => {
        if (re.test(l)) idx = i;
      });
      if (idx >= 0) {
        if (file[idx] === line) return { file, changed: false, touched: [] };
        const next = [...file];
        next[idx] = line;
        return { file: next, changed: true, touched: [idx] };
      }
    }
    if (file.includes(line)) return { file, changed: false, touched: [] };
    return { file: [...file, line], changed: true, touched: [file.length] };
  }

  function FileEditSimulator() {
    const [mode, setMode] = useState(copy.data.initialSelection1);
    const [file, setFile] = useState(START);
    const [line, setLine] = useState(MODES.replace.line);
    const [regexp, setRegexp] = useState(MODES.replace.regexp);
    const [touched, setTouched] = useState([]);
    const [log, setLog] = useState([]);
    const m = MODES[mode];

    const pick = (k) => {
      setMode(k);
      setLine(MODES[k].line);
      setRegexp(MODES[k].regexp);
      setTouched([]);
    };
    const run = () => {
      const r = apply(mode, file, line, regexp);
      setFile(r.file);
      setTouched(r.touched);
      setLog((l) => [...l.slice(-3), r.error ? { s: 'fail', t: r.error } : { s: r.changed ? 'changed' : 'ok', t: m.label }]);
    };
    const reset = () => {
      setFile(START);
      setTouched([]);
      setLog([]);
    };

    const yaml =
      mode === 'block'
        ? formatCopy(copy.text.template, [
            line
              .split('\n')
              .map((l) => `    ${l}`)
              .join('\n'),
          ])
        : formatCopy(copy.text.template2, [regexp !== null ? `\n  regexp: '${regexp}'` : '', line]);

    return (
      <div className="widget fes">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label}>
            {Object.entries(MODES).map(([k, v]) => (
              <button key={k} role="radio" aria-checked={mode === k} className={mode === k ? 'is-active' : ''} onClick={() => pick(k)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <p className="widget-sub">{m.hint}</p>

        <div className="fes-grid">
          <div>
            <div className="fes-fields">
              {regexp !== null && (
                <label>
                  <span>{copy.text.span}</span>
                  <input value={regexp} onChange={(e) => setRegexp(e.target.value)} spellCheck={false} />
                </label>
              )}
              <label>
                <span>{mode === 'block' ? 'block' : 'line'}</span>
                {mode === 'block' ? (
                  <CodeEditor rows={3} value={line} onChange={(e) => setLine(e.target.value)} spellCheck={false} />
                ) : (
                  <input value={line} onChange={(e) => setLine(e.target.value)} spellCheck={false} />
                )}
              </label>
            </div>
            <pre className="terminal fes-yaml">{yaml}</pre>
            <div className="fes-actions">
              <button className="btn btn-sm btn-primary" onClick={run} disabled={!line.trim()}>
                <Play size={13} />
                {copy.text.btn}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={reset}>
                <RotateCcw size={13} />
                {copy.text.btn2}
              </button>
            </div>
          </div>

          <div>
            <p className="fes-path">{copy.text.fesPath}</p>
            <pre className="terminal fes-file" aria-live="polite">
              {file.map((l, i) => (
                <span key={i} className={touched.includes(i) ? 'is-touched' : ''}>
                  {l || ' '}
                  {'\n'}
                </span>
              ))}
            </pre>
            <div className="terminal fes-log">
              {log.length === 0 && <p className="term-muted">{copy.text.termMuted}</p>}
              {log.map((r, i) => (
                <p key={i} className={`term-${r.s}`}>
                  {r.s === 'fail'
                    ? formatCopy(copy.text.template3, [r.t])
                    : formatCopy(copy.text.template4, [r.s, r.t, r.s === 'ok' ? '  (nothing to do)' : ''])}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return FileEditSimulator;
});
