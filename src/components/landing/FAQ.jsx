import React, { useState } from 'react';

const QUESTIONS = [
  {
    q: 'Is the information on this site financial advice?',
    a: 'No. Everything here is general product information, presented for comparison purposes. It does not take into account your personal objectives, financial situation or needs. Before applying for any credit card you should read the issuer\'s Product Disclosure Statement (PDS) and Target Market Determination (TMD), and consider whether the card is right for you. If unsure, speak to a licensed financial adviser.',
  },
  {
    q: 'Where do the rates and fees come from?',
    a: 'Every card we list is pulled from the issuer\'s public Consumer Data Right (CDR) endpoint — the same machine-readable feed banks are required to publish under Australian open-banking regulations. Rates and fees update each time we re-run the ingest (typically daily). The bank\'s own website remains the source of truth at the point of application.',
  },
  {
    q: 'Why does some information show "—"?',
    a: 'A dash means the issuer hasn\'t published that field in their CDR feed. Comparison rates, for example, are rarely populated by Australian credit-card issuers. We choose to show "—" rather than guess or scrape from elsewhere — we\'d rather be honest about the gap.',
  },
  {
    q: 'How do you make money?',
    a: 'Some issuers pay us a referral fee if you apply for a card after clicking through from this site. That fee is the same regardless of which card you pick, and it does not change the comparison data, the ranking, or which cards we show. See "How we make money" for the full detail.',
  },
  {
    q: 'Do you collect my personal data?',
    a: 'No sign-up is required to use the comparison tools. We don\'t collect your email or contact details unless you choose to submit them via the contact form. See our Privacy Policy.',
  },
];

function Item({ q, a, open, onClick }) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left py-4 flex items-start justify-between gap-4 hover:text-blue-700"
      >
        <span className="text-base font-medium text-gray-900">{q}</span>
        <span className={`text-gray-400 text-xl transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-700 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-2">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Common questions
          </h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-6">
          {QUESTIONS.map((item, i) => (
            <Item
              key={i}
              q={item.q}
              a={item.a}
              open={openIdx === i}
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
