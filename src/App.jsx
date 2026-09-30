import { HashRouter, Route, Routes } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import AppShell from '@/components/layout/AppShell';
import HomePage from '@/pages/HomePage';
import ChapterPage from '@/pages/ChapterPage';
import SectionPage from '@/pages/SectionPage';
import NotFound from '@/pages/NotFound';
import { mdxComponents } from '@/components/mdx';

// Hash routing keeps deep links working on GitHub Pages without a
// server-side rewrite or a 404.html fallback.
export default function App() {
  return (
    <MDXProvider components={mdxComponents}>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path=":chapterId" element={<ChapterPage />} />
            <Route path=":chapterId/:slug" element={<SectionPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </MDXProvider>
  );
}
