import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
const SearchDialog = lazy(() => import('@/components/search/SearchDialog'));
import { useStored } from '@/lib/storage';

export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useStored('sidebarCollapsed', false);
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) document.getElementById('main')?.focus({ preventScroll: true });
    previousPath.current = pathname;
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (/input|textarea|select/i.test(document.activeElement?.tagName)) {
        return;
      } else if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCollapsed]);

  return (
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
      <Header navigationOpen={navOpen} onMenu={() => setNavOpen((o) => !o)} onSearch={() => setSearchOpen(true)} />
      <div className="shell-body">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
        <main id="main" className="shell-main" tabIndex={-1}>
          <Outlet />
          <Footer />
        </main>
      </div>
      {searchOpen && (
        <Suspense fallback={<p role="status">Loading search…</p>}>
          <SearchDialog onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
