import React, { useEffect, useState, useRef } from 'react';
import { fetchCreditCards } from '../api/creditCards';
import CardGrid from '../components/CardGrid';
import AdvancedFilters from '../components/AdvancedFilters';
import { getMinimumAnnualFee } from '../utils.js';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';

function CardsPage() {
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const [filters, setFilters] = useState({
    type: '',
    creditScore: '',
    annualFee: '',
    interestRate: '',
    features: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selected } = useSelectedCards();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCreditCards();
        setCards(data);
        setFiltered(data);
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
        filters.features.every((f) => {
          const t = f.toLowerCase();
          const inFeatures = c.features?.some(
            (feat) =>
              feat.featureType?.toLowerCase().includes(t) ||
              feat.additionalValue?.toLowerCase().includes(t)
          );
          const inCategory = c.productCategory?.toLowerCase().includes(t);
          return inFeatures || inCategory;
        })
      );
    }

    if (filters.type) {
      const t = filters.type.toLowerCase();
      result = result.filter((c) => {
        const inCategory = c.productCategory?.toLowerCase().includes(t);
        const inFeatures = c.features?.some(
          (feat) =>
            feat.featureType?.toLowerCase().includes(t) ||
            feat.additionalValue?.toLowerCase().includes(t)
        );
        return inCategory || inFeatures;
      });
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

    if (filters.interestRate) {
      const max = Number(filters.interestRate);
      result = result.filter((c) => {
        const rate = parseFloat(c.feesAndPricing?.interestRates?.[0]?.rate);
        return !isNaN(rate) && rate <= max;
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 md:pr-4 md:sticky md:top-4">
          <AdvancedFilters filters={filters} setFilters={setFilters} />
          <button
            disabled={!selected.length}
            onClick={() => navigate('/compare')}
            className="mt-4 px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Compare ({selected.length})
          </button>
        </div>
        <div className="md:flex-1 mt-4 md:mt-0">
          <CardGrid cards={filtered.slice(0, visibleCount)} />
          <div ref={loadMoreRef} className="h-10" />
        </div>
      </div>
    </div>
  );
}

export default CardsPage;
