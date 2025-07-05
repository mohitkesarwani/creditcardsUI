import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';
import { StarIcon } from '@heroicons/react/24/outline';

interface Props {
  reviews: Review[];
}

export default function ReviewList({ reviews }: Props) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-600 flex flex-col items-center">
        <StarIcon className="w-6 h-6 mb-1 text-gray-400" />
        Be the first to leave a review for this product.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-xl overflow-hidden">
      {reviews
        .slice()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .map((r, idx) => (
          <li
            key={idx}
            className={`p-4 text-sm ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{r.name || 'Anonymous'}</span>
              <StarRating rating={r.stars} />
            </div>
            <p className="prose-sm mt-1">{r.comment}</p>
            <span className="text-xs text-gray-500">
              {new Date(r.timestamp).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </li>
        ))}
    </ul>
  );
}
