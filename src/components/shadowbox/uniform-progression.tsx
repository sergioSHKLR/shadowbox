import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import progressionJson from "@/data/uniform-progression.json";
import {
  awards,
  instances,
  profile,
  publicUrl,
  ranks,
  ribbonRows,
  warfare,
  type Award,
  type Kind,
  type TourFocus,
} from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

const P = progressionJson as unknown as {
  goldFrom: string;
  breastInsignia: { id: string; date: string | null; position: "primary" | "secondary" }[];
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

const LOOK_LABEL: Record<Look, string> = { blue: "Blues", white: "Whites", khaki: "Khakis" };

const PATCH: Record<string, Record<Look, string | null>> = {
  sn: { blue: "/incoming/e-3-blues.svg", white: "/incoming/e-3-whites.svg", khaki: null },
  et3: { blue: "/incoming/patch-e4-red.svg", white: "/incoming/patch-e4-blue.svg", khaki: null },
  et2: { blue: "/incoming/patch-e5-red.svg", white: "/incoming/patch-e5-blue.svg", khaki: null },
  et1: { blue: "/incoming/patch-e6-red.svg", white: "/incoming/patch-e6-blue.svg", khaki: null },
  etc: { blue: "/incoming/patch-e7-gold.svg", white: null, khaki: "/incoming/collar-chief.svg" },
};

const PIN: Record<string, string> = {
  esws: "/incoming/ESWS.svg",
  exw: "/incoming/EXW.svg",
  "jcse-device": "/incoming/jcse-device.svg",
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
function earnedBy(day: string): Award[] {
  const y = Number(day.slice(0, 4));
  const got = new Set(instances.filter((row) => row.year != null && row.year <= y).map((row) => row.awardId));
  return awards.filter((award) => got.has(award.id));
}
function hashesAt(day: string) {
  const years = Math.max(0, Math.floor((ym(day) - ym(START)) / 48));
  return Math.min(5, years);
}

export function UniformProgression({ onOpen, tour }: { onOpen: (k: Kind, id: string) => void; tour?: TourFocus | null }) {
  const [month, setMonth] = useState(M0);
  const [look, setLook] = useState<Look>("blue");
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
  const rank = [...ranks].reverse().find((r) => r.date && key(r.date) <= day) ?? ranks[0];
  const uniforms = P.uniforms.filter((u) => key(u.from) <= day && (!u.until || day <= key(u.until)));
  const looks = (["blue", "white", "khaki"] as Look[]).filter((id) => uniforms.some((u) => u.look === id));
  const shown = looks.includes(look) ? look : looks[0];
  const uniform = uniforms.find((x) => x.look === shown) ?? uniforms[0];
  const plate = uniform ? PLATE[uniform.id] : undefined;
  const label = `${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
  const rows = useMemo(() => ribbonRows(earnedBy(day)), [day]);
  const gold = key(P.goldFrom) <= day && shown === "blue";
  const hashCount = hashesAt(day);
  const patch = rank ? PATCH[rank.id]?.[shown] : null;
  const et1Gold = rank?.id === "et1" && gold;
  const sleeve = et1Gold ? "/incoming/patch-e6-gold.svg" : patch;
  const pins = P.breastInsignia.filter((pin) => pin.date && key(pin.date) <= day);
  const jcseOn = key("2009") <= day;

  return (
    <section className="uprog" aria-label="Uniform through the years">
      <h3>Uniform through the years</h3>
      <div className="uprog-controls">
        <button type="button" className="nav-btn icon-btn" aria-label="Back six months" onClick={() => { setPlaying(false); setMonth((m) => Math.max(M0, m - 6)); }}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <button type="button" className={`nav-btn icon-btn uprog-play${playing ? " on" : ""}`} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((on) => !on)}>
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
        {looks.map((id) => (
          <button key={id} type="button" className={shown === id ? "nav-btn on" : "nav-btn"} onClick={() => setLook(id)}>
            {LOOK_LABEL[id]}
          </button>
        ))}
      </div>
      <div className={`uprog-stage look-${shown}`}>
        <div className="uprog-scene has-plate">
          {plate ? <img className="uprog-plate" src={publicUrl(plate)} alt={uniform?.name ?? ""} /> : <p className="quiet">No plate for this uniform yet.</p>}
          {sleeve ? <img className={`uprog-piece uprog-badge-piece${rank?.id === "etc" && shown === "khaki" ? " uprog-collar" : ""}`} src={publicUrl(sleeve)} alt="" /> : null}
          {hashCount > 0 && shown === "blue" ? (
            <div className="uprog-hashes" aria-hidden="true">
              <img src={publicUrl(gold ? `/incoming/gold-${Math.min(hashCount, 4)}.svg` : `/incoming/gold-${Math.min(hashCount, 4)}.svg`)} alt="" />
            </div>
          ) : null}
          {pins.length ? (
            <div className="uprog-pins">
              {pins.map((pin) => (
                <button key={pin.id} type="button" className="worn" onClick={() => onOpen("warfare", pin.id)}>
                  <img src={publicUrl(PIN[pin.id] ?? warfare.find((w) => w.id === pin.id)?.image ?? "")} alt={pin.id} />
                </button>
              ))}
            </div>
          ) : null}
          {jcseOn && shown !== "white" ? (
            <button type="button" className="worn uprog-jcse" onClick={() => onOpen("insignia", "jcse-device")}>
              <img src={publicUrl(PIN["jcse-device"])} alt="JCSE" />
            </button>
          ) : null}
          {rows.length ? (
            <div className="uprog-rack uprog-rack--top">
              {rows.map((row) => (
                <div key={row.map((a) => a.id).join("-")} className="rack-row">
                  {row.map((award) => (
                    <button key={award.id} type="button" className="ribbon" onClick={() => onOpen("award", award.id)} aria-label={award.name}>
                      <RibbonArt award={award} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <p className="uprog-caption">
          {uniform?.short ?? "Uniform"} · {rows.flat().length} ribbon{rows.flat().length === 1 ? "" : "s"}
          {hashCount ? ` · ${hashCount} hash mark${hashCount === 1 ? "" : "s"}` : ""}
          {pins.length ? ` · ${pins.map((p) => p.id.toUpperCase()).join(", ")}` : ""}
        </p>
      </div>
    </section>
  );
}
