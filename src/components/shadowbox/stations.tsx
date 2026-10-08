import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Maximize2, Pause, Play, Shrink } from "lucide-react";
import {
  careerStops,
  caseCopy,
  formatWhen,
  type Kind,
  type Stop,
  type StopLayer,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";
import type { Chrome } from "@/lib/shadowbox/copy";


const GLYPH: Record<string, string> = {
  command: "M12 2a3 3 0 0 0-1 5.83V9H8a1 1 0 0 0 0 2h3v1.1A5 5 0 0 0 7.1 16H6a1 1 0 0 0 0 2h1.1A5 5 0 0 0 12 21a5 5 0 0 0 4.9-3H18a1 1 0 0 0 0-2h-1.1A5 5 0 0 0 13 12.1V11h3a1 1 0 0 0 0-2h-3V7.83A3 3 0 0 0 12 2z",
  instruction: "M12 3 2 8l10 5 8-4v6h2V8L12 3zm-6 9.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.5l-6 3-6-3z",
  base: "M4 10.5 12 4l8 6.5V20h-6v-5H10v5H4v-9.5z",
  field: "M4 20l4-9 3 4 2-3 3 5 4-8 2 11H4z",
  port: "M3 17h18v2H3v-2zm1-2 1.2-6h13.6L20 15H4zm3.2-8h9.6l.6 2H6.6l.6-2z",
  layover: "M21 16v-2l-8-5V4a1 1 0 0 0-2 0v5L3 14v2l8-2.5V18l-2 1.5V21l3-1 3 1v-1.5L13 18v-4.5l8 2.5z",
  stopover: "M4 8h6l2-3 2 3h6v2h-6.2l-1.8 3 1.8 3H20v2h-6l-2 3-2-3H4v-2h6.2L12 13 10.2 10H4V8z",
  approximate: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm1.1-6.5-.9.9c-.7.7-1.2 1.3-1.2 2.6h-2v-.5c0-1.1.4-2.1 1.2-2.8l1.2-1.3a2 2 0 1 0-3.4-1.4H7a4 4 0 1 1 7.1 2.5z",
};
function PinGlyph({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d={GLYPH[name] || GLYPH.command} />
    </svg>
  );
}

function pinGroups(t: Chrome): { id: StopLayer; label: string; legend: string; cls: string }[] {
  return [
    { id: "command", label: t.pinCommands, legend: t.legendCommands, cls: "command" },
    { id: "instruction", label: t.pinInstruction, legend: t.legendInstruction, cls: "instruction" },
    { id: "base", label: t.pinBases, legend: t.legendBases, cls: "base" },
    { id: "field", label: t.pinField, legend: t.legendField, cls: "field" },
    { id: "port", label: t.pinPorts, legend: t.legendPorts, cls: "port" },
    { id: "layover", label: t.pinLayovers, legend: t.legendLayovers, cls: "layover" },
    { id: "stopover", label: t.pinStopovers, legend: t.legendStopovers, cls: "stopover" },
  ];
}

function stopMatchesFilter(stop: Stop, shown: StopLayer[] | null) {
  if (!shown) return true;
  // Match primary category only so Commands is the six assigned-command pins
  // (San Diego's alsoKinds "command" does not add a seventh Commands pin).
  return shown.includes(stop.kind);
}

/** When a filter is on, show each place or assigned command once (first / canonical pin). Full sequence keeps every visit. */
function uniqueKey(stop: Stop, shown: StopLayer[] | null): string {
  if (!shown) return `n:${stop.n}`;
  if (shown.includes("command") && stop.kind === "command" && stop.commandId) {
    return `command:${stop.commandId}`;
  }
  return `place:${stop.place.id}`;
}

/**
 * Commands filter on its own (the default view): the career path numbered 1..n (Sergio, Oct 2026).
 * #1 Miami (place of entry), #2 RTC, #3 USS Tortuga, #4 NTC Great Lakes, #5 Keesler AFB, then the assigned
 * commands (kind "command") in sequence order. Other filter combinations keep the fixed sequence numbers.
 */
function commandPath(all: Stop[]): Stop[] {
  const sorted = [...all].sort((a, b) => (a.n ?? 0) - (b.n ?? 0));
  const lastWhere = (test: (stop: Stop) => boolean) => [...sorted].reverse().find(test);
  const firstWhere = (test: (stop: Stop) => boolean) => sorted.find(test);
  const lead = [
    firstWhere((stop) => stop.place.id === "city-miami" || stop.labels[0]?.startsWith("Miami")),
    firstWhere((stop) => stop.commandId === "rtc"),
    firstWhere((stop) => stop.commandId === "tortuga"),
    // NTC is in sequence.json twice (before and after the Tortuga TAD); the later row is the school tour.
    lastWhere((stop) => stop.commandId === "ntc-great-lakes"),
    firstWhere((stop) => stop.place.id === "keesler" && !!stop.labels[0]?.startsWith("Keesler")) ?? firstWhere((stop) => stop.place.id === "keesler"),
  ].filter((stop): stop is Stop => Boolean(stop));
  const seen = new Set<string>();
  const assigned = sorted.filter((stop) => {
    if (stop.kind !== "command" || !stop.commandId || seen.has(stop.commandId)) return false;
    seen.add(stop.commandId);
    return true;
  });
  return [...lead, ...assigned].map((stop, index) => ({ ...stop, n: index + 1, kind: "command" as StopLayer }));
}

function filterStops(all: Stop[], shown: StopLayer[] | null): Stop[] {
  if (shown && shown.length === 1 && shown[0] === "command") return commandPath(all);
  const matched = all.filter((stop) => stopMatchesFilter(stop, shown));
  if (!shown) return matched;
  const seen = new Set<string>();
  const out: Stop[] = [];
  for (const stop of matched) {
    const key = uniqueKey(stop, shown);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(stop);
  }
  return out;
}

export function Stations({ stops: allStops, onOpen, aboutLabel, title = "Travel Book", t }: { stops: ReturnType<typeof careerStops>; onOpen: (k: Kind, id: string) => void; aboutLabel: string; title?: string; locale?: string; t: Chrome }) {
  const PIN_GROUPS = pinGroups(t);
  const [shown, setShown] = useState<StopLayer[] | null>(["command"]);
  const toggle = (g: StopLayer) =>
    setShown((cur) => {
      if (!cur) return [g];
      const next = cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g];
      return next.length === 0 || next.length === PIN_GROUPS.length ? null : next;
    });

  const stops = useMemo(
    () => filterStops(allStops, shown),
    [allStops, shown],
  );

  const [cursor, setCursor] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const cityKey = (stop: (typeof stops)[number]) => stop.cityId || stop.place.id;
  const pinIndex = new Map<string, number>();
  const pins = stops.flatMap((stop) => {
    const key = cityKey(stop);
    if (pinIndex.has(key)) return [];
    pinIndex.set(key, pinIndex.size);
    return [{ ...stop, n: 0 }];
  });
  const revealedPins = cursor == null ? pins.length : new Set(stops.slice(0, cursor + 1).map(cityKey)).size;
  const last = Math.max(0, stops.length - 1);

  // Fullscreen: browser Fullscreen API where available; CSS viewport cover otherwise (iPhone Safari).
  const [full, setFull] = useState(false);
  useEffect(() => {
    const sync = () => {
      const stage = stageRef.current;
      if (!stage) return;
      if (document.fullscreenElement === stage) setFull(true);
      else if (!document.fullscreenElement && stage.dataset.cover !== "1") setFull(false);
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    if (!full) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stageRef.current?.dataset.cover === "1") exitFull();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("map-cover-lock");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("map-cover-lock");
    };
  }, [full]);
  const enterFull = () => {
    const stage = stageRef.current;
    if (!stage) return;
    if (typeof stage.requestFullscreen === "function" && document.fullscreenEnabled) {
      stage.requestFullscreen().then(() => setFull(true)).catch(() => {
        stage.dataset.cover = "1";
        setFull(true);
      });
    } else {
      stage.dataset.cover = "1";
      setFull(true);
    }
  };
  function exitFull() {
    const stage = stageRef.current;
    if (stage) delete stage.dataset.cover;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    setFull(false);
  }

  useEffect(() => {
    setPlaying(false);
    setCursor(null);
  }, [shown]);

  useEffect(() => {
    // Reduced motion still plays: the map jumps stop to stop instead of flying (map-view.tsx).
    if (!playing || stops.length === 0) return;
    const count = stops.length;
    const id = window.setInterval(() => {
      const cur = cursorRef.current;
      const next = cur == null ? 0 : cur + 1;
      if (next >= count) {
        setPlaying(false);
        return;
      }
      setCursor(next);
    }, 4500);
    return () => window.clearInterval(id);
  }, [playing, stops.length]);

  const keepMapInView = () => {
    const stage = stageRef.current;
    if (!stage) return;
    // Never scroll while fullscreen — scrollIntoView can exit the Fullscreen API
    // or fight the CSS cover lock, which stops the tour looking like it "isn't playing".
    if (full || stage.dataset.cover === "1" || document.fullscreenElement) return;
    // Land the stage just under the sticky top bar (not behind it), so the player status and the map both show; the
    // current stop's caption is docked on the map itself (map-now-card), so it can't fall below the fold.
    const bar = document.querySelector<HTMLElement>(".app-bar");
    const barH = bar ? Math.round(bar.getBoundingClientRect().bottom) : 0;
    stage.style.setProperty("--bar-h", `${barH}px`);
    stage.style.scrollMarginTop = `${barH + 6}px`;
    const box = stage.getBoundingClientRect();
    const fits = box.top >= barH - 2 && box.top <= barH + 120 && box.bottom <= window.innerHeight + 2;
    if (!fits) {
      stage.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  };
  // Keep the map + caption in view as the tour advances (e.g. after the user scrolled away mid-tour).
  useEffect(() => {
    if (playing && cursor != null) keepMapInView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, cursor]);

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
      {/* Travel Book (Sergio, Oct 2026): no visible page title; the heading stays for screen readers, like the Logbook. */}
      <h1 className="sr-only">{title}</h1>
      <div ref={stageRef} className={`map-stage${cursor != null ? " is-playing" : ""}${full ? " is-full" : ""}`}>
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
        <button type="button" className={`nav-btn icon-btn${cursor == null ? " on" : ""}`} aria-label={t.fullMap} title={t.fullMap} onClick={resetPlay} disabled={cursor == null}>
          <Maximize2 size={18} strokeWidth={2} aria-hidden="true" />
        </button>
        <button type="button" className={`nav-btn icon-btn map-full-btn${full ? " on" : ""}`} aria-pressed={full} aria-label={full ? "Exit fullscreen" : "Fullscreen"} title={full ? "Exit fullscreen (Esc)" : "Fullscreen"} onClick={() => (full ? exitFull() : enterFull())}>
          {full ? <Shrink size={18} strokeWidth={2} aria-hidden="true" /> : <Expand size={18} strokeWidth={2} aria-hidden="true" />}
        </button>

        {stops.length ? (
          <label className="map-play-scrub">
            <span className="sr-only">{t.stopInOrder}</span>
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
          stops={pins}
          extra={[]}
          tall
          focusId={here?.place.id ?? null}
          focusIndex={here ? pinIndex.get(cityKey(here)) ?? null : null}
          revealedCount={cursor == null ? null : revealedPins}
          layoutEpoch={full ? "full" : "inline"}
          onSelect={(id) => onOpen("place", id)}
        />
      ) : null}
      {here ? (
        <div className="map-now-card" aria-hidden="true">
          <span className={`pin-num ${here.kind} ${here.place.accuracy}`}>{here.n}</span>
          <span className="map-now-text">
            <strong>{here.labels[0]}</strong>
            <span>{here.place.name}{whenLabel ? ` · ${whenLabel}` : ""}</span>
          </span>
        </div>
      ) : null}
      </div>
      <div className="map-filter" role="group" aria-label="Show pin categories">
        {/* All (restored, Sergio, Oct 2026): first chip; shows every category (shown = null), as before 2f61e08. */}
        <button type="button" className={`nav-btn${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>{t.allChip}</button>
        {PIN_GROUPS.map((g) => (
          <button key={g.id} type="button" className={`nav-btn${shown?.includes(g.id) ? " on" : ""}`} aria-pressed={!!shown?.includes(g.id)} onClick={() => toggle(g.id)}>
            <span className={`pin-num ${g.cls}`} aria-hidden="true"><PinGlyph name={g.id} /></span>
            {g.label}
          </button>
        ))}
      </div>

    </main>
  );
}
