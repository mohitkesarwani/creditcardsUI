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
    <div className={`disclaimer-box ${className}`.trim()}>
      <div className="font-semibold flex items-center gap-1 mb-1">
        <span>ⓘ</span> Important Information
      </div>
      <ul className="list-disc ml-4 space-y-1">
        {disclaimers.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

export default Disclaimers;
