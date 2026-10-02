import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
const SearchDialog = lazy(() => import('@/components/search/SearchDialog'));
import { useStored } from '@/lib/storage';
import { interfaceContent } from '@/lib/course';
import { TeachingContentProvider } from '@/components/interactive/TeachingContent';

export default function AppShell() {
  const [overlay, setOverlay] = useState(null);
  const navOpen = overlay === 'navigation';
  const searchOpen = overlay === 'search';
  const progressOpen = overlay === 'progress';
  const closeOverlay = useCallback(() => setOverlay(null), []);
  const [collapsed, setCollapsed] = useStored('sidebarCollapsed', false);
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) document.getElementById('main')?.focus({ preventScroll: true });
    previousPath.current = pathname;
    closeOverlay();
    window.scrollTo({ top: 0 });
  }, [pathname, closeOverlay]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOverlay((value) => (value === 'search' ? null : 'search'));
      } else if (/input|textarea|select/i.test(document.activeElement?.tagName)) {
        return;
      } else if (e.key === '/') {
        e.preventDefault();
        setOverlay('search');
      } else if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCollapsed]);

  return (
    <TeachingContentProvider content={interfaceContent}>
      <div className="shell">
        <a
          className="skip-link"
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main')?.focus();
          }}
        >
          Skip to content
        </a>
        <Header
          navigationOpen={navOpen}
          onMenu={() => setOverlay((value) => (value === 'navigation' ? null : 'navigation'))}
          progressOpen={progressOpen}
          onProgress={() => setOverlay((value) => (value === 'progress' ? null : 'progress'))}
          onProgressClose={closeOverlay}
          onSearch={() => setOverlay('search')}
        />
        <div className="shell-body">
          <Sidebar open={navOpen} onClose={closeOverlay} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
          <main id="main" className="shell-main" tabIndex={-1}>
            <Outlet />
            <Footer />
          </main>
        </div>
        {searchOpen && (
          <Suspense fallback={<p role="status">Loading search…</p>}>
            <SearchDialog onClose={closeOverlay} />
          </Suspense>
        )}
      </div>
    </TeachingContentProvider>
  );
}
