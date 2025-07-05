import React, { useState, useEffect } from 'react';
import { postComment, getComments } from '../api/feedback';

function SocialBar({ itemId, type = 'card' }) {
  const likeKey = `${type}-like-${itemId}`;
  const likeCountKey = `${type}-like-count-${itemId}`;

  const [liked, setLiked] = useState(() => localStorage.getItem(likeKey) === '1');
  const [likes, setLikes] = useState(() => {
    const val = localStorage.getItem(likeCountKey);
    return val ? parseInt(val, 10) : 0;
  });
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getComments(itemId);
        setComments(Array.isArray(data) ? data : []);
      } catch {
        // ignore fetch errors
      }
    };
    load();
  }, [itemId]);

  useEffect(() => {
    localStorage.setItem(likeKey, liked ? '1' : '0');
    localStorage.setItem(likeCountKey, String(likes));
  }, [liked, likes, likeKey, likeCountKey]);


  const handleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikes((c) => (next ? c + 1 : Math.max(c - 1, 0)));
      return next;
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    try {
      await postComment({
        userId: 'anon',
        entityId: itemId,
        entityType: type,
        commentText: text,
      });
      const updated = await getComments(itemId);
      setComments(Array.isArray(updated) ? updated : []);
      setNewComment('');
    } catch {
      // ignore errors for now
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${type === 'mortgage' ? '/home-loans' : '/credit-cards'}#${itemId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const iconCls = 'h-5 w-5';
  const btnCls = 'flex items-center gap-1 hover:text-blue-500 transition';

  return (
    <div className="mt-3 pt-2 border-t text-sm text-gray-500">
      <div className="flex gap-4 items-center flex-wrap">
        <button onClick={handleLike} aria-label="Like this item" className={btnCls}>
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v7a2 2 0 002 2h6.31a2 2 0 001.994-1.817l.31-2.183h2.386a2 2 0 001.989-1.757l.357-3A2 2 0 0018.389 9H14z" />
          </svg>
          <span>Like</span>
          <span className="ml-1 text-xs">{likes}</span>
        </button>
        <button onClick={() => setShowComments((c) => !c)} aria-label="View comments" className={btnCls}>
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4H7a2 2 0 01-2-2V10a2 2 0 012-2h2" />
          </svg>
          <span>Comment</span>
          <span className="ml-1 text-xs">{comments.length}</span>
        </button>
        <button onClick={handleShare} aria-label="Share this item" className={btnCls}>
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v.01M12 5v.01M20 12v.01M12 19v.01M8 12h8" />
          </svg>
          <span>Share</span>
        </button>
        {copied && <span className="text-xs text-green-600">Copied to clipboard!</span>}
      </div>
      {showComments && (
        <div className="mt-2 space-y-2">
          <div className="max-h-40 overflow-y-auto space-y-2">
            {comments.slice(-5).map((c, idx) => (
              <div key={idx} className="border-b pb-1">
                <p className="font-bold text-sm leading-none">{c.userId || 'Anon'}</p>
                <p className="text-sm">{c.commentText}</p>
                <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="pt-2 border-t flex gap-2 items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 rounded border px-2 py-1 text-sm"
              placeholder="Add a comment"
            />
            <button type="submit" className="bg-blue-500 text-white text-xs rounded px-2 py-1">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SocialBar;
