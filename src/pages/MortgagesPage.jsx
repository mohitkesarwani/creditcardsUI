import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchMortgages } from '../api/residentialMortgages';
import MortgageCard from '../components/MortgageCard.jsx';
import MortgageFiltersPanel from '../components/MortgageFiltersPanel.jsx';
import SortBar from '../components/SortBar.jsx';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import ComparisonRateWarning from '../components/ComparisonRateWarning.jsx';
import MortgageCompareStickyButton from '../components/MortgageCompareStickyButton.jsx';
import { formatPercent } from '../utils.js';

const PAGE_SIZE = 20;
const EMPTY_FILTERS = {
  rateType: 'any',
  purpose: 'any',
  tags: [],         // labels of currently-active tag chips (AND)
  banks: [],
};

const SORTS = [
  { key: 'rateAsc',   label: 'Lowest variable' },
  { key: 'fixedAsc',  label: 'Lowest fixed' },
  { key: 'compAsc',   label: 'Lowest comparison' },
  { key: 'featured',  label: 'Featured' },
];

// Headline rate for the currently selected purpose. UI flips between owner /
// investment rate columns depending on the user's "Loan purpose" filter.
const headlineForPurpose = (m, purpose, rateType) => {
  const v = purpose === 'invest' ? m.min_variable_rate_invest : m.min_variable_rate_owner;
  const f = purpose === 'invest' ? m.min_fixed_rate_invest    : m.min_fixed_rate_owner;
  if (rateType === 'fixed') return f;
  if (rateType === 'variable') return v;
  return v ?? f;
};

const matchesRateType = (m, rateType, purpose) => {
  if (rateType === 'any') return true;
  return headlineForPurpose(m, purpose, rateType) !== null && headlineForPurpose(m, purpose, rateType) !== undefined;
};

const matchesPurpose = (m, purpose) => {
  if (purpose === 'any') return true;
  if (purpose === 'owner')
    return m.min_variable_rate_owner !== null || m.min_fixed_rate_owner !== null;
  return m.min_variable_rate_invest !== null || m.min_fixed_rate_invest !== null;
};

const matchesTags = (m, selectedTagLabels) => {
  if (!selectedTagLabels?.length) return true;
  const labels = (m.tags || []).map((t) => t.toLowerCase());
  return selectedTagLabels.every((sel) => labels.includes(sel.toLowerCase()));
};

const applyOthers = (loans, filters, exclude) =>
  loans.filter((m) => {
    if (exclude !== 'rateType' && !matchesRateType(m, filters.rateType, filters.purpose)) return false;
    if (exclude !== 'purpose'  && !matchesPurpose(m, filters.purpose)) return false;
    if (exclude !== 'tags'     && !matchesTags(m, filters.tags)) return false;
    if (exclude !== 'banks'    && filters.banks.length) {
      const issuer = m.brandName || m.brand || m.bank_name;
      if (!filters.banks.includes(issuer)) return false;
    }
    return true;
  });

function MortgagesPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('rateAsc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMortgages();
        if (!cancelled) setLoans(data);
      } catch {
        if (!cancelled) setError('Failed to load home loans. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const allBanks = useMemo(
    () => Array.from(new Set(loans.map((m) => m.brandName || m.brand || m.bank_name).filter(Boolean))).sort(),
    [loans],
  );

  const allTagObjects = useMemo(() => {
    const seen = new Map();
    loans.forEach((m) => (m.tagObjects || []).forEach((t) => {
      if (!seen.has(t.id)) seen.set(t.id, t);
    }));
    return Array.from(seen.values());
  }, [loans]);

  // Live counts
  const countsForRateType = useMemo(() => {
    const base = applyOthers(loans, filters, 'rateType');
    return {
      any:      base.length,
      variable: base.filter((m) => headlineForPurpose(m, filters.purpose, 'variable')).length,
      fixed:    base.filter((m) => headlineForPurpose(m, filters.purpose, 'fixed')).length,
    };
  }, [loans, filters]);

  const countsForPurpose = useMemo(() => {
    const base = applyOthers(loans, filters, 'purpose');
    return {
      any:    base.length,
      owner:  base.filter((m) => m.min_variable_rate_owner !== null || m.min_fixed_rate_owner !== null).length,
      invest: base.filter((m) => m.min_variable_rate_invest !== null || m.min_fixed_rate_invest !== null).length,
    };
  }, [loans, filters]);

  // Tag counts narrow as filters accumulate (same pattern as credit cards).
  // Each unselected tag shows how many loans you'd see if you also picked it;
  // selected tags report the current narrowed result count.
  const countsForTags = useMemo(() => {
    const fullBase = applyOthers(loans, filters, null);
    const activeLower = new Set((filters.tags || []).map((t) => t.toLowerCase()));
    const map = {};
    allTagObjects.forEach((t) => {
      const label = t.label;
      const labelLower = label.toLowerCase();
      if (activeLower.has(labelLower)) {
        map[label] = fullBase.length;
      } else {
        map[label] = fullBase.filter((m) =>
          (m.tags || []).some((x) => x.toLowerCase() === labelLower),
        ).length;
      }
    });
    return map;
  }, [loans, filters, allTagObjects]);

  const countsForBanks = useMemo(() => {
    const base = applyOthers(loans, filters, 'banks');
    const out = {};
    allBanks.forEach((b) => {
      out[b] = base.filter((m) => (m.brandName || m.brand || m.bank_name) === b).length;
    });
    return out;
  }, [loans, filters, allBanks]);

  const filtered = useMemo(() => {
    const list = applyOthers(loans, filters, null);
    const arr = [...list];
    const num = (v) => (Number.isFinite(v) ? v : Infinity);
    switch (sortBy) {
      case 'rateAsc':
        arr.sort((a, b) => num(a.min_variable_rate_owner) - num(b.min_variable_rate_owner));
        break;
      case 'fixedAsc':
        arr.sort((a, b) => num(a.min_fixed_rate_owner) - num(b.min_fixed_rate_owner));
        break;
      case 'compAsc':
        arr.sort((a, b) => num(a.min_comparison_rate) - num(b.min_comparison_rate));
        break;
      case 'featured':
      default:
        arr.sort((a, b) => {
          if ((b.is_sponsored ? 1 : 0) !== (a.is_sponsored ? 1 : 0))
            return (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0);
          return (a.sponsor_rank || 0) - (b.sponsor_rank || 0);
        });
    }
    return arr;
  }, [loans, filters, sortBy]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filtered.length, sortBy]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((n) => Math.min(n + PAGE_SIZE, filtered.length));
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const activeFilterCount =
    (filters.rateType !== 'any' ? 1 : 0) +
    (filters.purpose  !== 'any' ? 1 : 0) +
    (filters.tags?.length || 0) +
    filters.banks.length;

  const summary = useMemo(() => {
    if (!loans.length) return '';
    const rates = filtered.map((m) => m.min_variable_rate_owner).filter((n) => Number.isFinite(n));
    const fixedRates = filtered.map((m) => m.min_fixed_rate_owner).filter((n) => Number.isFinite(n));
    const issuers = new Set(filtered.map((m) => m.brandName || m.brand || m.bank_name).filter(Boolean));
    const parts = [
      `${filtered.length.toLocaleString()} of ${loans.length.toLocaleString()} loans`,
      `${issuers.size} issuer${issuers.size === 1 ? '' : 's'}`,
    ];
    if (rates.length) parts.push(`variable from ${formatPercent(Math.min(...rates))}`);
    if (fixedRates.length) parts.push(`fixed from ${formatPercent(Math.min(...fixedRates))}`);
    return parts.join(' · ');
  }, [filtered, loans]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 md:px-8 py-8"><LoaderSkeleton rows={5} /></div>;
  if (error)   return <p className="text-center py-12 text-red-600">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compare home loans</h1>
          <p className="text-sm text-gray-600 mt-1">
            Filter by rate type, loan purpose or feature. Information is general only —
            read each issuer's PDS and TMD, and confirm rates with the lender before applying.
          </p>
        </header>

        <button
          type="button"
          className="md:hidden inline-flex items-center gap-2 mb-4 btn btn-outline text-sm"
          onClick={() => setFiltersOpenMobile(true)}
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center bg-blue-600 text-white rounded-full text-xs px-2">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="md:grid md:grid-cols-[280px_1fr] md:gap-6 md:items-start">
          <div
            className="hidden md:block md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto"
            style={{ overscrollBehavior: 'contain' }}
          >
            <MortgageFiltersPanel
              filters={filters}
              setFilters={setFilters}
              availableBanks={allBanks}
              countsForBanks={countsForBanks}
              countsForRateType={countsForRateType}
              countsForPurpose={countsForPurpose}
              availableTagObjects={allTagObjects}
              countsForTags={countsForTags}
              activeFilterCount={activeFilterCount}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
          </div>

          {filtersOpenMobile && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpenMobile(false)} />
              <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-white overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold">Filters</h2>
                  <button onClick={() => setFiltersOpenMobile(false)} className="text-sm text-gray-500">Close</button>
                </div>
                <MortgageFiltersPanel
                  filters={filters}
                  setFilters={setFilters}
                  availableBanks={allBanks}
                  countsForBanks={countsForBanks}
                  countsForRateType={countsForRateType}
                  countsForPurpose={countsForPurpose}
                  availableTagObjects={allTagObjects}
              countsForTags={countsForTags}
                  activeFilterCount={activeFilterCount}
                  onClear={() => setFilters(EMPTY_FILTERS)}
                />
                <button className="btn btn-primary w-full mt-4" onClick={() => setFiltersOpenMobile(false)}>
                  Show {filtered.length} loans
                </button>
              </div>
            </div>
          )}

          <div>
            <SortBar
              summary={summary}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-600 mb-2">No home loans match these filters.</p>
                <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm text-blue-600 hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filtered.slice(0, visibleCount).map((m) => (
                    <MortgageCard key={m.id} mortgage={m} selectedTags={filters.tags} />
                  ))}
                  {visibleCount < filtered.length && (
                    <div ref={loadMoreRef} className="text-center py-6 text-sm text-gray-500">
                      Loading more…
                    </div>
                  )}
                </div>

                {filtered.some((m) => m.comparisonRate) && (
                  <ComparisonRateWarning className="mt-6" />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <MortgageCompareStickyButton />
    </div>
  );
}

export default MortgagesPage;
