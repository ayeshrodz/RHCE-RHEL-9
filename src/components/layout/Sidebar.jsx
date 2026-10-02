import { useEffect, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { BookOpen, Check, ChevronRight, CircleHelp, FlaskConical, House, ListChecks, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { chapters } from '@/lib/course';
import { chapterProgress, useProgress } from '@/hooks/useProgress';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import ProgressRing from './ProgressRing';

export const kindIcon = { lesson: BookOpen, lab: FlaskConical, quiz: CircleHelp, summary: ListChecks };

/**
 * Course navigation. On desktop it can shrink to a rail of chapter numbers;
 * on small screens it is a slide-in drawer.
 */
export default function Sidebar({ open, onClose, collapsed, onToggleCollapsed }) {
  const { chapterId } = useParams();
  const { done } = useProgress();
  const isMobile = useMediaQuery('(max-width: 960px)');
  const rail = collapsed && !isMobile;
  const navRef = useRef(null);
  useDialogFocus(navRef, isMobile && open, onClose);

  return (
    <>
      <div className={`scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <nav
        ref={navRef}
        id="course-navigation"
        tabIndex={-1}
        inert={isMobile && !open ? true : undefined}
        aria-hidden={isMobile && !open ? true : undefined}
        className={`sidebar ${open ? 'is-open' : ''} ${rail ? 'is-rail' : ''}`}
        aria-label="Course navigation"
      >
        {rail ? (
          <Rail chapterId={chapterId} done={done} onExpand={onToggleCollapsed} />
        ) : (
          <Full chapterId={chapterId} onClose={isMobile ? onClose : null} onCollapse={isMobile ? null : onToggleCollapsed} />
        )}
      </nav>
    </>
  );
}

function Full({ chapterId, onCollapse, onClose }) {
  const { done, isDone } = useProgress();
  // Accordion: only one chapter is open at a time.
  const [openId, setOpenId] = useState(chapterId ?? 'ch01');

  useEffect(() => {
    if (chapterId) setOpenId(chapterId);
  }, [chapterId]);

  return (
    <div className="sidebar-inner">
      <div className="sidebar-top">
        <NavLink to="/" end className="sidebar-home">
          Course overview
        </NavLink>
        {onClose && (
          <button className="icon-btn" onClick={onClose} aria-label="Close navigation">
            ×
          </button>
        )}
        {onCollapse && (
          <button className="icon-btn sidebar-collapse" onClick={onCollapse} aria-label="Collapse sidebar" title="Collapse sidebar">
            <PanelLeftClose size={17} />
          </button>
        )}
      </div>

      <ol className="nav-chapters">
        {chapters.map((ch) => {
          const isOpen = openId === ch.id && !ch.comingSoon;
          const { count, total } = chapterProgress(ch, done);
          return (
            <li key={ch.id} className={`nav-chapter ${ch.comingSoon ? 'is-soon' : ''} ${chapterId === ch.id ? 'is-current' : ''}`}>
              <div className="nav-chapter-row">
                <NavLink
                  to={`/${ch.id}`}
                  end
                  className="nav-chapter-link"
                  onClick={(e) => {
                    // Clicking the open chapter collapses it in place; any other opens it (closing the rest).
                    if (isOpen) {
                      e.preventDefault();
                      setOpenId(null);
                    } else {
                      setOpenId(ch.id);
                    }
                  }}
                >
                  <span className="nav-chapter-num">{ch.number}</span>
                  <span className="nav-chapter-title">{ch.title}</span>
                </NavLink>
                {ch.comingSoon ? (
                  <span className="nav-soon">Soon</span>
                ) : (
                  <button
                    className={`nav-expand ${isOpen ? 'is-open' : ''}`}
                    onClick={() => setOpenId((cur) => (cur === ch.id ? null : ch.id))}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} chapter ${ch.number}`}
                    aria-expanded={isOpen}
                  >
                    {count > 0 && (
                      <span className="nav-count">
                        {count}/{total}
                      </span>
                    )}
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>

              {isOpen && (
                <ol className="nav-sections">
                  {ch.sections.map((s, i) => {
                    const Icon = kindIcon[s.kind] ?? BookOpen;
                    const complete = isDone(`${ch.id}/${s.slug}`);
                    return (
                      <li key={s.slug}>
                        <NavLink to={`/${ch.id}/${s.slug}`} className="nav-section">
                          <span className={`nav-section-icon ${complete ? 'is-done' : ''}`}>
                            {complete ? <Check size={13} strokeWidth={2.5} /> : <Icon size={14} />}
                          </span>
                          <span className="nav-section-num">
                            {ch.number}.{i + 1}
                          </span>
                          <span className="nav-section-title">{s.title}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Rail({ chapterId, done, onExpand }) {
  return (
    <div className="rail">
      <button className="icon-btn" onClick={onExpand} aria-label="Expand sidebar" title="Expand sidebar">
        <PanelLeftOpen size={17} />
      </button>
      <NavLink to="/" end className="rail-item" title="Course overview" aria-label="Course overview">
        <House size={16} />
      </NavLink>
      <span className="rail-sep" />
      {chapters.map((ch) => {
        const { count, total } = chapterProgress(ch, done);
        const pct = total ? (count / total) * 100 : 0;
        return (
          <NavLink
            key={ch.id}
            to={`/${ch.id}`}
            className={`rail-item rail-chapter ${ch.comingSoon ? 'is-soon' : ''} ${chapterId === ch.id ? 'is-current' : ''}`}
            title={`${ch.number}. ${ch.title}${ch.comingSoon ? ' (coming soon)' : ` · ${count}/${total} complete`}`}
            aria-label={`Chapter ${ch.number}: ${ch.title}`}
          >
            {!ch.comingSoon && pct > 0 && <ProgressRing value={pct} size={34} stroke={2} />}
            <span>{ch.number}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
