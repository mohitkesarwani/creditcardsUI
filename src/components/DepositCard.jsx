import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureTags from './FeatureTags.tsx';
import ActionButtons from './ActionButtons.tsx';
import SocialStats from './SocialStats.tsx';
import InlineFeedbackBox from './InlineFeedbackBox.tsx';
import { useToast } from '../hooks/useToast.tsx';
import useEntityEngagement from '../hooks/useEntityEngagement.ts';
import { useSelectedDeposits } from '../hooks/useSelectedDeposits.jsx';
import apiClient from '../api/apiClient.js';

function DepositCard({ deposit, highlightTags = [] }) {
  const navigate = useNavigate();
  const { selected, toggleDeposit } = useSelectedDeposits();
  const isSelected = selected.some((d) => d.id === deposit.id);
  const { data: engagement, isLoading, like, share, review } = useEntityEngagement(deposit.id, 'deposits');
  const toast = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const commentCount = engagement?.reviews?.length ?? engagement?.comments ?? 0;

  const handleRate = (val) => {
    setUserRating(val);
    setFeedbackOpen(true);
  };

  const handleFeedbackSubmit = async (comment, rating) => {
    try {
      if (rating > 0 && comment.trim().length <= 2) {
        toast('error', 'Comment must be at least 3 characters');
        return;
      }
      review.mutate({ name: 'Anonymous', comment, timestamp: new Date().toISOString(), stars: rating });
      setUserRating(rating);
      setUserComment('');
      setFeedbackOpen(false);
    } catch {
      toast('error', 'Failed to post comment');
    }
  };

  const handleApply = async () => {
    try {
      await apiClient.post('/api/referrals', {
        cardId: deposit.id,
        partnerId: deposit.partnerId,
        redirectUrl: deposit.applicationUrl || deposit.applicationUri,
      });
    } catch (err) {
      console.error('Referral log failed', err);
    }
  };

  return (
    <div className="relative flex flex-col bg-white rounded p-5 shadow-sm min-h-[580px] hover:shadow-md" data-testid="deposit-card">
      <img
        src={deposit.productImageUrl || deposit.cardArt?.[0]?.imageUri || '/assets/image-not-available.svg'}
        alt={deposit.name}
        className="w-full h-20 object-contain mb-4 cursor-pointer"
        onClick={() => navigate(`/deposits/${deposit.id}`)}
        onError={(e) => {
          if (e.currentTarget.src !== '/assets/image-not-available.svg') {
            e.currentTarget.src = '/assets/image-not-available.svg';
          }
        }}
      />
      <h3 className="card-title mb-1">{deposit.name}</h3>
      <FeatureTags tags={deposit.features || []} highlightTags={highlightTags} className="mb-2" />
      <div className="grid gap-1 mb-2 text-sm">
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
      <div className="mt-auto">
        {isSelected && (
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </span>
            <button onClick={() => toggleDeposit(deposit)} className="text-xs text-accent underline">
              Deselect
            </button>
          </div>
        )}
        <ActionButtons
          showCompare={!isSelected}
          onCompare={() => toggleDeposit(deposit)}
          onDetails={() => navigate(`/deposits/${deposit.id}`)}
          onApply={handleApply}
          applyHref={deposit.applicationUrl || deposit.applicationUri}
        />
      </div>
      <SocialStats
        likes={engagement?.likes ?? 0}
        comments={commentCount}
        shares={engagement?.shares ?? 0}
        rating={engagement?.rating ?? 0}
        loading={isLoading && !engagement}
        onLike={() => like.mutate()}
        onShare={() => share.mutate()}
        onComment={() => setFeedbackOpen((v) => !v)}
        onRate={handleRate}
        userRating={userRating}
        productId={deposit.id}
        productType="deposits"
        summary={{
          image: deposit.productImageUrl || deposit.cardArt?.[0]?.imageUri || '/assets/image-not-available.svg',
          name: deposit.name,
          rate: deposit.interestRate,
        }}
      />
      {feedbackOpen ? (
        <InlineFeedbackBox
          entityId={deposit.id}
          entityType="deposits"
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={handleFeedbackSubmit}
          initialComment={userComment}
          initialRating={userRating}
        />
      ) : (
        <div className="bg-white rounded-lg border px-4 py-2 mt-2 text-sm text-gray-500 cursor-text" onClick={() => setFeedbackOpen(true)}>
          Add a comment...
        </div>
      )}
    </div>
  );
}

export default DepositCard;
