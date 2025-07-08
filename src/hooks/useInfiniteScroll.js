import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(callback, { rootRef, hasMore = true, loading = false } = {}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = rootRef?.current || null;
    if (!sentinel || !root || loading || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        callback();
      }
    }, { root });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [callback, rootRef, hasMore, loading]);

  return sentinelRef;
}
