import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatMoney,
  formatPercent,
  getMortgageFeatureTags,
} from '../utils.js';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import SocialStats from './SocialStats.tsx';
import useEngagement from '../hooks/useEngagement.ts';
import FeatureTags from './FeatureTags.tsx';
import ActionButtons from './ActionButtons.tsx';

function MortgageCard({ mortgage, highlightTags = [] }) {
  const navigate = useNavigate();
  const rate = mortgage.lendingRates?.[0]?.rate;
  const comparisonRate = mortgage.lendingRates?.[0]?.comparisonRate;
  const fees = mortgage.feesAndPricing?.fees || [];
  const tags = getMortgageFeatureTags(mortgage);
  const { selected, toggleMortgage } = useSelectedMortgages();
  const isSelected = selected.some((m) => m.id === mortgage.id);
  const { data: engagement, isLoading: engagementLoading, like, share } = useEngagement(mortgage.id);

  return (
    <div
      id={mortgage.id}
      className="relative flex flex-col bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-h-[460px] hover:shadow-md hover:scale-[1.01] transition"
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
      <p className="text-xs text-gray-500 mb-1 leading-snug">{mortgage.bankName || mortgage.brandName}</p>
      <h3 className="card-title mb-2 font-semibold leading-snug">{mortgage.name}</h3>
      <div className="grid gap-1 mb-2 text-sm leading-relaxed">
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
      <FeatureTags tags={tags} highlightTags={highlightTags} className="mb-3" />
      <div className="mt-auto">
        {isSelected && (
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </span>
            <button onClick={() => toggleMortgage(mortgage)} className="text-xs text-accent underline" aria-label="Deselect loan">
              Deselect
            </button>
          </div>
        )}
        <ActionButtons
          showCompare={!isSelected}
          onCompare={() => toggleMortgage(mortgage)}
          onDetails={() => navigate(`/home-loans/${mortgage.id}`)}
          applyHref={mortgage.applicationUri}
        />
      </div>
      <SocialStats
        likes={engagement?.likes ?? 0}
        comments={engagement?.comments ?? 0}
        shares={engagement?.shares ?? 0}
        rating={engagement?.rating ?? 0}
        loading={engagementLoading && !engagement}
        onLike={() => like.mutate()}
        onShare={() => share.mutate()}
      />
    </div>
  );
}

export default MortgageCard;
