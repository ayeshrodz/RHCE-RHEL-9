import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sidebar.css';
import './styles/prose.css';
import './styles/components.css';
import './styles/diagrams.css';
import './styles/widgets.css';
import './styles/pages.css';
import './styles/mobile.css';
import './styles/motion.css';
// After the global styles, so chapter widget styles (loaded via App) can override them.
import App from './App';
import { bootContent } from './lib/course';

const root = createRoot(document.getElementById('root'));

/** Content is loaded and validated before the first render; a failure shows a plain message. */
function BootError({ error }) {
  return (
    <main className="boot-error" role="alert">
      <h1>This page could not load</h1>
      <p>{error.message}</p>
      <p>Check your connection and reload the page.</p>
    </main>
  );
}

bootContent().then(
  () =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  (error) => {
    console.error(error);
    root.render(<BootError error={error} />);
  },
);
