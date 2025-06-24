import React from 'react';

const benefits = [
  {
    title: 'Personalized Recommendations',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: 'No Sponsored Bias',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14l2-2 4 4 8-8" />
        <path d="M7 10h.01" />
      </svg>
    ),
  },
  {
    title: 'Updated Daily \u2013 Based on Latest Available Rates (1-Day Lag)',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17l-5-5" />
        <path d="M13 12l-2 2-3-3" />
      </svg>
    ),
  },
];

function BenefitsSection() {
  return (
    <section className="py-16 px-4 bg-gray-50" id="benefits">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3 text-center">
        {benefits.map((b, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="p-4 rounded-full bg-white shadow mb-2 text-brand-start">
              {b.icon}
            </div>
            <h3 className="font-medium text-gray-800">{b.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BenefitsSection;
