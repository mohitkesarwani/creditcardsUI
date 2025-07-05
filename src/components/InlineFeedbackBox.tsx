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
      if (comment.trim()) {
        await postComment({
          userId: 'anon',
          entityId,
          entityType,
          commentText: comment.trim(),
        });
      }
      if (rating > 0) {
        await postReview({ userId: 'anon', entityId, entityType, rating });
      }
      toast('success', 'Comment posted');
      onSubmitted && onSubmitted(comment.trim(), rating);
      onClose();
    } catch {
      toast('error', 'Failed to post comment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border px-4 py-3 mt-2 shadow" data-testid="inline-feedback">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add your comment here..."
        className="w-full border rounded p-2 text-sm resize-none mb-2 max-h-[100px]"
      />
      <div className="flex items-center justify-end gap-2">
        <StarRatingInput rating={rating} onChange={setRating} />
        <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePost}
          disabled={saving}
          className="btn btn-primary text-xs"
        >
          Post
        </button>
      </div>
    </div>
  );
}
