import React, { useEffect, useState, useRef } from 'react';
import { fetchMortgages } from '../api/residentialMortgages';
import MortgageCardGrid from '../components/MortgageCardGrid';
import MortgageFilters from '../components/MortgageFilters';

function MortgagesPage() {
  const [mortgages, setMortgages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const [filters, setFilters] = useState({ rate: [0, 20], fees: [], features: [], eligibility: [] });
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [availableEligibility, setAvailableEligibility] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMortgages();
        setMortgages(data);
        setFiltered(data);
        setAvailableFeatures([...new Set(data.flatMap(m => m.features?.map(f => f.featureType) || []))]);
        setAvailableEligibility([...new Set(data.flatMap(m => m.eligibility?.map(e => e.eligibilityType) || []))]);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let result = mortgages;
    result = result.filter(m => {
      const rate = parseFloat(m.lendingRates?.[0]?.rate || 0);
      return rate >= filters.rate[0] && rate <= filters.rate[1];
    });
    if (filters.features.length) {
      result = result.filter(m => filters.features.every(f => m.features?.some(x => x.featureType === f)));
    }
    if (filters.eligibility.length) {
      result = result.filter(m => filters.eligibility.every(e => m.eligibility?.some(x => x.eligibilityType === e)));
    }
    setFiltered(result);
  }, [filters, mortgages]);

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

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-brand-start/10 to-brand-end/10 h-screen overflow-hidden flex flex-col">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        <header className="text-center mb-8 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Browse &amp; Compare Mortgages</h1>
        </header>
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="md:w-1/4 md:pr-4 md:sticky md:top-4 flex-shrink-0">
            <MortgageFilters filters={filters} setFilters={setFilters} availableFeatures={availableFeatures} availableEligibility={availableEligibility} />
          </div>
          <div className="md:flex-1 mt-4 md:mt-0 overflow-y-auto pb-4" data-testid="mortgage-scroll">
            <MortgageCardGrid mortgages={filtered.slice(0, visibleCount)} selectedTags={filters.features} />
            <div ref={loadMoreRef} className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MortgagesPage;
