import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    label: 'Select a product type',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
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
        <rect x="2" y="7" width="8" height="13" rx="2" />
        <rect x="14" y="3" width="8" height="17" rx="2" />
      </svg>
    ),
  },
];

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.3 },
  }),
};

function HeroInfographic() {
  return (
    <motion.div
      className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-8"
      initial="hidden"
      animate="visible"
    >
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          custom={i}
          variants={variants}
          className="flex flex-col items-center text-center"
        >
          <div className="p-4 bg-white rounded-full shadow mb-2 text-brand-start">
            {step.icon}
          </div>
          <p className="text-sm font-medium text-gray-700 w-32">{step.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default HeroInfographic;
