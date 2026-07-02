import React from 'react';
import { Link } from 'react-router-dom';

// Our Principles page. Codifies the brand voice and the trust commitments
// that make RewardRadar distinct from incumbents. The defensive purpose:
// these are public, time-stamped promises that competitors can't credibly
// copy without changing their own business model.

const COMMITMENTS = [
  {
    icon: '✓',
    title: 'We list every issuer the CDR feed publishes',
    body:
      'Not just the ones who pay us. As long as a bank or non-bank lender publishes their products via the Consumer Data Right feed, they appear in our results. Affiliate relationships influence display order via a clearly labelled "Sponsored" tag — never inclusion.',
  },
  {
    icon: '✓',
    title: 'Sponsored placements are always labelled — visibly',
    body:
      'When we activate sponsored placements (Month 4 onwards), every paid placement carries a bold "Sponsored" pill, the same visual prominence as any other product label. No "featured" or "promoted" without the label.',
  },
  {
    icon: '✓',
    title: 'No sign-up to compare',
    body:
      'You can browse, filter, shortlist and compare without giving us an email address, phone number or any personal information. No paywall, no "create a free account to see rates" prompt.',
  },
  {
    icon: '✓',
    title: 'No personal financial information collected',
    body:
      'We never ask for your income, balances, account numbers, or credit history. We don\'t run credit checks. Filtering and comparison happens entirely in your browser.',
  },
  {
    icon: '✓',
    title: 'Honest about gaps',
    body:
      'When an issuer doesn\'t publish a field in their CDR feed — a comparison rate, an LVR cap, a bonus condition — we show "—" rather than guess or scrape from somewhere else. We\'d rather be honest about the gap.',
  },
  {
    icon: '✓',
    title: '"Conditions apply" when conditions apply',
    body:
      'Bonus and introductory rates always carry a visible "Conditions apply" note linking to the full breakdown. We don\'t lead with a headline number you can\'t actually earn.',
  },
  {
    icon: '✗',
    title: 'No editorial picks, no "best for you"',
    body:
      'We don\'t publish "Best credit card 2026" articles or wizards that recommend a single product. Our tools return all matching options, sorted by criteria you choose — never a single editorial pick that conveniently happens to pay us the most.',
  },
  {
    icon: '✗',
    title: 'No email harvesting, no marketing follow-ups',
    body:
      'If you submit the contact form, we use your details to reply and then file the conversation. We don\'t add you to a mailing list. We don\'t send "your rate alerts" emails unless you explicitly opt in (we haven\'t built that feature yet).',
  },
  {
    icon: '✗',
    title: 'No high-pressure tactics',
    body:
      'No countdown timers. No fake scarcity ("3 people viewing this card right now"). No popups asking you to "wait, don\'t leave!". The Apply button waits for you to be ready.',
  },
  {
    icon: '✗',
    title: 'No selling user data',
    body:
      'Ever. Our revenue model is referral commissions and (later) clearly labelled sponsored placements — not selling data about who looked at what.',
  },
];

export default function PrinciplesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--surface-subtle))' }}>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.16em] text-brand-700 font-bold mb-2">Our principles</p>
        <h1 className="text-display-sm md:text-display font-bold text-ink-900 tracking-tighter-2 mb-3">
          The promises that hold even when they cost us money.
        </h1>
        <p className="text-lg text-ink-600 leading-relaxed mb-2">
          Comparison sites have a long history of quietly drifting toward the highest-paying
          partners. Here's what we'll do and what we won't, written down publicly so the drift
          is visible if it happens.
        </p>
        <p className="text-sm text-ink-500">Published 28 June 2026. We'll add changes to this page with dated notes, not silently rewrite history.</p>

        <div className="mt-10 space-y-4">
          {COMMITMENTS.map((c, i) => (
            <div key={i} className="surface p-5 flex items-start gap-4">
              <span
                className={
                  'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold ' +
                  (c.icon === '✓'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700')
                }
                aria-hidden="true"
              >
                {c.icon}
              </span>
              <div>
                <h2 className="text-base md:text-lg font-bold text-ink-900">{c.title}</h2>
                <p className="text-sm md:text-base text-ink-700 leading-relaxed mt-1">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 surface p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink-900">Caught us drifting?</h3>
            <p className="text-sm text-ink-600 mt-0.5">Tell us. We commit to publishing the complaint and our response.</p>
          </div>
          <Link to="/contact" className="btn btn-primary text-sm">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
