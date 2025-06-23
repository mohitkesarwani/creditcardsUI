import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCreditCard } from '../api/creditCards';
import {
  getMinimumAnnualFee,
  getFeatureTags,
  getTagColor,
} from '../utils.js';

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

  const annualFee = getMinimumAnnualFee(card);
  const interestRate = card.feesAndPricing?.interestRates?.[0]?.rate;
  const comparisonRate = card.lendingRates?.[0]?.comparisonRate;
  const interestFree = card.feesAndPricing?.interestFreePeriod;
  const tags = getFeatureTags(card);

  return (
    <div className="p-4">
      <Link to="/cards" className="text-blue-600 underline">&larr; Back</Link>
      <div className="mt-4 max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={card.cardArt?.[0]?.imageUri}
            alt={card.name}
            className="h-40 mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">{card.name}</h2>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((t) => (
              <span
                key={t}
                className={`text-xs font-semibold px-2 py-0.5 rounded ${getTagColor(t)}`}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mb-4 max-w-xl">{card.description}</p>
          <a
            href={card.applicationUri}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Apply Now
          </a>
        </div>

        <section className="mb-6">
          <h3 className="font-bold text-lg mb-2">Fees &amp; Pricing</h3>
          <table className="w-full text-sm">
            <tbody>
              {interestRate && (
                <tr>
                  <th className="text-left pr-2">Interest Rate</th>
                  <td>{interestRate}</td>
                </tr>
              )}
              {comparisonRate && (
                <tr>
                  <th className="text-left pr-2">Comparison Rate</th>
                  <td>{comparisonRate}</td>
                </tr>
              )}
              {interestFree && (
                <tr>
                  <th className="text-left pr-2">Interest Free Period</th>
                  <td>{interestFree}</td>
                </tr>
              )}
              {annualFee !== null && (
                <tr>
                  <th className="text-left pr-2">Annual Fee</th>
                  <td>{annualFee}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {card.features?.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold text-lg mb-2">Features</h3>
            <ul className="list-disc ml-5 space-y-1">
              {card.features.map((f, i) => (
                <li key={i}>
                  {f.featureType}
                  {f.additionalValue ? ` - ${f.additionalValue}` : ''}
                </li>
              ))}
            </ul>
          </section>
        )}

        {card.eligibility?.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold text-lg mb-2">Eligibility</h3>
            <ul className="list-disc ml-5 space-y-1">
              {card.eligibility.map((e, i) => (
                <li key={i}>
                  {e.value}
                  {e.unit || ''}
                </li>
              ))}
            </ul>
          </section>
        )}

        {card.lendingRates?.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold text-lg mb-2">Lending Rates</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {Object.keys(card.lendingRates[0]).map((k) => (
                    <th key={k} className="border px-2 py-1 text-left">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.lendingRates.map((rate, i) => (
                  <tr key={i}>
                    {Object.keys(card.lendingRates[0]).map((k) => (
                      <td key={k} className="border px-2 py-1">
                        {rate[k] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {card.fees?.length > 0 && (
          <section className="mb-6">
            <h3 className="font-bold text-lg mb-2">Fees</h3>
            <ul className="list-disc ml-5 space-y-1">
              {card.fees.map((f, i) => (
                <li key={i}>{f.amount}</li>
              ))}
            </ul>
          </section>
        )}

        <h3 className="font-bold text-lg mb-2">User Reviews</h3>
        <p className="italic text-sm">Coming soon...</p>
      </div>
    </div>
  );
}

export default CardDetailPage;
