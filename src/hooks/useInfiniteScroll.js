import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(
  callback,
  { rootRef, hasMore = true, loading = false, rootMargin = '0px 0px -20% 0px' } = {}
) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = rootRef?.current || null;
    if (!sentinel || !root || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          callback();
        }
      },
      { root, rootMargin }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [callback, rootRef, hasMore, loading, rootMargin]);

  return sentinelRef;
}
