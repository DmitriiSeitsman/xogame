import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/global.css";

// The prerendered, crawler-visible copy of the page (see
// scripts/prerender.mjs) is replaced by the real app as soon as React
// mounts. Removing it explicitly keeps that deterministic rather than
// relying on the root container being cleared for us.
document.getElementById("prerender-seo")?.remove();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
