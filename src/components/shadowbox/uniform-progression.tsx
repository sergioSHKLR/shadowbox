import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  publicUrl,
  ranks,
  uniformSlideAt,
  uniformSteps,
  type TourFocus,
  type UniformLook,
} from "@/lib/shadowbox/model";

const LOOK_LABEL: Record<UniformLook, string> = { blue: "Blues", white: "Whites", khaki: "Khakis" };
/** Pause on each command before advancing. */
const STEP_PAUSE_MS = 4000;
const key = (v: string) => {
  const [y, m, d] = v.split("-");
  return `${y}-${(m ?? "01").padStart(2, "0")}-${(d ?? "01").padStart(2, "0")}`;
};
function stepIndexFor(tour: TourFocus): number {
  const byUnit = uniformSteps.findIndex((step) => step.unitId === tour.id);
  if (byUnit >= 0) return byUnit;
  const month = Number(tour.start.slice(0, 4)) * 12 + (Number(tour.start.slice(5, 7) || "1") - 1);
  let best = 0;
  uniformSteps.forEach((step, i) => {
    if (step.month <= month) best = i;
  });
  return best;
}

export function UniformProgression({ tour }: { tour?: TourFocus | null }) {
  const [look, setLook] = useState<Exclude<UniformLook, "khaki">>("blue");
  const [khaki, setKhaki] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = uniformSteps;
  const last = Math.max(0, steps.length - 1);
  const at = Math.min(index, last);
  const step = steps[at];
  const rank = step
    ? [...ranks].reverse().find((r) => r.date && key(r.date).slice(0, 7) <= key(step.from).slice(0, 7))
    : undefined;
  const isChief = rank?.grade === "E-7";
  const shown: UniformLook = khaki && isChief ? "khaki" : look;
  useEffect(() => {
    if (!tour) return;
    setPlaying(false);
    setIndex(stepIndexFor(tour));
  }, [tour?.kind, tour?.id, tour?.start]);
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => {
      if (at >= last) setPlaying(false);
      else setIndex(at + 1);
    }, STEP_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [playing, at, last]);
  const slide = step ? uniformSlideAt(step.month, shown) : null;
  const label = step ? `${step.label} · ${step.span}` : "";
  const pickLook = (next: UniformLook) => {
    setPlaying(false);
    if (next === "khaki") {
      setKhaki(true);
      return;
    }
    setKhaki(false);
    setLook(next);
  };
  const looks: UniformLook[] = ["blue", "white", "khaki"];

  return (
    <section className="uprog" aria-label="Uniform by command">
      {uniformSteps.length ? (
        <div className="uprog-controls">
          <button type="button" className="nav-btn icon-btn" aria-label="Previous command" onClick={() => { setPlaying(false); setIndex((i) => Math.max(0, i - 1)); }}>
            <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`nav-btn icon-btn uprog-play${playing ? " on" : ""}`}
            aria-pressed={playing}
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => {
              if (playing) {
                setPlaying(false);
                return;
              }
              if (at >= last) setIndex(0);
              setPlaying(true);
            }}
          >
            {playing ? <Pause size={20} strokeWidth={2} aria-hidden="true" /> : <Play size={20} strokeWidth={2} aria-hidden="true" />}
          </button>
          <button type="button" className="nav-btn icon-btn" aria-label="Next command" onClick={() => { setPlaying(false); setIndex((i) => Math.min(last, i + 1)); }}>
            <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <label className="uprog-slider">
            <span className="sr-only">Command</span>
            <input
              type="range"
              min={0}
              max={last}
              step={1}
              value={at}
              aria-valuetext={label}
              onChange={(e) => { setPlaying(false); setIndex(Number(e.target.value)); }}
            />
          </label>
          <output className="uprog-date">{label}{rank ? ` · ${rank.abbreviation}` : ""}</output>
          {looks.map((id) => {
            const locked = id === "khaki" && !isChief;
            return (
              <button
                key={id}
                type="button"
                className={shown === id ? "nav-btn on" : "nav-btn"}
                disabled={locked}
                aria-label={locked ? "Khakis, available at E-7" : LOOK_LABEL[id]}
                title={locked ? "Available at E-7" : undefined}
                onClick={() => pickLook(id)}
              >
                {LOOK_LABEL[id]}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="uprog-stage">
        {step?.crest ? <img className="uprog-crest" src={publicUrl(step.crest)} alt="" /> : null}
        {slide ? (
          <figure className="uprog-slide">
            <img src={publicUrl(slide.src)} alt={slide.caption} />
            <figcaption>{slide.caption}</figcaption>
          </figure>
        ) : (
          <p className="quiet">No slides yet.</p>
        )}
      </div>
    </section>
  );
}
