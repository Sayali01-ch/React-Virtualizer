// ============================================================================
// mockApi.ts
//
// STEP 0: MOCK API — replace this with your real backend call.
// Simulates a paginated endpoint with network delay.
//
// HOW TO USE THIS IN YOUR REAL PROJECT:
//   Replace mockFetchPage() with a real fetch/axios call to your Express
//   backend, e.g.:
//
//     export async function fetchPage(cursor: number | null, limit = PAGE_SIZE) {
//       const res = await fetch(`/api/items?cursor=${cursor ?? 0}&limit=${limit}`);
//       return res.json(); // { data, nextCursor, hasMore }
//     }
//
//   Your backend endpoint should accept:
//     GET /api/items?cursor=<lastId>&limit=50
//   and return:
//     { data: [...], nextCursor: <id or null>, hasMore: true/false }
// ============================================================================

import type { Item, PageResponse } from "./types";

export const TOTAL_ROWS = 70000; // pretend the backend has this many total rows
export const PAGE_SIZE = 100;

export function mockFetchPage(
  cursor: number | null,
  limit = PAGE_SIZE
): Promise<PageResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = cursor ?? 0;
      const end = Math.min(start + limit, TOTAL_ROWS);

      const data: Item[] = Array.from({ length: end - start }, (_, i) => {
        const id = start + i;
        return {
          id,
          name: `Item #${id}`,
          status: id % 3 === 0 ? "Active" : id % 3 === 1 ? "Pending" : "Closed",
          value: `$${(id * 37.5).toFixed(2)}`,
        };
      });

      resolve({
        data,
        nextCursor: end < TOTAL_ROWS ? end : null,
        hasMore: end < TOTAL_ROWS,
      });
    }, 400); // simulate network latency
  });
}