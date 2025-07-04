import React, { useState } from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

interface Props {
  rating: number; // 0-5 step 0.5
  onChange: (value: number) => void;
}

export default function StarRatingInput({ rating, onChange }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const display = hover !== null ? hover : rating;

  const getIcon = (i: number) => {
    if (display >= i) return <StarSolid className="w-6 h-6" />;
    if (display >= i - 0.5)
      return (
        <StarSolid className="w-6 h-6" style={{ clipPath: 'inset(0 50% 0 0)' }} />
      );
    return <StarOutline className="w-6 h-6" />;
  };

  const handleClick = (
    i: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX - rect.left < rect.width / 2 ? 0.5 : 0;
    const val = i - half;
    onChange(val === rating ? 0 : val);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(i === rating ? 0 : i);
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(5, rating + 0.5));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(0, rating - 0.5));
    }
  };

  return (
    <fieldset className="flex" aria-label="Your Rating">
      <legend className="sr-only">Your Rating</legend>
      {Array.from({ length: 5 }).map((_, idx) => {
        const i = idx + 1;
        return (
          <button
            key={i}
            type="button"
            tabIndex={0}
            onMouseEnter={() => setHover(i)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const val =
                e.clientX - rect.left < rect.width / 2 ? i - 0.5 : i;
              setHover(val);
            }}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={(e) => handleClick(i, e)}
            onKeyDown={(e) => handleKey(e, i)}
            className={`text-yellow-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
          >
            {getIcon(i)}
          </button>
        );
      })}
    </fieldset>
  );
}
