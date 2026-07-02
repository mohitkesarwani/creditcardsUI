import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FAQAccordion from '../components/FAQAccordion';
import JsonLd, { faqPageSchema } from '../components/JsonLd.jsx';

// Questions researched against Canstar, Finder, RateCity and Mozo (AU
// comparison-site FAQs) — written in our own voice. Honest, no fluff,
// avoids financial advice.

const FAQ_ITEMS = [
  // ── About RewardRadar ───────────────────────────────────────────────────
  {
    category: 'About us',
    question: 'Is RewardRadar a bank, lender or financial adviser?',
    answer:
      'No. RewardRadar is an information and comparison tool. We don\'t hold an Australian Credit Licence and we don\'t provide personal financial advice. We list publicly available product data from Australian issuers so you can shortlist and compare options — you apply directly with the issuer.',
  },
  {
    category: 'About us',
    question: 'How do you make money?',
    answer:
      'We may receive a referral fee from some issuers when you click through and successfully open an account. The fee never affects which products we list, the order they appear in (except where "Sponsored" is clearly labelled), the data we display, or our willingness to show products from issuers who don\'t pay us. See How We Make Money for the full breakdown.',
  },
  {
    category: 'About us',
    question: 'Are you independent?',
    answer:
      'Yes. RewardRadar is independently owned and not affiliated with any bank, mutual or non-bank lender. Sponsored placements are clearly labelled with a "Sponsored" tag and don\'t change our product data. Our tag taxonomy, deal extraction and rate calculations run the same way for every issuer.',
  },

  // ── Our data ────────────────────────────────────────────────────────────
  {
    category: 'Our data',
    question: 'Where does your product data come from?',
    answer:
      'Every credit card, home loan and deposit on this site is sourced from the issuer\'s public Consumer Data Right (CDR) endpoint. CDR is the Australian Government\'s open-banking framework — all banks have been required to publish standardised product data since 1 July 2020. You\'re looking at the same machine-readable feed banks publish under federal regulation.',
  },
  {
    category: 'Our data',
    question: 'How often is data updated?',
    answer:
      'Product data is refreshed against the CDR feed on a rolling basis. Headline rates, fees and features may be up to 24 hours out of date by the time you see them. Rates — especially deposit and home-loan rates — can move daily. Always confirm the current number with the issuer on their own application page before deciding.',
  },
  {
    category: 'Our data',
    question: 'I can\'t find a product I know exists — why?',
    answer:
      'A few reasons it might be missing: (1) the issuer hasn\'t published it to their CDR feed yet, (2) their endpoint was down when we last fetched it, (3) the issuer\'s CDR participation isn\'t live — small mutuals are still being onboarded. If you spot a gap, send the product name and issuer via the Contact page and we\'ll check.',
  },
  {
    category: 'Our data',
    question: 'Why does the data sometimes show "—" instead of a number?',
    answer:
      'We deliberately don\'t fabricate numbers. When an issuer doesn\'t publish a field — annual fee, max LVR, comparison rate, bonus cap — we show "—". That\'s a CDR-data-quality issue, not a UI bug.',
  },

  // ── Comparing products ─────────────────────────────────────────────────
  {
    category: 'Understanding the numbers',
    question: 'What is a comparison rate?',
    answer:
      'A comparison rate combines the headline interest rate with standard fees and charges into a single percentage, so you can compare loans like for like. It\'s based on a standardised example loan ($150,000 over 25 years) and might not reflect what your actual loan costs — read the warning we show next to comparison rates wherever they appear.',
  },
  {
    category: 'Understanding the numbers',
    question: 'What is LVR?',
    answer:
      'Loan-to-Value Ratio — the loan amount divided by the property\'s value, as a percentage. A $400,000 loan on a $500,000 property is an 80% LVR. Lower LVRs usually unlock cheaper rates because the lender is taking less risk. LVRs above 80% often require Lenders Mortgage Insurance (LMI).',
  },
  {
    category: 'Understanding the numbers',
    question: 'What\'s the difference between base, bonus and intro rates on savings accounts?',
    answer:
      'The base rate is what you earn just for having the account. A bonus rate is added when you meet monthly conditions — typically a minimum deposit + no withdrawals. An introductory rate is a promotional rate paid for a fixed period (often 3–6 months) before reverting to the base rate. Our "headline" rate on savings cards shows whichever is highest — check the detail page for the conditions.',
  },
  {
    category: 'Understanding the numbers',
    question: 'Are your calculators accurate?',
    answer:
      'Our calculators are estimates only. The repayment estimator uses standard amortisation at a constant rate; the savings calculators assume monthly compounding. Neither models bonus-rate conditions, balance tiers, term-deposit early-withdrawal penalties, offset balances or extra repayments. For an exact number, use the issuer\'s own calculator or quote.',
  },

  // ── Applying ───────────────────────────────────────────────────────────
  {
    category: 'The application process',
    question: 'How do I apply for a product I\'ve shortlisted?',
    answer:
      'Click the green "Apply now" or "Open account" button on the product\'s row or detail page — it takes you straight to the issuer\'s own application page. RewardRadar never collects your personal or financial details for an application.',
  },
  {
    category: 'The application process',
    question: 'Will checking products on RewardRadar affect my credit score?',
    answer:
      'No. Browsing, filtering and comparing on RewardRadar is anonymous and has zero impact on your credit file. Only when the issuer runs a credit check during their own application can that show up on your file — and not every issuer does a hard pull.',
  },
  {
    category: 'The application process',
    question: 'Will I be approved?',
    answer:
      'That\'s entirely the issuer\'s decision. We can show you what each product publishes about its eligibility (residency, age, income, employment type) but the lender\'s own approval criteria — credit score, serviceability, existing debts — aren\'t in the CDR feed. Read the eligibility section on the detail page, and check the issuer\'s site for their borrowing-power calculator if they have one.',
  },

  // ── Privacy & legal ────────────────────────────────────────────────────
  {
    category: 'Privacy & legal',
    question: 'Is my information secure?',
    answer:
      'RewardRadar doesn\'t collect or store personal financial information — no income, no balances, no credit checks. Browse-side filters and selections are stored locally in your browser only. If you contact us, your message is held in standard support-system records — see our Privacy page.',
  },
  {
    category: 'Privacy & legal',
    question: 'Do you provide financial advice?',
    answer:
      'No. Nothing on RewardRadar is personal financial product advice. We don\'t know your circumstances, your goals or your risk tolerance. The information here is general only — before making a decision read each issuer\'s Product Disclosure Statement (PDS) and Target Market Determination (TMD), and consider speaking with a licensed financial adviser.',
  },
];

const CATEGORIES = ['About us', 'Our data', 'Understanding the numbers', 'The application process', 'Privacy & legal'];

function FaqPage() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((it) => {
      if (activeCat !== 'All' && it.category !== activeCat) return false;
      if (!q) return true;
      return (
        it.question.toLowerCase().includes(q) ||
        (typeof it.answer === 'string' && it.answer.toLowerCase().includes(q))
      );
    });
  }, [query, activeCat]);

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--surface-subtle))' }}>
      {/* FAQ schema → Google rich results + LLM-friendly Q&A structure */}
      <JsonLd id="schema-org-faqpage" schema={faqPageSchema(FAQ_ITEMS)} />
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Hero */}
        <header className="mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700 font-bold mb-2">Help centre</p>
          <h1 className="text-display-sm md:text-display font-bold text-ink-900 tracking-tighter-2 mb-3">
            Frequently asked questions
          </h1>
          <p className="text-lg text-ink-600 leading-relaxed max-w-2xl">
            Straight answers about how RewardRadar works, where our data comes from, what the
            numbers mean, and what happens after you click "Apply".
          </p>
        </header>

        {/* Search + categories */}
        <div className="surface p-4 md:p-5 mb-6 space-y-4">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCat('All')}
              data-active={activeCat === 'All'}
              className="filter-chip"
            >
              All <span className="text-xs opacity-70">({FAQ_ITEMS.length})</span>
            </button>
            {CATEGORIES.map((c) => {
              const count = FAQ_ITEMS.filter((it) => it.category === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCat(c)}
                  data-active={activeCat === c}
                  className="filter-chip"
                >
                  {c} <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question list */}
        {filtered.length === 0 ? (
          <div className="surface p-8 text-center">
            <p className="text-ink-600 mb-3">No questions match "{query}".</p>
            <button
              type="button"
              onClick={() => { setQuery(''); setActiveCat('All'); }}
              className="text-sm text-brand-700 hover:text-brand-800 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <FAQAccordion items={filtered} />
        )}

        {/* Still stuck */}
        <div className="mt-8 surface p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Still have a question?</h2>
            <p className="text-sm text-ink-600 mt-0.5">We aim to reply within 2 business days.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/contact" className="btn btn-primary">Contact us</Link>
            <Link to="/how-we-make-money" className="text-sm text-ink-600 hover:text-ink-900 hover:underline">
              How we make money →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
