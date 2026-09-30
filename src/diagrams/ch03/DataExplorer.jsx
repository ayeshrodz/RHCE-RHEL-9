import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

// Keys that clash with Python dict methods: dot notation can return the method instead of your value.
const METHOD_NAMES = new Set(['add', 'append', 'clear', 'copy', 'discard', 'get', 'items', 'keys', 'pop', 'update', 'values']);

/**
 * Browse a nested structure (a dictionary variable or ansible_facts) and see
 * how to reference any value with dot and bracket syntax.
 * legacyPrefix: when set (e.g. "ansible_"), also show the old injected-variable name.
 */
export default function DataExplorer({ name, data, initial = [], legacyPrefix, title }) {
  const [path, setPath] = useState(initial);
  const [open, setOpen] = useState(() => new Set(['', ...initial.map((_, i) => initial.slice(0, i + 1).join('\u0000'))]));
  const value = path.reduce((v, k) => v?.[k], data);

  const dot = [name, ...path].join('.');
  const bracket = name + path.map((k) => (typeof k === 'number' ? `[${k}]` : `['${k}']`)).join('');
  const clash = path.find((k) => METHOD_NAMES.has(k));
  const legacy =
    legacyPrefix && path.length
      ? legacyPrefix +
        path[0] +
        path
          .slice(1)
          .map((k) => (typeof k === 'number' ? `[${k}]` : `['${k}']`))
          .join('')
      : null;

  const toggle = (key) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const render = (node, trail) => {
    const entries = Array.isArray(node) ? node.map((v, i) => [i, v]) : Object.entries(node);
    return (
      <ul>
        {entries.map(([k, v]) => {
          const p = [...trail, k];
          const key = p.join('\u0000');
          const branch = v !== null && typeof v === 'object';
          const isOpen = open.has(key);
          const selected = p.length === path.length && p.every((x, i) => x === path[i]);
          return (
            <li key={key}>
              <button
                className={`dx-node ${selected ? 'is-selected' : ''}`}
                onClick={() => {
                  setPath(p);
                  if (branch) toggle(key);
                }}
              >
                {branch ? (
                  <ChevronRight size={12} className={`dx-caret ${isOpen ? 'is-open' : ''}`} />
                ) : (
                  <span className="dx-caret-space" />
                )}
                <span className="dx-key">{typeof k === 'number' ? `[${k}]` : k}</span>
                {!branch && <span className="dx-val">{JSON.stringify(v)}</span>}
                {branch && !isOpen && (
                  <span className="dx-summary">{Array.isArray(v) ? `[${v.length}]` : `{${Object.keys(v).length}}`}</span>
                )}
              </button>
              {branch && isOpen && render(v, p)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="widget dx">
      {title && <p className="widget-title">{title}</p>}
      <div className="dx-grid">
        <div className="dx-tree">
          <p className="widget-label">{name}: click to explore</p>
          {render(data, [])}
        </div>
        <div className="dx-detail" aria-live="polite">
          <p className="widget-label">Reference it as</p>
          <code className="dx-expr">{`{{ ${bracket} }}`}</code>
          <code className={`dx-expr ${clash ? 'is-risky' : ''}`}>{`{{ ${dot} }}`}</code>
          {clash && (
            <p className="dx-warn">
              <code>{clash}</code> is also the name of a Python dictionary method, so dot notation may return the method instead of your
              data. Use brackets here.
            </p>
          )}
          {legacy && (
            <>
              <p className="widget-label dx-gap">Old injected name</p>
              <code className="dx-expr is-legacy">{`{{ ${legacy} }}`}</code>
            </>
          )}
          <p className="widget-label dx-gap">Value</p>
          <pre className="dx-value">{value === undefined ? 'undefined' : JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
