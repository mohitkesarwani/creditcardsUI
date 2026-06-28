import React from 'react';

// ASIC's required comparison-rate warning text for credit-product advertising
// that displays a comparison rate. Wording is intentionally near-verbatim.
//
// Show this anywhere a comparison_rate value appears (compare table, card
// detail page). It's small but legally meaningful.

export default function ComparisonRateWarning({ className = '' }) {
  return (
    <p
      role="note"
      className={`text-[11px] text-gray-500 leading-snug ${className}`.trim()}
    >
      <strong>Comparison rate warning:</strong> The comparison rate is true only
      for the examples given and may not include all fees and charges.
      Different terms, fees or other loan amounts might result in a different
      comparison rate.
    </p>
  );
}
