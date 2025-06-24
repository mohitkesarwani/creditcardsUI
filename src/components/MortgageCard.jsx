import React from 'react';
import { formatMoney, formatPercent, getTagColor } from '../utils.js';

function MortgageCard({ mortgage, highlightTags = [] }) {
  const rate = mortgage.lendingRates?.[0]?.rate;
  const comparisonRate = mortgage.lendingRates?.[0]?.comparisonRate;
  const fees = mortgage.feesAndPricing?.fees || [];
  const tags = mortgage.features?.map(f => f.featureType) || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col" data-testid="mortgage-card">
      {mortgage.cardArt?.imageUri ? (
        <img src={mortgage.cardArt.imageUri} alt="" className="mb-2 rounded" />
      ) : (
        <div className="h-12 mb-2 rounded bg-gradient-to-r from-brand-start to-brand-end text-white flex items-center justify-center font-semibold">
          {mortgage.bankName || mortgage.brandName}
        </div>
      )}
      <h3 className="font-bold mb-1">{mortgage.name}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        {rate && (
          <span>
            <span className="font-semibold">Rate:</span> {formatPercent(rate)}
          </span>
        )}
        {comparisonRate && (
          <span>
            <span className="font-semibold">Comparison:</span> {formatPercent(comparisonRate)}
          </span>
        )}
        {fees.map(f => (
          <span key={f.name} className="flex items-center gap-1" data-testid={`fee-${f.name.toLowerCase().replace(/\s+/g,'-')}`}> 
            <span className="font-semibold">{f.name}:</span> {formatMoney(f.amount)}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map(t => (
          <span key={t} className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)} ${highlightTags.includes(t) ? 'ring-2 ring-brand-start' : ''}`} data-testid={`tag-${t.toLowerCase().replace(/\s+/g,'-')}`}>{t}</span>
        ))}
      </div>
      <a href={mortgage.applicationUri} target="_blank" rel="noopener noreferrer" className="mt-auto btn btn-primary text-center text-sm">Apply Now</a>
    </div>
  );
}

export default MortgageCard;
