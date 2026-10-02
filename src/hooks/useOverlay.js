import { useEffect } from 'react';
import { useDialogFocus } from './useDialogFocus';

/** Shared focus, scroll and visual-viewport behavior for drawers and dialogs. */
export function useOverlay(ref, active, onClose, initialRef) {
  useDialogFocus(ref, active, onClose, initialRef);
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const previous = document.body.style.overflow;
    const oldHeight = root.style.getPropertyValue('--overlay-height');
    const oldTop = root.style.getPropertyValue('--overlay-top');
    const update = () => {
      root.style.setProperty('--overlay-height', `${window.visualViewport?.height ?? window.innerHeight}px`);
      root.style.setProperty('--overlay-top', `${window.visualViewport?.offsetTop ?? 0}px`);
    };
    document.body.style.overflow = 'hidden';
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      document.body.style.overflow = previous;
      root.style.setProperty('--overlay-height', oldHeight);
      root.style.setProperty('--overlay-top', oldTop);
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, [active]);
}
