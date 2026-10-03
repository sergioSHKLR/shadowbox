import seedJson from "@/data/photo-remarks.json";

export type PhotoRemarksMap = Record<string, string>;

const SRC_OK = /^\/(?:equipment|photos)\/[A-Za-z0-9][A-Za-z0-9._/-]*\.(?:jpe?g|png|webp)$/i;
const WEAR_OK = /^\/uniforms\/v12\/[A-Za-z0-9._-]+-wear\.(?:jpe?g|png|webp)$/i;
const MAX = 4000;

let overlay: PhotoRemarksMap = { ...(seedJson as PhotoRemarksMap) };
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribeRemarks(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function remarksFor(src: string): string {
  return overlay[src] ?? "";
}

export function remarksMap(): PhotoRemarksMap {
  return { ...overlay };
}

export function isRemarkSrc(src: string): boolean {
  if (src.includes("..")) return false;
  return SRC_OK.test(src) || WEAR_OK.test(src);
}

function setLocal(src: string, remarks: string) {
  const text = remarks.trim();
  if (text) overlay[src] = text.slice(0, MAX);
  else delete overlay[src];
  notify();
}

function downloadMap() {
  const blob = new Blob([`${JSON.stringify(overlay, null, 2)}\n`], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "photo-remarks.json";
  a.click();
  URL.revokeObjectURL(href);
}

/** Writes src/data/photo-remarks.json in local preview; downloads that file otherwise. */
export async function saveRemarks(src: string, remarks: string): Promise<"file" | "download"> {
  if (!isRemarkSrc(src)) throw new Error("Unknown photograph");
  setLocal(src, remarks);
  try {
    const response = await fetch("/__shadowbox/photo-remarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ src, remarks: remarks.trim().slice(0, MAX) }),
    });
    if (response.ok) return "file";
  } catch {
    /* live site has no write endpoint */
  }
  downloadMap();
  return "download";
}
