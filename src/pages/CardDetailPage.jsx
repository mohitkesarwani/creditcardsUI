import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCreditCard } from '../api/creditCards';
import {
  getMinimumAnnualFee,
  getFeatureTags,
  getTagColor,
  categorizeFeatures,
  formatPercent,
  formatMoney,
} from '../utils.js';
import Disclaimers from '../components/Disclaimers';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import SocialStats from '../components/SocialStats.tsx';
import ReviewsSection from '../components/ReviewsSection.tsx';
import useEngagement from '../hooks/useEngagement.ts';

function CardDetailPage() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: engagement, like, share, review } = useEngagement(id);

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

  useEffect(() => {
    if (!card) return;
    document.title = `${card.name} - RewardRadar`;
    const meta = document.querySelector('meta[name="description"]');
    const content = card.description || `Details about ${card.name}`;
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      const el = document.createElement('meta');
      el.name = 'description';
      el.content = content;
      document.head.appendChild(el);
    }
  }, [card]);

  if (loading) return <LoaderSkeleton rows={6} />;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;
  if (!card) return <p>Card not found.</p>;

  const annualFee = card.annualFee ?? getMinimumAnnualFee(card);
  const interestRate = card.interestRate ?? card.feesAndPricing?.interestRates?.[0]?.rate;
  const comparisonRate = card.comparisonRate ?? card.lendingRates?.[0]?.comparisonRate;
  const interestFree = card.interestFree ?? card.feesAndPricing?.interestFreePeriod;
  const tags = getFeatureTags(card);
  const featureGroups = categorizeFeatures(card.features);

  return (
    <div className="p-4">
      <Link
        to="/credit-cards"
        className="sticky top-0 z-10 inline-block text-sm text-blue-600 hover:underline mb-4"
      >
        &larr; Back
      </Link>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={
              card.productImageUrl ||
              card.cardArt?.[0]?.imageUri ||
              '/assets/image-not-available.svg'
            }
            alt={card.name}
            className="w-64 rounded-xl shadow mx-auto md:mx-0"
            onError={(e) => {
              if (e.currentTarget.src !== '/assets/image-not-available.svg') {
                e.currentTarget.src = '/assets/image-not-available.svg';
              }
            }}
          />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold">{card.name}</h1>
            <p className="text-gray-600 text-sm md:text-base mt-2">
              {card.description}
            </p>
            <div className="mt-3">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-gray-100 text-xs text-gray-800 rounded-full px-2 py-1 inline-block mr-2 mb-1"
                >
                  {t}
                </span>
              ))}
            </div>
            {engagement && (
              <SocialStats
                likes={engagement.likes}
                comments={engagement.comments}
                shares={engagement.shares}
                rating={engagement.rating}
                onLike={() => like.mutate()}
                onShare={() => share.mutate()}
                onComment={() => {}}
              />
            )}
            <a
              href={card.applicationUrl || card.applicationUri}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Apply for ${card.name}`}
              className="mt-4 inline-block bg-blue-600 text-white text-sm rounded-full px-6 py-2 hover:bg-blue-700 transition"
            >
              Apply Now
            </a>
          </div>
        </div>

        <section className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fees &amp; Pricing</h3>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm text-left text-gray-700">
              <tbody>
                {interestRate && (
                  <tr className="even:bg-gray-50">
                    <th className="pr-4 py-2">Interest Rate</th>
                    <td className="py-2">{formatPercent(interestRate)}</td>
                  </tr>
                )}
                {comparisonRate && (
                  <tr className="even:bg-gray-50">
                    <th className="pr-4 py-2">Comparison Rate</th>
                    <td className="py-2">{formatPercent(comparisonRate)}</td>
                  </tr>
                )}
                {interestFree && (
                  <tr className="even:bg-gray-50">
                    <th className="pr-4 py-2">Interest Free Period</th>
                    <td className="py-2">{interestFree}</td>
                  </tr>
                )}
                {annualFee !== null && (
                  <tr className="even:bg-gray-50">
                    <th className="pr-4 py-2">Annual Fee</th>
                    <td className="py-2">{formatMoney(annualFee)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {card.features?.length > 0 && (
          <section className="mt-10 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(featureGroups).map(([cat, list]) =>
                list.length ? (
                  <div key={cat} className="bg-white border rounded-xl shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">{cat}</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      {list.map((f, i) => (
                        <li key={i} className="text-sm">
                          {f.featureType}
                          {f.additionalValue ? ` - ${f.additionalValue}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>
          </section>
        )}

        {(card.lendingRates?.length > 0 || card.fees?.length > 0) && (
          <section className="mt-10 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lending Rates &amp; Fees</h3>
            <div className="rounded-md overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 font-semibold text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Rate / Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.lendingRates?.map((rate, i) => (
                      <tr key={`lr${i}`} className="even:bg-gray-50">
                        <td className="py-2 px-3">{rate.rateType || '-'}</td>
                        <td className="py-2 px-3">{formatPercent(rate.rate)}</td>
                      </tr>
                    ))}
                    {card.fees?.map((f, i) => (
                      <tr key={`fee${i}`} className="even:bg-gray-50">
                        <td className="py-2 px-3">{f.name || `Fee ${i + 1}`}</td>
                        <td className="py-2 px-3">{f.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {engagement && (
          <ReviewsSection reviews={engagement.reviews} onAdd={(r) => review.mutate(r)} />
        )}

        <Disclaimers className="mt-10" />
      </div>
    </div>
  );
}

export default CardDetailPage;
