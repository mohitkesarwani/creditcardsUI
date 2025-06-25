import React, { useState } from 'react';

function FAQAccordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  const toggle = (idx) => setOpen(open === idx ? null : idx);

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, idx) => (
        <div key={idx} className="accordion-item">
          <button
            type="button"
            onClick={() => toggle(idx)}
            className="accordion-question w-full text-left"
          >
            <span>{item.question}</span>
            <span>{open === idx ? '▾' : '▸'}</span>
          </button>
          {open === idx && (
            <div className="accordion-answer">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FAQAccordion;
