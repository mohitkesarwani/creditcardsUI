import React from 'react';
import { Link } from 'react-router-dom';

function H2({ children }) {
  return <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h2>;
}

export default function HowWeMakeMoneyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">How we make money</h1>
      <p className="text-sm text-gray-500 mt-1">Last updated: 28 June 2026</p>

      <p className="mt-6 text-gray-700">
        We want to be transparent about how RewardRadar funds itself. There is no editorial
        slant or hidden ranking algorithm — here's exactly what's going on.
      </p>

      <H2>Referral commissions</H2>
      <p className="text-gray-700">
        Some credit-card issuers pay us a referral fee if you click an "Apply" link on our
        site and subsequently apply for and are approved for a card with that issuer.
        Commissions are paid per successful application and may be a flat fee or a small
        percentage of the first year's annual fee, depending on the agreement with each
        issuer.
      </p>

      <H2>What commissions do <em>not</em> change</H2>
      <ul className="list-disc pl-6 text-gray-700 space-y-1">
        <li>The cards we list. Every Australian issuer published in the public CDR register can appear in our results.</li>
        <li>The default ranking. Non-sponsored cards are ordered by the criteria you choose (annual fee, purchase rate, etc.). We never reorder cards in exchange for commission.</li>
        <li>The data we display. Rates, fees and features come from each issuer's public CDR feed, unchanged.</li>
      </ul>

      <H2>What "Sponsored" means</H2>
      <p className="text-gray-700">
        A small number of issuers pay for prominence. When a card is sponsored, it appears
        with a clearly labelled <span className="inline-block text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded align-middle">Sponsored</span> badge
        and is placed above non-sponsored cards in the default ordering. Sponsorship does
        not affect the data shown — only the placement and the badge.
      </p>

      <H2>What we do <em>not</em> do</H2>
      <ul className="list-disc pl-6 text-gray-700 space-y-1">
        <li>We do not accept payment to remove or hide cards from comparisons.</li>
        <li>We do not write editorial reviews or "Editor's pick" recommendations.</li>
        <li>We do not sell your personal information. See our{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">Privacy policy</Link>.</li>
      </ul>

      <H2>Independence</H2>
      <p className="text-gray-700">
        RewardRadar is independently owned and is not part of, nor affiliated with, any
        financial institution.
      </p>

      <Link to="/" className="inline-block mt-10 text-sm text-blue-600 hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
