import React, { useEffect, useRef, useState } from 'react';
import StarRatingInput from './StarRatingInput';
import { Review } from '../types';
import { useToast } from '../hooks/useToast.tsx';

interface Props {
  onAdd: (review: Review) => Promise<any> | void;
}

export default function ReviewForm({ onAdd }: Props) {
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const expanded = touched || comment || rating || name;

  useEffect(() => {
    if (expanded && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [expanded]);

  const commentTooLong = comment.length > 200;
  const canSubmit = comment.trim() && rating > 0 && !commentTooLong && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim() || 'Anonymous',
        comment: comment.trim(),
        timestamp: Date.now(),
        stars: rating,
      });
      setComment('');
      setName('');
      setRating(0);
      setTouched(false);
      toast('success', 'Thanks for sharing your feedback!');
    } catch {
      toast('error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="form"
      aria-label="Submit a review"
      className={`transition-all overflow-hidden ${expanded ? 'max-h-[500px]' : 'max-h-16'}`}
    >
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={() => setTouched(true)}
          placeholder="Share your experience with this product..."
          className="w-full border rounded p-2 text-sm resize-none focus:outline-none"
          rows={expanded ? 4 : 2}
        />
        {touched && !comment.trim() && (
          <p className="text-red-600 text-xs" role="alert">
            Comment is required
          </p>
        )}
        {commentTooLong && (
          <p className="text-red-600 text-xs" role="alert">
            Comment must be 200 characters or less
          </p>
        )}
        <div className="flex items-center gap-2">
          <StarRatingInput rating={rating} onChange={setRating} />
          {touched && rating === 0 && (
            <p className="text-red-600 text-xs" role="alert">
              Rating required
            </p>
          )}
          <span className={`ml-auto text-xs ${commentTooLong ? 'text-red-600' : 'text-gray-500'}`}>{comment.length}/200</span>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="w-full border rounded p-2 text-sm"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm w-full disabled:opacity-50"
        >
          Submit Review
        </button>
      </div>
    </form>
  );
}
