import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Static build published at https://sergioshkler.github.io/shadowbox/ */
export default defineConfig({
  base: "/shadowbox/",
  publicDir: "public",
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  build: {
    outDir: "dist/pages",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve("pages/index.html"),
    },
  },
});
