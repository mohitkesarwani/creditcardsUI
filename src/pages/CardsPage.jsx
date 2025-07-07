import React, { useEffect, useState, useRef } from 'react';
import { fetchCreditCards } from '../api/creditCards';
import CardGrid from '../components/CardGrid';
import AdvancedFilters from '../components/AdvancedFilters';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import { getMinimumAnnualFee, getCardTags } from '../utils.js';
import apiClient from '../api/apiClient.js';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';
import CompareStickyButton from '../components/CompareStickyButton.jsx';

function CardsPage() {
  const adFrequency = Number(import.meta.env.VITE_AD_FREQUENCY) || 4;
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const scrollRef = useRef(null);
  const [filters, setFilters] = useState({
    annualFee: '',
    features: [],
    bank: '',
  });
  const [sortBy, setSortBy] = useState('featured');
  const resetFilters = () => setFilters({ annualFee: '', features: [], bank: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { selected } = useSelectedCards();
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState({});

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
        setAvailableBanks([
          ...new Set(withTags.map((c) => c.brandName || c.brand).filter(Boolean)),
        ]);
        const eng = {};
        await Promise.all(
          withTags.map(async (c) => {
            try {
              const res = await apiClient.get(`/api/products/${c.id}/engagement`);
              eng[c.id] = {
                ...res.data,
                comments:
                  res.data.reviews?.length ?? res.data.comments ?? 0,
              };
            } catch {
              eng[c.id] = { likes: 0, shares: 0, comments: 0, rating: 0 };
            }
          })
        );
        setEngagements(eng);
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

    if (filters.annualFee) {
      const max = Number(filters.annualFee);
      result = result.filter((c) => {
        const fee = getMinimumAnnualFee(c);
        return fee !== null && fee <= max;
      });
    }

    setAvailableBanks([
      ...new Set(result.map((c) => c.brandName || c.brand).filter(Boolean)),
    ]);

    if (filters.bank) {
      const term = filters.bank.toLowerCase();
      result = result.filter(
        (c) =>
          (c.brandName && c.brandName.toLowerCase().includes(term)) ||
          (c.brand && c.brand.toLowerCase().includes(term))
      );
    }

    if (sortBy !== 'featured') {
      result = result.slice().sort((a, b) => {
        const eaRaw = engagements[a.id] || {};
        const ebRaw = engagements[b.id] || {};
        const ea = {
          likes: eaRaw.likes ?? a.likes ?? 0,
          comments: eaRaw.comments ?? a.comments ?? 0,
          rating: eaRaw.rating ?? a.rating ?? a.averageRating ?? 0,
        };
        const eb = {
          likes: ebRaw.likes ?? b.likes ?? 0,
          comments: ebRaw.comments ?? b.comments ?? 0,
          rating: ebRaw.rating ?? b.rating ?? b.averageRating ?? 0,
        };
        if (sortBy === 'mostLiked') return eb.likes - ea.likes;
        if (sortBy === 'mostCommented') return eb.comments - ea.comments;
        if (sortBy === 'topRated') return eb.rating - ea.rating;
        return 0;
      });
    }

    setFiltered(result);
  }, [filters, cards, sortBy, engagements]);

  // reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [filtered]);

  // infinite scroll observer
  useEffect(() => {
    const el = loadMoreRef.current;
    const root = scrollRef.current;
    if (!el || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + 20, filtered.length));
        }
      },
      { root }
    );
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
          <p className="text-lg font-medium text-gray-700 max-w-xl mx-auto mb-6">Use smart filters to explore cards that match your lifestyle — rewards, cashback, travel perks and more.</p>
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
            className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 overflow-y-auto max-h-screen shadow-inner transform transition md:static md:translate-x-0 md:w-1/4 md:min-w-[250px] md:pr-4 md:sticky md:top-0 flex-shrink-0 ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <AdvancedFilters
              filters={filters}
              setFilters={setFilters}
              availableTags={availableTags}
              banks={availableBanks}
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
          <div ref={scrollRef} className="md:flex-1 mt-4 md:mt-0 overflow-y-auto pb-4">
            <div className="mb-2 text-right">
              <label className="text-sm mr-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="mostLiked">Most Liked</option>
                <option value="topRated">Top Rated</option>
                <option value="mostCommented">Most Commented</option>
              </select>
            </div>
            <CardGrid
              cards={filtered.slice(0, visibleCount)}
              selectedTags={filters.features}
              adFrequency={adFrequency}
              onReset={resetFilters}
            />
            <div ref={loadMoreRef} className="h-10" />
          </div>
        </div>
      </div>
      <CompareStickyButton />
    </div>
  );
}

export default CardsPage;
