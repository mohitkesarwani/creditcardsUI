import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchDeposit } from '../api/deposits';
import { useSelectedDeposits } from '../hooks/useSelectedDeposits.jsx';
import supabase from '../supabaseClient.js';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import Tabs from '../components/detail/Tabs.jsx';
import FeesBreakdown from '../components/detail/FeesBreakdown.jsx';
import FeaturesGrid from '../components/detail/FeaturesGrid.jsx';
import InterestEarnedCalculator from '../components/detail/InterestEarnedCalculator.jsx';
import SavingsGoalCalculator from '../components/detail/SavingsGoalCalculator.jsx';
import { formatPercent } from '../utils.js';

const FALLBACK_IMG = '/assets/image-not-available.svg';

function Kpi({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 leading-tight">{label}</p>
      <p className="text-lg md:text-xl font-bold leading-tight text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

function categoryLabel(c) {
  switch (c) {
    case 'TERM_DEPOSIT': return 'Term deposit';
    case 'SAVINGS':      return 'Savings account';
    case 'TRANSACTION':  return 'Everyday account';
    default:             return '';
  }
}

function termRangeLabel(d) {
  if (!Number.isFinite(d.min_term_days) || !Number.isFinite(d.max_term_days)) return '—';
  const f = (n) => (n < 30 ? `${n} d` : n < 365 ? `${Math.round(n / 30)} mo` : `${(n / 365).toFixed(n % 365 === 0 ? 0 : 1)} yr`);
  return d.min_term_days === d.max_term_days ? f(d.min_term_days) : `${f(d.min_term_days)} – ${f(d.max_term_days)}`;
}

function DepositRatesBreakdown({ rates }) {
  if (!rates?.length) return <p className="text-sm text-gray-500">No deposit-rate detail published.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
          <tr>
            <th className="py-2 pr-3">Type</th>
            <th className="py-2 pr-3">Rate</th>
            <th className="py-2 pr-3">Term / cadence</th>
            <th className="py-2 pr-3">Tier (balance)</th>
            <th className="py-2 pr-3">Conditions</th>
          </tr>
        </thead>
        <tbody>
          {rates.flatMap((r, i) => {
            const baseRows = (r.tiers && r.tiers.length ? r.tiers : [null]).map((t, j) => {
              const tierLabel = t
                ? (t.unitOfMeasure === 'DOLLAR'
                    ? `$${Number(t.minimumValue || 0).toLocaleString()}${t.maximumValue ? '–$' + Number(t.maximumValue).toLocaleString() : '+'}`
                    : `${t.minimumValue || ''}${t.maximumValue ? '–' + t.maximumValue : ''} ${t.unitOfMeasure || ''}`)
                : '—';
              const conds = (r.applicabilityConditions || []).map((c) => c.additionalInfo).filter(Boolean).join(' · ');
              return (
                <tr key={`${i}-${j}`} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-3 font-medium text-gray-700">{r.depositRateType}</td>
                  <td className="py-2 pr-3 tabular-nums text-gray-900">{formatPercent(Number(r.rate))}</td>
                  <td className="py-2 pr-3 text-gray-700">{r.applicationFrequency || '—'}</td>
                  <td className="py-2 pr-3 text-gray-700 tabular-nums">{tierLabel}</td>
                  <td className="py-2 pr-3 text-gray-600 leading-snug">{conds || '—'}</td>
                </tr>
              );
            });
            return baseRows;
          })}
        </tbody>
      </table>
    </div>
  );
}

function DepositDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftTab, setLeftTab] = useState('interest');
  const { selected, toggleDeposit } = useSelectedDeposits();
  const isSelected = deposit && selected.some((d) => d.id === deposit.id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDeposit(id);
        if (!cancelled) setDeposit(data);
      } catch {
        if (!cancelled) setError('Failed to load deposit.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!deposit) return;
    document.title = `${deposit.name} · RewardRadar`;
  }, [deposit]);

  const handleApply = async () => {
    if (!deposit) return;
    try {
      await supabase.from('referrals').insert({
        card_id: deposit.id,
        partner_id: deposit.partnerId,
        redirect_url: deposit.applicationUrl || deposit.application_uri,
      });
    } catch {/* non-fatal */}
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 md:px-8 py-8"><LoaderSkeleton rows={6} /></div>;
  if (error || !deposit) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <p className="text-gray-600 mb-4">{error || 'Deposit not found.'}</p>
        <Link to="/deposits" className="text-blue-600 hover:underline">Back to all deposits</Link>
      </div>
    );
  }

  const issuer = deposit.brandName || deposit.brand || deposit.bank_name || 'Unknown';
  const applyHref = deposit.applicationUrl || deposit.application_uri;

  // Headline KPI varies by category and by which rate is actually present.
  const isTerm = deposit.product_category === 'TERM_DEPOSIT';
  const headlineKindLabel = (() => {
    switch (deposit.headlineRateKind) {
      case 'fixed': return 'Best rate';
      case 'bonus': return 'Bonus rate';
      case 'intro': return 'Intro rate';
      case 'base':  return 'Base rate';
      default:      return 'Rate';
    }
  })();

  const kpiCells = [
    {
      label: headlineKindLabel,
      value: deposit.headlineRate || '—',
    },
    isTerm
      ? { label: 'Terms', value: termRangeLabel(deposit) }
      : { label: 'Base rate', value: deposit.baseRate || '—' },
    {
      label: 'Min deposit',
      value:
        Number.isFinite(deposit.min_deposit_amount)
          ? `$${Math.round(deposit.min_deposit_amount).toLocaleString('en-AU')}`
          : '—',
    },
    {
      label: 'Monthly fee',
      value:
        deposit.monthly_fee_amount === 0
          ? '$0'
          : Number.isFinite(deposit.monthly_fee_amount)
          ? `$${deposit.monthly_fee_amount}`
          : '—',
    },
  ];

  const ratesTab = {
    id: 'rates',
    label: 'Rates',
    badge: (deposit.deposit_rates || []).length || null,
    render: () => <DepositRatesBreakdown rates={deposit.deposit_rates} />,
  };
  const feesTab = {
    id: 'fees',
    label: 'Fees',
    badge: (deposit.fees || []).length || null,
    render: () => <FeesBreakdown fees={deposit.fees} />,
  };
  const featuresTab = {
    id: 'features',
    label: 'Features',
    badge: (deposit.features || []).length || null,
    render: () => <FeaturesGrid features={deposit.features} />,
  };
  const overviewTab = {
    id: 'overview',
    label: 'Overview',
    render: () => (
      <div className="space-y-4 text-sm text-gray-800">
        <p className="text-gray-700 leading-relaxed">{deposit.description || 'No description published.'}</p>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><dt className="text-xs uppercase text-gray-500">Bonus rate</dt><dd className="font-medium">{deposit.bonusRate || '—'}</dd></div>
          <div><dt className="text-xs uppercase text-gray-500">Intro rate</dt><dd className="font-medium">{deposit.introRate || '—'}</dd></div>
          <div><dt className="text-xs uppercase text-gray-500">Intro period</dt><dd className="font-medium">{deposit.intro_period_months ? `${deposit.intro_period_months} mo` : '—'}</dd></div>
          <div><dt className="text-xs uppercase text-gray-500">Bonus balance cap</dt><dd className="font-medium">{Number.isFinite(deposit.bonus_max_balance) ? `$${Math.round(deposit.bonus_max_balance).toLocaleString('en-AU')}` : '—'}</dd></div>
          <div><dt className="text-xs uppercase text-gray-500">TD min rate</dt><dd className="font-medium">{deposit.minRate || '—'}</dd></div>
          <div><dt className="text-xs uppercase text-gray-500">TD max rate</dt><dd className="font-medium">{deposit.maxRate || '—'}</dd></div>
        </dl>
        {deposit.tags?.length > 0 && (
          <div>
            <p className="text-xs uppercase text-gray-500 mb-1">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {deposit.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="md:h-[calc(100vh-3.5rem)] md:overflow-hidden flex flex-col" style={{ background: 'rgb(var(--surface-subtle))' }}>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-3 md:py-4 flex flex-col flex-1 min-h-0">

        <nav className="text-xs text-gray-500 mb-2">
          <Link to="/deposits" className="hover:text-gray-700">All deposits</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{deposit.name}</span>
        </nav>

        {/* Compact hero */}
        <header className="surface p-4 mb-4 flex-shrink-0">
          <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr_auto] gap-4 items-center">
            <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center h-16 md:h-20">
              <img
                src={deposit.productImageUrl || FALLBACK_IMG}
                alt={deposit.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) e.currentTarget.src = FALLBACK_IMG; }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">{issuer}</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                  {categoryLabel(deposit.product_category)}
                </span>
                {deposit.is_sponsored && (
                  <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Sponsored</span>
                )}
              </div>
              <h1 className="text-base md:text-xl font-semibold text-gray-900 leading-tight truncate" title={deposit.name}>{deposit.name}</h1>
              <div className="hidden md:flex flex-wrap gap-1 mt-1.5">
                {deposit.has_bonus_rate     && <span className="feature-chip text-[10px] py-0">Bonus</span>}
                {deposit.has_intro_rate     && <span className="feature-chip text-[10px] py-0">Intro</span>}
                {deposit.has_card_access    && <span className="feature-chip text-[10px] py-0">Card</span>}
                {deposit.has_unlimited_txns && <span className="feature-chip text-[10px] py-0">Unlimited txns</span>}
                {deposit.has_npp_payid      && <span className="feature-chip text-[10px] py-0">PayID</span>}
                {deposit.has_digital_banking && <span className="feature-chip text-[10px] py-0">Digital</span>}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 col-start-3">
              {applyHref && (
                <a href={applyHref} target="_blank" rel="noopener noreferrer" onClick={handleApply}
                   className="btn btn-primary text-sm whitespace-nowrap">Open account</a>
              )}
              <button type="button" onClick={() => toggleDeposit(deposit)}
                      className="btn btn-outline text-sm whitespace-nowrap">
                {isSelected ? '✓ Compare' : 'Compare'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 md:gap-6 mt-3 pt-3 border-t border-gray-100">
            {kpiCells.map((k, i) => (<Kpi key={i} label={k.label} value={k.value} />))}
          </div>
        </header>

        {/* Body: 2 columns */}
        <div className="grid md:grid-cols-[400px_1fr] gap-4 flex-1 min-h-0">
          {/* Left: calculator tabs */}
          <div className="surface flex flex-col min-h-0">
            <div role="tablist" className="tab-strip px-1 pt-1">
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'interest'}
                data-active={leftTab === 'interest'}
                onClick={() => setLeftTab('interest')}
                className="tab-item flex-1"
              >
                Interest earned
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'goal'}
                data-active={leftTab === 'goal'}
                onClick={() => setLeftTab('goal')}
                className="tab-item flex-1"
              >
                Savings goal
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {leftTab === 'interest'
                ? <InterestEarnedCalculator deposit={deposit} />
                : <SavingsGoalCalculator deposit={deposit} />}
            </div>
          </div>

          {/* Right: tabbed long-form */}
          <div className="surface p-4 md:p-5 min-h-0 flex flex-col">
            <Tabs
              tabs={[overviewTab, ratesTab, feesTab, featuresTab]}
              defaultId="overview"
            />
          </div>
        </div>
      </div>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button type="button" onClick={() => toggleDeposit(deposit)} className="btn btn-outline text-sm flex-1">
          {isSelected ? '✓ Compare' : 'Compare'}
        </button>
        {applyHref && (
          <a href={applyHref} target="_blank" rel="noopener noreferrer" onClick={handleApply}
             className="btn btn-primary text-sm flex-[2] text-center">Open</a>
        )}
      </div>
    </div>
  );
}

export default DepositDetailPage;
