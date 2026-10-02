import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('ModuleExplorer', (copy) => {
  const MODULES = copy.data.modules;

  const CATS = copy.data.cats;

  function ModuleExplorer() {
    const [cat, setCat] = useState(copy.data.initialSelection1);
    const [q, setQ] = useState('');
    const [sel, setSel] = useState(copy.data.initialSelection2);
    const [copied, setCopied] = useState(false);
    const list = MODULES.filter((m) => (cat === 'All' || m.cat === cat) && (m.fqcn + m.text).toLowerCase().includes(q.toLowerCase()));
    const cmd = formatCopy(copy.text.template, [sel]);

    const copyCommand = async () => {
      try {
        await navigator.clipboard.writeText(cmd);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      } catch {
        /* ignore */
      }
    };

    return (
      <div className="widget mods">
        <div className="mods-head">
          <div className="segmented" role="tablist">
            {CATS.map((c) => (
              <button key={c} role="tab" aria-selected={c === cat} className={c === cat ? 'is-active' : ''} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <input
            className="mods-search"
            placeholder={copy.text.placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={copy.text.label}
          />
        </div>
        <div className="mods-list">
          {list.map((m) => (
            <button key={m.fqcn} className={`mods-item ${sel === m.fqcn ? 'is-active' : ''}`} onClick={() => setSel(m.fqcn)}>
              <code>{m.fqcn}</code>
              <span>{m.text}</span>
              {m.warn && <span className="mods-warn">{copy.text.modsWarn}</span>}
            </button>
          ))}
          {list.length === 0 && <p className="term-muted">{copy.text.termMuted}</p>}
        </div>
        <div className="mods-cmd">
          <code>{cmd}</code>
          <button className="code-copy" onClick={copyCommand} aria-label={copy.text.label2}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </div>
    );
  }
  return ModuleExplorer;
});
