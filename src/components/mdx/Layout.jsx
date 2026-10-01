// Small layout helpers used from MDX: cards, columns, tabs, reveal, objectives.
import { Children, useId, useState } from 'react';
import { ChevronDown, Target } from 'lucide-react';

export function Lead({ children }) {
  return <div className="lead">{children}</div>;
}

export function Objectives({ children }) {
  return (
    <div className="objectives">
      <p className="objectives-title">
        <Target size={14} /> In this section
      </p>
      {children}
    </div>
  );
}

export function Cards({ children, cols = 2 }) {
  return <div className={`cards cols-${cols}`}>{children}</div>;
}

export function Card({ title, tone = 'gray', kicker, children }) {
  return (
    <div className={`card t-${tone}`}>
      {kicker && <p className="card-kicker">{kicker}</p>}
      {title && <p className="card-title">{title}</p>}
      <div className="card-body">{children}</div>
    </div>
  );
}

export function Columns({ children }) {
  return <div className="columns">{children}</div>;
}

export function Column({ title, tone = 'gray', children }) {
  return (
    <div className={`column t-${tone}`}>
      {title && <p className="column-title">{title}</p>}
      {children}
    </div>
  );
}

export function Tabs({ children }) {
  const tabs = Children.toArray(children).filter(Boolean);
  const [active, setActive] = useState(0);
  const id = useId();
  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            id={`${id}-t${i}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onKeyDown={(event) => {
              const target =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? tabs.length - 1
                    : event.key === 'ArrowRight'
                      ? (i + 1) % tabs.length
                      : event.key === 'ArrowLeft'
                        ? (i - 1 + tabs.length) % tabs.length
                        : null;
              if (target !== null) {
                event.preventDefault();
                setActive(target);
                document.getElementById(`${id}-t${target}`)?.focus();
              }
            }}
            aria-controls={`${id}-p${i}`}
            className={i === active ? 'is-active' : ''}
            onClick={() => setActive(i)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div key={i} role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`} hidden={i !== active} className="tabs-panel">
          {tab.props.children}
        </div>
      ))}
    </div>
  );
}

export function Tab({ children }) {
  return children;
}

export function Reveal({ title = 'Show answer', children }) {
  const [open, setOpen] = useState(false);
  return (
    <details className={`reveal ${open ? 'is-open' : ''}`} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="reveal-toggle">
        <ChevronDown size={16} />
        {open ? title.replace(/^Show/, 'Hide') : title}
      </summary>
      <div className="reveal-body">{children}</div>
    </details>
  );
}

/** Numbered steps for procedures inside lessons (not persisted, unlike Lab tasks). */
export function Steps({ children }) {
  return <ol className="steps">{children}</ol>;
}

export function Step({ title, children }) {
  return (
    <li className="step">
      {title && <p className="step-title">{title}</p>}
      <div className="step-body">{children}</div>
    </li>
  );
}

/** Two-column term/definition list. */
export function Glossary({ children }) {
  return <dl className="glossary">{children}</dl>;
}

export function Term({ name, children }) {
  return (
    <div className="glossary-row">
      <dt>{name}</dt>
      <dd>{children}</dd>
    </div>
  );
}
