import React, { useState } from 'react';
import {
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import StarRatingInput from './StarRatingInput';
import ShareModal from './ShareModal';

interface SocialStatsProps {
  likes: number;
  comments: number;
  shares: number;
  rating: number;
  loading?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  onRate?: (value: number) => void;
  userRating?: number;
  productId: string;
  productType: string;
  summary: {
    image?: string;
    name: string;
    rate?: string | number | null;
    annualFee?: string | number | null;
  };
}

export default function SocialStats({
  likes,
  comments,
  shares,
  rating,
  loading = false,
  onLike,
  onShare,
  onComment,
  onRate,
  userRating,
  productId,
  productType,
  summary,
}: SocialStatsProps) {
  const iconCls = 'w-5 h-5 text-[#555555] group-hover:text-[#222222]';
  const btnCls = 'flex items-center gap-1 transition group';
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="mt-2 flex items-center flex-wrap gap-4 animate-pulse" aria-label="Loading social stats">
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="mt-2 text-sm text-gray-600 flex items-center flex-wrap gap-4">
      <button onClick={onLike} aria-label="Like this product" className={btnCls} tabIndex={0}>
        <HandThumbUpIcon className={iconCls} /> {likes}
      </button>
      <button onClick={onComment} aria-label="View comments" className={btnCls} tabIndex={0}>
        <ChatBubbleLeftEllipsisIcon className={iconCls} /> {comments}
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          aria-label="Share this product"
          className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
        >
          <PaperAirplaneIcon className={iconCls} /> Share
        </button>
        <span className="text-xs">{shares} Shares</span>
      </div>
      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        onShare={() => onShare && onShare()}
        header={`Share this ${productType === 'home-loans' ? 'home loan' : 'card'}`}
        summary={summary}
      />
      <div className="flex items-center gap-1" aria-label="Average rating" title={onRate ? 'Rate this card' : undefined}>
        <StarIcon className="w-5 h-5 text-yellow-500" />
        <span className="sr-only">Rating</span>
        {onRate ? (
          <div className="scale-75">
            <StarRatingInput rating={userRating ?? 0} onChange={onRate} />
          </div>
        ) : (
          <StarRating rating={rating} />
        )}
      </div>
    </div>
  );
}
