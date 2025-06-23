import React from 'react';

function HeroAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-64 h-64">
        <svg className="absolute left-1/2 top-1/2 w-6 h-6 text-white/40 hero-orbit" style={{ '--orbit-radius': '80px' }} viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
        </svg>
        <svg className="absolute left-1/2 top-1/2 w-6 h-6 text-white/30 hero-orbit-reverse" style={{ '--orbit-radius': '100px', animationDuration: '25s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21v-4a4 4 0 014-4h8a4 4 0 014 4v4" />
          <line x1="12" y1="3" x2="12" y2="7" />
          <line x1="12" y1="3" x2="16" y2="7" />
          <line x1="12" y1="3" x2="8" y2="7" />
        </svg>
        <svg className="absolute left-1/2 top-1/2 w-6 h-6 text-white/30 hero-orbit" style={{ '--orbit-radius': '120px', animationDuration: '30s' }} viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="3" width="4" height="18" />
          <rect x="10" y="9" width="4" height="12" />
          <rect x="16" y="13" width="4" height="8" />
        </svg>
        <svg className="absolute left-1/2 top-1/2 w-6 h-6 text-white/40 hero-orbit-reverse" style={{ '--orbit-radius': '140px', animationDuration: '35s' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z" />
        </svg>
      </div>
    </div>
  );
}

export default HeroAnimation;
