import { useEffect, useMemo, useRef, useState } from "react";
import progressionJson from "@/data/uniform-progression.json";
import { awards, deviceSummary, formatSpan, formatWhen, profile, publicUrl, ranks, tourItems, warfare, type Award, type Device, type Kind, type TourFocus } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

const P = progressionJson as unknown as {
  goldFrom: string;
  breastInsignia: { id: string; date: string | null; approximate: boolean; position: "primary" | "secondary"; note: string }[];
  shoulderPatch: { image: string; from: string; until?: string | null } | null;
  awards: { awardId: string; date: string | null; recordYears: number[] }[];
  deviceUpdates: { awardId: string; date: string; devices: Device[] }[];
  uniforms: UniformDef[];
};

type Look = "blue" | "white" | "khaki";
type UniformDef = { id: string; look: Look; kind: "jumper" | "coat" | "choker" | "khaki"; name: string; short: string; grades: string; from: string; until: string | null };

const PLATE: Record<string, string> = {
  "sdb-jumper": "/incoming/jumper-blues.png",
  "sdw-jumper": "/incoming/jumper-whites.png",
  "cpo-sdb": "/incoming/dress-blues.png",
  "cpo-sdw": "/incoming/chokers.png",
  "cpo-khaki": "/incoming/khakis.png",
};

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
function stateAt(day: string) {
  const rank = [...ranks].reverse().find((r) => r.date && key(r.date) <= day) ?? ranks[0];
  const uniforms = P.uniforms.filter((u) => key(u.from) <= day && (!u.until || day <= key(u.until)));
  return { day, rank, uniforms };
}

export function UniformProgression({ onOpen, tour }: { onOpen: (k: Kind, id: string) => void; tour?: TourFocus | null }) {
  const [month, setMonth] = useState(M0);
  const [look, setLook] = useState<Look>("blue");
  useEffect(() => {
    if (!tour) return;
    setMonth(monthFor(tour.start));
  }, [tour?.kind, tour?.id, tour?.start]);
  const day = dayOf(month);
  const s = useMemo(() => stateAt(day), [day]);
  const uniform = s.uniforms.find((x) => x.look === look) ?? s.uniforms[0];
  const plate = uniform ? PLATE[uniform.id] : undefined;
  const label = `${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
  return (
    <section className="uprog" aria-label="Uniform through the years">
      <h3>Uniform through the years</h3>
      <div className="uprog-controls">
        <label className="uprog-slider">
          <span className="sr-only">Date</span>
          <input type="range" min={M0} max={M1} step={1} value={month} aria-valuetext={label} onChange={(e) => setMonth(Number(e.target.value))} />
        </label>
        <output className="uprog-date">{label}</output>
        {(["blue", "white", "khaki"] as Look[]).map((id) => (
          <button key={id} type="button" className={look === id ? "nav-btn on" : "nav-btn"} onClick={() => setLook(id)}>
            {id}
          </button>
        ))}
      </div>
      <div className="uprog-stage">
        {plate ? (
          <img className="uprog-plate" src={publicUrl(plate)} alt={uniform?.name ?? ""} />
        ) : (
          <p className="quiet">No plate for this uniform yet.</p>
        )}
      </div>
    </section>
  );
}
