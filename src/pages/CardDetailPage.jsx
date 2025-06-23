import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCreditCard } from '../api/creditCards';
import { getMinimumAnnualFee } from '../utils.js';

function CardDetailPage() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCreditCard(id);
        setCard(data);
      } catch (err) {
        setError('Failed to load card');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!card) return <p>Card not found.</p>;

  return (
    <div className="p-4">
      <Link to="/cards" className="text-blue-600 underline">&larr; Back</Link>
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">{card.name}</h2>
        <img
          src={card.cardArt?.[0]?.imageUri}
          alt={card.name}
          className="h-32 mb-4"
        />
        <p className="mb-2">{card.description}</p>
        <p>Interest Rate: {card.feesAndPricing?.interestRates?.[0]?.rate}</p>
        <p>Interest Free Period: {card.feesAndPricing?.interestFreePeriod}</p>
        <p>Annual Fee: {getMinimumAnnualFee(card)}</p>
        <h3 className="font-bold mt-4">Benefits</h3>
        <ul className="list-disc ml-5">
          {card.features?.map((f, i) => (
            <li key={i}>{f.featureType} {f.additionalValue}</li>
          ))}
        </ul>
        <h3 className="font-bold mt-4">Fees</h3>
        <ul className="list-disc ml-5">
          {card.fees?.map((f, i) => (
            <li key={i}>{f.amount}</li>
          ))}
        </ul>
        <h3 className="font-bold mt-4">User Reviews</h3>
        <p className="italic text-sm">Coming soon...</p>
      </div>
    </div>
  );
}

export default CardDetailPage;
