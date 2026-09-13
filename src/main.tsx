import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { watchSystemTheme } from "./utils/theme";
import "./styles/global.css";

// The prerendered, crawler-visible copy of the page (see
// scripts/prerender.mjs) is replaced by the real app as soon as React
// mounts. Removing it explicitly keeps that deterministic rather than
// relying on the root container being cleared for us.
document.getElementById("prerender-seo")?.remove();

// The theme itself is applied before paint by the inline script in
// index.html; this only keeps an unset preference in step with the OS if it
// flips while the tab is open (automatic dark mode at sunset, say).
watchSystemTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
