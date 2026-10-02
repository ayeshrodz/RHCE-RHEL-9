import { useEffect, useRef, useState } from 'react';
import { course, referenceLoaderFor } from '@/lib/course';
import { useHeadingNavigation } from '@/hooks/useHeadingNavigation';
import TableOfContents from '@/components/layout/TableOfContents';

/** Informational MDX page: metadata supplies the header; content supplies the body. */
export default function ReferencePage({ page }) {
  const [Content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const articleRef = useRef(null);
  useHeadingNavigation(!!Content);
  useEffect(() => {
    let alive = true;
    document.title = `${page.title} · ${course.title}`;
    setContent(null);
    setError(null);
    const load = referenceLoaderFor(page);
    if (!load) setError('This reference page is unavailable.');
    else
      load()
        .then((m) => alive && setContent(() => m.default))
        .catch(() => alive && setError('This reference page could not load. Reload to try again.'));
    return () => {
      alive = false;
    };
  }, [page]);
  return (
    <div className="page-grid reference-page">
      <article className="page-article" ref={articleRef}>
        <header className="page-header">
          <p className="page-eyebrow">{page.eyebrow}</p>
          <h1 className="page-title">{page.title}</h1>
          <p className="reference-intro">{page.description}</p>
        </header>
        <div className="prose">
          {error ? (
            <p className="load-error" role="alert">
              {error}
            </p>
          ) : Content ? (
            <Content />
          ) : (
            <p role="status">Loading reference…</p>
          )}
        </div>
      </article>
      <aside className="page-aside">
        <TableOfContents articleRef={articleRef} contentKey={Content ? page.contentFile : null} />
      </aside>
    </div>
  );
}
