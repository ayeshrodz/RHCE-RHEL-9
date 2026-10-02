import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Shared heading navigation for lazy MDX lessons and reference pages. */
export function useHeadingNavigation(ready) {
  const location = useLocation();
  let target;
  try {
    target = decodeURIComponent(location.hash.slice(1));
  } catch {
    target = location.hash.slice(1);
  }
  const smooth = location.state?.scrollSmooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (!ready || !target) return;
    const jump = (behavior) => {
      const element = document.getElementById(target);
      for (let parent = element?.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
      element?.scrollIntoView({ behavior });
    };
    let userScrolled = false;
    const stop = () => (userScrolled = true);
    const events = ['wheel', 'touchmove', 'keydown', 'mousedown'];
    events.forEach((e) => window.addEventListener(e, stop, { passive: true }));
    const frame = requestAnimationFrame(() => jump(smooth ? 'smooth' : 'auto'));
    const timers = smooth ? [] : [150, 500, 1200].map((ms) => setTimeout(() => !userScrolled && jump('auto'), ms));
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      events.forEach((e) => window.removeEventListener(e, stop));
    };
  }, [ready, target, smooth, location.key]);
}
