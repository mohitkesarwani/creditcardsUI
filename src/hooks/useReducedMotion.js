import { useEffect, useState } from 'react';

// True when the user prefers reduced motion. All decorative effects in this
// app check this and short-circuit so we never sacrifice accessibility for
// aesthetics.
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
}
