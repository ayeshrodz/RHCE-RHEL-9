import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, RotateCcw, Upload, X } from 'lucide-react';
import { chapters } from '@/lib/course';
import { chapterProgress, useProgress } from '@/hooks/useProgress';
import { exportProgress, importProgress, resetAllProgress } from '@/lib/storage';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { createPortal } from 'react-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOverlay } from '@/hooks/useOverlay';
import ProgressRing from './ProgressRing';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('ProgressMenu', (copy) => {
  function ProgressMenu({ open, onToggle, onClose }) {
    const { done, percent, total } = useProgress();
    const [message, setMessage] = useState(null);
    const rootRef = useRef(null);
    const fileRef = useRef(null);
    const panelRef = useRef(null);
    const mobile = useMediaQuery('(max-width: 960px)');
    useDialogFocus(panelRef, open && !mobile, () => onClose());
    useOverlay(panelRef, open && mobile, () => onClose());

    useEffect(() => {
      if (!open) return;
      const onDown = (e) => !rootRef.current?.contains(e.target) && !panelRef.current?.contains(e.target) && onClose();
      const onKey = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('mousedown', onDown);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('keydown', onKey);
      };
    }, [open, onClose]);

    const download = () => {
      const progress = exportProgress();
      const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${progress.app}-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ ok: true, text: copy.text.text });
    };

    const upload = async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        if (file.size > 2_000_000) throw new Error(copy.text.label2);
        const count = importProgress(JSON.parse(await file.text()));
        setMessage({ ok: true, text: formatCopy(copy.text.text2, [count, count === 1 ? '' : 's']) });
      } catch (err) {
        setMessage({ ok: false, text: err instanceof SyntaxError ? copy.text.label3 : err.message });
      }
    };

    const reset = () => {
      if (confirm(copy.text.label4)) {
        resetAllProgress();
        setMessage({ ok: true, text: copy.text.text3 });
      }
    };

    const available = chapters.filter((c) => !c.comingSoon);

    const panel = open ? (
      <div
        ref={panelRef}
        tabIndex={-1}
        className="progress-panel"
        role="dialog"
        aria-modal={mobile ? true : undefined}
        aria-label={copy.text.label5}
      >
        {mobile && (
          <button className="icon-btn progress-close" aria-label={copy.text.close} onClick={() => onClose()}>
            <X size={18} />
          </button>
        )}
        <p className="progress-panel-title">{copy.text.progressPanelTitle}</p>
        <Link to="/progress" onClick={() => onClose()}>
          {copy.text.link}
        </Link>
        <p className="progress-panel-sub">
          {done.length}
          {copy.text.progressPanelSub}
          {total}
          {copy.text.progressPanelSub2}
        </p>

        <ul className="progress-chapters">
          {available.map((ch) => {
            const { count, total: t } = chapterProgress(ch, done);
            return (
              <li key={ch.id}>
                <span className="progress-chapter-name">
                  {ch.number}
                  {copy.text.progressChapterName}
                  {ch.title}
                </span>
                <span className="progress-chapter-count">
                  {count}
                  {copy.text.progressChapterCount}
                  {t}
                </span>
                <span className="progress-chapter-bar">
                  <span style={{ width: `${(count / t) * 100}%` }} />
                </span>
              </li>
            );
          })}
        </ul>

        <p className="progress-panel-note">{copy.text.progressPanelNote}</p>

        <div className="progress-actions">
          <button className="btn btn-sm" onClick={download}>
            <Download size={13} />
            {copy.text.btn}
          </button>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
            <Upload size={13} />
            {copy.text.btn2}
          </button>
          <button className="btn btn-sm btn-ghost progress-reset" onClick={reset}>
            <RotateCcw size={13} />
            {copy.text.btn3}
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={upload} />
        </div>

        {message && (
          <p role="status" className={`progress-message ${message.ok ? 'is-ok' : 'is-error'}`}>
            {message.text}
          </p>
        )}
      </div>
    ) : null;

    return (
      <div className="progress-menu" ref={rootRef}>
        <button
          className="header-progress"
          onClick={() => {
            onToggle();
            setMessage(null);
          }}
          aria-expanded={open}
          aria-label={copy.text.label6}
          aria-haspopup="dialog"
          title={copy.text.title}
        >
          <ProgressRing value={percent} size={22} stroke={2.5} />
          <span>
            {percent}
            {copy.text.span}
          </span>
        </button>

        {mobile && open
          ? createPortal(
              <div
                className="progress-backdrop"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) onClose();
                }}
              >
                {panel}
              </div>,
              document.body,
            )
          : panel}
      </div>
    );
  }
  return ProgressMenu;
});
