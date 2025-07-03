import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatMoney,
  formatPercent,
  getMortgageFeatureTags,
} from '../utils.js';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';

function MortgageCard({ mortgage, highlightTags = [] }) {
  const navigate = useNavigate();
  const rate = mortgage.lendingRates?.[0]?.rate;
  const comparisonRate = mortgage.lendingRates?.[0]?.comparisonRate;
  const fees = mortgage.feesAndPricing?.fees || [];
  const tags = getMortgageFeatureTags(mortgage);
  const { selected, toggleMortgage } = useSelectedMortgages();
  const isSelected = selected.some((m) => m.id === mortgage.id);

  return (
    <div
      className="relative flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 min-h-[420px] hover:shadow-md transition"
      data-testid="mortgage-card"
    >
      <img
        src={mortgage.cardArt?.imageUri || '/assets/image-not-available.svg'}
        alt={mortgage.bankName || mortgage.brandName}
        className="w-full h-20 object-contain mb-2"
        onError={(e) => {
          if (e.currentTarget.src !== '/assets/image-not-available.svg') {
            e.currentTarget.src = '/assets/image-not-available.svg';
          }
        }}
      />
      <p className="text-xs text-gray-500 mb-1">{mortgage.bankName || mortgage.brandName}</p>
      <h3 className="card-title mb-2">{mortgage.name}</h3>
      <div className="grid gap-1 mb-2 text-sm">
        {rate && (
          <p className="card-subtext">
            <span className="font-bold">Interest Rate:</span> {formatPercent(rate)}
          </p>
        )}
        {comparisonRate && (
          <p className="card-subtext">
            <span className="font-bold">Comparison Rate:</span> {formatPercent(comparisonRate)}
          </p>
        )}
        {fees.map((f) => (
          <p
            key={f.name}
            className="card-subtext flex items-center gap-1"
            data-testid={`fee-${f.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span className="font-bold">{f.name}:</span> {formatMoney(f.amount)}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => {
          const match = highlightTags.includes(t);
          return (
            <span
              key={t}
              data-testid={`tag-${t.toLowerCase().replace(/\s+/g, '-')}`}
              className={`inline-flex items-center text-xs px-2 rounded-full ${match ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
            >
              {t}
            </span>
          );
        })}
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
          <button
            onClick={() => toggleMortgage(mortgage)}
            className="text-sm border rounded px-4 py-2 hover:bg-gray-100 flex-1"
          >
            Compare
          </button>
        )}
        <button
          onClick={() => navigate(`/home-loans/${mortgage.id}`)}
          className="text-sm border rounded px-4 py-2 hover:bg-gray-100 flex-1"
        >
          Details
        </button>
      </div>
      <a
        href={mortgage.applicationUri}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-semibold w-full flex items-center justify-center gap-1"
      >
        Apply Now
      </a>
    </div>
  );
}

export default MortgageCard;
