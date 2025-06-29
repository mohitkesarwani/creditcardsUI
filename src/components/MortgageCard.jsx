import React from 'react';
import {
  formatMoney,
  formatPercent,
  getTagColor,
  getMortgageFeatureTags,
} from '../utils.js';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';

function MortgageCard({ mortgage, highlightTags = [] }) {
  const rate = mortgage.lendingRates?.[0]?.rate;
  const comparisonRate = mortgage.lendingRates?.[0]?.comparisonRate;
  const fees = mortgage.feesAndPricing?.fees || [];
  const tags = getMortgageFeatureTags(mortgage);
  const { selected, toggleMortgage } = useSelectedMortgages();
  const isSelected = selected.some((m) => m.id === mortgage.id);

  return (
    <div
      className="card-tile relative transition transform hover:-translate-y-1 hover:shadow-lg hover:scale-105 flex flex-col fade-in"
      data-testid="mortgage-card"
    >
      {mortgage.cardArt?.imageUri ? (
        <img src={mortgage.cardArt.imageUri} alt="" className="mb-2 rounded" />
      ) : (
        <div className="h-12 mb-2 rounded bg-gradient-to-r from-accent to-accent/80 text-white flex items-center justify-center font-semibold">
          {mortgage.bankName || mortgage.brandName}
        </div>
      )}
      <h3 className="card-title mb-1">{mortgage.name}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
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
          <span key={t} className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)} ${highlightTags.includes(t) ? 'ring-2 ring-accent' : ''}`} data-testid={`tag-${t.toLowerCase().replace(/\s+/g,'-')}`}>{t}</span>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {isSelected ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </span>
            <button onClick={() => toggleMortgage(mortgage)} className="text-xs text-accent underline">
              Deselect
            </button>
          </div>
        ) : (
          <button onClick={() => toggleMortgage(mortgage)} className="text-sm border border-accent text-accent rounded-md px-3 py-1 hover:bg-accent/10 transition flex-1">
            Compare
          </button>
        )}
        <a href={mortgage.applicationUri} target="_blank" rel="noopener noreferrer" className="text-sm border border-accent text-accent rounded-md px-3 py-1 hover:bg-accent/10 transition flex-1 text-center">
          Apply
        </a>
      </div>
    </div>
  );
}

export default MortgageCard;
