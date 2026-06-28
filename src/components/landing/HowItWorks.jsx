import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    n: 1,
    title: 'Filter',
    body: 'Narrow 100+ cards by annual fee, purchase rate, rewards program or issuer. Live counts show how many cards match each option.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
    ),
  },
  {
    n: 2,
    title: 'Select',
    body: 'Tick up to four cards to compare. They appear in a sticky bar at the bottom of every page — never lose your shortlist.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    n: 3,
    title: 'Compare',
    body: 'See annual fee, interest rates, interest-free days, rewards, insurance and digital wallets side by side. Best-in-row values are highlighted.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Three steps to a real shortlist
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mt-3">
            No sign-up, no email collection, no marketing follow-ups.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">
                {s.n}
              </div>
              <div className="text-blue-600 mb-3">{s.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
