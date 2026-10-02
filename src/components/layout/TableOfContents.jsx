import { useEffect, useRef, useState } from 'react';
import { interfaceContent } from '@/lib/course';
import { useNavigate } from 'react-router-dom';

/**
 * "On this page" outline. Reads h2/h3 headings from the rendered article
 * and highlights the one currently in view. A click puts the section in the
 * URL ("#/page#heading"), which SectionPage scrolls to.
 */
export default function TableOfContents({ articleRef, contentKey, compact = false }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const disclosure = useRef(null);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const collect = () =>
      setItems(
        [...root.querySelectorAll('h2[id], h3[id]')].map((h) => ({
          id: h.id,
          text: h.textContent.trim(),
          level: h.tagName === 'H2' ? 2 : 3,
        })),
      );
    collect();
    // MDX pages are lazy; re-collect once content is swapped in.
    const mo = new MutationObserver(collect);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [articleRef, contentKey]);

  useEffect(() => {
    if (!items.length) return;
    const onScroll = () => {
      let current = items[0]?.id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 120) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  if (items.length < 2) return null;

  const list = (
    <nav className="toc" aria-label={interfaceContent.Outline.text.title}>
      {!compact && <p className="toc-title">{interfaceContent.Outline.text.title}</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`toc-l${item.level}`}>
            <button
              className={active === item.id ? 'is-active' : ''}
              onClick={() => {
                if (disclosure.current) disclosure.current.open = false;
                navigate({ hash: `#${item.id}` }, { replace: true, state: { scrollSmooth: true } });
                document.getElementById(item.id)?.focus({ preventScroll: true });
              }}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
  return compact ? (
    <details className="page-outline" ref={disclosure}>
      <summary>{interfaceContent.Outline.text.title}</summary>
      {list}
    </details>
  ) : (
    list
  );
}
