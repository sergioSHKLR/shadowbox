import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play } from "lucide-react";
import {
  careerStops,
  caseCopy,
  formatWhen,
  type Kind,
  type Stop,
  type StopLayer,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";

const PIN_GROUPS: { id: StopLayer; label: string; legend: string; cls: string }[] = [
  { id: "command", label: "Commands", legend: "Assigned commands (NCTS, AS-40, EODMU 5, SERCC, JCSE, NH Jax)", cls: "command" },
  { id: "base", label: "Bases", legend: "Home bases, NAS, NS, annexes, and schools at those places", cls: "base" },
  { id: "field", label: "Field", legend: "FOBs, camps, airfields in theater, training sites, and exercises", cls: "field" },
  { id: "port", label: "Port visits", legend: "Ship port calls and city port stops", cls: "port" },
  { id: "flight", label: "Flight stops", legend: "Transit hubs and flight legs", cls: "flight" },
];

function stopVisible(stop: Stop, shown: StopLayer[] | null) {
  if (!shown) return true;
  return shown.includes(stop.kind);
}

export function Stations({ stops: allStops, onOpen }: { stops: ReturnType<typeof careerStops>; onOpen: (k: Kind, id: string) => void }) {
  const [shown, setShown] = useState<StopLayer[] | null>(null);
  const toggle = (g: StopLayer) =>
    setShown((cur) => {
      if (!cur) return [g];
      const next = cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g];
      return next.length === 0 || next.length === PIN_GROUPS.length ? null : next;
    });

  const stops = useMemo(
    () => allStops.filter((stop) => stopVisible(stop, shown)),
    [allStops, shown],
  );

  const [cursor, setCursor] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const last = Math.max(0, stops.length - 1);

  useEffect(() => {
    setPlaying(false);
    setCursor(null);
  }, [shown]);

  useEffect(() => {
    if (!playing || stops.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    const count = stops.length;
    const id = window.setInterval(() => {
      const cur = cursorRef.current;
      const next = cur == null ? 0 : cur + 1;
      if (next >= count) {
        setPlaying(false);
        return;
      }
      setCursor(next);
    }, 2200);
    return () => window.clearInterval(id);
  }, [playing, stops.length]);

  const keepMapInView = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const top = stage.getBoundingClientRect().top;
    if (top < 8 || top > 120) {
      stage.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  };

  const startPlay = () => {
    setCursor((cur) => (cur == null || cur >= last ? 0 : cur));
    setPlaying(true);
    window.requestAnimationFrame(keepMapInView);
  };
  const stopPlay = () => setPlaying(false);
  const resetPlay = () => {
    setPlaying(false);
    setCursor(null);
  };
  const step = (delta: number) => {
    setPlaying(false);
    setCursor((cur) => {
      const base = cur == null ? (delta < 0 ? last : -1) : cur;
      return Math.max(0, Math.min(last, base + delta));
    });
  };
  const here = cursor == null ? null : stops[cursor];
  const whenLabel = here?.when ? (here.when.length === 4 ? here.when : formatWhen(here.when)) : null;

  const openStop = (stop: Stop) => {
    onOpen("place", stop.place.id);
  };

  return (
    <main className="sheet">
      <h2>Where the career went</h2>
      <p>{caseCopy.mapLead}</p>
      <div className="map-filter" role="group" aria-label="Show pin categories">
        <button type="button" className={`nav-btn${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>All</button>
        {PIN_GROUPS.map((g) => (
          <button key={g.id} type="button" className={`nav-btn${shown?.includes(g.id) ? " on" : ""}`} aria-pressed={!!shown?.includes(g.id)} onClick={() => toggle(g.id)}>
            <span className={`pin-num ${g.cls}`} aria-hidden="true" />
            {g.label}
          </button>
        ))}
      </div>
      <div ref={stageRef} className={`map-stage${cursor != null ? " is-playing" : ""}`}>
      <div className="map-play" role="group" aria-label="Play the map in career order">
        <button type="button" className="nav-btn icon-btn" aria-label="Back" title="Back" onClick={() => step(-1)} disabled={!stops.length}>
          <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <button type="button" className={`nav-btn icon-btn${playing ? " on" : ""}`} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"} title={playing ? "Pause" : "Play"} onClick={() => (playing ? stopPlay() : startPlay())}>
          {playing ? <Pause size={20} strokeWidth={2} aria-hidden="true" /> : <Play size={20} strokeWidth={2} aria-hidden="true" />}
        </button>
        <button type="button" className="nav-btn icon-btn" aria-label="Next" title="Next" onClick={() => step(1)} disabled={!stops.length}>
          <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <button type="button" className={`nav-btn icon-btn${cursor == null ? " on" : ""}`} aria-label="Full map" title="Full map" onClick={resetPlay} disabled={cursor == null}>
          <Maximize2 size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="map-play-status" aria-live="polite">
          {here
            ? `${here.n}${whenLabel ? ` · ${whenLabel}` : ""} · ${here.labels[0]}`
            : `Full map · ${stops.length} of ${allStops.length} stops`}
        </p>
        {stops.length ? (
          <label className="map-play-scrub">
            <span className="sr-only">Stop in order</span>
            <input
              type="range"
              min={0}
              max={last}
              value={cursor ?? 0}
              onChange={(event) => {
                setPlaying(false);
                setCursor(Number(event.target.value));
              }}
            />
          </label>
        ) : null}
      </div>
      {stops.length ? (
        <MapView
          stops={stops}
          extra={[]}
          tall
          focusId={here?.place.id ?? null}
          revealedIds={cursor == null ? null : stops.slice(0, cursor + 1).map((stop) => stop.place.id)}
          onSelect={(id) => onOpen("place", id)}
        />
      ) : null}
      </div>
      <ul className="map-legend" aria-label="Pin colours">
        {PIN_GROUPS.map((g) => (
          <li key={g.id}><span className={`pin-num ${g.cls}`}>1</span> {g.legend}</li>
        ))}
        <li><span className="pin-num approximate">1</span> Approximate location</li>
      </ul>
      <ol className="stop-list">
        {stops.map((stop, index) => (
          <li key={`${stop.n}-${stop.place.id}`} data-stop={index} className={cursor == null ? undefined : index === cursor ? "now" : index > cursor ? "later" : "reached"}>
            <button type="button" onClick={() => { setPlaying(false); setCursor(index); openStop(stop); }}>
              <span className={`pin-num ${stop.kind} ${stop.place.accuracy}`} aria-label={`Pin ${stop.n}`}>{stop.n}</span>
              <strong>{stop.labels[0]}</strong>
              <span>{stop.place.name}{stop.when ? ` · ${stop.when.length === 4 ? stop.when : formatWhen(stop.when)}` : ""}</span>
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}
