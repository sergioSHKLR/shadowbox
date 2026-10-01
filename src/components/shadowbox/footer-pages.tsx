import { useEffect, useState } from "react";

type Note = { id: string; name: string; text: string; at: string };
const KEY = "shadowbox-guestbook";

function loadNotes(): Note[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Note[];
  } catch {
    return [];
  }
}

export function Contact({ onOpenBook }: { onOpenBook: () => void }) {
  return (
    <main className="sheet">
      <h2>Contact</h2>
      <p>This is a personal record, kept so the uniform and the tours can be read. Questions about a date, a graphic, or a credit belong in the guestbook until a mail route is wired.</p>
      <p>Itajaí, Santa Catarina, Brazil.</p>
      <button type="button" className="nav-btn on" onClick={onOpenBook}>Open the guestbook</button>
    </main>
  );
}

export function Guestbook() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  useEffect(() => setNotes(loadNotes()), []);
  const save = () => {
    const body = text.trim();
    if (!body) return;
    const next = [{ id: String(Date.now()), name: name.trim() || "Visitor", text: body, at: new Date().toISOString() }, ...notes];
    localStorage.setItem(KEY, JSON.stringify(next));
    setNotes(next);
    setText("");
  };
  return (
    <main className="sheet">
      <h2>Guestbook</h2>
      <p className="quiet">Entries stay in this browser. A shared book needs a host; this is the page it will live on.</p>
      <form className="guest-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <label>Name <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} /></label>
        <label>Note <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={4} required /></label>
        <button type="submit" className="nav-btn on">Sign</button>
      </form>
      <ul className="stack">
        {notes.map((note) => (
          <li key={note.id}>
            <div className="row-btn static">
              <strong>{note.name}</strong>
              <span>{note.text}</span>
              <em>{note.at.slice(0, 10)}</em>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function VisitorCount() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    const key = "shadowbox-seen";
    const seen = sessionStorage.getItem(key);
    const url = seen
      ? "https://api.counterapi.dev/v1/mil.shklr.org/visits"
      : "https://api.counterapi.dev/v1/mil.shklr.org/visits/up";
    fetch(url)
      .then((r) => r.json())
      .then((body: { count?: number }) => {
        if (typeof body.count === "number") {
          sessionStorage.setItem(key, "1");
          setN(body.count);
        }
      })
      .catch(() => setN(null));
  }, []);
  if (n == null) return <span>Visitors</span>;
  return <span>{n.toLocaleString("en-US")} visitors</span>;
}
