import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('VariableNameChecker', (copy) => {
  const PRESETS = copy.data.presets;

  const RESERVED = new Set([
    'hostvars',
    'groups',
    'group_names',
    'inventory_hostname',
    'inventory_hostname_short',
    'play_hosts',
    'ansible_facts',
    'ansible_play_hosts',
    'environment',
    'omit',
  ]);

  function check(name) {
    if (!name) return { ok: false, reasons: [copy.text.label] };
    const reasons = [];
    if (!/^[A-Za-z]/.test(name)) reasons.push(formatCopy(copy.text.template, [name[0]]));
    const bad = [...new Set(name.replace(/[A-Za-z0-9_]/g, ''))];
    if (bad.length) reasons.push(formatCopy(copy.text.template2, [bad.map((c) => (c === ' ' ? 'space' : `“${c}”`)).join(', ')]));
    if (!reasons.length && RESERVED.has(name)) return { ok: false, warn: true, reasons: [formatCopy(copy.text.template3, [name])] };
    if (reasons.length) return { ok: false, reasons, suggestion: suggest(name) };
    return { ok: true, reasons: [copy.text.label2] };
  }

  function suggest(name) {
    let s = name.replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    if (/^\d/.test(s)) s = s.replace(/^(\d+)(.*)$/, (_, d, rest) => (rest.replace(/^_/, '') || 'var') + '_' + d);
    return s || null;
  }

  function VariableNameChecker() {
    const [name, setName] = useState(copy.text.initial);
    const result = check(name.trim());

    return (
      <div className="widget vname">
        <p className="widget-title">{copy.text.widgetTitle}</p>
        <input
          className="ranges-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          spellCheck={false}
          aria-label={copy.text.label3}
        />
        <div className="chip-row ranges-presets">
          {PRESETS.map((p) => (
            <button key={p} className={`pill ${p === name ? 'pill-accent' : ''}`} onClick={() => setName(p)}>
              {p}
            </button>
          ))}
        </div>
        <div className={`vname-result ${result.ok ? 'is-ok' : result.warn ? 'is-warn' : 'is-bad'}`} aria-live="polite">
          <span className="vname-icon">{result.ok ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}</span>
          <div>
            {result.reasons.map((r) => (
              <p key={r}>{r}</p>
            ))}
            {result.suggestion && result.suggestion !== name && (
              <p className="vname-suggest">
                {copy.text.vnameSuggest}
                <button onClick={() => setName(result.suggestion)}>{result.suggestion}</button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return VariableNameChecker;
});
