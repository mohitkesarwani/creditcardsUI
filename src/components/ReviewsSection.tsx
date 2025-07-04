import React, { useState } from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

interface Props {
  reviews: Review[];
  onAdd: (review: Review) => void;
}

export default function ReviewsSection({ reviews, onAdd }: Props) {
  const [comment, setComment] = useState('');
  const [stars, setStars] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const rev: Review = { name: 'User', comment: comment.trim(), timestamp: Date.now(), stars };
    onAdd(rev);
    setComment('');
    setStars(5);
  };

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold mb-2">User Reviews</h3>
      {reviews.length === 0 && (
        <p className="text-sm text-gray-500">No reviews yet — be the first to share your thoughts!</p>
      )}
      {reviews.length > 0 && (
        <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
          {reviews
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((r, idx) => (
              <div key={idx} className="border-b pb-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  <StarRating rating={r.stars} />
                </div>
                <p>{r.comment}</p>
                <p className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleString()}</p>
              </div>
            ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          placeholder="Write a review"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm">Rating:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={stars}
            onChange={(e) => setStars(Number(e.target.value))}
            className="w-16 border rounded p-1 text-sm"
          />
          <button type="submit" className="ml-auto btn btn-primary text-xs px-3 py-1">
            Submit
          </button>
        </div>
      </form>
    </section>
  );
}
