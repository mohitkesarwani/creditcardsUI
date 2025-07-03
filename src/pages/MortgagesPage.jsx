import React, { useEffect, useState, useRef } from 'react';
import { fetchMortgages } from '../api/residentialMortgages';
import MortgageCardGrid from '../components/MortgageCardGrid';
import MortgageFilters from '../components/MortgageFilters';
import MortgageCompareStickyButton from '../components/MortgageCompareStickyButton.jsx';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import { getMortgageFeatureTags } from '../utils.js';

function MortgagesPage() {
  const adFrequency = Number(import.meta.env.VITE_AD_FREQUENCY) || 4;
  const [mortgages, setMortgages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const [filters, setFilters] = useState({ rate: [0, 0], fees: [], features: [], bank: '' });
  const [rateBounds, setRateBounds] = useState([0, 0]);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMortgages();
        setMortgages(data);
        setFiltered(data);
        const rates = data
          .map(m => parseFloat(m.lendingRates?.[0]?.rate))
          .filter(n => !Number.isNaN(n));
        if (rates.length) {
          const minRate = Math.min(...rates);
          const maxRate = Math.max(...rates);
          setRateBounds([minRate, maxRate]);
          const stored = localStorage.getItem('mortgageFilters');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setFilters({
                rate: parsed.rate || [minRate, maxRate],
                fees: parsed.fees || [],
                features: parsed.features || [],
                bank: parsed.bank || '',
              });
            } catch {
              setFilters({ rate: [minRate, maxRate], fees: [], features: [], bank: '' });
            }
          } else {
            setFilters({ rate: [minRate, maxRate], fees: [], features: [], bank: '' });
          }
        }
        setAvailableFeatures([
          ...new Set(data.flatMap((m) => getMortgageFeatureTags(m))),
        ]);
        setAvailableBanks([...new Set(data.map(m => m.bankName || m.brandName).filter(Boolean))]);
      } catch (err) {
        console.error(err);
        setError('Failed to load mortgages');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      let result = mortgages;
      result = result.filter(m => {
        const rate = parseFloat(m.lendingRates?.[0]?.rate);
        if (Number.isNaN(rate)) return false;
        return rate >= filters.rate[0] && rate <= filters.rate[1];
      });
      if (filters.features.length) {
        result = result.filter(m => {
          const tags = getMortgageFeatureTags(m);
          return filters.features.every(f => tags.includes(f));
        });
      }
      if (filters.bank) {
        const term = filters.bank.toLowerCase();
        result = result.filter(m =>
          (m.bankName && m.bankName.toLowerCase().includes(term)) ||
          (m.brandName && m.brandName.toLowerCase().includes(term))
        );
      }
      setAvailableBanks([...new Set(result.map(m => m.bankName || m.brandName).filter(Boolean))]);
      setFiltered(result);
    }, 200);
    return () => clearTimeout(handle);
  }, [filters, mortgages]);

  useEffect(() => {
    if (rateBounds[0] === 0 && rateBounds[1] === 0) return;
    localStorage.setItem('mortgageFilters', JSON.stringify(filters));
  }, [filters, rateBounds]);

  useEffect(() => { setVisibleCount(20); }, [filtered]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(c => Math.min(c + 20, filtered.length));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered]);

  if (loading) return <LoaderSkeleton rows={4} />;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;

  return (
    <>
    <div className="p-4 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 min-h-screen flex flex-col overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        <header className="text-center mb-8 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find the Right Mortgage. No Guesswork.</h1>
          <p className="text-lg font-medium text-gray-700 max-w-xl mx-auto mb-6">Compare mortgages easily. Find your best rate, faster.</p>
        </header>
        <div className="flex flex-col md:flex-row md:gap-4 flex-1 md:overflow-hidden relative">
          <button
            className="md:hidden mb-2 btn btn-outline self-start"
            onClick={() => setShowFilters(true)}
          >
            Filters
          </button>
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white rounded-xl shadow-md p-4 overflow-y-auto max-h-screen transform transition md:static md:translate-x-0 md:w-1/4 md:min-w-[250px] md:pr-4 md:sticky md:top-0 flex-shrink-0 ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <MortgageFilters
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
          <div className="md:flex-1 mt-4 md:mt-0 overflow-y-auto pb-4" data-testid="mortgage-scroll">
            <MortgageCardGrid
              mortgages={filtered.slice(0, visibleCount)}
              selectedTags={filters.features}
              adFrequency={adFrequency}
            />
            <div ref={loadMoreRef} className="h-10" />
          </div>
        </div>
      </div>
    </div>
    <MortgageCompareStickyButton />
    </>
  );
}

export default MortgagesPage;
