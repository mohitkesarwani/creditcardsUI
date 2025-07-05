import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatMoney,
  formatPercent,
  getMortgageFeatureTags,
} from '../utils.js';
import { useSelectedMortgages } from '../hooks/useSelectedMortgages.jsx';
import SocialStats from './SocialStats.tsx';
import InlineFeedbackBox from './InlineFeedbackBox.tsx';
import { useToast } from '../hooks/useToast.tsx';
import useEngagement from '../hooks/useEngagement.ts';
import FeatureTags from './FeatureTags.tsx';
import ActionButtons from './ActionButtons.tsx';

function MortgageCard({ mortgage, highlightTags = [] }) {
  const navigate = useNavigate();
  const rate = mortgage.lendingRates?.[0]?.rate;
  const comparisonRate = mortgage.lendingRates?.[0]?.comparisonRate;
  const fees = mortgage.feesAndPricing?.fees || [];
  const tags = getMortgageFeatureTags(mortgage);
  const { selected, toggleMortgage } = useSelectedMortgages();
  const isSelected = selected.some((m) => m.id === mortgage.id);
  const { data: engagement, isLoading: engagementLoading, like, share, review } = useEngagement(mortgage.id);
  const toast = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(0);

  const handleRate = (val) => {
    setUserRating(val);
    setFeedbackOpen(true);
  };

  const handleFeedbackSubmit = (comment, rating) => {
    setUserComment(comment);
    setUserRating(rating);
    review.mutate({ name: 'Anon', comment, timestamp: Date.now(), stars: rating });
  };

  const handleDelete = () => {
    setUserComment('');
    setUserRating(0);
    toast('success', 'Comment deleted');
  };


  return (
    <div
      id={mortgage.id}
      className="relative flex flex-col bg-white rounded p-5 shadow-sm min-h-[580px] hover:shadow-md transition"
      data-testid="mortgage-card"
    >
      <img
        src={mortgage.cardArt?.imageUri || '/assets/image-not-available.svg'}
        alt={mortgage.bankName || mortgage.brandName}
        className="w-full h-20 object-contain mb-2"
        onError={(e) => {
          if (e.currentTarget.src !== '/assets/image-not-available.svg') {
            e.currentTarget.src = '/assets/image-not-available.svg';
          }
        }}
      />
      <p className="text-xs text-gray-500 mb-1 leading-snug">{mortgage.bankName || mortgage.brandName}</p>
      <h3 className="card-title mb-2 font-semibold leading-snug">{mortgage.name}</h3>
      <div className="grid gap-1 mb-2 text-sm leading-relaxed">
        {rate && (
          <p className="card-subtext">
            <span className="font-bold">Interest Rate:</span> {formatPercent(rate)}
          </p>
        )}
        {comparisonRate && (
          <p className="card-subtext">
            <span className="font-bold">Comparison Rate:</span> {formatPercent(comparisonRate)}
          </p>
        )}
        {fees.map((f) => (
          <p
            key={f.name}
            className="card-subtext flex items-center gap-1"
            data-testid={`fee-${f.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span className="font-bold">{f.name}:</span> {formatMoney(f.amount)}
          </p>
        ))}
      </div>
      <FeatureTags tags={tags} highlightTags={highlightTags} className="mb-3" />
      <div className="mt-auto">
        {isSelected && (
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </span>
            <button onClick={() => toggleMortgage(mortgage)} className="text-xs text-accent underline" aria-label="Deselect loan">
              Deselect
            </button>
          </div>
        )}
        <ActionButtons
          showCompare={!isSelected}
          onCompare={() => toggleMortgage(mortgage)}
          onDetails={() => navigate(`/home-loans/${mortgage.id}`)}
          applyHref={mortgage.applicationUri}
        />
      </div>
      <SocialStats
        likes={engagement?.likes ?? 0}
        comments={engagement?.comments ?? 0}
        shares={engagement?.shares ?? 0}
        rating={engagement?.rating ?? 0}
        loading={engagementLoading && !engagement}
        onLike={() => like.mutate()}
        onShare={() => share.mutate()}
        onComment={() => setFeedbackOpen((v) => !v)}
        onRate={handleRate}
        userRating={userRating}
        productId={mortgage.id}
        productType="home-loans"
        summary={{
          image: mortgage.cardArt?.imageUri || '/assets/image-not-available.svg',
          name: mortgage.name,
          rate,
          annualFee: fees[0]?.amount,
        }}
      />
      {feedbackOpen ? (
        <InlineFeedbackBox
          entityId={mortgage.id}
          entityType="home-loans"
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={handleFeedbackSubmit}
          initialComment={userComment}
          initialRating={userRating}
        />
      ) : userComment ? (
        <div className="bg-white rounded-lg border px-4 py-3 mt-2 text-sm shadow">
          <p className="whitespace-pre-line break-words">{userComment}</p>
          <div className="flex justify-end gap-2 mt-2 text-xs">
            <button type="button" onClick={() => setFeedbackOpen(true)} className="btn btn-secondary text-xs">Edit</button>
            <button type="button" onClick={handleDelete} className="btn btn-secondary text-xs">Delete</button>
          </div>
        </div>
      ) : (
        <div
          className="bg-white rounded-lg border px-4 py-2 mt-2 text-sm text-gray-500 cursor-text"
          onClick={() => setFeedbackOpen(true)}
        >
          Add a comment...
        </div>
      )}
    </div>
  );
}

export default MortgageCard;
