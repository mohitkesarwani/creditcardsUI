import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCreditCard } from '../api/creditCards';
import { useSelectedCards } from '../hooks/useSelectedCards.jsx';
import supabase from '../supabaseClient.js';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import Tabs from '../components/detail/Tabs.jsx';
import RatesBreakdown from '../components/detail/RatesBreakdown.jsx';
import FeesBreakdown from '../components/detail/FeesBreakdown.jsx';
import FeaturesGrid from '../components/detail/FeaturesGrid.jsx';
import YearlyCostCalculator from '../components/detail/YearlyCostCalculator.jsx';
import DocumentsPanel from '../components/detail/DocumentsPanel.jsx';
import ComparisonRateWarning from '../components/ComparisonRateWarning.jsx';
import { formatMoneyWhole } from '../utils.js';
import { TAG_STYLES } from '../lib/cardTags.js';

const FALLBACK_IMG = '/assets/image-not-available.svg';

const displayFee = (card) => {
  const n = card.annualFeeNumber;
  if (n === 0) return '$0';
  if (n !== null && n !== undefined) return formatMoneyWhole(n);
  if (card.annualFee) return card.annualFee;
  return '—';
};
const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v);

function Kpi({ label, value, tone }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 leading-tight">{label}</p>
      <p className={`text-lg md:text-xl font-bold leading-tight tabular-nums ${tone || 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function CardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selected, toggleCard } = useSelectedCards();
  const isSelected = card && selected.some((c) => c.id === card.id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCreditCard(id);
        if (!cancelled) setCard(data);
      } catch {
        if (!cancelled) setError('Failed to load card.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!card) return;
    document.title = `${card.name} · RewardRadar`;
  }, [card]);

  const handleApply = async () => {
    if (!card) return;
    try {
      await supabase.from('referrals').insert({
        card_id: card.id,
        partner_id: card.partnerId,
        redirect_url: card.applicationUrl || card.applicationUri,
      });
    } catch {/* non-fatal */}
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 md:px-8 py-8"><LoaderSkeleton rows={6} /></div>;
  }
  if (error || !card) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <p className="text-gray-600 mb-4">{error || 'Card not found.'}</p>
        <Link to="/credit-cards" className="text-blue-600 hover:underline">Back to all cards</Link>
      </div>
    );
  }

  const issuer = card.brandName || card.brand || card.bank_name || 'Unknown';
  const tagObjects = card.tagObjects || [];
  const spendingTags = tagObjects.filter((t) => t.category === 'spending');
  const typeTags     = tagObjects.filter((t) => t.category === 'type');
  const applyHref = card.applicationUrl || card.applicationUri;

  const ratesTab = {
    id: 'rates',
    label: 'Rates',
    badge: (card.lendingRates || []).length || null,
    render: () => (
      <>
        <RatesBreakdown rates={card.lendingRates} />
        {card.comparisonRate && <ComparisonRateWarning className="mt-3" />}
      </>
    ),
  };
  const feesTab = {
    id: 'fees',
    label: 'Fees',
    badge: (card.fees || []).length || null,
    render: () => <FeesBreakdown fees={card.fees} />,
  };
  const featuresTab = {
    id: 'features',
    label: 'Features',
    badge: (card.features || []).length || null,
    render: () => <FeaturesGrid features={card.features} />,
  };
  const docsTab = {
    id: 'docs',
    label: 'Documents',
    render: () => <DocumentsPanel product={card} productType="credit-card" applicationUri={applyHref} />,
  };

  // Single-screen dashboard layout — no scrolling needed for the primary flow.
  // Mobile: stacks, calculator above tabs.
  // Desktop: 2-col body (calculator left, tabs right), each scrolls internally.
  return (
    <div className="md:h-[calc(100vh-3.5rem)] md:overflow-hidden flex flex-col" style={{ background: 'rgb(var(--surface-subtle))' }}>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-3 md:py-4 flex flex-col flex-1 min-h-0">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-2">
          <Link to="/credit-cards" className="hover:text-gray-700">All credit cards</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{card.name}</span>
        </nav>

        {/* ─── Compact hero ───────────────────────────────────────────── */}
        <header className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex-shrink-0">
          <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr_auto] gap-4 items-center">
            <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center h-16 md:h-20">
              <img
                src={card.productImageUrl || card.cardArt?.[0]?.imageUri || FALLBACK_IMG}
                alt={card.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) e.currentTarget.src = FALLBACK_IMG; }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">{issuer}</span>
                {card.isSponsored && (
                  <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Sponsored</span>
                )}
              </div>
              <h1 className="text-base md:text-xl font-semibold text-gray-900 leading-tight truncate" title={card.name}>{card.name}</h1>
              <div className="hidden md:flex flex-wrap gap-1.5 mt-1.5">
                {spendingTags.length > 0 && (
                  <>
                    <span className="text-[10px] uppercase tracking-wide text-gray-400 self-center mr-0.5">Best for</span>
                    {spendingTags.slice(0, 3).map((t) => (
                      <span key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_STYLES.spending}`}>
                        {t.label}
                      </span>
                    ))}
                  </>
                )}
                {typeTags.length > 0 && (
                  <>
                    {spendingTags.length > 0 && <span className="text-gray-300">·</span>}
                    {typeTags.slice(0, 3).map((t) => (
                      <span key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_STYLES.type}`}>
                        {t.label}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 col-start-3">
              {applyHref && (
                <a href={applyHref} target="_blank" rel="noopener noreferrer" onClick={handleApply}
                   className="btn btn-primary text-sm whitespace-nowrap">Apply now</a>
              )}
              <button type="button" onClick={() => toggleCard(card)}
                      className="btn btn-outline text-sm whitespace-nowrap">
                {isSelected ? '✓ Compare' : 'Compare'}
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3 md:gap-6 mt-3 pt-3 border-t border-gray-100">
            <Kpi label="Annual fee"    value={displayFee(card)} />
            <Kpi label="Purchase rate" value={dash(card.interestRate)} />
            <Kpi label="Comparison"    value={dash(card.comparisonRate)} />
            <Kpi label="Interest-free" value={dash(card.interestFree)} />
          </div>
        </header>

        {/* ─── Body: 2 columns, each scrolls inside its own pane ─────── */}
        <div className="grid md:grid-cols-[340px_1fr] gap-4 flex-1 min-h-0">
          {/* Left: interactive calculator (always visible) */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:overflow-y-auto">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
              How you'll use this card
            </h2>
            <p className="text-xs text-gray-600 mb-3">
              Tick what applies — we'll sum the fees this card actually charges.
            </p>
            <YearlyCostCalculator card={card} />
          </div>

          {/* Right: tabbed long-form content */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 min-h-0 flex flex-col">
            <Tabs
              tabs={[ratesTab, feesTab, featuresTab, docsTab]}
              defaultId="rates"
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button type="button" onClick={() => toggleCard(card)}
                className="btn btn-outline text-sm flex-1">
          {isSelected ? '✓ Compare' : 'Compare'}
        </button>
        {applyHref && (
          <a href={applyHref} target="_blank" rel="noopener noreferrer" onClick={handleApply}
             className="btn btn-primary text-sm flex-[2] text-center">Apply now</a>
        )}
      </div>
    </div>
  );
}

export default CardDetailPage;
