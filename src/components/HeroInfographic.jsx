import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    label: 'Pick a product type',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Set personal filters',
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
    label: 'See tailored matches',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="8" height="13" rx="2" />
        <rect x="14" y="3" width="8" height="17" rx="2" />
      </svg>
    ),
  },
  {
    label: 'Apply or save options',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.6, repeat: Infinity, repeatDelay: 0.5 },
  },
};

const itemVariants = {
  animate: {
    opacity: [0, 1, 1, 0],
    y: [20, 0, 0, 20],
    transition: { duration: 2 },
  },
};

function HeroInfographic() {
  return (
    <motion.div
      className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-8"
      variants={containerVariants}
      animate="animate"
    >
      {steps.map((step) => (
        <motion.div
          key={step.label}
          variants={itemVariants}
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
