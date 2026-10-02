import { useEffect } from 'react';
import { useStored } from '@/lib/storage';

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Theme preference: 'light' | 'dark' | 'system'. Resolved onto <html data-theme>. */
export function useTheme() {
  const [pref, setPref] = useStored('theme', 'system');

  useEffect(() => {
    const apply = () => {
      const dark = pref === 'dark' || (pref === 'system' && media().matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    if (pref !== 'system') return;
    const mq = media();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [pref]);

  const cycle = () => setPref(pref === 'light' ? 'dark' : pref === 'dark' ? 'system' : 'light');
  return { pref, setPref, cycle };
}
