import React from 'react';

export const disclaimers = [
  "The information provided on this site is of a general nature only and does not take into account your personal objectives, financial situation or needs. Consider whether the information is appropriate to your circumstances before making any financial decisions.",
  "Product information is current at the time of publication but may be subject to change. You should check the product issuer’s website before making any decision.",
  "RewardRadar may receive a commission when you apply for products through our links. However, this does not influence our comparisons or editorial content.",
  "All product details are sourced either directly from the provider or from publicly available information. We do not guarantee the accuracy of third-party data.",
  "RewardRadar is independently owned and not affiliated with any financial institution.",
  "Rate data is updated daily based on publicly available sources and may have a delay of up to 24 hours."
];

function Disclaimers({ className = '' }) {
  return (
    <div
      className={`bg-gray-100 text-gray-600 text-sm rounded-xl px-6 py-4 ${className}`.trim()}
    >
      <div className="font-semibold flex items-center gap-2 mb-3">
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
        Important Information
      </div>
      <ul className="list-disc pl-5">
        {disclaimers.map((d, i) => {
          if (d.startsWith('RewardRadar may receive')) {
            const phrase = 'RewardRadar may receive a commission';
            const rest = d.replace(phrase, '');
            return (
              <li key={i} className="mb-2">
                <strong>{phrase}</strong>
                {rest}
              </li>
            );
          }
          return (
            <li key={i} className="mb-2">
              {d}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Disclaimers;
