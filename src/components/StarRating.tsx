import React from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

interface Props {
  rating: number; // 0-5
}

export default function StarRating({ rating }: Props) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<StarSolid key={i} className="w-4 h-4 text-yellow-500" />);
    else if (i === full && half) stars.push(
      <StarSolid key={i} className="w-4 h-4 text-yellow-500" style={{ clipPath: 'inset(0 50% 0 0)' }} />
    );
    else stars.push(<StarOutline key={i} className="w-4 h-4 text-yellow-500" />);
  }
  return <div className="flex">{stars}</div>;
}
