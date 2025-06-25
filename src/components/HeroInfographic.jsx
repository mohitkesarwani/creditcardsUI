import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    label: 'Select a product type',
    icon: (
      <div className="product-icon-container flex justify-center items-center space-x-3 flex-wrap max-w-full overflow-hidden">
        <svg aria-label="credit card" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="10" height="7" rx="1" />
          <line x1="1" y1="7" x2="11" y2="7" />
        </svg>
        <svg aria-label="home loan" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V12H9v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        <svg aria-label="deposit" role="img" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v6c0 1.5 4 3 9 3s9-1.5 9-3V5" />
          <path d="M3 11v6c0 1.5 4 3 9 3s9-1.5 9-3v-6" />
        </svg>
      </div>
    ),
  },
  {
    label: 'Set your preferences',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
      </svg>
    ),
  },
  {
    label: 'Compare & choose',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="7" height="13" rx="1" />
        <rect x="14" y="5" width="7" height="13" rx="1" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
];

function HeroInfographic() {
  return (
    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          className="flex flex-col items-center text-center gap-2 w-[120px] my-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.35, ease: 'easeInOut', delay: i * 0.1 }}
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow text-accent">
            {step.icon}
          </div>
          <p className="text-sm font-medium text-gray-700">{step.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default HeroInfographic;
