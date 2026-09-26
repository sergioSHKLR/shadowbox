import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const DARK = "#0c0c0d";

/** Static build published at https://mil.shklr.org/ (GitHub Pages custom domain, served from the root) */
export default defineConfig({
  base: "/",
  publicDir: "public",
  plugins: [
    react(),
    tailwindcss(),
    // Installable PWA: manifest + Workbox service worker at the site root (scope "/").
    // autoUpdate + skipWaiting/clientsClaim: a new deploy takes over on the next load, nobody is stuck on an old build.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "inline",
      filename: "sw.js",
      manifestFilename: "manifest.webmanifest",
      includeAssets: [],
      manifest: {
        id: "/",
        name: "SHADOWBOX",
        short_name: "SHADOWBOX",
        description: "Not for gawking but for learning!",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        theme_color: DARK,
        background_color: DARK,
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App shell: the HTML, the JS/CSS bundles, the icons, and every image on the Case page (ribbons, devices, pins, photos, crests),
        // so the case works offline from the first visit. Uniform and gear photos are cached as they are viewed.
        globPatterns: ["pages/index.html", "assets/**/*.{js,css}", "favicon.svg", "icons/apple-touch-icon.png", "{ribbons,devices,insignia,photos,crests}/**/*.{png,svg,webp,jpg}"],
        globIgnores: ["__grok/**", "404.html"],
        // The HTML is built at pages/index.html and moved to the root by build:pages.
        modifyURLPrefix: { "pages/": "" },
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        inlineWorkboxRuntime: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
            handler: "CacheFirst",
            options: { cacheName: "shadowbox-images", expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 60 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: ({ url }) => /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "map-tiles", expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 14, purgeOnQuotaError: true }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: ({ url }) => url.hostname === "fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css", expiration: { maxEntries: 10 } },
          },
          {
            urlPattern: ({ url }) => url.hostname === "fonts.gstatic.com",
            handler: "CacheFirst",
            options: { cacheName: "google-fonts", expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  resolve: { tsconfigPaths: true },
  build: {
    outDir: "dist/pages",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve("pages/index.html"),
    },
  },
});
