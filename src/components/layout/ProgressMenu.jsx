import { useEffect, useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { chapters } from '@/lib/course';
import { chapterProgress, useProgress } from '@/hooks/useProgress';
import { exportProgress, importProgress, resetAllProgress } from '@/lib/storage';
import ProgressRing from './ProgressRing';

/** Header progress ring that opens a panel to review, back up or reset progress. */
export default function ProgressMenu() {
  const { done, percent, total } = useProgress();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const rootRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const download = () => {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhce-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: 'Progress file downloaded.' });
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const count = importProgress(JSON.parse(await file.text()));
      setMessage({ ok: true, text: `Restored ${count} saved item${count === 1 ? '' : 's'}.` });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof SyntaxError ? 'That file is not valid JSON.' : err.message });
    }
  };

  const reset = () => {
    if (confirm('Reset all progress, lab checklists and quiz answers in this browser?')) {
      resetAllProgress();
      setMessage({ ok: true, text: 'Progress reset.' });
    }
  };

  const available = chapters.filter((c) => !c.comingSoon);

  return (
    <div className="progress-menu" ref={rootRef}>
      <button
        className="header-progress"
        onClick={() => {
          setOpen((o) => !o);
          setMessage(null);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Your progress"
      >
        <ProgressRing value={percent} size={22} stroke={2.5} />
        <span>{percent}%</span>
      </button>

      {open && (
        <div className="progress-panel" role="dialog" aria-label="Your progress">
          <p className="progress-panel-title">Your progress</p>
          <p className="progress-panel-sub">
            {done.length} of {total} sections complete. Saved in this browser only.
          </p>

          <ul className="progress-chapters">
            {available.map((ch) => {
              const { count, total: t } = chapterProgress(ch, done);
              return (
                <li key={ch.id}>
                  <span className="progress-chapter-name">
                    {ch.number}. {ch.title}
                  </span>
                  <span className="progress-chapter-count">
                    {count}/{t}
                  </span>
                  <span className="progress-chapter-bar">
                    <span style={{ width: `${(count / t) * 100}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="progress-panel-note">
            Clearing site data or switching browsers loses progress. Download a copy to keep it safe or move it to another device.
          </p>

          <div className="progress-actions">
            <button className="btn btn-sm" onClick={download}>
              <Download size={13} /> Export
            </button>
            <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
              <Upload size={13} /> Import
            </button>
            <button className="btn btn-sm btn-ghost progress-reset" onClick={reset}>
              <RotateCcw size={13} /> Reset
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={upload} />
          </div>

          {message && <p className={`progress-message ${message.ok ? 'is-ok' : 'is-error'}`}>{message.text}</p>}
        </div>
      )}
    </div>
  );
}
