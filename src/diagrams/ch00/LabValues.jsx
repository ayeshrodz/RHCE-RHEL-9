import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { PLACEHOLDERS, usePlaceholderValues } from '@/lib/placeholders';

/**
 * Readers type their own host IP, user and router once; every command on the
 * site then shows (and copies) their values instead of the placeholders.
 */
export default function LabValues() {
  const [values, setValues] = usePlaceholderValues();
  const [draft, setDraft] = useState(values);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(values), [values]);

  const save = (e) => {
    e.preventDefault();
    const clean = Object.fromEntries(
      Object.entries(draft)
        .map(([k, v]) => [k, (v ?? '').trim()])
        .filter(([, v]) => v),
    );
    setValues(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };
  const clear = () => {
    setValues({});
    setDraft({});
  };
  const filled = PLACEHOLDERS.filter((p) => values[p.key]).length;

  return (
    <form className="widget labvals" onSubmit={save}>
      <div className="labvals-head">
        <div>
          <p className="widget-title">Your lab values</p>
          <p className="widget-sub">
            Fill these in once. Every command in this guide then shows your own values, and the copy buttons copy them. Saved only in this
            browser.
          </p>
        </div>
        <span className={`pill ${filled === PLACEHOLDERS.length ? 'pill-done' : ''}`}>
          {filled}/{PLACEHOLDERS.length} set
        </span>
      </div>
      <div className="labvals-grid">
        {PLACEHOLDERS.map((p) => (
          <label key={p.key} className="labvals-field">
            <span className="labvals-key">
              <code>{`<${p.key}>`}</code> {p.label}
            </span>
            <input
              value={draft[p.key] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [p.key]: e.target.value }))}
              placeholder={p.example}
              spellCheck={false}
              autoComplete="off"
            />
            <span className="labvals-hint">
              find it with <code>{p.hint}</code>
            </span>
          </label>
        ))}
      </div>
      <div className="labvals-actions">
        <button type="submit" className="btn btn-sm btn-primary">
          <Check size={13} /> {saved ? 'Saved' : 'Save values'}
        </button>
        {filled > 0 && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={clear}>
            <RotateCcw size={13} /> Clear
          </button>
        )}
      </div>
    </form>
  );
}
