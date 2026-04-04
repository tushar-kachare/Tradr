import { useState, useEffect, useRef, useCallback } from "react";

const useInfiniteScroll = (fetchFn, deps = []) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const pageRef = useRef(1);
  const hasNextPageRef = useRef(true);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasNextPageRef.current) return;

    // block immediately — synchronous, before any await
    loadingRef.current = true;
    setLoading(true);

    const pageToFetch = pageRef.current;

    try {
      const res = await fetchFn(pageToFetch);
      const newItems = res.posts ?? [];

      setItems((prev) => (pageToFetch === 1 ? newItems : [...prev, ...newItems]));

      const hasNext = pageToFetch < res.pagination.totalPages;
      hasNextPageRef.current = hasNext;

      if (hasNext) {
        pageRef.current = pageToFetch + 1; // set explicitly, not +=
      }
    } catch (err) {
      setError("Failed to load. Try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    pageRef.current = 1;
    hasNextPageRef.current = true;
    loadingRef.current = false;
    setItems([]);
    setError(null);
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPageRef.current &&
          !loadingRef.current
        ) {
          loadMore();
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, items]);

  return { items, loading, error, sentinelRef };
};

export default useInfiniteScroll;