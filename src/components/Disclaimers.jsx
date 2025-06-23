import React from 'react';

export const disclaimers = [
  "The information provided on this site is of a general nature only and does not take into account your personal objectives, financial situation or needs. Consider whether the information is appropriate to your circumstances before making any financial decisions.",
  "Product information is current at the time of publication but may be subject to change. You should check the product issuer’s website before making any decision.",
  "RewardRadar may receive a commission when you apply for products through our links. However, this does not influence our comparisons or editorial content.",
  "All product details are sourced either directly from the provider or from publicly available information. We do not guarantee the accuracy of third-party data.",
  "RewardRadar is independently owned and not affiliated with any financial institution."
];

function Disclaimers({ className = '' }) {
  return (
    <div className={`text-xs text-gray-600 space-y-2 ${className}`.trim()}>
      {disclaimers.map((d, i) => (
        <p key={i}>{d}</p>
      ))}
    </div>
  );
}

export default Disclaimers;
