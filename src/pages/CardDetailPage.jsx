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
import FeatureTags from '../components/FeatureTags.tsx';
import ActionButtons from '../components/ActionButtons.tsx';
import { useSelectedCards } from '../hooks/useSelectedCards.jsx';
import useEngagement from '../hooks/useEngagement.ts';

function CardDetailPage() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selected, toggleCard } = useSelectedCards();
  const { data: engagement, isLoading: engagementLoading, like, share, review } = useEngagement(id);
  const commentCount = engagement?.reviews?.length ?? engagement?.comments ?? 0;

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
  const isSelected = selected.some((c) => c.id === card.id);

  return (
    <div className="bg-[#f8f9fa] p-4 md:p-8 min-h-screen">
      <Link
        to="/credit-cards"
        className="inline-block text-sm text-blue-600 underline mb-4"
      >
        &larr; Back
      </Link>
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 md:p-8">
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
            <FeatureTags tags={tags} className="mt-3" />
            <SocialStats
              likes={engagement?.likes ?? 0}
              comments={commentCount}
              shares={engagement?.shares ?? 0}
              rating={engagement?.rating ?? 0}
              loading={engagementLoading && !engagement}
              onLike={() => like.mutate()}
              onShare={() => share.mutate()}
              productId={id}
              productType="credit-cards"
              summary={{
                image:
                  card.productImageUrl ||
                  card.cardArt?.[0]?.imageUri ||
                  '/assets/image-not-available.svg',
                name: card.name,
                rate: interestRate,
                annualFee,
              }}
              onComment={() => {}}
            />
            {isSelected && (
              <div className="flex items-center gap-2 mt-3">
                <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Selected
                </span>
                <button onClick={() => toggleCard(card)} className="text-xs text-accent underline">
                  Deselect
                </button>
              </div>
            )}
            <ActionButtons
              showCompare={!isSelected}
              showDetails={false}
              onCompare={() => toggleCard(card)}
              applyHref={card.applicationUrl || card.applicationUri}
            />
          </div>
        </div>

        <section className="mt-8 border-t pt-6">
          <h3 className="section-heading mb-4">Fees &amp; Pricing</h3>
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
          <section className="mt-8 border-t pt-6">
            <h3 className="section-heading mb-4">Features</h3>
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
          <section className="mt-8 border-t pt-6">
            <h3 className="section-heading mb-4">Lending Rates &amp; Fees</h3>
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
    </div>
  );
}

export default CardDetailPage;
