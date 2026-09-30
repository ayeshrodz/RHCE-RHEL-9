import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Monitor, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { course } from '@/lib/course';
import ProgressMenu from './ProgressMenu';
import Logo from './Logo';
import PlatformDialog from './PlatformDialog';

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
      </div>
      {platformOpen && <PlatformDialog onClose={closePlatform} />}
    </header>
  );
}
