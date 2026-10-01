import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  awards,
  instances,
  medalFor,
  profile,
  publicUrl,
  ribbonRows,
  type Award,
  type Kind,
  type TourFocus,
} from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";
import { UniformProgression } from "@/components/shadowbox/uniform-progression";

const START = profile.serviceStart;
const END = profile.serviceEnd;
const ym = (v: string) => {
  const [y, m] = v.split("-");
  return Number(y) * 12 + (m ? Number(m) - 1 : 0);
};
const M0 = ym(START);
const M1 = ym(END);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dayOf(month: number): string {
  if (month <= M0) return START.slice(0, 10);
  if (month >= M1) return END.slice(0, 10);
  const y = Math.floor(month / 12);
  const m = (month % 12) + 1;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}
function monthFor(v: string) {
  const [y, m] = v.split("-");
  return Math.min(M1, Math.max(M0, Number(y) * 12 + (m ? Number(m) - 1 : 0)));
}
function earnedBy(day: string): Award[] {
  const y = Number(day.slice(0, 4));
  const got = new Set(instances.filter((row) => row.year != null && row.year <= y).map((row) => row.awardId));
  return awards.filter((award) => got.has(award.id));
}
function rowsOf(list: Award[], size: number): Award[][] {
  const rows: Award[][] = [];
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size));
  return rows;
}

export function Decorations({
  onOpen,
  tour,
}: {
  onOpen: (k: Kind, id: string) => void;
  tour?: TourFocus | null;
}) {
  const [month, setMonth] = useState(M1);
  const [playing, setPlaying] = useState(false);
  const [medals, setMedals] = useState(false);
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
  const list = useMemo(() => earnedBy(day), [day]);
  const rows = useMemo(() => ribbonRows(list), [list]);
  const withMedal = list.filter((award) => medalFor(award.id)?.front);
  const ribbonOnly = list.filter((award) => !medalFor(award.id)?.front);
  const label = `${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;

  return (
    <main className="sheet">
      <h2>Decorations</h2>
      <p>The rack as it stood, with no uniform under it. Ribbon bars until the toggle. The medal rasters already include the ribbon, so they hang as one piece.</p>
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
        <output className="uprog-date">{label}</output>
        <button type="button" className={medals ? "nav-btn on" : "nav-btn"} aria-pressed={medals} onClick={() => setMedals((on) => !on)}>
          {medals ? "Ribbons and medals" : "Ribbons"}
        </button>
      </div>
      {medals ? (
        <div className="living-medals">
          {rowsOf(withMedal, 3).map((row) => (
            <div key={row.map((a) => a.id).join("-")} className="medal-row">
              {row.map((award) => {
                const medal = medalFor(award.id);
                if (!medal?.front) return null;
                return (
                  <button key={award.id} type="button" className="hanging-medal" onClick={() => onOpen("award", award.id)} aria-label={award.name}>
                    <img src={publicUrl(medal.front)} alt="" />
                  </button>
                );
              })}
            </div>
          ))}
          {!withMedal.length ? <p className="quiet">No full-size medal art for this date yet.</p> : null}
          {ribbonOnly.length ? (
            <div className="living-rack">
              <p className="quiet">No pendant yet</p>
              {ribbonRows(ribbonOnly).map((row) => (
                <div key={row.map((a) => a.id).join("-")} className="rack-row">
                  {row.map((award) => (
                    <button key={award.id} type="button" className="ribbon living-ribbon" onClick={() => onOpen("award", award.id)} aria-label={award.name}>
                      <RibbonArt award={award} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="living-rack" aria-label="Ribbon rack">
          {rows.map((row) => (
            <div key={row.map((a) => a.id).join("-")} className="rack-row">
              {row.map((award) => (
                <button key={award.id} type="button" className="ribbon living-ribbon" onClick={() => onOpen("award", award.id)} aria-label={award.name}>
                  <RibbonArt award={award} />
                </button>
              ))}
            </div>
          ))}
          {!rows.length ? <p className="quiet">Nothing dated before {label}.</p> : null}
        </div>
      )}
      <p className="uprog-caption">{list.length} on the rack</p>
      <div className="uniform-timeline-parked" hidden>
        <UniformProgression onOpen={onOpen} tour={tour} />
      </div>
    </main>
  );
}
