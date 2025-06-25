import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    text: 'Tell us what you\u2019re looking for',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    text: 'We match products to your goals',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    text: 'Compare features, rates, and perks',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h6v10H3z" />
        <path d="M15 7h6v10h-6z" />
        <path d="M9 17h6" />
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
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center text-center"
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
