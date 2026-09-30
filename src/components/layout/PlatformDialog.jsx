import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { course } from '@/lib/course';

// Content lives in content/_platform.mdx so it can be edited like any lesson.
const loadPlatform = Object.values(import.meta.glob('/content/_platform.mdx'))[0];

/** Modal describing the RHEL / Ansible versions the guide targets. */
export default function PlatformDialog({ onClose }) {
  const [Content, setContent] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    loadPlatform?.().then((m) => setContent(() => m.default));
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Portal to <body>: the sticky header's backdrop-filter would otherwise
  // become the containing block for this fixed-position overlay.
  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="platform-title" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div>
            <p className="modal-kicker">
              <span className="modal-badge">RHEL {course.rhel}</span> Platform and versions
            </p>
            <h2 id="platform-title">
              Red Hat Enterprise Linux {course.rhel} with Ansible Automation Platform {course.aap}
            </h2>
          </div>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="modal-body prose">{Content ? <Content /> : <p className="term-muted">Loading…</p>}</div>
      </div>
    </div>,
    document.body,
  );
}
