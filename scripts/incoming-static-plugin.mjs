/**
 * Serve the repo's incoming/ folder at /incoming/ on the Vite dev and preview servers (Oct 2026).
 * Production needs nothing: GitHub Pages serves main's incoming/ directly. This replaces the old public/incoming duplicates.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";

const TYPES = {
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".json": "application/json",
};

export function incomingStaticPlugin() {
  const root = resolve("incoming");
  const handler = (req, res, next) => {
    const url = (req.url || "").split("?")[0];
    const at = url.indexOf("/incoming/");
    if (at < 0) return next();
    let rel;
    try {
      rel = decodeURIComponent(url.slice(at + "/incoming/".length));
    } catch {
      return next();
    }
    const file = normalize(join(root, rel));
    if (!file.startsWith(root + sep)) return next();
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.statusCode = 404;
      return res.end("Not found");
    }
    res.setHeader("Content-Type", TYPES[extname(file).toLowerCase()] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    createReadStream(file).pipe(res);
  };
  return {
    name: "incoming-static",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}
