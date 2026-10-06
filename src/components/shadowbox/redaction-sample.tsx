/**
 * Sample redacted paragraph (Sergio, Oct 2026). Placeholder lorem text only — no career facts. Each blacked-out word gets
 * its own hand-drawn marker stroke: wobbling edges, uneven height, tapered ends, slight overlap into the next word, and an
 * SVG filter for rough edges + ink bleed. A few words stay unredacted between strokes.
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

function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** One marker pass in a 100×24 box: tapered, wobbling top and bottom edges. */
function strokePath(seed: number) {
  const steps = 36;
  const mid = 12 + (rand(seed) - 0.5) * 2.2;
  const weight = 5.8 + rand(seed + 1) * 2.0; // uneven height per word
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ends = Math.min(1, Math.min(t, 1 - t) / 0.09); // taper over the first/last 9%
    const taper = 0.45 + 0.55 * Math.sin((Math.PI / 2) * ends);
    const wob = Math.sin(t * 9 + seed * 3.1) * 0.7 + Math.sin(t * 23 + seed) * 0.35;
    const drift = (t - 0.5) * (rand(seed + 2) - 0.5) * 3;
    const y = mid + wob * 0.6 + drift;
    const upper = weight * taper * (1 + Math.sin(t * 17 + seed * 2) * 0.06);
    const lower = weight * taper * (1 + Math.cos(t * 13 + seed * 1.7) * 0.07);
    const x = (t * 100).toFixed(2);
    top.push(`${x} ${(y - upper).toFixed(2)}`);
    bot.push(`${x} ${(y + lower).toFixed(2)}`);
  }
  return `M ${top.join(" L ")} L ${bot.reverse().join(" L ")} Z`;
}

function Redacted({ text, seed }: { text: string; seed: number }) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">[redacted]</span>
      {words.map((word, i) => {
        const s = seed * 10 + i;
        const tilt = (rand(s + 5) - 0.5) * 2.2;
        const lift = (rand(s + 6) - 0.5) * 0.12;
        return (
          <span key={i}>
            <span className="redact-word" aria-hidden="true">
              <span className="redact-text">{word}</span>
              <svg className="redact-ink" viewBox="0 0 100 24" preserveAspectRatio="none" style={{ transform: `translateY(${lift}em) rotate(${tilt}deg)` }}>
                <path d={strokePath(s)} />
              </svg>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </>
  );
}

export function RedactionSample() {
  return (
    <div className="redact-sample">
      {/* Filter: turbulence-displaced edges (rough felt tip) + a soft halo underneath (ink feathering into the paper). */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <filter id="marker-ink" x="-10%" y="-40%" width="120%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feGaussianBlur in="rough" stdDeviation="1.1" result="halo" />
          <feComponentTransfer in="halo" result="bleed"><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
          <feGaussianBlur in="rough" stdDeviation="0.25" result="core" />
          <feMerge><feMergeNode in="bleed" /><feMergeNode in="core" /></feMerge>
        </filter>
      </svg>
      <p className="bio redact-para">
        {SAMPLE.map((part, i) => (
          <span key={i}>
            {typeof part === "string" ? part : <Redacted text={part.r} seed={i + 1} />}
            {i < SAMPLE.length - 1 ? " " : null}
          </span>
        ))}
      </p>
    </div>
  );
}
