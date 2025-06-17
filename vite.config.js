import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  // base: '/sistema/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      "ec9f62f5-d35f-4649-b5c7-d65dcbfc08f5-00-1hnr5mpm6qixg.kirk.replit.dev",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/index.js",
        assetFileNames: "assets/index.css",
      },
    },
  },
  plugins: [react()],
});
