import React from 'react';

// General Disclaimers component shown at the foot of substantive pages.
// Language follows the Australian general-advice template used by Canstar,
// Finder, RateCity et al. None of this constitutes financial product advice.

export const disclaimers = [
  {
    headline: 'General information only',
    body: 'The information on this website is general in nature. It does not take into account your objectives, financial situation or needs. It is not financial product advice and you should consider whether the information is appropriate for your circumstances before acting on it.',
  },
  {
    headline: 'Read the PDS and TMD before applying',
    body: 'Before applying for any credit card listed here, read the issuer\'s Product Disclosure Statement (PDS), Target Market Determination (TMD) and other product documentation available on the issuer\'s website. If you are unsure whether a product is suitable for you, speak with a licensed financial adviser.',
  },
  {
    headline: 'We may receive a referral fee',
    body: 'RewardRadar may receive a commission from some issuers when you apply for a card through links on this site. The fee does not change which cards we list, the order they appear in (other than where "Sponsored" is shown), or the data we present.',
  },
  {
    headline: 'Sources and accuracy',
    body: 'Product data is sourced from each issuer\'s public Consumer Data Right (CDR) endpoint and may be up to 24 hours out of date. Always confirm rates, fees and features with the issuer before you apply. We do not warrant the accuracy or completeness of any third-party data.',
  },
  {
    headline: 'Independence',
    body: 'RewardRadar is independently owned and not affiliated with any financial institution. Sponsored products are clearly labelled and do not affect editorial integrity.',
  },
];

function Disclaimers({ className = '' }) {
  return (
    <aside
      className={`bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-700 ${className}`.trim()}
      aria-labelledby="disclaimer-heading"
    >
      <h3
        id="disclaimer-heading"
        className="font-semibold flex items-center gap-2 mb-3 text-gray-800"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9a1 1 0 102 0V7a1 1 0 10-2 0v2zm0 4a1 1 0 102 0 1 1 0 00-2 0z"
            clipRule="evenodd"
          />
        </svg>
        Important information
      </h3>
      <ul className="space-y-3">
        {disclaimers.map((d) => (
          <li key={d.headline}>
            <p className="font-medium text-gray-800">{d.headline}</p>
            <p className="text-gray-600 leading-relaxed mt-0.5">{d.body}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Disclaimers;
