import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Expand, GraduationCap, Layers, Pause, Plane, Play, Route, Shield, Ship, Shrink, Tent } from "lucide-react";
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


const CHIP_ICON = { command: Shield, instruction: GraduationCap, base: Building2, field: Tent, port: Ship, layover: Plane, stopover: Route };
function PinGlyph({ name }: { name: string }) {
  const Icon = CHIP_ICON[name as keyof typeof CHIP_ICON] ?? Shield;
  return <Icon size={18} strokeWidth={2} aria-hidden="true" />;
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
  const seen = new Set<string>();
  const assigned = sorted.filter((stop) => {
    if (stop.kind !== "command" || !stop.commandId || seen.has(stop.commandId)) return false;
    seen.add(stop.commandId);
    return true;
  });
  return assigned.map((stop, index) => ({ ...stop, n: index + 1, kind: "command" as StopLayer }));
}

const FIELD_ORDER = ["u-tapao", "shoalwater-bay", "mosul", "fob-sykes", "fob-tal-afar", "camp-blanding", "camp-bastion", "fob-delaram", "camp-blanding", "fob-sharana", "fob-orgun-e", "fob-patriot"];
const INSTRUCTION_ORDER = ["rtc", "ntc-great-lakes", "keesler", "san-diego", "imperial-beach", "gryphon-school"];
const BASE_ORDER = ["little-creek", "nas-north-island", "san-diego", "guam", "city-yokosuka", "city-sasebo", "city-chinhae", "polaris-point", "whidbey", "fort-bliss", "macdill", "mayport", "nas-jax"];
const STOPOVER_ORDER = ["camp-arifjan", "al-udeid", "bagram", "nas-north-island"];
const LAYOVER_ORDER = ["hickam", "travis", "bitburg", "ramstein", "leipzig", "city-baltimore"];
function fieldPath(all: Stop[]): Stop[] {
  const sorted = [...all].sort((a, b) => (a.n ?? 0) - (b.n ?? 0));
  const used = new Set<number>();
  const out: Stop[] = [];
  for (const id of FIELD_ORDER) {
    const stop = sorted.find((row) => !used.has(row.n) && (row.place.id === id || row.baseId === id || row.cityId === id));
    if (!stop) continue;
    used.add(stop.n);
    out.push({ ...stop, kind: "field" });
  }
  return out.map((stop, index) => ({ ...stop, n: index + 1 }));
}
function orderedPath(all: Stop[], ids: string[], kind: StopLayer): Stop[] {
  const sorted = [...all].sort((a, b) => (a.n ?? 0) - (b.n ?? 0));
  const used = new Set<number>();
  const out: Stop[] = [];
  for (const id of ids) {
    const stop = sorted.find((row) => !used.has(row.n) && (row.place.id === id || row.baseId === id || row.cityId === id || row.commandId === id));
    if (!stop) continue;
    used.add(stop.n);
    out.push({ ...stop, kind });
  }
  return out.map((stop, index) => ({ ...stop, n: index + 1 }));
}
function filterStops(all: Stop[], shown: StopLayer[] | null): Stop[] {
  if (shown && shown.length === 1 && shown[0] === "command") return commandPath(all);
  if (shown && shown.length === 1 && shown[0] === "field") return fieldPath(all);
  if (shown && shown.length === 1 && shown[0] === "instruction") return orderedPath(all, INSTRUCTION_ORDER, "instruction");
  if (shown && shown.length === 1 && shown[0] === "base") return orderedPath(all, BASE_ORDER, "base");
  if (shown && shown.length === 1 && shown[0] === "stopover") return orderedPath(all, STOPOVER_ORDER, "stopover");
  if (shown && shown.length === 1 && shown[0] === "layover") return orderedPath(all, LAYOVER_ORDER, "layover");
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
        <button type="button" className={`nav-btn map-all${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>
          <span className="pin-num command" aria-hidden="true"><Layers size={18} strokeWidth={2} /></span>
          {t.allChip}
        </button>
        {PIN_GROUPS.map((g) => (
          <button key={g.id} type="button" className={`nav-btn${!shown || shown.includes(g.id) ? " on" : ""}`} aria-pressed={!shown || shown.includes(g.id)} onClick={() => toggle(g.id)}>
            <span className={`pin-num ${g.cls}`} aria-hidden="true"><PinGlyph name={g.id} /></span>
            {g.label}
          </button>
        ))}
      </div>

    </main>
  );
}
