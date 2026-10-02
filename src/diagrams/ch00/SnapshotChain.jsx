import { useState } from 'react';
import { Camera, RotateCcw, Trash2 } from 'lucide-react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('SnapshotChain', (copy) => {
  const NAMES = copy.data.names;

  function SnapshotChain() {
    const [snaps, setSnaps] = useState(['clean']);
    const [log, setLog] = useState([{ kind: 'ok', text: copy.text.text }]);

    const push = (entry) => setLog((l) => [entry, ...l].slice(0, 4));
    const take = () => {
      const name = NAMES.find((n) => !snaps.includes(n));
      if (!name) return;
      setSnaps((s) => [...s, name]);
      push({ kind: 'ok', text: formatCopy(copy.text.text2, [name]) });
    };
    const restore = (name) => {
      const i = snaps.indexOf(name);
      if (i === snaps.length - 1) {
        push({ kind: 'ok', text: formatCopy(copy.text.text3, [name]) });
      } else {
        push({
          kind: 'err',
          text: formatCopy(copy.text.text4, [name]),
        });
      }
    };
    const remove = (name) => {
      setSnaps((s) => s.filter((x) => x !== name));
      push({ kind: 'ok', text: formatCopy(copy.text.text5, [name]) });
    };

    return (
      <div className="widget snapc">
        <div className="snapc-head">
          <div>
            <p className="widget-title">{copy.text.widgetTitle}</p>
            <p className="widget-sub">{copy.text.widgetSub}</p>
          </div>
          <button className="btn btn-sm" onClick={take} disabled={snaps.length > NAMES.length}>
            <Camera size={13} />
            {copy.text.btn}
          </button>
        </div>

        <ol className="snapc-chain">
          {snaps.map((s, i) => {
            const newest = i === snaps.length - 1;
            return (
              <li key={s} className={`snapc-snap ${newest ? 'is-newest' : ''} ${s === 'clean' ? 'is-clean' : ''}`}>
                <span className="snapc-name">{s}</span>
                <span className="snapc-tag">{newest ? copy.text.label : 'older'}</span>
                <span className="snapc-actions">
                  <button className="btn btn-sm" onClick={() => restore(s)} aria-label={formatCopy(copy.text.template, [s])}>
                    <RotateCcw size={12} />
                    {copy.text.btn2}
                  </button>
                  {s !== 'clean' && (
                    <button className="btn btn-sm btn-ghost" onClick={() => remove(s)} aria-label={formatCopy(copy.text.template2, [s])}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="terminal snapc-log" aria-live="polite">
          {log.map((l, i) => (
            <p key={i} className={l.kind === 'err' ? 'term-fail' : i === 0 ? '' : 'term-muted'}>
              {l.text}
            </p>
          ))}
        </div>
        <p className="widget-caption">{copy.text.widgetCaption}</p>
      </div>
    );
  }
  return SnapshotChain;
});
