import React, { useState } from 'react';

// Single-item accordion (only one open at a time). Items can carry an
// optional `category` field which renders as a small badge in the header
// when present — used by FaqPage to group questions.
function FAQAccordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  const toggle = (idx) => setOpen(open === idx ? null : idx);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className="accordion-item" data-open={isOpen}>
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="accordion-question w-full text-left group"
              aria-expanded={isOpen}
            >
              <span className="flex-1 pr-4">{item.question}</span>
              <svg
                viewBox="0 0 20 20"
                className={
                  'w-4 h-4 text-ink-400 shrink-0 transition-transform duration-200 ease-out-quart ' +
                  (isOpen ? 'rotate-180 text-brand-600' : 'group-hover:text-ink-600')
                }
                fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
              </svg>
            </button>
            {isOpen && (
              <div className="accordion-answer animate-fade-up">
                {typeof item.answer === 'string'
                  ? <p className="text-ink-700 leading-relaxed">{item.answer}</p>
                  : item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FAQAccordion;
