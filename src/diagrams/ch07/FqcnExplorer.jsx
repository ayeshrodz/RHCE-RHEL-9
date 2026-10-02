import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('FqcnExplorer', (copy) => {
  const SAMPLES = copy.data.samples;

  const PATHS = copy.data.paths;

  function FqcnExplorer() {
    const [value, setValue] = useState(SAMPLES[1].name);
    const sample = SAMPLES.find((s) => s.name === value.trim());
    const parts = value.trim().split('.');
    const valid = parts.length === 3 && parts.every((p) => /^[a-z_][a-z0-9_]*$/.test(p));
    const [ns, coll, item] = parts;
    const kind = sample?.kind ?? 'module';
    const rel = valid ? `ansible_collections/${ns}/${coll}/${kind === 'role' ? `roles/${item}/` : `plugins/modules/${item}.py`}` : '';

    return (
      <div className="widget fq">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="chip-row">
          {SAMPLES.map((s) => (
            <button key={s.name} className={`chip ${s.name === value.trim() ? 'is-active' : ''}`} onClick={() => setValue(s.name)}>
              {s.name}
            </button>
          ))}
        </div>
        <input
          className="fq-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          aria-label={copy.text.label}
        />

        {valid ? (
          <>
            <div className="fq-parts" aria-live="polite">
              <div>
                <span className="fq-part t-ns">{ns}</span>
                <em>{copy.text.em}</em>
                <p>{copy.text.p}</p>
              </div>
              <div>
                <span className="fq-part t-coll">{coll}</span>
                <em>{copy.text.em2}</em>
                <p>{copy.text.p2}</p>
              </div>
              <div>
                <span className="fq-part t-item">{item}</span>
                <em>{kind}</em>
                <p>
                  {copy.text.p3}
                  {kind}
                  {copy.text.p4}
                </p>
              </div>
            </div>
            {sample?.builtin ? (
              <p className="fq-note">
                <code>{copy.text.code}</code>
                {copy.text.fqNote}
                <code>{copy.text.code2}</code>
                {copy.text.fqNote2}
              </p>
            ) : (
              <>
                <p className="fq-note">{copy.text.fqNote3}</p>
                <pre className="terminal fq-paths">{PATHS.map((p, i) => formatCopy(copy.text.template, [i + 1, p, rel])).join('\n')}</pre>
              </>
            )}
          </>
        ) : (
          <p className="fq-note is-bad">
            {copy.text.fqNote4}
            <code>{copy.text.code3}</code>
            {copy.text.fqNote5}
          </p>
        )}
      </div>
    );
  }
  return FqcnExplorer;
});
