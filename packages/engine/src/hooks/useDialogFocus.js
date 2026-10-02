import { useEffect, useRef } from 'react';

/** Keep keyboard focus inside an open dialog and return it to its opener. */
export function useDialogFocus(ref, active, onClose, initialRef) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!active || !ref.current) return;
    const opener = document.activeElement;
    const panel = ref.current;
    const focusable = () =>
      [
        ...panel.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => element.getClientRects().length);
    (initialRef?.current ?? focusable()[0] ?? panel).focus();
    const handle = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close.current?.();
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0],
        last = items.at(-1);
      if (!first) {
        event.preventDefault();
        panel.focus();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handle, true);
    return () => {
      document.removeEventListener('keydown', handle, true);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [ref, active, initialRef]);
}
