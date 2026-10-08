import { useEffect, useState } from "react";

/** "In my own words" (Sergio, Oct 2026): one written-notes box on every sidebar. Saved in this browser's localStorage under
 *  KEY as { "<kind>:<id>": { text, savedAt } }. reflections.json text (if any) is the starting text until a note is saved. */
const KEY = "shadowbox-my-words";
const MAX = 8000;

type Note = { text: string; usedWhere?: string; savedAt: string };

function readAll(): Record<string, Note> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as unknown;
    return raw && typeof raw === "object" ? (raw as Record<string, Note>) : {};
  } catch {
    return {};
  }
}

function writeNote(id: string, text: string, usedWhere = ""): Note | null {
  const all = readAll();
  const trimmed = text.trim().slice(0, MAX);
  const where = usedWhere.trim().slice(0, 400);
  let note: Note | null = null;
  if (trimmed || where) {
    note = { text: trimmed, ...(where ? { usedWhere: where } : {}), savedAt: new Date().toISOString() };
    all[id] = note;
  } else {
    delete all[id];
  }
  localStorage.setItem(KEY, JSON.stringify(all));
  return note;
}

function when(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function MyWords({ noteId, seed, usedWhere: withUsedWhere = false }: { noteId: string; seed?: string | null; usedWhere?: boolean }) {
  const [text, setText] = useState("");
  const [where, setWhere] = useState("");
  const [saved, setSaved] = useState<Note | null>(null);
  const [status, setStatus] = useState<"" | "saved" | "download" | "cleared" | "error">("");

  useEffect(() => {
    const note = readAll()[noteId] ?? null;
    setSaved(note);
    setText(note?.text ?? seed ?? "");
    setWhere(note?.usedWhere ?? "");
    setStatus("");
  }, [noteId, seed]);

  const dirty = text.trim() !== (saved?.text ?? seed ?? "").trim() || where.trim() !== (saved?.usedWhere ?? "").trim();
  const save = async () => {
    try {
      const note = writeNote(noteId, text, withUsedWhere ? where : "");
      setSaved(note);
      const [kind, subjectId] = noteId.split(":");
      let published = "download";
      try {
        const response = await fetch("/__shadowbox/reflections", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind, subjectId, text: text.trim() }),
        });
        if (response.ok) published = "file";
      } catch { /* live site has no write endpoint */ }
      if (published !== "file") {
        const blob = new Blob([`${JSON.stringify([{ id: noteId, kind, subjectId, text: text.trim() }], null, 2)}\n`], { type: "application/json" });
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = "reflections.json";
        a.click();
        URL.revokeObjectURL(href);
      }
      setStatus(note ? (published === "file" ? "saved" : "download") : "cleared");
    } catch {
      setStatus("error");
    }
  };

  const inputId = `my-words-${noteId.replace(/[^A-Za-z0-9_-]/g, "-")}`;
  return (
    <section className="my-words">
      <h3><label htmlFor={inputId}>In my own words</label></h3>
      <p className="quiet">This note is about the record, not a photograph.</p>
      <form
        className="my-words-form"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        {withUsedWhere ? (
          <label className="my-words-where">
            <span>Used where</span>
            <input type="text" value={where} onChange={(event) => { setWhere(event.target.value); setStatus(""); }} maxLength={400} placeholder="e.g. which deployments or commands" />
          </label>
        ) : null}
        <textarea id={inputId} value={text} onChange={(event) => { setText(event.target.value); setStatus(""); }} rows={4} maxLength={MAX} placeholder="Your note on this record. Saving publishes it." />
        <div className="my-words-bar">
          <button type="submit" className="nav-btn on" disabled={!dirty}>Save</button>
          <span className="my-words-status quiet" role="status" aria-live="polite">
            {status === "error"
              ? "Did not save."
              : status === "download"
                ? "Saved reflections.json to Downloads. Commit that file to publish."
              : status === "cleared"
                ? "Cleared."
                : dirty
                  ? "Not saved yet."
                  : saved
                    ? `Saved ${when(saved.savedAt)}`
                    : ""}
          </span>
        </div>
      </form>
    </section>
  );
}
