import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, FileText, Search } from 'lucide-react';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { getIndex, search } from './searchIndex';

const SUGGESTIONS = ['inventory ranges', 'ansible.cfg precedence', 'become', 'syntax-check', 'execution environment', 'FQCN'];

export default function SearchDialog({ onClose }) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, true, onClose, inputRef);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    getIndex()
      .then((index) => alive && setEntries(index))
      .catch(() => alive && setLoadError(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      alive = false;
      document.body.style.overflow = prev;
    };
  }, []);

  const results = useMemo(() => (entries ? search(entries, query) : []), [entries, query]);
  useEffect(() => setCursor(0), [query]);

  const open = (r) => {
    navigate(r.anchor ? `${r.page.path}#${r.anchor}` : r.page.path);
    onClose();
  };

  const onKey = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) open(results[cursor]);
  };

  return (
    <div className="search-backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="search-input-row">
          <Search size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search lessons, commands, directives…"
            aria-label="Search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-autocomplete="list"
            aria-activedescendant={results[cursor] ? `search-result-${cursor}` : undefined}
            aria-controls="search-results"
          />
          <kbd>Esc</kbd>
        </div>

        <div className="search-results" id="search-results" role="listbox">
          {loadError && (
            <p role="status" className="search-none">
              Search could not load. Check your connection and open search again.
            </p>
          )}
          {!query && (
            <div className="search-empty">
              <p>Try searching for</p>
              <div className="search-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="pill" onClick={() => setQuery(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {query && entries && results.length === 0 && <p className="search-none">No matches for “{query}”.</p>}
          {results.map((r, i) => (
            <button
              key={`${r.page.key}-${r.anchor}-${i}`}
              id={`search-result-${i}`}
              role="option"
              aria-selected={i === cursor}
              className={`search-hit ${i === cursor ? 'is-active' : ''}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => open(r)}
            >
              <FileText size={15} className="search-hit-icon" />
              <span className="search-hit-body">
                <span className="search-hit-title">
                  <span className="search-hit-num">{r.page.number}</span> {r.page.section.title}
                  {r.heading && <span className="search-hit-heading"> › {r.heading}</span>}
                </span>
                <span className="search-hit-snippet">
                  <Highlight text={r.snippet} term={query.split(/\s+/)[0]} />
                </span>
              </span>
              {i === cursor && <CornerDownLeft size={14} className="search-hit-enter" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Highlight({ text, term }) {
  if (!term) return text;
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
}
