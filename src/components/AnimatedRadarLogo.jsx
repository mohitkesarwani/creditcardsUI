import React from 'react';

function AnimatedRadarLogo({ className = 'w-8 h-8' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <circle cx="50" cy="50" r="48" className="radar-pulse" />
      <circle cx="50" cy="50" r="32" opacity="0.6" />
      <circle cx="50" cy="50" r="16" opacity="0.3" />
      <line x1="50" y1="50" x2="90" y2="50" className="radar-sweep" />
    </svg>
  );
}

export default AnimatedRadarLogo;
