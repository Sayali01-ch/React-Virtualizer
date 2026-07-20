
// Shows loaded-row count vs total, plus how many rows actually exist in the
// DOM — the number that proves virtualization is working.

import React from "react";
import { TOTAL_ROWS } from "./mockApi";

interface TableStatsProps {
  loadedCount: number;
  domRowCount: number;
}

export default function TableStats({ loadedCount, domRowCount }: TableStatsProps) {
  return (
    <div
      style={{
        marginBottom: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Items</h2>
      <span style={{ fontSize: 13, color: "#666" }}>
        Loaded {loadedCount.toLocaleString()} / {TOTAL_ROWS.toLocaleString()} rows
        {" · "}
        DOM rows rendered: <strong>{domRowCount}</strong>
      </span>
    </div>
  );
}