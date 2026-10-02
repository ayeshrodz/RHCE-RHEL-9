import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
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
import BootError from './pages/BootError';
import { bootContent } from './lib/course';

const root = createRoot(document.getElementById('root'));

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
