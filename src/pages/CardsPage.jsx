import React, { useEffect, useState } from 'react';
import { fetchCreditCards } from '../api/creditCards';
import CardGrid from '../components/CardGrid';
import FeatureFilter from '../components/FeatureFilter';
import { useNavigate } from 'react-router-dom';
import { useSelectedCards } from '../hooks/useSelectedCards';

function CardsPage() {
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [features, setFeatures] = useState([]);
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
    if (!features.length) {
      setFiltered(cards);
    } else {
      setFiltered(
        cards.filter((c) =>
          features.every((f) =>
            c.features?.some(
              (feat) =>
                feat.featureType?.toLowerCase().includes(f.toLowerCase()) ||
                feat.additionalValue?.toLowerCase().includes(f.toLowerCase())
            )
          )
        )
      );
    }
  }, [features, cards]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 md:pr-4">
          <FeatureFilter active={features} setActive={setFeatures} />
          <button
            disabled={!selected.length}
            onClick={() => navigate('/compare')}
            className="mt-4 px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Compare ({selected.length})
          </button>
        </div>
        <div className="md:flex-1 mt-4 md:mt-0">
          <CardGrid cards={filtered} />
        </div>
      </div>
    </div>
  );
}

export default CardsPage;
