import React, { useEffect, useState, useRef } from 'react';
import { fetchCreditCards } from '../api/creditCards';
import CardGrid from '../components/CardGrid';
import AdvancedFilters from '../components/AdvancedFilters';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import { getMinimumAnnualFee, getCardTags } from '../utils.js';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';

function CardsPage() {
  const adFrequency = Number(import.meta.env.VITE_AD_FREQUENCY) || 4;
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const [filters, setFilters] = useState({
    type: '',
    creditScore: '',
    annualFee: '',
    features: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { selected } = useSelectedCards();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCreditCards();
        const withTags = data.map((c) => ({ ...c, tags: getCardTags(c, 10) }));
        setCards(withTags);
        setFiltered(withTags);
        setAvailableTags([
          ...new Set(withTags.flatMap((c) => c.tags)),
        ]);
      } catch (err) {
        setError('Failed to load cards');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let result = cards;

    if (filters.features.length) {
      result = result.filter((c) =>
        filters.features.every((f) =>
          c.tags.some((t) => t.toLowerCase() === f.toLowerCase())
        )
      );
    }

    if (filters.type) {
      const t = filters.type.toLowerCase();
      result = result.filter((c) =>
        c.tags.some((tag) => tag.toLowerCase().includes(t))
      );
    }

    if (filters.creditScore) {
      const min = Number(filters.creditScore);
      result = result.filter((c) => {
        const score = Number(
          c.creditScore ||
            c.minimumCreditScore ||
            c.eligibility?.find((e) => e.type === 'creditScore')?.value
        );
        return score && score >= min;
      });
    }

    if (filters.annualFee) {
      const max = Number(filters.annualFee);
      result = result.filter((c) => {
        const fee = getMinimumAnnualFee(c);
        return fee !== null && fee <= max;
      });
    }

    setFiltered(result);
  }, [filters, cards]);

  // reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [filtered]);

  // infinite scroll observer
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
    <div className="p-4 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 min-h-screen flex flex-col overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        <header className="text-center mb-8 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find the Right Card. No Guesswork.</h1>
          <p className="text-lg font-medium text-gray-700 max-w-xl mx-auto mb-6">Use smart filters to explore rewards, cashback, low-interest, and balance transfer credit cards—compare clearly and choose with confidence.</p>
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
            className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white p-4 overflow-y-auto md:max-h-screen transform transition md:static md:translate-x-0 md:w-1/4 md:min-w-[250px] md:pr-4 md:sticky md:top-4 flex-shrink-0 ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <AdvancedFilters
              filters={filters}
              setFilters={setFilters}
              availableTags={availableTags}
            />
            <button className="md:hidden mt-2 btn btn-outline text-sm" onClick={() => setShowFilters(false)}>
              Close
            </button>
            <button
              disabled={!selected.length}
              onClick={() => navigate('/compare')}
              className="btn btn-primary w-full mt-4 disabled:opacity-50 md:hidden"
            >
              Compare ({selected.length})
            </button>
          </div>
          <div className="md:flex-1 mt-4 md:mt-0 overflow-y-auto pb-4">
            <CardGrid
              cards={filtered.slice(0, visibleCount)}
              selectedTags={filters.features}
              adFrequency={adFrequency}
            />
            <div ref={loadMoreRef} className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardsPage;
