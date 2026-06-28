import React from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    title: 'Real data, refreshed daily',
    body: 'Every card pulled from the issuer\'s public Consumer Data Right feed — the same source banks publish under government regulation. No scraped marketing copy.',
    icon: '🛰️',
  },
  {
    title: 'No editorial picks',
    body: 'We don\'t rank or recommend cards. We just present the data and let you filter. Sponsored cards (if any) are clearly flagged.',
    icon: '⚖️',
  },
  {
    title: 'Honest gaps',
    body: 'When a fee or rate isn\'t published by the bank, we show "—". We never fabricate a number to fill a column.',
    icon: '🔍',
  },
  {
    title: 'No tracking pixels',
    body: 'No third-party analytics by default, no marketing cookies, no email harvesting. You browse, we don\'t watch.',
    icon: '🔒',
  },
];

export default function WhyUs() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">
            Why this site
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Built like a tool, not a funnel
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="border border-gray-200 rounded-2xl p-6 bg-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
