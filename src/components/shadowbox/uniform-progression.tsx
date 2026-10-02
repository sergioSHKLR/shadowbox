import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  firstUniformSlide,
  profile,
  publicUrl,
  ranks,
  uniformLooks,
  uniformSlideAt,
  uniformSlides,
  type TourFocus,
  type UniformLook,
} from "@/lib/shadowbox/model";

const LOOK_LABEL: Record<UniformLook, string> = { blue: "Blues", white: "Whites", khaki: "Khakis" };

const START = profile.serviceStart;
const END = profile.serviceEnd;
const ym = (v: string) => {
  const [y, m] = v.split("-");
  return Number(y) * 12 + (m ? Number(m) - 1 : 0);
};
const M0 = ym(START);
const M1 = ym(END);
const key = (v: string) => {
  const [y, m, d] = v.split("-");
  return `${y}-${(m ?? "01").padStart(2, "0")}-${(d ?? "01").padStart(2, "0")}`;
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dayOf(month: number): string {
  if (month <= M0) return key(START);
  if (month >= M1) return key(END);
  const y = Math.floor(month / 12);
  const m = (month % 12) + 1;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}
function monthFor(v: string) {
  return Math.min(M1, Math.max(M0, ym(key(v))));
}

export function UniformProgression({ tour }: { tour?: TourFocus | null }) {
  const [month, setMonth] = useState(M0);
  const [look, setLook] = useState<UniformLook>(uniformLooks[0] ?? "blue");
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!tour) return;
    setPlaying(false);
    setMonth(monthFor(tour.start));
  }, [tour?.kind, tour?.id, tour?.start]);
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    const id = window.setInterval(() => {
      setMonth((cur) => {
        if (cur >= M1) {
          setPlaying(false);
          return M1;
        }
        return Math.min(M1, cur + 1);
      });
    }, 110);
    return () => window.clearInterval(id);
  }, [playing]);
  const day = dayOf(month);
  const rank = [...ranks].reverse().find((r) => r.date && key(r.date) <= day);
  const shown = uniformLooks.includes(look) ? look : (uniformLooks[0] ?? "blue");
  const slide = uniformSlideAt(month, shown);
  const label = `${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
  const dated = uniformSlides.some((row) => row.month != null);
  const pickLook = (next: UniformLook) => {
    setLook(next);
    const first = firstUniformSlide(next);
    if (first?.month != null && month < first.month) {
      setPlaying(false);
      setMonth(Math.min(M1, Math.max(M0, first.month)));
    }
  };

  return (
    <section className="uprog" aria-label="Uniform through the years">
      <h3>Uniform through the years</h3>
      <p>Ready slides from incoming/plates.</p>
      {dated ? (
        <div className="uprog-controls">
          <button type="button" className="nav-btn icon-btn" aria-label="Back six months" onClick={() => { setPlaying(false); setMonth((m) => Math.max(M0, m - 6)); }}>
            <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button type="button" className={`nav-btn icon-btn uprog-play${playing ? " on" : ""}`} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"} onClick={() => { if (month >= M1) setMonth(M0); setPlaying((on) => !on); }}>
            {playing ? <Pause size={20} strokeWidth={2} aria-hidden="true" /> : <Play size={20} strokeWidth={2} aria-hidden="true" />}
          </button>
          <button type="button" className="nav-btn icon-btn" aria-label="Forward six months" onClick={() => { setPlaying(false); setMonth((m) => Math.min(M1, m + 6)); }}>
            <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <label className="uprog-slider">
            <span className="sr-only">Date</span>
            <input type="range" min={M0} max={M1} step={1} value={month} aria-valuetext={label} onChange={(e) => { setPlaying(false); setMonth(Number(e.target.value)); }} />
          </label>
          <output className="uprog-date">{label}{rank ? ` · ${rank.abbreviation}` : ""}</output>
          {uniformLooks.map((id) => (
            <button key={id} type="button" className={shown === id ? "nav-btn on" : "nav-btn"} onClick={() => pickLook(id)}>
              {LOOK_LABEL[id]}
            </button>
          ))}
        </div>
      ) : null}
      {slide ? (
        <figure className="uprog-slide">
          <img src={publicUrl(slide.src)} alt={slide.caption} />
          <figcaption>{slide.caption}</figcaption>
        </figure>
      ) : (
        <p className="quiet">No slides yet.</p>
      )}
    </section>
  );
}
