import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    text: 'Select a product',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="10" height="7" rx="1" />
        <line x1="1" y1="7" x2="11" y2="7" />
      </svg>
    ),
  },
  {
    text: 'Set your preferences',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    text: 'Compare & apply',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="7" height="13" rx="1" />
        <rect x="14" y="5" width="7" height="13" rx="1" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
];

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 },
  }),
};

function HowItWorksSection() {
  return (
    <section className="py-16 px-4" id="how-it-works">
      <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow hover:shadow-md hover:-translate-y-1 transition"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
            variants={variants}
          >
            <div className="p-4 rounded-full bg-accent/10 text-accent mb-4">
              {step.icon}
            </div>
            <p className="font-medium text-gray-700 max-w-xs">{step.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
