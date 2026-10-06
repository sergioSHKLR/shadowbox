/**
 * Sample redacted paragraph (Sergio, Oct 2026). Placeholder lorem text only, no career facts. Pure CSS: each redaction
 * is one continuous marker stroke over a sentence or a multi-word fragment (.redact-mark, display:inline), so it wraps
 * across lines and box-decoration-break: clone gives every line segment its own uneven rounded ends; a few short words
 * stay visible between strokes. Per-stroke radius variants live in styles.css. Permanently redacted: no hover reveal, not selectable,
 * and screen readers hear "[redacted]" once per phrase instead of the hidden words.
 */
const SAMPLE: Array<string | { r: string }> = [
  "Lorem ipsum",
  { r: "dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" },
  "incididunt ut",
  { r: "labore et dolore magna aliqua." },
  "Ut enim",
  { r: "ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip" },
  "ex ea commodo.",
  { r: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore." },
];

function Redacted({ text, variant }: { text: string; variant: number }) {
  return (
    <span className={`redact-run redact-v${variant % 4}`}>
      <span className="sr-only">[redacted]</span>
      <span className="redact-mark" aria-hidden="true">{text}</span>
    </span>
  );
}

export function RedactionSample() {
  return (
    <div className="redact-sample">
      <p className="bio redact-para">
        {SAMPLE.map((part, i) => (
          <span key={i}>
            {typeof part === "string" ? part : <Redacted text={part.r} variant={Math.floor(i / 2)} />}
            {i < SAMPLE.length - 1 ? " " : null}
          </span>
        ))}
      </p>
    </div>
  );
}
