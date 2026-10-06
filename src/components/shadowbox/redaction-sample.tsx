/**
 * Sample redacted paragraph (Sergio, Oct 2026). Placeholder lorem text only, no career facts. Pure CSS: every blacked-out
 * word is a .redact-word span with a near-black gradient, an asymmetric border radius and a slight tilt; nth-child
 * variants keep the spans from looking identical (see styles.css). Permanently redacted: no hover reveal, not selectable,
 * and screen readers hear "[redacted]" once per phrase instead of the hidden words.
 */
const SAMPLE: Array<string | { r: string }> = [
  "Lorem ipsum",
  { r: "dolor sit amet, consectetur" },
  "adipiscing elit, sed",
  { r: "do eiusmod tempor incididunt" },
  "ut labore et",
  { r: "dolore magna aliqua." },
  "Ut enim ad minim veniam,",
  { r: "quis nostrud exercitation ullamco laboris" },
  "nisi ut",
  { r: "aliquip ex ea commodo" },
  "consequat. Duis aute irure",
  { r: "dolor in reprehenderit in voluptate." },
];

function Redacted({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span className="redact-run">
      <span className="sr-only">[redacted]</span>
      {words.map((word, i) => (
        <span key={i}>
          <span className="redact-word" aria-hidden="true">{word}</span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

export function RedactionSample() {
  return (
    <div className="redact-sample">
      <p className="bio redact-para">
        {SAMPLE.map((part, i) => (
          <span key={i}>
            {typeof part === "string" ? part : <Redacted text={part.r} />}
            {i < SAMPLE.length - 1 ? " " : null}
          </span>
        ))}
      </p>
    </div>
  );
}
