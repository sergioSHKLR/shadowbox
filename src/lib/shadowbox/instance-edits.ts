/** Sidebar edits for one award instance. Local preview writes award-instances.json. */

export type InstanceFields = {
  year: number | null;
  unitId: string | null;
  operationId: string | null;
  note: string | null;
};

export type InstanceRow = InstanceFields & { id: string; awardId: string };

const YEAR_MIN = 1990;
const YEAR_MAX = 2030;
const NOTE_MAX = 2000;

const patches = new Map<string, InstanceFields>();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribeInstanceEdits(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function patchedInstance<T extends InstanceRow>(row: T): T {
  const patch = patches.get(row.id);
  return patch ? { ...row, ...patch } : row;
}

export function parseInstanceFields(
  input: { year: string; unitId: string; operationId: string; note: string },
  unitIds: readonly string[],
  operationIds: readonly string[],
): InstanceFields | null {
  const yearText = input.year.trim();
  let year: number | null = null;
  if (yearText) {
    if (!/^\d{4}$/.test(yearText)) return null;
    year = Number(yearText);
    if (year < YEAR_MIN || year > YEAR_MAX) return null;
  }
  const unitId = input.unitId || null;
  const operationId = input.operationId || null;
  if (unitId && !unitIds.includes(unitId)) return null;
  if (operationId && !operationIds.includes(operationId)) return null;
  const note = input.note.trim().slice(0, NOTE_MAX) || null;
  return { year, unitId, operationId, note };
}

function downloadInstances(rows: readonly InstanceRow[]) {
  const next = rows.map((row) => patchedInstance(row));
  const blob = new Blob([`${JSON.stringify(next, null, 2)}\n`], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "award-instances.json";
  a.click();
  URL.revokeObjectURL(href);
}

/** Writes src/data/award-instances.json in local preview; downloads that file otherwise. */
export async function saveInstance(rowId: string, patch: InstanceFields, rows: readonly InstanceRow[]): Promise<"file" | "download"> {
  if (!rows.some((row) => row.id === rowId)) throw new Error("Unknown award");
  patches.set(rowId, patch);
  notify();
  let response: Response;
  try {
    response = await fetch("/__shadowbox/award-instance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: rowId, ...patch }),
    });
  } catch {
    downloadInstances(rows);
    return "download";
  }
  if (response.ok) return "file";
  if (response.status === 404 || response.status === 405) {
    downloadInstances(rows);
    return "download";
  }
  throw new Error("rejected");
}
