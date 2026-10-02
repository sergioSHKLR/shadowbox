import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  awards,
  caseCopy,
  certificates,
  instances,
  profile,
  publicUrl,
  ribbonRows,
  warfare,
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
const ESWS_FROM = ym("2003-01");
const EXW_FROM = ym("2014-01");
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
function Rack({ list, onOpen }: { list: Award[]; onOpen: (id: string) => void }) {
  if (!list.length) return null;
  return (
    <div className="living-rack" aria-label="Ribbon rack">
      {ribbonRows(list).map((row) => (
        <div key={row.map((a) => a.id).join("-")} className="rack-row">
          {row.map((award) => (
            <button key={award.id} type="button" className="ribbon living-ribbon" onClick={() => onOpen(award.id)} aria-label={award.name}>
              <RibbonArt award={award} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Pin({ id, onOpen }: { id: string; onOpen: (k: Kind, id: string) => void }) {
  const pin = warfare.find((row) => row.id === id);
  if (!pin?.image) return null;
  return (
    <button type="button" className="warfare-pin" onClick={() => onOpen("warfare", pin.id)} aria-label={pin.name}>
      <img src={publicUrl(pin.image)} alt="" />
      <span>{pin.abbreviation}</span>
    </button>
  );
}

export function Decorations({
  onOpen,
  tour,
}: {
  onOpen: (k: Kind, id: string) => void;
  tour?: TourFocus | null;
}) {
  const [month, setMonth] = useState(M0);
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
  const list = useMemo(() => earnedBy(day), [day]);
  const label = `${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
  const openAward = (id: string) => onOpen("award", id);
  const showSw = month >= ESWS_FROM;
  const showExw = month >= EXW_FROM;

  const ribbonBlock = (
    <>
      {showSw ? <Pin id="esws" onOpen={onOpen} /> : null}
      <Rack list={list} onOpen={openAward} />
      {!list.length ? <p className="quiet">Nothing dated before {label}.</p> : null}
      {showExw ? <Pin id="exw" onOpen={onOpen} /> : null}
    </>
  );

  return (
    <main className="sheet decorations">
      <h2>Decorations</h2>
      <p>The rack as it stood. The surface pin sits a quarter inch above it from 2003. The expeditionary pin sits a quarter inch below from 2014. Both are years, not board dates.</p>
      <ul className="plain">
        {caseCopy.howToRead.map((line) => <li key={line}>{line}</li>)}
      </ul>
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
        <div className="uprog-scrub">
          <output className="uprog-date">{label}</output>
          <label className="uprog-slider">
            <span className="sr-only">Date</span>
            <input type="range" min={M0} max={M1} step={1} value={month} aria-valuetext={label} onChange={(e) => { setPlaying(false); setMonth(Number(e.target.value)); }} />
          </label>
        </div>
      </div>
      {ribbonBlock}
      <p className="uprog-caption">{list.length} on the rack</p>
      <h3>Unofficial certificates</h3>
      <p>Not worn on the rack.</p>
      <ul className="stack">
        {certificates.map((certificate) => (
          <li key={certificate.id}>
            <button type="button" className="row-btn" onClick={() => onOpen("certificate", certificate.id)}>
              <strong>Date needed</strong>
              <span>{certificate.name}</span>
              <em>Unofficial</em>
            </button>
          </li>
        ))}
      </ul>
      <div className="uniform-timeline-parked" hidden>
        <UniformProgression onOpen={onOpen} tour={tour} />
      </div>
    </main>
  );
}
