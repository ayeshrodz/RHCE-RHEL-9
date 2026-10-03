import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Link as RootLink, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import PlatformShell from '@/components/layout/PlatformShell';
import PlatformHome from '@/pages/PlatformHome';
import HomePage from '@/pages/HomePage';
import ChapterPage from '@/pages/ChapterPage';
import SectionPage from '@/pages/SectionPage';
import NotFound from '@/pages/NotFound';
import BootError from '@/pages/BootError';
import ProgramLanding from '@/pages/ProgramLanding';
import ProgramProgress from '@/pages/ProgramProgress';
import { activateProgram, defaultProgramId, hasProgram, interfaceContent, track } from '@/lib/course';

const ReferencePage = lazy(() => import('@/pages/ReferencePage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));

// A program shows its authored landing page and dashboard when its content has them, and simple built-in ones otherwise.
const ProgramHome = () => (interfaceContent.HomePage ? <HomePage /> : <ProgramLanding />);
const ProgressRoute = () => (interfaceContent.ProgressPage ? <ProgressPage /> : <ProgramProgress />);

// Addresses from before programs existed ("#/ch03/inventory") still open the default program.
const OLD_ADDRESS = /^\/(ch\d{2}|progress|platform)(\/|$)/;

/** Reads the program's reference page at render time, after the program has loaded. */
function PlatformPage() {
  return <ReferencePage page={track.platform} />;
}

function RootNotFound() {
  return (
    <div className="not-found">
      <p className="page-eyebrow">404</p>
      <h1>That page isn't here</h1>
      <p>There is no program at this address.</p>
      <RootLink className="btn btn-primary" to="/">
        Go to the start
      </RootLink>
    </div>
  );
}

/** Loads the program named in the address, then shows its pages. Switching programs remounts them. */
function ProgramGate() {
  const { programId } = useParams();
  const { pathname, search, hash } = useLocation();
  const known = hasProgram(programId);
  const [state, setState] = useState({ id: null, error: null });

  useEffect(() => {
    if (!known) return undefined;
    let live = true;
    activateProgram(programId).then(
      (installed) => live && installed && setState({ id: programId, error: null }),
      (error) => live && setState({ id: programId, error }),
    );
    return () => {
      live = false;
    };
  }, [programId, known]);

  if (!known) {
    return OLD_ADDRESS.test(pathname) ? <Navigate to={`/${defaultProgramId()}${pathname}${search}${hash}`} replace /> : <RootNotFound />;
  }
  if (state.id !== programId)
    return (
      <p className="boot-status" role="status">
        Loading…
      </p>
    );
  if (state.error) return <BootError error={state.error} />;
  return <Outlet key={programId} />;
}

// Hash routing keeps deep links working on GitHub Pages without a
// server-side rewrite or a 404.html fallback.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PlatformShell />}>
          <Route index element={<PlatformHome />} />
        </Route>
        <Route path=":programId" element={<ProgramGate />}>
          <Route element={<AppShell />}>
            <Route index element={<ProgramHome />} />
            <Route
              path="progress"
              element={
                <Suspense fallback={<p role="status">Loading your learning…</p>}>
                  <ProgressRoute />
                </Suspense>
              }
            />
            <Route
              path="platform"
              element={
                <Suspense fallback={<p role="status">Loading reference…</p>}>
                  <PlatformPage />
                </Suspense>
              }
            />
            <Route path=":chapterId" element={<ChapterPage />} />
            <Route path=":chapterId/:slug" element={<SectionPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
        <Route path="*" element={<RootNotFound />} />
      </Routes>
    </HashRouter>
  );
}
