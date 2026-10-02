import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import HomePage from '@/pages/HomePage';
import ChapterPage from '@/pages/ChapterPage';
import SectionPage from '@/pages/SectionPage';
import NotFound from '@/pages/NotFound';
import { track } from '@/lib/course';

const ReferencePage = lazy(() => import('@/pages/ReferencePage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));

// Hash routing keeps deep links working on GitHub Pages without a
// server-side rewrite or a 404.html fallback.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route
            path="progress"
            element={
              <Suspense fallback={<p role="status">Loading your learning…</p>}>
                <ProgressPage />
              </Suspense>
            }
          />
          <Route
            path="platform"
            element={
              <Suspense fallback={<p role="status">Loading reference…</p>}>
                <ReferencePage page={track.platform} />
              </Suspense>
            }
          />
          <Route path=":chapterId" element={<ChapterPage />} />
          <Route path=":chapterId/:slug" element={<SectionPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
