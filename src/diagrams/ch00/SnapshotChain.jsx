import { useState } from 'react';
import { Camera, RotateCcw, Trash2 } from 'lucide-react';

const NAMES = ['ch02-done', 'ch03-done', 'before-vault', 'ch04-done', 'experiment'];

/**
 * Simulates ZFS-backed LXD snapshots on one VM: you can only roll back to the
 * newest snapshot. Try restoring an older one to see the error.
 */
export default function SnapshotChain() {
  const [snaps, setSnaps] = useState(['clean']);
  const [log, setLog] = useState([{ kind: 'ok', text: 'rht-vmctl save  →  servera: snapshot “clean” taken' }]);

  const push = (entry) => setLog((l) => [entry, ...l].slice(0, 4));
  const take = () => {
    const name = NAMES.find((n) => !snaps.includes(n));
    if (!name) return;
    setSnaps((s) => [...s, name]);
    push({ kind: 'ok', text: `rht-vmctl save servera -n ${name}  →  saved` });
  };
  const restore = (name) => {
    const i = snaps.indexOf(name);
    if (i === snaps.length - 1) {
      push({ kind: 'ok', text: `rht-vmctl restore servera ${name}  →  restored, booted and ready` });
    } else {
      push({
        kind: 'err',
        text: `Error: Failed restoring snapshot rootfs: Snapshot "${name}" cannot be restored due to subsequent snapshot(s). Set zfs.remove_snapshots to override`,
      });
    }
  };
  const remove = (name) => {
    setSnaps((s) => s.filter((x) => x !== name));
    push({ kind: 'ok', text: `rht-vmctl rmsnap servera ${name}  →  deleted` });
  };

  return (
    <div className="widget snapc">
      <div className="snapc-head">
        <div>
          <p className="widget-title">servera’s snapshots, oldest to newest</p>
          <p className="widget-sub">Take a few snapshots, then try to restore an older one.</p>
        </div>
        <button className="btn btn-sm" onClick={take} disabled={snaps.length > NAMES.length}>
          <Camera size={13} /> Take snapshot
        </button>
      </div>

      <ol className="snapc-chain">
        {snaps.map((s, i) => {
          const newest = i === snaps.length - 1;
          return (
            <li key={s} className={`snapc-snap ${newest ? 'is-newest' : ''} ${s === 'clean' ? 'is-clean' : ''}`}>
              <span className="snapc-name">{s}</span>
              <span className="snapc-tag">{newest ? 'newest · restorable' : 'older'}</span>
              <span className="snapc-actions">
                <button className="btn btn-sm" onClick={() => restore(s)} aria-label={`Restore ${s}`}>
                  <RotateCcw size={12} /> restore
                </button>
                {s !== 'clean' && (
                  <button className="btn btn-sm btn-ghost" onClick={() => remove(s)} aria-label={`Delete ${s}`}>
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
      <p className="widget-caption">
        Keep “clean” as the only (or newest) snapshot on the servers and resets always work. Delete newer snapshots with rht-vmctl rmsnap to
        go back further.
      </p>
    </div>
  );
}
