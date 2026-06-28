import React from 'react';
import { motion } from 'framer-motion';

// 3 stylised credit cards floating in 3D space behind the advisor. Real CSS
// perspective + transform-style: preserve-3d for genuine depth (not just
// scale tricks). Each card breathes independently via framer-motion.

const cards = [
  {
    name: 'PLATINUM',
    fg: 'linear-gradient(135deg, #1556f0 0%, #1e2a5a 100%)',
    accent: '#f5c451',
    transformInit: { rotateY: -20, rotateX: 12, translateZ: 0, translateX: 0, translateY: 0 },
    floatRange: 10,
    delay: 0,
  },
  {
    name: 'REWARDS',
    fg: 'linear-gradient(135deg, #3ec5b8 0%, #0e7d72 100%)',
    accent: '#ffffff',
    transformInit: { rotateY: 14, rotateX: -8, translateZ: -60, translateX: -40, translateY: 40 },
    floatRange: 14,
    delay: 0.4,
  },
  {
    name: 'TRAVEL',
    fg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    accent: '#ffffff',
    transformInit: { rotateY: -8, rotateX: 18, translateZ: -100, translateX: 70, translateY: -60 },
    floatRange: 12,
    delay: 0.8,
  },
];

function Card({ card, idx }) {
  return (
    <motion.div
      className="absolute w-44 h-28 md:w-52 md:h-32 rounded-2xl shadow-2xl"
      style={{
        background: card.fg,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${card.transformInit.translateX}px, ${card.transformInit.translateY}px, ${card.transformInit.translateZ}px) rotateX(${card.transformInit.rotateX}deg) rotateY(${card.transformInit.rotateY}deg)`,
        top: '50%',
        left: '50%',
        marginTop: '-3.5rem',
        marginLeft: '-5.5rem',
        zIndex: 3 - idx,
      }}
      animate={{
        y: [0, -card.floatRange, 0, card.floatRange, 0],
        rotate: [0, 1, 0, -1, 0],
      }}
      transition={{
        duration: 6 + idx * 1.2,
        delay: card.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Card surface */}
      <div className="absolute inset-0 p-4 text-white flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div
            className="w-7 h-5 rounded-sm"
            style={{ background: card.accent, opacity: 0.9 }}
          />
          <span className="text-[10px] font-bold tracking-widest opacity-80">
            {card.name}
          </span>
        </div>
        <div>
          <div className="text-xs font-mono tracking-wider opacity-70 mb-1">
            •••• •••• •••• ••••
          </div>
          <div className="flex justify-between items-end">
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded-full bg-white/30" />
              <div className="w-5 h-5 rounded-full bg-white/50 -ml-3" />
            </div>
          </div>
        </div>
      </div>
      {/* Specular highlight */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 100%)',
        }}
      />
    </motion.div>
  );
}

export default function FloatingCards() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ perspective: 1200 }}
    >
      {cards.map((c, i) => (
        <Card key={c.name} card={c} idx={i} />
      ))}
    </div>
  );
}
