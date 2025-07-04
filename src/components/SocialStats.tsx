import React from 'react';
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';

interface SocialStatsProps {
  likes: number;
  comments: number;
  shares: number;
  rating: number;
  onLike?: () => void;
  onShare?: () => void;
  onComment?: () => void;
}

export default function SocialStats({ likes, comments, shares, rating, onLike, onShare, onComment }: SocialStatsProps) {
  const iconCls = 'w-5 h-5';
  const btnCls = 'flex items-center gap-1 hover:text-blue-500 transition';

  return (
    <div className="mt-2 text-sm text-gray-600 flex items-center flex-wrap gap-4">
      <button onClick={onLike} aria-label="Like this product" className={btnCls} tabIndex={0}>
        <HandThumbUpIcon className={iconCls} /> {likes}
      </button>
      <button onClick={onComment} aria-label="View comments" className={btnCls} tabIndex={0}>
        <ChatBubbleLeftEllipsisIcon className={iconCls} /> {comments}
      </button>
      <button onClick={onShare} aria-label="Share this product" className={btnCls} tabIndex={0}>
        <ArrowPathIcon className={iconCls} /> {shares}
      </button>
      <div className="flex items-center gap-1" aria-label="Average rating">
        <StarIcon className="w-5 h-5 text-yellow-500" />
        <span className="sr-only">Rating</span>
        <StarRating rating={rating} />
      </div>
    </div>
  );
}
