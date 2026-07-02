import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CardKpis from './CardKpis.jsx';
import DealBadge from './DealBadge.jsx';
import supabase from '../supabaseClient.js';
import { useSelectedDeposits } from '../hooks/useSelectedDeposits.jsx';
import { topDepositTags, DEPOSIT_TAG_STYLES } from '../lib/depositTags.js';
import useReducedMotion from '../hooks/useReducedMotion.js';
import MagneticButton from './effects/MagneticButton.jsx';
import RippleButton from './effects/Ripple.jsx';

const FALLBACK_IMG = '/assets/image-not-available.svg';

const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v);

const fmtMoney = (n) =>
  Number.isFinite(n) ? (n === 0 ? '$0' : `$${Math.round(n).toLocaleString('en-AU')}`) : '—';

const headlineLabel = (kind) => {
  switch (kind) {
    case 'fixed': return 'Best rate';
    case 'bonus': return 'Bonus rate';
    case 'intro': return 'Intro rate';
    case 'base':  return 'Base rate';
    default:      return 'Rate';
  }
};

function DepositCard({ deposit, selectedTags = [] }) {
  const navigate = useNavigate();
  const { selected, toggleDeposit } = useSelectedDeposits();
  const isSelected = selected.some((d) => d.id === deposit.id);
  const cardRef = useRef(null);
  const reduced = useReducedMotion();

  // Pointer-tracked reveal-hover spotlight (Microsoft Fluent style). Sets
  // CSS variables so the gradient follows the cursor inside this card.
  const onPointerMove = (e) => {
    if (reduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--reveal-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--reveal-y', `${e.clientY - rect.top}px`);
  };
  const reachedLimit = !isSelected && selected.length >= 4;
  const tagObjects = deposit.tagObjects || [];
  const topTags = topDepositTags(tagObjects, 4, selectedTags);
  const issuer = deposit.brandName || deposit.brand || deposit.bank_name || 'Unknown';
  const applyHref = deposit.applicationUrl || deposit.application_uri;

  const handleApply = async () => {
    try {
      await supabase.from('referrals').insert({
        card_id: deposit.id,
        partner_id: deposit.partnerId,
        redirect_url: applyHref,
      });
    } catch { /* non-fatal */ }
  };

  const kpis = [
    {
      label: headlineLabel(deposit.headlineRateKind),
      value: dash(deposit.headlineRate),
      tooltip:
        deposit.headlineRateKind === 'fixed'
          ? 'Highest published FIXED rate across all terms / balance tiers.'
          : deposit.headlineRateKind === 'bonus'
          ? 'Bonus rate paid when monthly conditions are met.'
          : deposit.headlineRateKind === 'intro'
          ? 'Promotional rate for an introductory period.'
          : 'Base rate paid on the everyday balance.',
    },
    deposit.product_category === 'TERM_DEPOSIT'
      ? {
          label: 'Terms',
          value: dash(deposit.termRange),
          tooltip: 'Available term length range — shortest to longest published.',
        }
      : {
          label: 'Base rate',
          value: dash(deposit.baseRate),
          tooltip: 'Rate paid without meeting any bonus conditions.',
        },
    {
      label: 'Min deposit',
      value: fmtMoney(deposit.min_deposit_amount),
      tooltip: 'Minimum opening / qualifying balance.',
    },
    {
      label: 'Monthly fee',
      value:
        deposit.monthly_fee_amount === 0
          ? '$0'
          : deposit.monthly_fee_amount
          ? `$${deposit.monthly_fee_amount}`
          : '—',
      tooltip: 'Account-keeping fee, charged monthly.',
    },
  ];

  return (
    <article
      ref={cardRef}
      onPointerMove={onPointerMove}
      className="result-card reveal-card p-4 md:p-5"
      data-selected={isSelected}
      id={deposit.id}
    >
      <span aria-hidden="true" className="reveal-card__spotlight" />
      <div className="grid grid-cols-[88px_1fr] md:grid-cols-[112px_1fr_auto] gap-4 items-start">
        <button
          type="button"
          onClick={() => navigate(`/deposits/${deposit.id}`)}
          className="product-thumb bg-ink-50 rounded-lg p-2 flex items-center justify-center h-20 md:h-24 hover:bg-ink-100"
        >
          <img
            src={deposit.productImageUrl || FALLBACK_IMG}
            alt={deposit.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) e.currentTarget.src = FALLBACK_IMG;
            }}
          />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs text-gray-500 uppercase tracking-wide truncate">{issuer}</span>
            {deposit.is_sponsored && (
              <span
                title="This product appears here because the issuer paid for the placement. The data shown is identical to non-sponsored products."
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full"
              >
                <svg viewBox="0 0 8 8" className="w-1.5 h-1.5" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
                Sponsored
              </span>
            )}
            {deposit.deal && <DealBadge deal={deposit.deal} />}
          </div>
          <h3
            className="text-base md:text-lg font-semibold text-gray-900 leading-snug truncate cursor-pointer hover:text-blue-700"
            onClick={() => navigate(`/deposits/${deposit.id}`)}
            title={deposit.name}
          >
            {deposit.name}
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
                        : DEPOSIT_TAG_STYLES[t.category])
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

        <div className="hidden md:flex flex-col items-end gap-2">
          {applyHref && (
            <MagneticButton strength={6}>
              <RippleButton
                as="a"
                href={applyHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApply}
                title="You'll be taken to the issuer's own application. We may receive a referral fee — see How we make money."
                className="btn btn-primary text-sm whitespace-nowrap"
              >
                Open account
              </RippleButton>
            </MagneticButton>
          )}
          <button
            type="button"
            onClick={() => navigate(`/deposits/${deposit.id}`)}
            className="text-sm text-brand-700 hover:underline"
          >
            View details →
          </button>
          <span className="text-[10px] text-ink-500 text-right max-w-[140px] leading-tight">
            Click-out goes to issuer.{' '}
            <a href="/how-we-make-money" className="underline hover:text-ink-700">Referral fee disclosure</a>
          </span>
        </div>
      </div>

      <CardKpis cells={kpis} className="mt-4" />

      {/* Conditions-apply note next to time-sensitive bonus/intro rates.
          RG 234 expects conditions to be visible in the same view as the rate. */}
      {(deposit.headlineRateKind === 'bonus' || deposit.headlineRateKind === 'intro') && (
        <p className="text-[11px] text-ink-500 mt-2 leading-snug">
          <strong>Conditions apply</strong> — the {deposit.headlineRateKind === 'bonus' ? 'bonus' : 'introductory'} rate is paid only when you meet the issuer's monthly criteria.{' '}
          <button
            type="button"
            onClick={() => navigate(`/deposits/${deposit.id}`)}
            className="text-brand-700 hover:underline"
          >
            See full rate breakdown →
          </button>
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <label
          className={`flex items-center gap-2 text-sm select-none ${reachedLimit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            disabled={reachedLimit}
            onChange={() => toggleDeposit(deposit)}
            className="accent-blue-600 w-4 h-4"
          />
          <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>
            {isSelected ? 'Added to compare' : reachedLimit ? 'Compare full (4)' : 'Compare'}
          </span>
        </label>
        <div className="md:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/deposits/${deposit.id}`)}
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
              Open
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default DepositCard;
