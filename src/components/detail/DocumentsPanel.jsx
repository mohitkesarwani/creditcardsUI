import React from 'react';

// CDR Banking Product schema does NOT have a structured "required documents"
// field. We do two honest things instead:
//   1. Surface anything the bank publishes about documents in `eligibility[]`
//      / `additionalInformation` free text — extracted via regex.
//   2. Provide a curated "typical Australian {productType}" checklist as a
//      fallback so users know what to expect.
//
// The panel always tells the user the issuer's website is the source of truth.

const HOME_LOAN_TYPICAL = [
  { icon: '🪪', title: 'Photo ID', body: 'Driver\'s licence, passport, or other government-issued ID (often 2 forms — "100-point check").' },
  { icon: '💰', title: 'Proof of income', body: 'Last 2-3 payslips, group certificates, tax returns (PAYG); 2 years of returns + BAS (self-employed).' },
  { icon: '🏠', title: 'Address proof', body: 'Recent utility bill, lease agreement, or bank statement showing current address.' },
  { icon: '🏦', title: 'Bank statements', body: 'Last 3 months from your everyday account showing income credits and regular expenses.' },
  { icon: '💳', title: 'Existing debts', body: 'Statements for any credit cards, personal loans, HECS / student debt, and BNPL accounts.' },
  { icon: '📄', title: 'Liabilities & assets', body: 'List of property, vehicles, super, investments — plus contracts for any other loans.' },
  { icon: '📋', title: 'Property docs', body: 'Contract of sale, council rates, and a valuation report (usually arranged by the lender).' },
  { icon: '🤝', title: 'Deposit evidence', body: 'Savings history, parental gift letter, or First Home Owner Grant approval if applicable.' },
];

const CREDIT_CARD_TYPICAL = [
  { icon: '🪪', title: 'Photo ID', body: 'Driver\'s licence or passport for identity verification.' },
  { icon: '💰', title: 'Proof of income', body: 'Recent payslips or tax assessment (PAYG); accountant letter or BAS (self-employed).' },
  { icon: '🏠', title: 'Address proof', body: 'Utility bill or bank statement showing your residential address.' },
  { icon: '💳', title: 'Existing credit', body: 'Statements for any current cards, loans, or BNPL so the lender can assess capacity.' },
  { icon: '📊', title: 'Living expenses', body: 'A rough monthly breakdown — rent or mortgage, groceries, utilities, transport.' },
];

// Regex-scan for document mentions in eligibility & additionalInformation
// free-text. We're being conservative — only surface obvious hits.
const DOC_KEYWORDS = [
  /passport/i, /driver'?s?\s+licen[sc]e/i, /payslip/i, /tax\s+return/i, /BAS/,
  /bank\s+statement/i, /utility\s+bill/i, /medicare/i, /\b100\s*point/i,
  /proof\s+of/i, /(income|address|identity|residence)\s+verification/i,
  /(contract|deed)\s+of\s+sale/i, /council\s+rates/i, /valuation/i,
];

const extractMentions = (product) => {
  const blobs = [];
  (product.eligibility || []).forEach((e) => {
    if (e?.additionalInfo) blobs.push(e.additionalInfo);
  });
  const ai = product.additionalInformation || product.raw?.additionalInformation;
  if (ai && typeof ai === 'object') {
    Object.values(ai).forEach((v) => { if (typeof v === 'string') blobs.push(v); });
  } else if (typeof ai === 'string') {
    blobs.push(ai);
  }

  const sentences = blobs.flatMap((b) => b.split(/[.\n]/).map((s) => s.trim()).filter(Boolean));
  const hits = [];
  for (const s of sentences) {
    if (DOC_KEYWORDS.some((re) => re.test(s))) {
      // De-dupe by lowercase normalised first 80 chars
      const key = s.toLowerCase().slice(0, 80);
      if (!hits.some((h) => h.key === key)) hits.push({ key, text: s });
    }
  }
  return hits.slice(0, 6);
};

export default function DocumentsPanel({ product, productType = 'home-loan', applicationUri }) {
  const fromBank = extractMentions(product);
  const checklist = productType === 'home-loan' ? HOME_LOAN_TYPICAL : CREDIT_CARD_TYPICAL;
  const label = productType === 'home-loan' ? 'home-loan' : 'credit-card';

  return (
    <div className="space-y-5">
      {/* What the bank publishes (if anything) */}
      {fromBank.length > 0 && (
        <section>
          <h3 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
            What {product.brandName || 'this lender'} mentions
          </h3>
          <ul className="space-y-1.5">
            {fromBank.map((h, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-baseline gap-2">
                <span className="text-blue-500">•</span>
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Curated typical checklist */}
      <section>
        <h3 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3">
          Typical {label} application documents
        </h3>
        <ul className="grid sm:grid-cols-2 gap-3">
          {checklist.map((d) => (
            <li key={d.title} className="bg-gray-50 rounded-lg p-3 flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">{d.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{d.title}</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug">{d.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
        <strong>This is general guidance.</strong> The lender's website is the authoritative source of what you'll need to provide.
        {applicationUri && (
          <>
            {' '}
            <a
              href={applicationUri}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:no-underline"
            >
              Check the lender's application page →
            </a>
          </>
        )}
      </div>
    </div>
  );
}
