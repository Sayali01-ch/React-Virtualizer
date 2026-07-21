// Static header row for the items table.

import React from "react";

export default function TableHeader() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 100px 100px",
        fontSize: 12,
        fontWeight: 600,
        color: "#888",
        padding: "8px 12px",
        borderBottom: "1px solid #333",
      }}
    >
      <div>ID</div>
      <div>Name</div>
      <div>Status</div>
      <div>Value</div>
    </div>
  );
}