import { useEffect, useState } from 'react';
import { loadSiteHome, site } from '@/lib/course';
import PageTree from '@/components/content/PageTree';

/** The site's home page: its text comes from content/site/home.md. */
export default function PlatformHome() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    document.title = `${site.site.name} · ${site.site.tagline}`;
    const load = loadSiteHome();
    if (!load) setError('This site has no home page yet.');
    else
      load.then(
        (loaded) => alive && setPage(loaded),
        () => alive && setError('The home page could not load. Reload to try again.'),
      );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="page-grid platform-home">
      <article className="page-article">
        <header className="page-header">
          {page?.eyebrow && <p className="page-eyebrow">{page.eyebrow}</p>}
          <h1 className="page-title">{page?.title ?? site.site.tagline}</h1>
          {page?.description && <p className="reference-intro">{page.description}</p>}
        </header>
        <div className="prose">
          {error ? (
            <p className="load-error" role="alert">
              {error}
            </p>
          ) : page ? (
            <PageTree page={page} />
          ) : (
            <p role="status">Loading…</p>
          )}
        </div>
      </article>
    </div>
  );
}
