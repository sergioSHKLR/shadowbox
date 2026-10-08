import { useEffect, useState } from "react";
import { isRemarkSrc, remarksFor, saveRemarks, subscribeRemarks } from "@/lib/shadowbox/remarks";

export function PhotoRemarks({ src }: { src: string }) {
  const [text, setText] = useState(() => remarksFor(src));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setText(remarksFor(src));
    setStatus("");
  }, [src]);

  useEffect(() => subscribeRemarks(() => setText(remarksFor(src))), [src]);

  if (!isRemarkSrc(src)) return null;

  const save = async () => {
    setBusy(true);
    setStatus("");
    try {
      const where = await saveRemarks(src, text);
      setStatus(where === "file" ? "Saved to src/data/photo-remarks.json" : "Saved photo-remarks.json to Downloads");
    } catch {
      setStatus("Remarks did not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="photo-remarks-block">
      {text.trim() ? <p className="photo-remarks-text">{text}</p> : null}
      <form
        className="photo-remarks"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label>
          Remarks
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            maxLength={4000}
            placeholder="Your note on this photograph. Saving publishes it."
          />
        </label>
        <button type="submit" className="nav-btn on" disabled={busy}>
          Save
        </button>
        {status ? <p className="quiet">{status}</p> : null}
      </form>
    </div>
  );
}
