import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC_OK = /^\/(?:equipment|photos)\/[A-Za-z0-9][A-Za-z0-9._/-]*\.(?:jpe?g|png|webp)$/i;
const WEAR_OK = /^\/uniforms\/v12\/[A-Za-z0-9._-]+-wear\.(?:jpe?g|png|webp)$/i;
const MAX = 4000;
const MAX_BODY = 32_768;

function readMap(file) {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(file, map) {
  const sorted = {};
  for (const key of Object.keys(map).sort()) {
    const value = map[key];
    if (typeof value === "string" && value.trim()) sorted[key] = value.trim();
  }
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(sorted, null, 2)}\n`);
  try {
    renameSync(tmp, file);
  } catch (err) {
    try {
      unlinkSync(tmp);
    } catch {
      /* leave the temp if unlink also fails */
    }
    throw err;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

/** Local preview only: POST /__shadowbox/photo-remarks writes src/data/photo-remarks.json. */
export function photoRemarksPlugin() {
  return {
    name: "shadowbox-photo-remarks",
    apply: "serve",
    configureServer(server) {
      const file = join(server.config.root, "src/data/photo-remarks.json");
      server.middlewares.use(async (req, res, next) => {
        const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
        if (pathOnly === "/__shadowbox/reflections") {
          if ((req.method ?? "GET").toUpperCase() !== "POST") {
            send(res, 405, { error: "Method Not Allowed" });
            return;
          }
          try {
            const body = JSON.parse(await readBody(req));
            const kind = typeof body?.kind === "string" ? body.kind : "";
            const subjectId = typeof body?.subjectId === "string" ? body.subjectId : "";
            const text = typeof body?.text === "string" ? body.text.trim().slice(0, 8000) : "";
            if (!kind || !subjectId || kind.includes("..") || subjectId.includes("..")) {
              send(res, 400, { error: "Unknown record" });
              return;
            }
            const file = join(server.config.root, "src/data/reflections.json");
            const rows = JSON.parse(readFileSync(file, "utf8"));
            const list = Array.isArray(rows) ? rows : [];
            const id = `${kind}:${subjectId}`;
            const nextRows = list.filter((row) => !(row && row.kind === kind && row.subjectId === subjectId));
            if (text) nextRows.push({ id, kind, subjectId, text });
            writeFileSync(file, `${JSON.stringify(nextRows, null, 2)}\n`);
            send(res, 200, { ok: true, id });
          } catch {
            send(res, 400, { error: "Bad Request" });
          }
          return;
        }
        if (pathOnly !== "/__shadowbox/photo-remarks") {
          next();
          return;
        }
        if ((req.method ?? "GET").toUpperCase() !== "POST") {
          send(res, 405, { error: "Method Not Allowed" });
          return;
        }
        try {
          const body = JSON.parse(await readBody(req));
          const src = typeof body?.src === "string" ? body.src : "";
          const remarks = typeof body?.remarks === "string" ? body.remarks : "";
          if (src.includes("..") || !(SRC_OK.test(src) || WEAR_OK.test(src))) {
            send(res, 400, { error: "Unknown photograph" });
            return;
          }
          const map = readMap(file);
          const text = remarks.trim().slice(0, MAX);
          if (text) map[src] = text;
          else delete map[src];
          writeMap(file, map);
          send(res, 200, { ok: true, src, remarks: text });
        } catch {
          send(res, 400, { error: "Bad Request" });
        }
      });
    },
  };
}
