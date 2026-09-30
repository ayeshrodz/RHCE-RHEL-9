import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Monitor, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { course } from '@/lib/course';
import ProgressMenu from './ProgressMenu';
import Logo from './Logo';
import PlatformDialog from './PlatformDialog';

// lucide-react has no brand icons, so the GitHub mark is inline.
function GithubIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const themeIcon = { light: Sun, dark: Moon, system: Monitor };

export default function Header({ onMenu, onSearch }) {
  const { pref, cycle } = useTheme();
  const ThemeIcon = themeIcon[pref] ?? Monitor;
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const [platformOpen, setPlatformOpen] = useState(false);
  const closePlatform = useCallback(() => setPlatformOpen(false), []);

  return (
    <header className="header">
      <button className="icon-btn header-menu" onClick={onMenu} aria-label="Open navigation">
        <Menu size={18} />
      </button>

      <Link to="/" className="brand">
        <Logo />
        <span className="brand-name">{course.title}</span>
      </Link>
      <button
        className="brand-pill"
        onClick={() => setPlatformOpen(true)}
        aria-haspopup="dialog"
        title={`About Red Hat Enterprise Linux ${course.rhel} and the Ansible versions used`}
      >
        <span>RHEL {course.rhel}</span>
        <span>{course.exam}</span>
      </button>

      <button className="search-trigger" onClick={onSearch}>
        <Search size={15} />
        <span>Search the guide</span>
        <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>

      <div className="header-actions">
        <button className="icon-btn search-icon-only" onClick={onSearch} aria-label="Search">
          <Search size={17} />
        </button>
        <ProgressMenu />
        <button className="icon-btn" onClick={cycle} aria-label={`Theme: ${pref}. Click to change`} title={`Theme: ${pref}`}>
          <ThemeIcon size={17} />
        </button>
        {course.repo && (
          <a
            className="icon-btn"
            href={course.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the source on GitHub"
            title="View the source on GitHub"
          >
            <GithubIcon />
          </a>
        )}
      </div>
      {platformOpen && <PlatformDialog onClose={closePlatform} />}
    </header>
  );
}
