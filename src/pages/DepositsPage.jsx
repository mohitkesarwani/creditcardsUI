import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchDeposits } from '../api/deposits';
import DepositCard from '../components/DepositCard.jsx';
import DepositFiltersPanel, {
  RATE_BUCKETS, TERM_BUCKETS, CATEGORY_OPTIONS,
} from '../components/DepositFiltersPanel.jsx';
import SortBar from '../components/SortBar.jsx';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import DepositCompareStickyButton from '../components/DepositCompareStickyButton.jsx';
import SpecialtyToggle from '../components/SpecialtyToggle.jsx';
import DataFreshness from '../components/DataFreshness.jsx';
import { formatPercent } from '../utils.js';
import useScrollReveal from '../hooks/useScrollReveal.js';

const PAGE_SIZE = 20;
const EMPTY_FILTERS = {
  category: 'any',
  rateBucket: 'any',
  termBucket: 'any',
  tags: [],
  banks: [],
};

const SORTS = [
  { key: 'rateDesc',  label: 'Highest rate' },
  { key: 'feeAsc',    label: 'Lowest fee' },
  { key: 'featured',  label: 'Featured' },
];

const matchesCategory = (d, category) => category === 'any' || d.product_category === category;

const matchesRateBucket = (d, key) => {
  if (key === 'any') return true;
  const b = RATE_BUCKETS.find((x) => x.key === key);
  if (!b?.min) return true;
  return Number.isFinite(d.headlineRateNumber) && d.headlineRateNumber >= b.min;
};

const matchesTermBucket = (d, key) => {
  if (key === 'any') return true;
  if (d.product_category !== 'TERM_DEPOSIT') return false;
  const b = TERM_BUCKETS.find((x) => x.key === key);
  return b ? b.match(d) : true;
};

const matchesTags = (d, selectedTagLabels) => {
  if (!selectedTagLabels?.length) return true;
  const labels = (d.tags || []).map((t) => t.toLowerCase());
  return selectedTagLabels.every((sel) => labels.includes(sel.toLowerCase()));
};

const applyOthers = (deposits, filters, exclude) =>
  deposits.filter((d) => {
    if (exclude !== 'category'   && !matchesCategory(d, filters.category)) return false;
    if (exclude !== 'rateBucket' && !matchesRateBucket(d, filters.rateBucket)) return false;
    if (exclude !== 'termBucket' && !matchesTermBucket(d, filters.termBucket)) return false;
    if (exclude !== 'tags'       && !matchesTags(d, filters.tags)) return false;
    if (exclude !== 'banks'      && filters.banks.length) {
      const issuer = d.brandName || d.brand || d.bank_name;
      if (!filters.banks.includes(issuer)) return false;
    }
    return true;
  });

function DepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('rateDesc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);
  const [showSpecialty, setShowSpecialty] = useState(false);
  const loadMoreRef = useRef(null);
  const revealRef = useScrollReveal({ staggerMs: 40 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDeposits();
        if (!cancelled) setDeposits(data);
      } catch {
        if (!cancelled) setError('Failed to load deposit products. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Hide specialty (business / SMSF / trust / restricted-eligibility / etc.)
  // by default; SpecialtyToggle below the list flips this. All filter / count
  // calculations downstream operate on `consumerOnly` so the UI stays
  // self-consistent.
  const consumerOnly = useMemo(
    () => (showSpecialty ? deposits : deposits.filter((d) => !d.isSpecialty)),
    [deposits, showSpecialty],
  );
  const hiddenSpecialty = deposits.length - consumerOnly.length;

  const allBanks = useMemo(
    () => Array.from(new Set(consumerOnly.map((d) => d.brandName || d.brand || d.bank_name).filter(Boolean))).sort(),
    [consumerOnly],
  );

  const allTagObjects = useMemo(() => {
    const seen = new Map();
    consumerOnly.forEach((d) => (d.tagObjects || []).forEach((t) => {
      if (!seen.has(t.id)) seen.set(t.id, t);
    }));
    return Array.from(seen.values());
  }, [consumerOnly]);

  const countsForCategory = useMemo(() => {
    const base = applyOthers(consumerOnly, filters, 'category');
    const out = { any: base.length };
    CATEGORY_OPTIONS.forEach((c) => {
      if (c.key === 'any') return;
      out[c.key] = base.filter((d) => d.product_category === c.key).length;
    });
    return out;
  }, [consumerOnly, filters]);

  const countsForRateBucket = useMemo(() => {
    const base = applyOthers(consumerOnly, filters, 'rateBucket');
    const out = {};
    RATE_BUCKETS.forEach((b) => {
      out[b.key] = base.filter((d) => matchesRateBucket(d, b.key)).length;
    });
    return out;
  }, [consumerOnly, filters]);

  const countsForTermBucket = useMemo(() => {
    const base = applyOthers(consumerOnly, filters, 'termBucket');
    const out = {};
    TERM_BUCKETS.forEach((b) => {
      out[b.key] = base.filter((d) => matchesTermBucket(d, b.key)).length;
    });
    return out;
  }, [consumerOnly, filters]);

  const countsForTags = useMemo(() => {
    const fullBase = applyOthers(consumerOnly, filters, null);
    const activeLower = new Set((filters.tags || []).map((t) => t.toLowerCase()));
    const map = {};
    allTagObjects.forEach((t) => {
      const label = t.label;
      const labelLower = label.toLowerCase();
      if (activeLower.has(labelLower)) {
        map[label] = fullBase.length;
      } else {
        map[label] = fullBase.filter((d) =>
          (d.tags || []).some((x) => x.toLowerCase() === labelLower),
        ).length;
      }
    });
    return map;
  }, [consumerOnly, filters, allTagObjects]);

  const countsForBanks = useMemo(() => {
    const base = applyOthers(consumerOnly, filters, 'banks');
    const out = {};
    allBanks.forEach((b) => {
      out[b] = base.filter((d) => (d.brandName || d.brand || d.bank_name) === b).length;
    });
    return out;
  }, [consumerOnly, filters, allBanks]);

  const filtered = useMemo(() => {
    const list = applyOthers(consumerOnly, filters, null);
    const arr = [...list];
    const num = (v) => (Number.isFinite(v) ? v : -Infinity);
    switch (sortBy) {
      case 'rateDesc':
        arr.sort((a, b) => num(b.headlineRateNumber) - num(a.headlineRateNumber));
        break;
      case 'feeAsc': {
        const fee = (x) => (Number.isFinite(x.monthly_fee_amount) ? x.monthly_fee_amount : Infinity);
        arr.sort((a, b) => fee(a) - fee(b));
        break;
      }
      case 'featured':
      default:
        arr.sort((a, b) => {
          if ((b.is_sponsored ? 1 : 0) !== (a.is_sponsored ? 1 : 0))
            return (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0);
          return (a.sponsor_rank || 0) - (b.sponsor_rank || 0);
        });
    }
    return arr;
  }, [consumerOnly, filters, sortBy]);

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
    (filters.category   !== 'any' ? 1 : 0) +
    (filters.rateBucket !== 'any' ? 1 : 0) +
    (filters.termBucket !== 'any' ? 1 : 0) +
    (filters.tags?.length || 0) +
    filters.banks.length;

  const summary = useMemo(() => {
    if (!deposits.length) return '';
    const rates = filtered.map((d) => d.headlineRateNumber).filter((n) => Number.isFinite(n));
    const issuers = new Set(filtered.map((d) => d.brandName || d.brand || d.bank_name).filter(Boolean));
    const parts = [
      `${filtered.length.toLocaleString()} of ${deposits.length.toLocaleString()} deposits`,
      `${issuers.size} issuer${issuers.size === 1 ? '' : 's'}`,
    ];
    if (rates.length) parts.push(`up to ${formatPercent(Math.max(...rates))}`);
    return parts.join(' · ');
  }, [filtered, deposits]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 md:px-8 py-8"><LoaderSkeleton rows={5} /></div>;
  if (error)   return <p className="text-center py-12 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen has-sticky-bottom" style={{ background: 'rgb(var(--surface-subtle))' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compare deposits & savings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Term deposits, high-interest savings and everyday accounts. Rates change daily —
            confirm with the issuer before opening an account. Information is general only.
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
            <DepositFiltersPanel
              filters={filters}
              setFilters={setFilters}
              availableBanks={allBanks}
              countsForBanks={countsForBanks}
              countsForCategory={countsForCategory}
              countsForRateBucket={countsForRateBucket}
              countsForTermBucket={countsForTermBucket}
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
                <DepositFiltersPanel
                  filters={filters}
                  setFilters={setFilters}
                  availableBanks={allBanks}
                  countsForBanks={countsForBanks}
                  countsForCategory={countsForCategory}
                  countsForRateBucket={countsForRateBucket}
                  countsForTermBucket={countsForTermBucket}
                  availableTagObjects={allTagObjects}
                  countsForTags={countsForTags}
                  activeFilterCount={activeFilterCount}
                  onClear={() => setFilters(EMPTY_FILTERS)}
                />
                <button className="btn btn-primary w-full mt-4" onClick={() => setFiltersOpenMobile(false)}>
                  Show {filtered.length} deposits
                </button>
              </div>
            </div>
          )}

          <div>
            <SortBar
              summary={summary}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sorts={SORTS}
              freshness={<DataFreshness items={consumerOnly} />}
            />

            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-600 mb-2">No deposit products match these filters.</p>
                <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm text-blue-600 hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div ref={revealRef} className="space-y-3">
                {filtered.slice(0, visibleCount).map((d) => (
                  <DepositCard key={d.id} deposit={d} selectedTags={filters.tags} />
                ))}
                {visibleCount < filtered.length && (
                  <div ref={loadMoreRef} className="text-center py-6 text-sm text-gray-500">
                    Loading more…
                  </div>
                )}
              </div>
            )}

            <SpecialtyToggle
              count={hiddenSpecialty}
              show={showSpecialty}
              onToggle={() => setShowSpecialty((s) => !s)}
              productLabel="deposit"
            />
          </div>
        </div>
      </div>

      <DepositCompareStickyButton />
    </div>
  );
}

export default DepositsPage;
