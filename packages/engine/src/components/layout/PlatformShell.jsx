import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { sharedInterface } from '@/lib/course';
import { TeachingContentProvider } from '@/components/interactive/TeachingContent';

/**
 * The frame for pages that belong to the site rather than to one program: no sidebar, search or progress
 * menu. Used as a route layout, or around a page passed as children (the 404 and load errors).
 */
export default function PlatformShell({ children }) {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current !== pathname) document.getElementById('main')?.focus({ preventScroll: true });
    previous.current = pathname;
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <TeachingContentProvider content={sharedInterface}>
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
        <Header platform />
        <div className="shell-body">
          <main id="main" className="shell-main" tabIndex={-1}>
            {children ?? <Outlet />}
            <Footer platform />
          </main>
        </div>
      </div>
    </TeachingContentProvider>
  );
}
