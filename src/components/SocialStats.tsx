import React from 'react';
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, StarIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import ShareMenu from './ShareMenu';

interface SocialStatsProps {
  likes: number;
  comments: number;
  shares: number;
  rating: number;
  loading?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  productId: string;
  productType: string;
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
  productId,
  productType,
}: SocialStatsProps) {
  const iconCls = 'w-5 h-5 text-[#555555] group-hover:text-[#222222]';
  const btnCls = 'flex items-center gap-1 transition group';

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
      <ShareMenu
        productId={productId}
        productType={productType}
        count={shares}
        onShared={onShare}
      />
      <div className="flex items-center gap-1" aria-label="Average rating">
        <StarIcon className="w-5 h-5 text-yellow-500" />
        <span className="sr-only">Rating</span>
        <StarRating rating={rating} />
      </div>
    </div>
  );
}
