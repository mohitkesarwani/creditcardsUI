import React from 'react';

// Original SVG illustration. Hand-built geometric advisor character —
// gender-neutral, professional, brand-coloured. Designed to read clearly at
// any size from a 80px chip to a 400px hero element.
//
// Colour palette uses Tailwind brand vars converted to hex so the SVG renders
// the same regardless of cascade:
//   navy   = #1e2a5a
//   blue   = #1556f0
//   teal   = #3ec5b8
//   gold   = #f5c451 (accent for the credit card)
//   skin   = #f8d7be
//   white  = #ffffff
//
// Props:
//   size      number — bounding box dimension in px (default 280)
//   className extra Tailwind classes for layout

export default function AdvisorAvatar({ size = 280, className = '' }) {
  return (
    <svg
      viewBox="0 0 280 280"
      width={size}
      height={size}
      role="img"
      aria-label="Friendly RewardRadar advisor"
      className={className}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8f0ff" />
          <stop offset="100%" stopColor="#dbe7ff" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1556f0" />
          <stop offset="100%" stopColor="#1e2a5a" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a3a" />
          <stop offset="100%" stopColor="#161624" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" />
          <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="140" cy="140" r="135" fill="url(#bgGrad)" />

      {/* Decorative orbital dots */}
      <g opacity="0.5">
        <circle cx="40" cy="80" r="3.5" fill="#1556f0" />
        <circle cx="245" cy="70" r="2.5" fill="#3ec5b8" />
        <circle cx="232" cy="200" r="4" fill="#f5c451" />
        <circle cx="45" cy="215" r="2.5" fill="#1e2a5a" />
      </g>

      {/* Body / torso */}
      <path
        d="M 80 280 C 80 218, 110 200, 140 200 C 170 200, 200 218, 200 280 Z"
        fill="#1556f0"
        filter="url(#softShadow)"
      />
      {/* Inner collar */}
      <path d="M 120 215 L 140 232 L 160 215 L 160 240 L 120 240 Z" fill="#ffffff" />
      {/* Tie */}
      <path d="M 138 232 L 142 232 L 144 260 L 136 260 Z" fill="#3ec5b8" />

      {/* Neck */}
      <path d="M 128 195 L 152 195 L 152 215 L 128 215 Z" fill="#f8d7be" />

      {/* Head */}
      <ellipse cx="140" cy="155" rx="38" ry="44" fill="#f8d7be" filter="url(#softShadow)" />

      {/* Hair */}
      <path
        d="M 102 152 C 102 115, 122 100, 140 100 C 158 100, 178 115, 178 152
           L 178 142 C 178 142, 168 122, 140 122 C 112 122, 102 142, 102 152 Z"
        fill="url(#hairGrad)"
      />

      {/* Ears */}
      <ellipse cx="102" cy="158" rx="6" ry="9" fill="#f8d7be" />
      <ellipse cx="178" cy="158" rx="6" ry="9" fill="#f8d7be" />

      {/* Eyes */}
      <g fill="#161624">
        <ellipse cx="124" cy="156" rx="3" ry="4" />
        <ellipse cx="156" cy="156" rx="3" ry="4" />
      </g>
      {/* Eye sparkle */}
      <g fill="#ffffff" opacity="0.9">
        <circle cx="125" cy="154" r="1" />
        <circle cx="157" cy="154" r="1" />
      </g>
      {/* Brows */}
      <g stroke="#2a2a3a" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 118 147 Q 124 144 130 147" />
        <path d="M 150 147 Q 156 144 162 147" />
      </g>

      {/* Smile */}
      <path
        d="M 128 174 Q 140 184 152 174"
        stroke="#2a2a3a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Floating credit card next to head */}
      <g transform="translate(195, 110) rotate(15)" filter="url(#softShadow)">
        <rect x="0" y="0" width="60" height="40" rx="6" fill="url(#cardGrad)" />
        <rect x="6" y="24" width="20" height="4" rx="1" fill="#f5c451" />
        <rect x="6" y="32" width="40" height="2" rx="1" fill="#ffffff" opacity="0.4" />
        <circle cx="48" cy="10" r="4" fill="#f5c451" opacity="0.9" />
        <circle cx="53" cy="10" r="4" fill="#ffffff" opacity="0.7" />
      </g>

      {/* Floating checkmark badge */}
      <g transform="translate(28, 145)" filter="url(#softShadow)">
        <circle cx="14" cy="14" r="14" fill="#3ec5b8" />
        <path d="M 8 14 L 12 18 L 20 10" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
