// Renders a single virtual row — either real item data, or the trailing
// "Loading more…" / "No more items" placeholder row.

import React from "react";
import type { Item } from "./types";

interface TableRowProps {
  item?: Item;
  isLoaderRow: boolean;
  hasMore: boolean;
  top: number; // translateY offset from the virtualizer
  height: number;
}

const statusColor: Record<string, string> = {
  Active: "#4ade80",
  Pending: "#facc15",
  Closed: "#f87171",
};

export default function TableRow({ item, isLoaderRow, hasMore, top, height }: TableRowProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height,
        transform: `translateY(${top}px)`,
        display: "grid",
        gridTemplateColumns: "80px 1fr 100px 100px",
        alignItems: "center",
        padding: "0 12px",
        fontSize: 13,
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      {isLoaderRow || !item ? (
        <span style={{ gridColumn: "1 / -1", color: "#888" }}>
          {hasMore ? "Loading more…" : "No more items"}
        </span>
      ) : (
        <>
          <span style={{ color: "#888" }}>{item.id}</span>
          <span>{item.name}</span>
          <span style={{ color: statusColor[item.status] }}>{item.status}</span>
          <span>{item.value}</span>
        </>
      )}
    </div>
  );
}