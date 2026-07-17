import React from "react";
import ReactDOM from "react-dom/client";
import VirtualizedInfiniteTable from "./index.tsx";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <VirtualizedInfiniteTable />
  </React.StrictMode>
);
