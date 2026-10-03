import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const YEAR_MIN = 1990;
const YEAR_MAX = 2030;
const NOTE_MAX = 2000;
const MAX_BODY = 16_384;

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function idsOf(file) {
  const rows = readJson(file);
  return new Set(Array.isArray(rows) ? rows.map((row) => row?.id).filter((id) => typeof id === "string") : []);
}

/** Match the file's escaped punctuation so a save does not rewrite unrelated notes. */
function stringifyInstances(rows) {
  const text = JSON.stringify(rows, null, 2).replace(/[^\x00-\x7F]/g, (ch) => {
    const cp = ch.codePointAt(0);
    if (cp > 0xffff) {
      const u = cp - 0x10000;
      const hi = 0xd800 + (u >> 10);
      const lo = 0xdc00 + (u & 0x3ff);
      return `\\u${hi.toString(16)}\\u${lo.toString(16)}`;
    }
    return `\\u${cp.toString(16).padStart(4, "0")}`;
  });
  return `${text}\n`;
}

function writeInstances(file, rows) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, stringifyInstances(rows));
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

function clean(body, unitIds, operationIds) {
  const id = typeof body?.id === "string" ? body.id : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return null;
  let year = body?.year;
  if (year === "" || year == null) year = null;
  else if (typeof year !== "number" || !Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) return null;
  let unitId = body?.unitId;
  if (unitId === "" || unitId == null) unitId = null;
  else if (typeof unitId !== "string" || !unitIds.has(unitId)) return null;
  let operationId = body?.operationId;
  if (operationId === "" || operationId == null) operationId = null;
  else if (typeof operationId !== "string" || !operationIds.has(operationId)) return null;
  let note = body?.note;
  if (note == null || note === "") note = null;
  else if (typeof note !== "string") return null;
  else {
    note = note.trim().slice(0, NOTE_MAX);
    if (!note) note = null;
  }
  return { id, year, unitId, operationId, note };
}

/** Local preview only: POST /__shadowbox/award-instance updates one row in src/data/award-instances.json. */
export function awardInstancePlugin() {
  return {
    name: "shadowbox-award-instance",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      const file = join(root, "src/data/award-instances.json");
      const unitIds = () => idsOf(join(root, "src/data/units.json"));
      const operationIds = () => idsOf(join(root, "src/data/operations.json"));
      server.middlewares.use(async (req, res, next) => {
        const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
        if (pathOnly !== "/__shadowbox/award-instance") {
          next();
          return;
        }
        if ((req.method ?? "GET").toUpperCase() !== "POST") {
          send(res, 405, { error: "Method Not Allowed" });
          return;
        }
        try {
          const patch = clean(JSON.parse(await readBody(req)), unitIds(), operationIds());
          if (!patch) {
            send(res, 400, { error: "Bad instance" });
            return;
          }
          const rows = readJson(file);
          if (!Array.isArray(rows)) {
            send(res, 400, { error: "Bad instance" });
            return;
          }
          const row = rows.find((item) => item?.id === patch.id);
          if (!row) {
            send(res, 400, { error: "Unknown award" });
            return;
          }
          row.year = patch.year;
          row.unitId = patch.unitId;
          row.operationId = patch.operationId;
          row.note = patch.note;
          writeInstances(file, rows);
          send(res, 200, { ok: true, id: patch.id });
        } catch {
          send(res, 400, { error: "Bad Request" });
        }
      });
    },
  };
}
