import React, { useEffect, useState, useRef } from 'react';
import { fetchDeposits } from '../api/deposits';
import DepositCardGrid from '../components/DepositCardGrid';
import DepositFilters from '../components/DepositFilters';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import { getDepositFeatureTags } from '../utils.js';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

function DepositsPage() {
  const adFrequency = Number(import.meta.env.VITE_AD_FREQUENCY) || 4;
  const [deposits, setDeposits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const [filters, setFilters] = useState({ rate: [0, 0], features: [], bank: '' });
  const [rateBounds, setRateBounds] = useState([0, 0]);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDeposits();
        setDeposits(data);
        setFiltered(data);
        const rates = data
          .map((d) => parseFloat(d.interestRate))
          .filter((n) => !Number.isNaN(n));
        if (rates.length) {
          const minRate = Math.min(...rates);
          const maxRate = Math.max(...rates);
          setRateBounds([minRate, maxRate]);
          setFilters({ rate: [minRate, maxRate], features: [], bank: '' });
        }
        setAvailableFeatures([
          ...new Set(data.flatMap((d) => getDepositFeatureTags(d)))
        ]);
        setAvailableBanks([...new Set(data.map((d) => d.brand || d.brandName).filter(Boolean))]);
      } catch (err) {
        setError('Failed to load deposits');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let result = deposits;
    result = result.filter((d) => {
      const rate = parseFloat(d.interestRate);
      if (Number.isNaN(rate)) return false;
      return rate >= filters.rate[0] && rate <= filters.rate[1];
    });
    if (filters.features.length) {
      result = result.filter((d) =>
        filters.features.every((f) => getDepositFeatureTags(d).includes(f))
      );
    }
    if (filters.bank) {
      const term = filters.bank.toLowerCase();
      result = result.filter(
        (d) =>
          (typeof d.brand === 'string' && d.brand.toLowerCase().includes(term)) ||
          (typeof d.brandName === 'string' && d.brandName.toLowerCase().includes(term))
      );
    }
    setAvailableBanks([...new Set(result.map((d) => d.brand || d.brandName).filter(Boolean))]);
    setFiltered(result);
  }, [filters, deposits]);

  useEffect(() => {
    setVisibleCount(20);
  }, [filtered]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((c) => Math.min(c + 20, filtered.length));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered]);

  if (loading) return <LoaderSkeleton rows={5} />;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 min-h-screen flex flex-col overflow-x-hidden">
        <div className="max-w-6xl mx-auto flex flex-col h-full">
        <header className="text-center mb-8 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find the Right Deposit.</h1>
          <p className="text-lg font-medium text-gray-700 max-w-xl mx-auto mb-2">Compare deposit products easily.</p>
          <p className="text-sm text-gray-600">{deposits.length} deposits available</p>
        </header>
        <div className="flex flex-col md:flex-row md:gap-4 flex-1 md:overflow-hidden relative">
          <button className="md:hidden mb-2 btn btn-outline self-start" onClick={() => setShowFilters(true)}>Filters</button>
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowFilters(false)} />
          )}
          <div className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white rounded-xl shadow-md p-4 overflow-y-auto max-h-screen shadow-inner transform transition md:static md:translate-x-0 md:w-1/4 md:min-w-[250px] md:pr-4 md:sticky md:top-0 flex-shrink-0 ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <DepositFilters
              filters={filters}
              setFilters={setFilters}
              availableFeatures={availableFeatures}
              rateBounds={rateBounds}
              banks={availableBanks}
            />
            <button className="md:hidden mt-2 btn btn-outline text-sm" onClick={() => setShowFilters(false)}>
              Close
            </button>
          </div>
          <div className="md:flex-1 mt-4 md:mt-0 overflow-y-auto pb-4">
            <DepositCardGrid deposits={filtered.slice(0, visibleCount)} selectedTags={filters.features} adFrequency={adFrequency} />
            <div ref={loadMoreRef} className="h-10" />
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default DepositsPage;
