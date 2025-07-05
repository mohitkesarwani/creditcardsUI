import React, { useState } from 'react';
import { Review } from '../types';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface Props {
  reviews: Review[];
  onAdd: (review: Review) => Promise<any> | void;
}

export default function ReviewsSection({ reviews, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="mt-8 border-t pt-6" aria-label="User reviews">
      <div className="flex items-center justify-between mb-2">
        <h3 className="section-heading">
          User Reviews <span className="text-sm text-gray-500">({reviews.length})</span>
        </h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-sm text-blue-600 underline"
          aria-expanded={showForm}
        >
          Write a Review
        </button>
      </div>
      <div className="space-y-4">
        {showForm && <ReviewForm onAdd={onAdd} />}
        <ReviewList reviews={reviews} />
      </div>
    </section>
  );
}
