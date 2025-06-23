import React from 'react';

function AnimatedBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 animate-pulse pointer-events-none text-white"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="currentColor">
        <circle cx="40" cy="40" r="4" />
        <circle cx="160" cy="60" r="5" />
        <circle cx="120" cy="140" r="3" />
        <circle cx="60" cy="160" r="4" />
      </g>
    </svg>
  );
}

export default AnimatedBackground;
