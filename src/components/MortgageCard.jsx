import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardKpis from './CardKpis.jsx';
import DealBadge from './DealBadge.jsx';
import supabase from '../supabaseClient.js';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import { topHomeLoanTags, HOME_LOAN_TAG_STYLES } from '../lib/homeLoanTags.js';

const FALLBACK_IMG = '/assets/image-not-available.svg';

const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v);

function MortgageCard({ mortgage, selectedTags = [] }) {
  const navigate = useNavigate();
  const { selected, toggleMortgage } = useSelectedMortgages();
  const isSelected = selected.some((m) => m.id === mortgage.id);
  const reachedLimit = !isSelected && selected.length >= 3;
  const tagObjects = mortgage.tagObjects || [];
  const topTags = topHomeLoanTags(tagObjects, 4, selectedTags);
  const issuer = mortgage.brandName || mortgage.brand || mortgage.bank_name || 'Unknown';
  const applyHref = mortgage.applicationUrl || mortgage.application_uri;

  const handleApply = async () => {
    try {
      await supabase.from('referrals').insert({
        card_id: mortgage.id,
        partner_id: mortgage.partnerId,
        redirect_url: applyHref,
      });
    } catch { /* non-fatal */ }
  };

  // Headline rate: variable owner-occupied preferred, else fixed.
  const headline = mortgage.headlineRate || mortgage.variableRateOwner || mortgage.fixedRateOwner;
  const kind = mortgage.headlineRateKind ||
    (mortgage.variableRateOwner ? 'variable' : mortgage.fixedRateOwner ? 'fixed' : null);

  const kpis = [
    {
      label: kind === 'fixed' ? 'Fixed rate' : 'Variable rate',
      value: dash(headline),
      tooltip: 'Headline rate for owner-occupied principal-and-interest borrowers.',
    },
    {
      label: 'Comparison',
      value: dash(mortgage.comparisonRate),
      tooltip: 'Rate including standard fees — for apples-to-apples comparison.',
    },
    {
      label: 'Max LVR',
      value: dash(mortgage.maxLvr),
      tooltip: 'Maximum loan-to-value ratio the issuer offers on this product.',
    },
    {
      label: 'Annual fee',
      value: mortgage.annual_fee_amount !== null && mortgage.annual_fee_amount !== undefined
        ? `$${Math.round(mortgage.annual_fee_amount)}`
        : '—',
      tooltip: 'Package or annual service fee.',
    },
  ];

  return (
    <article className="result-card p-4 md:p-5" data-selected={isSelected} id={mortgage.id}>
      <div className="grid grid-cols-[88px_1fr] md:grid-cols-[112px_1fr_auto] gap-4 items-start">
        <button
          type="button"
          onClick={() => navigate(`/home-loans/${mortgage.id}`)}
          className="bg-gray-50 rounded-lg p-2 flex items-center justify-center h-20 md:h-24 hover:bg-gray-100 transition-colors"
        >
          <img
            src={mortgage.productImageUrl || FALLBACK_IMG}
            alt={mortgage.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) e.currentTarget.src = FALLBACK_IMG;
            }}
          />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs text-gray-500 uppercase tracking-wide truncate">{issuer}</span>
            {mortgage.is_sponsored && (
              <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                Sponsored
              </span>
            )}
            {mortgage.deal && <DealBadge deal={mortgage.deal} />}
          </div>
          <h3
            className="text-base md:text-lg font-semibold text-gray-900 leading-snug truncate cursor-pointer hover:text-blue-700"
            onClick={() => navigate(`/home-loans/${mortgage.id}`)}
            title={mortgage.name}
          >
            {mortgage.name}
          </h3>
          {topTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {topTags.map((t) => {
                const highlight = selectedTags.includes(t.label);
                return (
                  <span
                    key={t.id}
                    className={
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ' +
                      (highlight
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : HOME_LOAN_TAG_STYLES[t.category])
                    }
                    title={`${t.label} · ${t.category}`}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Apply CTA — desktop */}
        <div className="hidden md:flex flex-col items-end gap-2">
          {applyHref && (
            <a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApply}
              className="btn btn-primary text-sm whitespace-nowrap"
            >
              Apply now
            </a>
          )}
          <button
            type="button"
            onClick={() => navigate(`/home-loans/${mortgage.id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            View details →
          </button>
        </div>
      </div>

      <CardKpis cells={kpis} className="mt-4" />

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <label
          className={`flex items-center gap-2 text-sm select-none ${reachedLimit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            disabled={reachedLimit}
            onChange={() => toggleMortgage(mortgage)}
            className="accent-blue-600 w-4 h-4"
          />
          <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>
            {isSelected ? 'Added to compare' : reachedLimit ? 'Compare full (3)' : 'Compare'}
          </span>
        </label>
        <div className="md:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/home-loans/${mortgage.id}`)}
            className="text-sm text-blue-600"
          >
            Details
          </button>
          {applyHref && (
            <a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApply}
              className="btn btn-primary text-sm"
            >
              Apply
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default MortgageCard;
