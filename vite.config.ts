import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Custom domain serves from /. GitHub repo: DmitriiSeitsman/xogame
// https://крестик-нолик.рф
export default defineConfig({
  plugins: [react()],
  base: "/",
});
