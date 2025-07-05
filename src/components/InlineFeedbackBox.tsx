import React, { useState } from 'react';
import StarRatingInput from './StarRatingInput';
import { postComment, postReview } from '../api/feedback';
import { useToast } from '../hooks/useToast.tsx';

interface Props {
  entityId: string;
  entityType: string;
  onClose: () => void;
  onSubmitted?: (comment: string, rating: number) => void;
  initialComment?: string;
  initialRating?: number;
}

export default function InlineFeedbackBox({
  entityId,
  entityType,
  onClose,
  onSubmitted,
  initialComment = '',
  initialRating = 0,
}: Props) {
  const [comment, setComment] = useState(initialComment);
  const [rating, setRating] = useState(initialRating);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handlePost = async () => {
    setSaving(true);
    try {
      if (rating > 0) {
        if (comment.trim().length <= 2) {
          toast('error', 'Comment must be at least 3 characters');
          setSaving(false);
          return;
        }
        await postReview({
          userId: 'anon',
          entityId,
          entityType,
          rating,
          commentText: comment.trim(),
        });
        toast('success', 'Review posted');
      } else if (comment.trim()) {
        await postComment({
          userId: 'anon',
          entityId,
          entityType,
          commentText: comment.trim(),
        });
        toast('success', 'Comment posted');
      }
      onSubmitted && onSubmitted(comment.trim(), rating);
      onClose();
    } catch {
      toast('error', 'Failed to post comment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="mt-2 w-full flex flex-col bg-gray-50 border border-gray-200 rounded-md p-3 transition-[max-height] ease-in-out duration-300"
      data-testid="inline-feedback"
    >
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none mb-2 max-h-[100px] overflow-y-auto placeholder:text-sm placeholder:text-gray-500 placeholder:pl-2"
      />
      <div className="mb-2">
        <StarRatingInput rating={rating} onChange={setRating} />
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="border border-gray-300 text-gray-600 px-3 py-1 text-sm rounded"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePost}
          disabled={saving}
          className="bg-green-600 text-white px-3 py-1 text-sm rounded"
        >
          Post
        </button>
      </div>
    </div>
  );
}
