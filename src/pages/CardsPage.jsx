import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCreditCards } from '../api/creditCards';
import Card from '../components/Card.jsx';
import FiltersPanel, { FEE_BUCKETS } from '../components/FiltersPanel.jsx';
import SortBar from '../components/SortBar.jsx';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import CompareStickyButton from '../components/CompareStickyButton.jsx';
import SpecialtyToggle from '../components/SpecialtyToggle.jsx';
import DataFreshness from '../components/DataFreshness.jsx';
import {
  getMinimumAnnualFee,
  parseCurrency,
  formatMoneyWhole,
  formatPercent,
} from '../utils.js';
import useScrollReveal from '../hooks/useScrollReveal.js';

const PAGE_SIZE = 20;

const EMPTY_FILTERS = { feeBucket: 'any', features: [], banks: [] };

// Helpers
const annualFeeNumber = (c) => {
  const raw = c.annualFee ?? getMinimumAnnualFee(c);
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === 'number' ? raw : parseCurrency(raw);
  return Number.isFinite(n) ? n : null;
};
const purchaseRateNumber = (c) => {
  const raw = c.interestRate ?? c.feesAndPricing?.interestRates?.[0]?.rate;
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const comparisonRateNumber = (c) => {
  const raw = c.comparisonRate ?? c.lendingRates?.[0]?.comparisonRate;
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const matchesFeeBucket = (c, bucketKey) => {
  const bucket = FEE_BUCKETS.find((b) => b.key === bucketKey) || FEE_BUCKETS[0];
  return bucket.match(annualFeeNumber(c));
};

// Apply filters individually so we can compute live counts (each count
// excludes only its own dimension).
const applyOthers = (cards, filters, exclude) => {
  return cards.filter((c) => {
    if (exclude !== 'feeBucket' && filters.feeBucket && filters.feeBucket !== 'any') {
      if (!matchesFeeBucket(c, filters.feeBucket)) return false;
    }
    if (exclude !== 'features' && filters.features.length) {
      const tagSet = new Set((c.tags || []).map((t) => t.toLowerCase()));
      const ok = filters.features.every((t) => tagSet.has(t.toLowerCase()));
      if (!ok) return false;
    }
    if (exclude !== 'banks' && filters.banks.length) {
      const issuer = c.brandName || c.brand;
      if (!filters.banks.includes(issuer)) return false;
    }
    return true;
  });
};

function CardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);
  const [showSpecialty, setShowSpecialty] = useState(false);
  const loadMoreRef = useRef(null);
  const revealRef = useScrollReveal({ staggerMs: 40 });

  // Load + tag once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCreditCards();
        if (cancelled) return;
        // Tags are computed inside normalizeCard now (tagObjects + tags strings).
        setCards(data);
      } catch (e) {
        if (!cancelled) setError('Failed to load cards. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Hide specialty cards (business/corporate/SMSF, no-interest products like
  // CommBank Neo, 0%-published-rate data errors) by default. SpecialtyToggle
  // below the list flips this.
  const consumerOnly = useMemo(
    () => (showSpecialty ? cards : cards.filter((c) => !c.isSpecialty)),
    [cards, showSpecialty],
  );
  const hiddenSpecialty = cards.length - consumerOnly.length;

  // Universe of options. Tags now come in as objects with category info; we
  // expose them grouped so the filter panel can render "Best for" + "Card type"
  // sections instead of one undifferentiated chip pile.
  const allTagObjects = useMemo(() => {
    const seen = new Map();
    consumerOnly.forEach((c) => (c.tagObjects || []).forEach((t) => {
      if (!seen.has(t.id)) seen.set(t.id, t);
    }));
    return Array.from(seen.values());
  }, [consumerOnly]);

  // Keep the legacy `allTags` for the existing filter-match logic (string-based).
  const allTags = useMemo(
    () => allTagObjects.map((t) => t.label),
    [allTagObjects],
  );
  const allBanks = useMemo(
    () => Array.from(new Set(consumerOnly.map((c) => c.brandName || c.brand).filter(Boolean))).sort(),
    [consumerOnly],
  );

  // Live counts (each filter dimension's counts exclude only that dimension)
  const countsForBuckets = useMemo(() => {
    const base = applyOthers(consumerOnly, filters, 'feeBucket');
    return Object.fromEntries(
      FEE_BUCKETS.map((b) => [b.key, base.filter((c) => b.match(annualFeeNumber(c))).length]),
    );
  }, [consumerOnly, filters]);

  // Tag counts narrow against the active filter set:
  //   - For UNSELECTED tags: "if I added this filter, how many cards would
  //     remain?" — applies all current filters (incl. other features) and
  //     intersects with cards that also carry this tag.
  //   - For SELECTED tags: count is the current narrowed result count (all
  //     filtered cards trivially carry this tag, since it's part of the
  //     filter). Visually they're already in the active state, so the number
  //     is informational, not deceptive.
  //
  // This matches what users expect from cumulative AND filters (Booking.com,
  // Amazon, Kayak — pick a filter and see the next level narrow).
  const countsForTags = useMemo(() => {
    const fullBase = applyOthers(consumerOnly, filters, null); // apply ALL filters
    const map = {};
    allTags.forEach((t) => {
      const tagLower = t.toLowerCase();
      const isSelected = filters.features.some((f) => f.toLowerCase() === tagLower);
      if (isSelected) {
        map[t] = fullBase.length;
      } else {
        map[t] = fullBase.filter((c) =>
          (c.tags || []).some((x) => x.toLowerCase() === tagLower),
        ).length;
      }
    });
    return map;
  }, [consumerOnly, filters, allTags]);

  const countsForBanks = useMemo(() => {
    const base = applyOthers(consumerOnly, filters, 'banks');
    const map = {};
    allBanks.forEach((b) => {
      map[b] = base.filter((c) => (c.brandName || c.brand) === b).length;
    });
    return map;
  }, [consumerOnly, filters, allBanks]);

  // Filter + sort
  const filtered = useMemo(() => {
    const list = applyOthers(consumerOnly, filters, null);
    const arr = [...list];
    switch (sortBy) {
      case 'feeAsc':
        arr.sort((a, b) => (annualFeeNumber(a) ?? Infinity) - (annualFeeNumber(b) ?? Infinity));
        break;
      case 'rateAsc':
        arr.sort((a, b) => (purchaseRateNumber(a) ?? Infinity) - (purchaseRateNumber(b) ?? Infinity));
        break;
      case 'compAsc':
        arr.sort((a, b) => (comparisonRateNumber(a) ?? Infinity) - (comparisonRateNumber(b) ?? Infinity));
        break;
      case 'featured':
      default:
        arr.sort((a, b) => {
          if ((b.isSponsored ? 1 : 0) !== (a.isSponsored ? 1 : 0)) return (b.isSponsored ? 1 : 0) - (a.isSponsored ? 1 : 0);
          return (a.sponsorRank || 0) - (b.sponsorRank || 0);
        });
    }
    return arr;
  }, [consumerOnly, filters, sortBy]);

  // Reset pagination when result set changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filtered.length, sortBy]);

  // Infinite scroll
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
    (filters.feeBucket && filters.feeBucket !== 'any' ? 1 : 0) +
    filters.features.length +
    filters.banks.length;

  // Summary line: total + cheapest fee + cheapest rate
  const summary = useMemo(() => {
    if (!cards.length) return '';
    const totalShown = filtered.length;
    const totalAll = cards.length;
    const fees = filtered.map(annualFeeNumber).filter((n) => Number.isFinite(n));
    const rates = filtered.map(purchaseRateNumber).filter((n) => Number.isFinite(n));
    const issuers = new Set(filtered.map((c) => c.brandName || c.brand).filter(Boolean));
    const parts = [
      `${totalShown.toLocaleString()} of ${totalAll.toLocaleString()} cards`,
      `${issuers.size} issuer${issuers.size === 1 ? '' : 's'}`,
    ];
    if (fees.length) parts.push(`fees from ${formatMoneyWhole(Math.min(...fees))}`);
    if (rates.length) parts.push(`rates from ${formatPercent(Math.min(...rates))}`);
    return parts.join(' · ');
  }, [filtered, cards]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <LoaderSkeleton rows={5} />
      </div>
    );
  }
  if (error) {
    return <p className="text-center py-12 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen has-sticky-bottom" style={{ background: 'rgb(var(--surface-subtle))' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Compare credit cards</h1>
          <p className="text-sm text-gray-600 mt-1">
            Filter by fee, rate or feature. Tick up to four cards to compare side-by-side.
            Information is general only — read each issuer's PDS and TMD before applying.
          </p>
        </header>

        {/* Mobile filter trigger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center gap-2 mb-4 btn btn-outline text-sm"
          onClick={() => setFiltersOpenMobile(true)}
        >
          Filters {activeFilterCount > 0 && <span className="ml-1 inline-flex items-center justify-center bg-blue-600 text-white rounded-full text-xs px-2">{activeFilterCount}</span>}
        </button>

        <div className="md:grid md:grid-cols-[280px_1fr] md:gap-6 md:items-start">
          {/* Sidebar — desktop. Sticky to viewport but capped at its height so
              the Issuer list at the bottom remains reachable via internal scroll. */}
          <div
            className="hidden md:block md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto"
            style={{ overscrollBehavior: 'contain' }}
          >
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              availableTags={allTags}
              availableTagObjects={allTagObjects}
              availableBanks={allBanks}
              countsForBuckets={countsForBuckets}
              countsForTags={countsForTags}
              countsForBanks={countsForBanks}
              activeFilterCount={activeFilterCount}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
          </div>

          {/* Sidebar — mobile drawer */}
          {filtersOpenMobile && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpenMobile(false)} />
              <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-white overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold">Filters</h2>
                  <button onClick={() => setFiltersOpenMobile(false)} className="text-sm text-gray-500" aria-label="Close filters">Close</button>
                </div>
                <FiltersPanel
                  filters={filters}
                  setFilters={setFilters}
                  availableTags={allTags}
              availableTagObjects={allTagObjects}
                  availableBanks={allBanks}
                  countsForBuckets={countsForBuckets}
                  countsForTags={countsForTags}
                  countsForBanks={countsForBanks}
                  activeFilterCount={activeFilterCount}
                  onClear={() => setFilters(EMPTY_FILTERS)}
                />
                <button className="btn btn-primary w-full mt-4" onClick={() => setFiltersOpenMobile(false)}>
                  Show {filtered.length} cards
                </button>
              </div>
            </div>
          )}

          {/* Results column */}
          <div>
            <SortBar
              summary={summary}
              sortBy={sortBy}
              onSortChange={setSortBy}
              freshness={<DataFreshness items={consumerOnly} />}
            />

            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-600 mb-2">No cards match these filters.</p>
                <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm text-blue-600 hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div ref={revealRef} className="space-y-3">
                {filtered.slice(0, visibleCount).map((c) => (
                  <Card key={c.id} card={c} selectedTags={filters.features} />
                ))}
                {visibleCount < filtered.length && (
                  <div ref={loadMoreRef} className="text-center py-6 text-sm text-gray-500">
                    Loading more cards…
                  </div>
                )}
              </div>
            )}

            <SpecialtyToggle
              count={hiddenSpecialty}
              show={showSpecialty}
              onToggle={() => setShowSpecialty((s) => !s)}
              productLabel="card"
            />
          </div>
        </div>
      </div>

      <CompareStickyButton />
    </div>
  );
}

export default CardsPage;
