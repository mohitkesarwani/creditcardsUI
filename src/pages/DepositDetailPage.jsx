import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDeposit } from '../api/deposits';
import Disclaimers from '../components/Disclaimers';
import LoaderSkeleton from '../components/LoaderSkeleton.jsx';
import SocialStats from '../components/SocialStats.tsx';
import ReviewsSection from '../components/ReviewsSection.tsx';
import FeatureTags from '../components/FeatureTags.tsx';
import ActionButtons from '../components/ActionButtons.tsx';
import useEntityEngagement from '../hooks/useEntityEngagement.ts';

function DepositDetailPage() {
  const { id } = useParams();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: engagement, isLoading: engagementLoading, like, share, review } = useEntityEngagement(id, 'deposits');
  const commentCount = engagement?.reviews?.length ?? engagement?.comments ?? 0;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDeposit(id);
        setDeposit(data);
      } catch (err) {
        setError('Failed to load deposit');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!deposit) return;
    document.title = `${deposit.name} - RewardRadar`;
  }, [deposit]);

  if (loading) return <LoaderSkeleton rows={6} />;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;
  if (!deposit) return <p>Deposit not found.</p>;

  return (
    <div className="bg-[#f8f9fa] p-4 md:p-8 min-h-screen">
      <Link to="/deposits" className="inline-block text-sm text-blue-600 underline mb-4">
        &larr; Back
      </Link>
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img
              src={deposit.productImageUrl || deposit.cardArt?.[0]?.imageUri || '/assets/image-not-available.svg'}
              alt={deposit.name}
              className="w-64 rounded-xl shadow mx-auto md:mx-0"
              onError={(e) => {
                if (e.currentTarget.src !== '/assets/image-not-available.svg') {
                  e.currentTarget.src = '/assets/image-not-available.svg';
                }
              }}
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold">{deposit.name}</h1>
              <p className="text-gray-600 text-sm md:text-base mt-2">{deposit.description}</p>
              <FeatureTags tags={deposit.features || []} className="mt-3" />
              <div className="grid gap-1 mt-3 text-sm">
                {deposit.interestRate && (
                  <p className="card-subtext">
                    <span className="font-bold">Interest Rate:</span> {deposit.interestRate}
                  </p>
                )}
                {deposit.depositType && (
                  <p className="card-subtext">
                    <span className="font-bold">Type:</span> {deposit.depositType}
                  </p>
                )}
              </div>
              <ActionButtons
                showCompare={false}
                showDetails={false}
                applyHref={deposit.applicationUrl || deposit.applicationUri}
              />
              <SocialStats
                likes={engagement?.likes ?? 0}
                comments={commentCount}
                shares={engagement?.shares ?? 0}
                rating={engagement?.rating ?? 0}
                loading={engagementLoading && !engagement}
                onLike={() => like.mutate()}
                onShare={() => share.mutate()}
                productId={id}
                productType="deposits"
                summary={{
                  image: deposit.productImageUrl || deposit.cardArt?.[0]?.imageUri || '/assets/image-not-available.svg',
                  name: deposit.name,
                  rate: deposit.interestRate,
                }}
                onComment={() => {}}
              />
            </div>
          </div>

          {deposit.features?.length > 0 && (
            <section className="mt-8 border-t pt-6">
              <h3 className="section-heading mb-4">Features</h3>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                {deposit.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
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

export default DepositDetailPage;
