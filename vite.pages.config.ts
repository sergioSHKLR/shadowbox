import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
// @ts-expect-error JS plugin alongside the TS vite config
import { incomingStaticPlugin } from "./scripts/incoming-static-plugin.mjs";

/** CalVer (Sergio, Oct 2026): YYYY.MM.DD of the built commit's date in America/Sao_Paulo, plus its short hash. */
function buildVersion() {
  const git = (cmd: string) => execSync(`git ${cmd}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    const [iso, hash, full] = git("log -1 --format=%cI%n%h%n%H").split("\n");
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
    return { version: `${get("year")}.${get("month")}.${get("day")}`, hash: hash.slice(0, 7), full };
  } catch {
    return { version: "", hash: "", full: "" };
  }
}
const BUILD = buildVersion();

/** Static build published at https://shadowbox.shklr.org/ (GitHub Pages custom domain, served from the root) */
export default defineConfig({
  base: "/",
  publicDir: "public",
  plugins: [
    incomingStaticPlugin(),
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
        name: "Shadowbox",
        short_name: "Shadowbox",
        description: "Zero gawking, All instructing",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        // Top-bar navy (src/styles.css --color-navy): the app icon is the goldenrod shield on this navy, in light and dark alike.
        theme_color: "#14233a",
        background_color: "#14233a",
        icons: [
          { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/icons/icon-monochrome-512.png", sizes: "512x512", type: "image/png", purpose: "monochrome" },
        ],
      },
      workbox: {
        // App shell: the HTML, the JS/CSS bundles, the icons, and every image on the Case page (ribbons, devices, pins, photos, crests),
        // so the case works offline from the first visit. Uniform and gear photos are cached as they are viewed.
        globPatterns: [
          "pages/index.html",
          "assets/**/*.{js,css}",
          ...["favicon.svg", "og.jpg", "icons/apple-touch-icon.png", "icons/apple-touch-icon-dark.png", "icons/icon.svg", "icons/icon-light.svg", "icons/icon-dark.svg", "icons/icon-maskable.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon-monochrome-512.png", "shadowbox-cheat-sheet.pdf"].filter((file) => existsSync(resolve("public", file))),
          ...["ribbons", "devices", "insignia", "photos", "uniforms", "equipment", "crests", "medals"]
            .filter((dir) => existsSync(resolve("public", dir)))
            .map((dir) => `${dir}/**/*.{png,svg,webp,jpg}`),
        ],
        // The cheat sheet PDF (about 1.7 MB) is precached so it downloads offline too.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
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
  define: {
    __APP_VERSION__: JSON.stringify(BUILD.version),
    __APP_COMMIT__: JSON.stringify(BUILD.hash),
    __APP_COMMIT_FULL__: JSON.stringify(BUILD.full),
  },
  resolve: { tsconfigPaths: true },
  build: {
    outDir: "dist/pages",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve("pages/index.html"),
    },
  },
});
