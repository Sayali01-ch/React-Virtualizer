// ============================================================================
// useInfiniteItems.ts
//
// STEP 1: FETCH LOGIC — this is the "calling api" / pagination bookmark part.
// Encapsulated as a hook so it's reusable and separate from rendering concerns.
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { mockFetchPage, PAGE_SIZE } from "./mockApi";
import type { Item } from "./types";

export function useInfiniteItems() {
  const [items, setItems] = useState<Item[]>([]); // all rows fetched so far
  const [cursor, setCursor] = useState<number | null>(0); // pagination bookmark
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchNextPage = useCallback(async () => {
    if (isFetching || !hasMore) return; // prevent duplicate calls

    setIsFetching(true);
    try {
      const res = await mockFetchPage(cursor, PAGE_SIZE);
      setItems((prev) => [...prev, ...res.data]);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error("Failed to fetch page:", err);
    } finally {
      setIsFetching(false);
    }
  }, [cursor, hasMore, isFetching]);

  // Load the first page on mount
  useEffect(() => {
    fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, hasMore, isFetching, fetchNextPage };
}