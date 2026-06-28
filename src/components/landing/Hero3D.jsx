import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdvisorAvatar from './AdvisorAvatar.jsx';
import FloatingCards from './FloatingCards.jsx';

// Hero section with animated 3D credit cards and an illustrated advisor.
// Background: subtle navy → blue gradient with animated orbs.
//
// Layout:
//   left  → headline + sub + dual CTA + trust strip
//   right → 3D scene (cards in CSS 3D space + advisor in front)

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function Hero3D() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(circle at 20% 0%, #1e2a5a 0%, #0e1430 60%, #06091a 100%)',
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: '#1556f0' }}
          animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 -right-20 w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{ background: '#3ec5b8' }}
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: '#f5c451' }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        {/* Copy column */}
        <div className="text-center md:text-left">
          <motion.span
            className="inline-block text-xs uppercase tracking-widest text-white/60 mb-4"
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            Compare 100+ Australian credit cards
          </motion.span>

          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-5"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Find a card that<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3ec5b8] to-[#f5c451]">
              actually fits your wallet.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg text-white/75 max-w-xl mx-auto md:mx-0 mb-8"
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Filter by fee, rate or feature. Compare up to four cards side by side. All data
            pulled straight from each issuer's public Consumer Data Right feed — refreshed daily.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 mb-8"
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <Link
              to="/credit-cards"
              className="btn btn-primary text-base px-6 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            >
              Browse credit cards →
            </Link>
            <a
              href="#how-it-works"
              className="text-base px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              How it works
            </a>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-white/60"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> CDR-powered data
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> No sign-up
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> General information only
            </div>
          </motion.div>
        </div>

        {/* 3D scene column */}
        <div className="relative h-[360px] md:h-[460px]">
          <FloatingCards />
          <motion.div
            className="absolute inset-0 flex items-end justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          >
            <AdvisorAvatar size={300} className="relative z-10 drop-shadow-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
