import React, { useRef } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';

// Microsoft Fluent–style reveal-hover: a soft radial spotlight follows the
// cursor inside the card. Implemented as a non-interactive overlay layer with
// CSS variables for the cursor position; falls back to a static border on
// reduced-motion or hover-less devices.
//
// Usage:
//   <RevealCard className="result-card p-4">
//     ...your card content...
//   </RevealCard>
//
// Drop-in replacement for a plain wrapper — keeps existing className but adds
// the spotlight overlay.
export default function RevealCard({ children, className = '', as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const onMove = (e) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--reveal-x', `${x}px`);
    el.style.setProperty('--reveal-y', `${y}px`);
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      className={'reveal-card relative ' + className}
      {...rest}
    >
      {children}
      {/* The spotlight overlay — pointer-events:none so it never blocks clicks */}
      <span aria-hidden="true" className="reveal-card__spotlight" />
    </Tag>
  );
}
