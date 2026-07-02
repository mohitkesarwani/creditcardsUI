import React, { useCallback, useState } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';

// Google Material 3 click ripple — circular expand from the click point,
// fade out. Used on primary CTAs to give tactile feedback.
//
// Usage:
//   <RippleButton className="btn btn-primary" onClick={...}>Apply</RippleButton>
//
// Or wrap any element by mounting <RippleLayer /> inside a positioned parent.

let rippleId = 0;

export function useRippleHandler() {
  const reduced = useReducedMotion();
  const [ripples, setRipples] = useState([]);

  const fire = useCallback(
    (e) => {
      if (reduced) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
      const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;
      const id = ++rippleId;
      setRipples((rs) => [...rs, { id, x, y, size }]);
      setTimeout(() => {
        setRipples((rs) => rs.filter((r) => r.id !== id));
      }, 600);
    },
    [reduced],
  );

  return { ripples, fire };
}

export function RippleLayer({ ripples }) {
  return (
    <span aria-hidden="true" className="ripple-layer">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-dot"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </span>
  );
}

// Convenience wrapper. Forwards all props through; renders the ripple layer.
const RippleButton = React.forwardRef(function RippleButton(
  { as: Tag = 'button', className = '', children, onClick, ...rest },
  ref,
) {
  const { ripples, fire } = useRippleHandler();
  const handleClick = (e) => {
    fire(e);
    onClick?.(e);
  };
  return (
    <Tag
      ref={ref}
      onClick={handleClick}
      className={'relative overflow-hidden ' + className}
      {...rest}
    >
      <span className="relative z-[1]">{children}</span>
      <RippleLayer ripples={ripples} />
    </Tag>
  );
});

export default RippleButton;
