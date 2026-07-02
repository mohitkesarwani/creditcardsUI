import React, { useRef } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';

// Magnetic wrapper — when the pointer is inside this element's bounds, the
// element subtly translates toward the cursor (max ~`strength` px). Snaps
// back on leave with a short transition.
//
// Inspired by Apple/Awwwards-style CTAs. Kept small (6-8px) so the effect
// reads as "responsive" rather than "show-off".
//
// Usage:
//   <MagneticButton strength={6} className="...">
//     <a className="btn btn-primary">Apply</a>
//   </MagneticButton>
//
// `as` lets you choose the wrapper tag (default span) without nesting <a>
// or <button> elements where they shouldn't be.
export default function MagneticButton({
  children,
  strength = 6,
  as: Tag = 'span',
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const onMove = (e) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const max = Math.max(rect.width, rect.height) / 2;
    const tx = Math.max(-strength, Math.min(strength, (x / max) * strength));
    const ty = Math.max(-strength, Math.min(strength, (y / max) * strength));
    el.style.transform = `translate(${tx}px, ${ty}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0,0)';
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={'inline-block transition-transform duration-200 ease-out ' + className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
