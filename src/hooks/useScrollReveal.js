import { useEffect, useRef } from 'react';
import useReducedMotion from './useReducedMotion.js';

// IntersectionObserver-based reveal-on-scroll. Returns a ref to attach to
// the *container* of children you want to stagger-reveal.
//
// Usage:
//   const ref = useScrollReveal();
//   <ul ref={ref}>... each direct child gets `data-reveal=visible` once
//                    it scrolls into view ...</ul>
//
// Pair with CSS:
//   [data-reveal="hidden"]  { opacity: 0; transform: translateY(8px); }
//   [data-reveal="visible"] { opacity: 1; transform: none;
//                              transition: opacity 400ms cubic-bezier(.25,1,.5,1),
//                                          transform 400ms cubic-bezier(.25,1,.5,1); }
//
// Stagger is achieved by a `transition-delay` proportional to index, set by
// this hook via a CSS variable `--reveal-delay`.
export default function useScrollReveal({
  staggerMs = 50,      // delay between consecutive children
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.1,
} = {}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children);

    // Reduced motion → reveal immediately, no animation.
    if (reduced) {
      children.forEach((c) => c.setAttribute('data-reveal', 'visible'));
      return;
    }

    // Initial hidden state + stagger delay
    children.forEach((c, i) => {
      if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', 'hidden');
      c.style.setProperty('--reveal-delay', `${i * staggerMs}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-reveal', 'visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin, threshold },
    );

    children.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reduced, staggerMs, rootMargin, threshold]);

  return ref;
}
