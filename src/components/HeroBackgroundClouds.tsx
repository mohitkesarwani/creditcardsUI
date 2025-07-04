import React from 'react';

export default function HeroBackgroundClouds() {
  const clouds = [
    { top: 'top-2', width: 'w-40', anim: 'animate-cloud1' },
    { top: 'top-12', width: 'w-52', anim: 'animate-cloud2' },
    { top: 'top-24', width: 'w-36', anim: 'animate-cloud3' },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {clouds.map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 64 32"
          fill="currentColor"
          className={`absolute ${c.top} -left-1/3 ${c.width} text-white filter blur-sm ${c.anim}`}
          style={{ opacity: 0.08 }}
        >
          <path d="M48 24a12 12 0 00-23.3-3A10 10 0 0010 30a10 10 0 000 20h38a10 10 0 000-20z" />
        </svg>
      ))}
    </div>
  );
}
