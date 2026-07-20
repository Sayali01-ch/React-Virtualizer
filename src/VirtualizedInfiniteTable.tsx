// Main component. 
// Combines:
//   - useInfiniteItems()  -> data fetching / "calling api on scroll"
//   - useVirtualizer()    -> virtualization / viewport optimization
//   - TableHeader, TableRow, TableStats -> presentation
//
// Only ~15-20 real DOM rows exist at any time, no matter how many rows
// have been loaded into `items`.
// ============================================================================

import React, { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInfiniteItems } from "./useInfiniteItems";
import TableRow from "./TableRow";
import TableStats from "./TableStats";

function TableHeader() {
  return (
    <div
      style={{
        display: "flex",
        padding: "12px 16px",
        borderBottom: "1px solid #ccc",
        fontWeight: 600,
        background: "#f8f8f8",
      }}
    >
      <div style={{ flex: 1 }}>ID</div>
      <div style={{ flex: 2 }}>Title</div>
      <div style={{ flex: 1 }}>Status</div>
    </div>
  );
}

const ROW_HEIGHT = 48;

export default function VirtualizedInfiniteTable() {
  const { items, hasMore, isFetching, fetchNextPage } = useInfiniteItems();
  const parentRef = useRef<HTMLDivElement | null>(null); // the scrollable container

  // VIRTUALIZATION — only visible rows become real DOM nodes.
  const rowVirtualizer = useVirtualizer({
    count: hasMore ? items.length + 1 : items.length, // +1 = trailing loader row
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8, // extra rows above/below viewport so fast scroll looks smooth
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // TRIGGER NEXT FETCH when the virtual scroll range nears the end.
  // Watches the VIRTUAL range, not raw scroll pixels, so it works no matter
  // the row height.
  useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1];
    if (!lastItem) return;

    if (lastItem.index >= items.length - 1 && hasMore && !isFetching) {
      fetchNextPage();
    }
  }, [virtualRows, items.length, hasMore, isFetching, fetchNextPage]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
      <TableStats loadedCount={items.length} domRowCount={virtualRows.length} />
      <TableHeader />

      {/* The scrollable, virtualized container */}
      <div
        ref={parentRef}
        style={{
          height: 480,
          overflow: "auto",
          border: "1px solid #333",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
        }}
      >
        {/* Spacer div — height equals the FULL virtual list height, even
            though only a few real rows exist inside it. Keeps the scrollbar
            size/position correct. */}
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {virtualRows.map((virtualRow) => {
            const isLoaderRow = virtualRow.index > items.length - 1;
            return (
              <TableRow
                key={virtualRow.key}
                item={items[virtualRow.index]}
                isLoaderRow={isLoaderRow}
                hasMore={hasMore}
                top={virtualRow.start}
                height={virtualRow.size}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}