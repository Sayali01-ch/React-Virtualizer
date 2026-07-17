# React Virtualized Infinite Table

This workspace contains a React + TypeScript demo for a virtualized infinite-scroll table.

## Run the demo

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local demo server:

   ```bash
   npm run dev
   ```

3. Open the browser at the URL shown by Vite (usually `http://localhost:5173`).

## Preview for your manager

- Use `npm run dev` to show the working demo interactively.
- Use `npm run preview` after `npm run build` for a production-like preview.

start index=scrollTop/height 
End index=(scrollTop + window height) / height

New start index =Math.max(0, start index -overscan);
End Index=Math.min(totalNumberOfItems, End index + overscan);

# Virtualized Infinite Table

A MERN-friendly React component that combines **virtualization** and **infinite scroll** to render huge lists (tens of thousands of rows) while keeping the DOM light and the UI smooth.

Built with [`@tanstack/react-virtual`](https://tanstack.com/virtual/latest).

```
virtualized-infinite-table/
├── types.ts
├── mockApi.ts
├── useInfiniteItems.ts
├── TableHeader.tsx
├── TableRow.tsx
├── TableStats.tsx
├── VirtualizedInfiniteTable.tsx
└── index.ts
```

---

## `types.ts`

Defines the shared TypeScript shapes used by every other file, so the whole folder speaks the same "language" for data.

- **`ItemStatus`** — a string union (`"Active" | "Pending" | "Closed"`) representing the allowed values for a row's status. Using a union instead of `string` means TypeScript will catch typos like `"Actve"` at compile time, and it powers the color-coding logic in `TableRow.tsx`.
- **`Item`** — the shape of a single row of data: `id`, `name`, `status`, and `value`. This mirrors what your Express API would return for one document (e.g., a MongoDB record).
- **`PageResponse`** — the shape of one "page" returned by the API: an array of `data`, a `nextCursor` (the bookmark to fetch the next page, or `null` if there isn't one), and a `hasMore` boolean flag.

**Why it's a separate file:** types have zero runtime code — they're erased when compiled to JavaScript. Keeping them isolated means any file (hook, component, API layer) can import just the shapes it needs without pulling in fetch logic or UI code, and it gives you one place to update the data contract if your backend schema changes.

---

## `mockApi.ts`

A **fake backend** that simulates a real paginated Express endpoint, including network delay, so the component can be developed and tested without a live server.

- **`TOTAL_ROWS`** — pretends the database has 70,000 documents total.
- **`PAGE_SIZE`** — how many rows are returned per request (100).
- **`mockFetchPage(cursor, limit)`** — takes a `cursor` (the last-seen row's position) and a `limit`, waits 400ms to simulate latency, then generates and returns a slice of fake rows plus the `nextCursor`/`hasMore` flags.

This uses **cursor-based pagination** rather than page-number pagination: instead of asking for "page 5", the client says "give me the next batch after item #400". This is the pattern recommended in the earlier explanation because it stays fast even on very large collections, since MongoDB doesn't have to skip over previously-seen documents.

**Swapping in a real API:** replace the body of `mockFetchPage` (or add a new exported function) with a real network call:

```ts
export async function fetchPage(cursor: number | null, limit = PAGE_SIZE): Promise<PageResponse> {
  const res = await fetch(`/api/items?cursor=${cursor ?? 0}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json(); // must return { data, nextCursor, hasMore }
}
```

Your Express route just needs to return JSON in that same `{ data, nextCursor, hasMore }` shape — nothing else in the app needs to change, since every other file only depends on that contract, not on how it's fetched.

---

## `useInfiniteItems.ts`

A **custom React hook** that owns all the state and logic for progressively loading data. Separating this from the UI means the fetching logic can be tested, reused, or swapped out independently of how the list is rendered.

State it manages:
- **`items`** — the full array of rows loaded *so far* (grows over time as more pages arrive; never shrinks).
- **`cursor`** — the pagination bookmark for the *next* request. Starts at `0`, updated after every successful fetch.
- **`hasMore`** — whether there's more data left to fetch. Used to stop requesting once the end is reached.
- **`isFetching`** — a loading flag used to prevent duplicate/overlapping requests while one is already in flight.

Key function:
- **`fetchNextPage`** — wrapped in `useCallback` so its identity is stable across renders (important because it's used inside a `useEffect` dependency array elsewhere). It guards against firing while already fetching or when there's nothing left, calls `mockFetchPage`, appends the new rows to `items`, and updates `cursor`/`hasMore`.

A `useEffect` with an empty dependency array calls `fetchNextPage()` once on mount, so the first page loads automatically when the component appears.

**Why a hook instead of inline state:** if you ever need a second virtualized list elsewhere in the app, you can reuse `useInfiniteItems()` as-is, and the fetching logic stays testable in isolation from rendering/DOM concerns.

---

## `TableHeader.tsx`

A small, purely presentational component: a static grid row showing the column labels — **ID, Name, Status, Value**. It has no props and no state; its only job is layout and styling, using the same `grid-template-columns` as the data rows so columns line up.

---

## `TableRow.tsx`

Renders **one row** inside the virtualized list — either a real data row, or the trailing "loading" placeholder row.

Props:
- **`item`** — the row's data (optional, since the loader row has none).
- **`isLoaderRow`** — true if this virtual slot is the extra "+1" row appended when there's more data to come.
- **`hasMore`** — determines whether the loader row says "Loading more…" or "No more items".
- **`top`** / **`height`** — positioning values handed down from the virtualizer (`virtualRow.start` and `virtualRow.size`), used to absolutely position the row at the correct vertical offset.

It also defines a small `statusColor` lookup so `Active`/`Pending`/`Closed` render in green/yellow/red respectively.

**Why it's absolutely positioned:** this is central to how virtualization works — every row is positioned with `transform: translateY(px)` inside a container whose *total* height matches what the full (non-virtualized) list would be. That keeps the scrollbar's size and position accurate even though only a handful of rows physically exist in the DOM at once.

---

## `TableStats.tsx`

A small status bar above the table showing:
- How many rows have been **loaded** so far vs. the **total** available (`TOTAL_ROWS`, imported from `mockApi.ts`).
- How many rows are **actually rendered in the DOM** right now (`domRowCount`).

This last number is the proof that virtualization is working — even after scrolling through thousands of loaded rows, it should stay around 15–25, never growing with `items.length`.

---

## `VirtualizedInfiniteTable.tsx`

The **main component** — it doesn't contain much logic itself, but wires together the hook, the virtualizer, and the presentational pieces.

Step by step:

1. **Fetch data** — calls `useInfiniteItems()` to get `items`, `hasMore`, `isFetching`, and `fetchNextPage`.
2. **Set up virtualization** — calls `useVirtualizer()` from `@tanstack/react-virtual`, passing:
   - `count`: the number of virtual rows, which is `items.length + 1` when `hasMore` is true (that extra slot is the loader row) or just `items.length` when there's nothing left to fetch.
   - `getScrollElement`: points to the scrollable `<div>` (`parentRef`).
   - `estimateSize`: the expected pixel height of a row (`48px`), used to calculate scroll positions before every row has actually rendered.
   - `overscan`: renders a few extra rows above/below the visible viewport (8) so fast scrolling doesn't show blank gaps.
3. **Trigger the next fetch on scroll** — a `useEffect` watches `virtualRows` (the currently-visible virtual rows). When the *last visible* virtual row's index reaches the end of the loaded `items` array, and there's more data (`hasMore`) and no request already in flight (`!isFetching`), it calls `fetchNextPage()`. This is the "infinite scroll" trigger — but instead of listening to raw pixel scroll position, it reacts to the virtualizer's own visible range, which is more reliable regardless of row height or container size.
4. **Render** — renders `TableStats`, `TableHeader`, and the scrollable container. Inside, a spacer `<div>` sized to `rowVirtualizer.getTotalSize()` preserves correct scrollbar dimensions, and each `virtualRow` maps to a `TableRow`, positioned via `top`/`height` props.

This file is intentionally thin: it composes the hook (data) and the sub-components (presentation) rather than owning either directly, which keeps each concern independently testable and replaceable.

---

## `index.ts`

A **barrel file** — re-exports the main component as the default export, plus all the shared types, so consumers get a clean single import path:

```ts
import VirtualizedInfiniteTable, { Item, ItemStatus } from "./virtualized-infinite-table";
```

instead of reaching into individual files like `./virtualized-infinite-table/VirtualizedInfiniteTable`.

---

## How to use this in a real MERN project

1. Copy the whole `virtualized-infinite-table/` folder into your `src/components` directory.
2. Install the virtualization library:
   ```bash
   npm install @tanstack/react-virtual
   ```
3. In `mockApi.ts`, replace `mockFetchPage` with a real call to your Express backend (see the snippet in the `mockApi.ts` section above).
4. Build the matching Express route, returning `{ data, nextCursor, hasMore }`:
   ```js
   app.get("/api/items", async (req, res) => {
     const cursor = parseInt(req.query.cursor) || 0;
     const limit = parseInt(req.query.limit) || 100;

     const data = await Item.find({ _id: { $gt: cursor } }).limit(limit);
     const hasMore = data.length === limit;
     const nextCursor = hasMore ? data[data.length - 1]._id : null;

     res.json({ data, nextCursor, hasMore });
   });
   ```
5. Drop `<VirtualizedInfiniteTable />` anywhere in your app. No other file needs to change — the hook, virtualizer, and row components are all decoupled from where the data actually comes from.
