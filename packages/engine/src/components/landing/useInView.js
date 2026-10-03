import { useEffect, useRef, useState } from 'react';

/**
 * True once the element has scrolled into view (and stays true). Without IntersectionObserver the
 * content simply shows at once. Used to start entrance animations when a reader reaches them.
 */
export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const node = ref.current;
    if (seen || !node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}
