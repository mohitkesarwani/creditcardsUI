import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchMortgage } from '../api/residentialMortgages';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import supabase from '../supabaseClient.js';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import Tabs from '../components/detail/Tabs.jsx';
import HomeLoanRatesBreakdown from '../components/detail/HomeLoanRatesBreakdown.jsx';
import FeesBreakdown from '../components/detail/FeesBreakdown.jsx';
import FeaturesGrid from '../components/detail/FeaturesGrid.jsx';
import RepaymentEstimator from '../components/detail/RepaymentEstimator.jsx';
import RateFinder from '../components/detail/RateFinder.jsx';
import DocumentsPanel from '../components/detail/DocumentsPanel.jsx';
import ComparisonRateWarning from '../components/ComparisonRateWarning.jsx';
import { formatMoneyWhole, formatPercent } from '../utils.js';

const FALLBACK_IMG = '/assets/image-not-available.svg';

function Kpi({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 leading-tight">{label}</p>
      <p className="text-lg md:text-xl font-bold leading-tight text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

function HomeLoanDetailsPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leftTab, setLeftTab] = useState('estimator'); // 'estimator' | 'finder'
  // A "pinned rate" is a specific rate option the user picked from the Rate
  // Finder. When non-null, the Repayment Estimator uses it instead of the
  // loan's default headline rate. Shape: { key, label, rate, comparisonRate }.
  const [pinnedRate, setPinnedRate] = useState(null);
  const { selected, toggleMortgage } = useSelectedMortgages();
  const isSelected = loan && selected.some((m) => m.id === loan.id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMortgage(loanId);
        if (!cancelled) setLoan(data);
      } catch {
        if (!cancelled) setError('Failed to load home loan.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loanId]);

  useEffect(() => {
    if (!loan) return;
    document.title = `${loan.name} · RewardRadar`;
  }, [loan]);

  const handleApply = async () => {
    if (!loan) return;
    try {
      await supabase.from('referrals').insert({
        card_id: loan.id,
        partner_id: loan.partnerId,
        redirect_url: loan.applicationUrl || loan.application_uri,
      });
    } catch {/* non-fatal */}
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 md:px-8 py-8"><LoaderSkeleton rows={6} /></div>;
  }
  if (error || !loan) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <p className="text-gray-600 mb-4">{error || 'Home loan not found.'}</p>
        <Link to="/home-loans" className="text-blue-600 hover:underline">Back to all home loans</Link>
      </div>
    );
  }

  const issuer = loan.brandName || loan.brand || loan.bank_name || 'Unknown';
  const applyHref = loan.applicationUrl || loan.application_uri;
  const eligibility = loan.eligibility?.length ? loan.eligibility : null;

  const headlineKind = loan.min_variable_rate_owner ? 'Variable rate'
    : loan.min_fixed_rate_owner ? 'Fixed rate' : 'Headline rate';
  const headlineValue = loan.min_variable_rate_owner ?? loan.min_fixed_rate_owner;

  // Tabs for right pane
  const ratesTab = {
    id: 'rates',
    label: 'Rates',
    badge: (loan.lendingRates || loan.lending_rates || []).length || null,
    render: () => (
      <>
        <HomeLoanRatesBreakdown rates={loan.lendingRates || loan.lending_rates} />
        {Number.isFinite(loan.min_comparison_rate) && <ComparisonRateWarning className="mt-3" />}
      </>
    ),
  };
  const feesTab = {
    id: 'fees',
    label: 'Fees',
    badge: (loan.fees || []).length || null,
    render: () => <FeesBreakdown fees={loan.fees} />,
  };
  const featuresTab = {
    id: 'features',
    label: 'Features',
    badge: (loan.features || []).length || null,
    render: () => <FeaturesGrid features={loan.features} />,
  };
  const limitsTab = {
    id: 'limits',
    label: 'Limits',
    render: () => (
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase text-gray-500">Min loan</dt>
          <dd className="font-medium">{loan.min_loan_amount ? formatMoneyWhole(loan.min_loan_amount) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-gray-500">Max loan</dt>
          <dd className="font-medium">{loan.max_loan_amount ? formatMoneyWhole(loan.max_loan_amount) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-gray-500">Max LVR</dt>
          <dd className="font-medium">{loan.maxLvr || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-gray-500">Max term</dt>
          <dd className="font-medium">
            {Number.isFinite(loan.max_term_months)
              ? loan.max_term_months >= 12 ? `${Math.round(loan.max_term_months / 12)} years` : `${loan.max_term_months} months`
              : '—'}
          </dd>
        </div>
        {eligibility && (
          <div className="col-span-full mt-3">
            <dt className="text-xs uppercase text-gray-500 mb-2">Eligibility</dt>
            <ul className="space-y-1 text-sm text-gray-800">
              {eligibility
                .filter((e) => e && (e.eligibilityType || e.additionalValue))
                .map((e, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="text-gray-400">•</span>
                    <span>
                      <span className="text-gray-500 capitalize">
                        {(e.eligibilityType || '').replace(/_/g, ' ').toLowerCase()}
                        {e.eligibilityType ? ': ' : ''}
                      </span>
                      <span className="font-medium">
                        {e.value}{e.unit ? ` ${e.unit}` : ''}
                        {e.additionalValue ? ` ${e.additionalValue}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </dl>
    ),
  };
  const docsTab = {
    id: 'docs',
    label: 'Documents',
    render: () => <DocumentsPanel product={loan} productType="home-loan" applicationUri={applyHref} />,
  };

  return (
    <div className="bg-gray-50 md:h-[calc(100vh-3.5rem)] md:overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-3 md:py-4 flex flex-col flex-1 min-h-0">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-2">
          <Link to="/home-loans" className="hover:text-gray-700">All home loans</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{loan.name}</span>
        </nav>

        {/* ─── Compact hero ─── */}
        <header className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex-shrink-0">
          <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr_auto] gap-4 items-center">
            <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center h-16 md:h-20">
              <img
                src={loan.productImageUrl || FALLBACK_IMG}
                alt={loan.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_IMG)) e.currentTarget.src = FALLBACK_IMG; }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">{issuer}</span>
                {loan.is_sponsored && (
                  <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Sponsored</span>
                )}
              </div>
              <h1 className="text-base md:text-xl font-semibold text-gray-900 leading-tight truncate" title={loan.name}>{loan.name}</h1>
              <div className="hidden md:flex flex-wrap gap-1 mt-1.5">
                {loan.has_offset           && <span className="feature-chip text-[10px] py-0">Offset</span>}
                {loan.has_redraw           && <span className="feature-chip text-[10px] py-0">Redraw</span>}
                {loan.has_extra_repayments && <span className="feature-chip text-[10px] py-0">Extra repay</span>}
                {loan.has_rate_lock        && <span className="feature-chip text-[10px] py-0">Rate lock</span>}
                {loan.has_split_loan       && <span className="feature-chip text-[10px] py-0">Split loan</span>}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 col-start-3">
              {applyHref && (
                <a href={applyHref} target="_blank" rel="noopener noreferrer" onClick={handleApply}
                   className="btn btn-primary text-sm whitespace-nowrap">Apply now</a>
              )}
              <button type="button" onClick={() => toggleMortgage(loan)}
                      className="btn btn-outline text-sm whitespace-nowrap">
                {isSelected ? '✓ Compare' : 'Compare'}
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3 md:gap-6 mt-3 pt-3 border-t border-gray-100">
            <Kpi label={headlineKind}
                 value={Number.isFinite(headlineValue) ? formatPercent(headlineValue) : '—'} />
            <Kpi label="Comparison"
                 value={Number.isFinite(loan.min_comparison_rate) ? formatPercent(loan.min_comparison_rate) : '—'} />
            <Kpi label="Max LVR"
                 value={Number.isFinite(loan.max_lvr_percent) ? `${loan.max_lvr_percent}%` : '—'} />
            <Kpi label="Max loan"
                 value={Number.isFinite(loan.max_loan_amount)
                          ? (loan.max_loan_amount >= 1_000_000
                              ? `$${(loan.max_loan_amount / 1_000_000).toFixed(1)}M`
                              : formatMoneyWhole(loan.max_loan_amount))
                          : '—'} />
          </div>
        </header>

        {/* ─── Body: 2 columns ─── */}
        <div className="grid md:grid-cols-[400px_1fr] gap-4 flex-1 min-h-0">
          {/* Left: switchable interactive panels */}
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
            <div role="tablist" className="flex border-b border-gray-200 px-1 pt-1">
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'estimator'}
                onClick={() => setLeftTab('estimator')}
                className={
                  'flex-1 px-3 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ' +
                  (leftTab === 'estimator'
                    ? 'text-blue-700 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-800')
                }
              >
                Repayment estimate
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'finder'}
                onClick={() => setLeftTab('finder')}
                className={
                  'flex-1 px-3 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ' +
                  (leftTab === 'finder'
                    ? 'text-blue-700 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-800')
                }
              >
                Find your rate
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {leftTab === 'estimator' ? (
                <RepaymentEstimator
                  variableRate={loan.min_variable_rate_owner}
                  fixedRate={loan.min_fixed_rate_owner}
                  pinnedRate={pinnedRate}
                  onClearPinned={() => setPinnedRate(null)}
                />
              ) : (
                <RateFinder
                  loan={loan}
                  pinnedKey={pinnedRate?.key}
                  onPin={(rate) => {
                    setPinnedRate(rate);
                    // Jump to estimator so the user sees the impact immediately.
                    setLeftTab('estimator');
                  }}
                />
              )}
            </div>
          </div>

          {/* Right: tabbed long-form content */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 min-h-0 flex flex-col">
            <Tabs
              tabs={[ratesTab, feesTab, featuresTab, limitsTab, docsTab]}
              defaultId="rates"
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button type="button" onClick={() => toggleMortgage(loan)}
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

export default HomeLoanDetailsPage;
