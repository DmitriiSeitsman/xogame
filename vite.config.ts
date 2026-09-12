import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Custom domain serves from /. GitHub repo: DmitriiSeitsman/xogame
// https://xo-game.online
export default defineConfig({
  plugins: [react()],
  base: "/",
});
