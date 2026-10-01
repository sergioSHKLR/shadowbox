import { useEffect, useState } from "react";
import { units } from "@/lib/shadowbox/model";
import "@/memories.css";

type Shot = { id: string; src: string };
type Memory = { id: string; title: string; text: string; unitId: string; at: string; photos: Shot[] };
const KEY = "shadowbox-memories";

function load(): Memory[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Memory[];
  } catch {
    return [];
  }
}

function thumb(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 720 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    img.src = url;
  });
}

export function Memories() {
  const [items, setItems] = useState<Memory[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [unitId, setUnitId] = useState("");
  const [open, setOpen] = useState<Memory | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => setItems(load()), []);
  const saveItems = (next: Memory[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
  };
  const add = async (files: FileList | null) => {
    const body = text.trim();
    if (!body && !title.trim() && !files?.length) return;
    const photos: Shot[] = [];
    for (const file of [...(files ?? [])].slice(0, 8)) {
      if (!file.type.startsWith("image/")) continue;
      photos.push({ id: `${Date.now()}-${photos.length}`, src: await thumb(file) });
    }
    const next = [{ id: String(Date.now()), title: title.trim() || "Memory", text: body, unitId, at: new Date().toISOString(), photos }, ...items];
    try {
      saveItems(next);
      setTitle("");
      setText("");
      setUnitId("");
      setNote("");
    } catch {
      setNote("That set is too large for this browser. Use fewer or smaller photos.");
    }
  };
  const remove = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
    setOpen(null);
  };
  return (
    <main className="sheet">
      <h2>Memories</h2>
      <p className="quiet">Notes and photos stay in this browser. They are not on the public site until you upload them to incoming/.</p>
      <form className="guest-form" onSubmit={(e) => { e.preventDefault(); void add((e.currentTarget.elements.namedItem("photos") as HTMLInputElement).files); }}>
        <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} /></label>
        <label>Command
          <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            <option value="">None</option>
            {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.abbreviation || unit.name}</option>)}
          </select>
        </label>
        <label>Memory <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={4} /></label>
        <label>Photos <input name="photos" type="file" accept="image/*" multiple /></label>
        <button type="submit" className="nav-btn on">Save</button>
      </form>
      {note ? <p className="quiet">{note}</p> : null}
      <ul className="memory-grid">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" className="memory-card" onClick={() => setOpen(item)}>
              {item.photos[0] ? <img src={item.photos[0].src} alt="" /> : <span className="memory-empty">No photo</span>}
              <strong>{item.title}</strong>
              <span>{item.at.slice(0, 10)}</span>
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <article className="memory-open">
          <h3>{open.title}</h3>
          <p>{open.text || "No note."}</p>
          <ul className="memory-grid">
            {open.photos.map((photo) => (
              <li key={photo.id}><img src={photo.src} alt="" /></li>
            ))}
          </ul>
          <button type="button" className="nav-btn" onClick={() => remove(open.id)}>Delete</button>
        </article>
      ) : null}
    </main>
  );
}
