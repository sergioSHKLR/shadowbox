import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { awards, publicUrl, ribbonRows, units, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

/**
 * Home shadowbox case (Sergio, Oct 12 2026): single-item art from incoming/used, every item at its true size on one
 * canvas measured in millimetres (1 canvas unit = 1 mm), scaled by one factor --k. Wide/landscape: items thrown about
 * after shadowbox-case-cleaned.svg, shirt flush left. Narrow (<=768px or portrait): an upright square grid.
 * Google Drawings exports are 96 dpi, so mm = px / 3.7795 (CAC 323.5 px = 85.6 mm).
 */
const PX = 96 / 25.4;
type Item = {
  id: string; src: string; w: number; h: number; view?: string; unit?: string; label: string; obj?: boolean; rack?: boolean; crop?: boolean; dev?: { src: string; h: number; label: string };
  /** wide: centre x, y and tilt in degrees */ wide: [number, number, number]; z: number;
};
const mm = (px: number) => Math.round((px / PX) * 10) / 10;
const CREST_H = 95;
/** Collar device for the rank on arrival at each command (true size: 23 mm wide, art cropped to its own height). */
const DEV = {
  po3: { src: "po3-silver-collar.svg", h: 25, label: "PO3" }, po2: { src: "po2-silver-collar.svg", h: 29.9, label: "PO2" },
  po1: { src: "po1-silver-collar.svg", h: 32.5, label: "PO1" }, po1g: { src: "po1-gold-collar.svg", h: 32.5, label: "PO1 (gold)" },
  cpo: { src: "cpo-collar.svg", h: 32.5, label: "CPO" },
};
const DEV_W = 23;
const DEV_GAP = 5;
const crest = (id: string, unit: string, file: string, aspect: number, cx: number, label: string, dev?: Item["dev"]): Item => ({
  id, src: file, dev, w: Math.round(CREST_H * aspect), h: CREST_H, view: "onduty", unit, label, wide: [cx, 600, 0], z: 5,
});
const RACK_ROWS = ribbonRows(awards, 3);
const RIBBON_W = 35; // 1 3/8 in
const RIBBON_H = 9.5; // 3/8 in
const PIN_W = 70;
const RACK_H = Math.round(mm(90.7) + 4 + RACK_ROWS.length * RIBBON_H + 4 + mm(98.3));

const SHIRT_H = 478;
const ITEMS: Item[] = [
  // Shirt cropped (not scaled) to the top 478 mm so three front buttons show; flush top-left.
  { id: "uniforms", src: "shirt-long.svg", crop: true, w: mm(1474.016), h: SHIRT_H, view: "uniforms", label: "Uniforms", wide: [mm(1474.016) / 2, SHIRT_H / 2, 0], z: 1 },
  { id: "decorations", src: "", rack: true, w: 3 * RIBBON_W, h: RACK_H, view: "decorations", label: "Decorations", wide: [210, 270, 0], z: 3 },
  { id: "contact", src: "calling-card.svg", w: 85.6, h: 54, view: "contact", label: "Contact", wide: [215, 585, 12], z: 3 },
  { id: "admin", src: "9527-card.svg", w: 85.6, h: 54, view: "admin", label: "Admin", wide: [395, 85, -15], z: 3 },
  { id: "logbook", src: "green-notebook.svg", w: mm(359.055), h: mm(529.134), view: "logbook", label: "Logbook", wide: [440, 290, -30], z: 4 },
  { id: "map", src: "passport-maroon.svg", w: mm(332.598), h: mm(472.441), view: "map", label: "Travel book", wide: [590, 160, -15], z: 3 },
  { id: "onduty", src: "id-card.svg", obj: true, w: 54, h: 54 * (680.11 / 439.297), view: "onduty", label: "Identification card", wide: [700, 185, 15], z: 4 },
  { id: "offduty", src: "liberty-card.svg", w: 85.6, h: 54, view: "offduty", label: "Off Duty", wide: [690, 395, 15], z: 3 },
  { id: "timeline", src: "portrait-recruit.webp", w: 150, h: 150 * (625 / 640), view: "timeline", label: "Timeline", wide: [840, 110, -4], z: 2 },
  { id: "bio", src: "portrait-chief.webp", w: 150, h: 150 * (625 / 640), view: "bio", label: "Biography", wide: [985, 135, 3], z: 2 },
  { id: "plaque", src: "brass-plaque.svg", w: mm(264.567), h: mm(89.197), label: "", wide: [940, 255, 0], z: 3 },
  { id: "guestbook", src: "black-pen.svg", w: mm(37.795), h: mm(536.693), view: "guestbook", label: "Guestbook", wide: [1035, 420, -14], z: 4 },
];
const CRESTS: Item[] = [
  crest("ncts", "ncts", "ncts-crest.svg", 1, 0, "NCTS", DEV.po3),
  crest("frank-cable", "frank-cable", "as40-crest.svg", 960 / 720, 0, "USS Frank Cable", DEV.po2),
  crest("eodmu5", "eodmu5", "eodmu5-crest.svg", 1, 0, "EODMU-5", DEV.po1),
  crest("sercc", "sercc", "sercc-crest.svg", 341.781 / 298.482, 0, "SERCC", DEV.po1g),
  crest("jcse", "jcse", "jcse-crest.svg", 1208.234 / 1700.204, 0, "JCSE", DEV.po1g),
  crest("navhosp", "navhosp", "nhjax-crest.svg", 298.611 / 295.308, 0, "NH Jacksonville", DEV.cpo),
];
// Crest row: Sergio's span (x 301-883 of 960) scaled to the wide canvas, gutters evened out.
{
  const x0 = 345, x1 = 1000;
  const gap = (x1 - x0 - CRESTS.reduce((s, c) => s + c.w, 0)) / (CRESTS.length - 1);
  let x = x0;
  for (const c of CRESTS) { c.wide = [x + c.w / 2, 615, 0]; x += c.w + gap; }
}
const ALL = [...ITEMS, ...CRESTS];
const WIDE = { w: 1080, h: 675 };

// Upright grid for narrow screens, in nav order; rows are centred, items centred on the row's height.
const G = 12;
const GRID_W = 400;
const GRID_ROWS = [["bio", "timeline"], ["plaque"], ["logbook", "map", "onduty", "guestbook"], ["uniforms"], ["decorations", "offduty", "admin"], ["contact"], ["ncts", "frank-cable", "eodmu5"], ["sercc", "jcse", "navhosp"]];
const GRID: Record<string, [number, number]> = {};
let gridH = G;
for (const row of GRID_ROWS) {
  const items = row.map((id) => ALL.find((i) => i.id === id)!);
  const rw = items.reduce((s, i) => s + i.w, 0) + (items.length - 1) * G;
  const top = (i: Item) => (i.dev ? i.dev.h + DEV_GAP : 0);
  const rh = Math.max(...items.map((i) => i.h + top(i)));
  let x = (GRID_W - rw) / 2;
  for (const i of items) { GRID[i.id] = [x, gridH + (rh - i.h - top(i)) / 2 + top(i)]; x += i.w + G; }
  gridH += rh + G;
}
const GRID_SIZE = { w: GRID_W, h: Math.ceil(gridH) };
export const NARROW_QUERY = "(max-width: 768px), (orientation: portrait)";

function Rack() {
  return (
    <span className="cx-rack">
      <img className="cx-pin" src={publicUrl("/case/surface-warfare.svg")} alt="" style={{ width: PIN_W }} />
      <span className="cx-rows">
        {RACK_ROWS.map((row) => (
          <span key={row[0].id} className="cx-row">
            {row.map((award) => <RibbonArt key={award.id} award={award} className="cx-ribbon" />)}
          </span>
        ))}
      </span>
      <img className="cx-pin" src={publicUrl("/case/expeditionary-warfare.svg")} alt="" style={{ width: PIN_W }} />
    </span>
  );
}

export function CaseHome({ onOpen, onGo, label }: { onOpen?: (k: Kind, id: string) => void; onGo?: (view: string) => void; label: (view: string) => string }) {
  const stage = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const mq = matchMedia(NARROW_QUERY);
    const fit = () => {
      const narrow = mq.matches;
      const c = narrow ? GRID_SIZE : WIDE;
      const w = el.clientWidth;
      const k = narrow ? w / c.w : Math.min(w / c.w, el.clientHeight / c.h);
      el.dataset.layout = narrow ? "grid" : "wide";
      if (narrow) el.style.height = `${c.h * k}px`; else el.style.removeProperty("height");
      el.style.setProperty("--k", String(k));
      el.style.setProperty("--cw", `${c.w}px`);
      el.style.setProperty("--ch", `${c.h}px`);
      el.style.setProperty("--ox", `${narrow ? 0 : (w - c.w * k) / 2}px`);
      el.style.setProperty("--oy", `${narrow ? 0 : (el.clientHeight - c.h * k) / 2}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    mq.addEventListener?.("change", fit);
    return () => { ro.disconnect(); mq.removeEventListener?.("change", fit); };
  }, []);
  return (
    <div ref={stage} className="cx-stage" data-layout="wide" style={{ backgroundImage: `url("${publicUrl("/case/felt.svg")}")` }}>
      <div className="cx-canvas">
        {ALL.map((item) => {
          const [cx, cy, deg] = item.wide;
          const g = GRID[item.id];
          const style = {
            width: item.w, height: item.h,
            "--wx": `${cx - item.w / 2}px`, "--wy": `${cy - item.h / 2}px`, "--wr": `${deg}deg`, "--wz": item.z,
            "--gx": `${g[0]}px`, "--gy": `${g[1]}px`,
          } as CSSProperties;
          const dev = item.dev ? (
            <span key={`${item.id}-dev`} className="cx-item cx-dev is-static" data-id={`${item.id}-dev`} aria-hidden="true" title={item.dev.label}
              style={{ width: DEV_W, height: item.dev.h, "--wx": `${cx - DEV_W / 2}px`, "--wy": `${cy - item.h / 2 - DEV_GAP - item.dev.h}px`, "--wr": "0deg", "--wz": item.z,
                "--gx": `${g[0] + item.w / 2 - DEV_W / 2}px`, "--gy": `${g[1] - DEV_GAP - item.dev.h}px` } as CSSProperties}>
              <img className="cx-art" src={publicUrl(`/case/${item.dev.src}`)} alt="" draggable={false} />
            </span>
          ) : null;
          const art = item.rack ? <Rack /> : item.obj
            ? <object className="cx-art" type="image/svg+xml" data={publicUrl(`/case/${item.src}`)} aria-hidden="true" tabIndex={-1} />
            : <img className={item.crop ? "cx-art is-crop" : "cx-art"} src={publicUrl(`/case/${item.src}`)} alt="" draggable={false} />;
          if (dev) return [dev, <CaseButton key={item.id} item={item} style={style} art={art} name={item.unit ? units.find((u) => u.id === item.unit)?.name ?? item.label : item.label} go={() => onOpen?.("unit", item.unit!)} />];
          if (!item.view) return <span key={item.id} className="cx-item is-static" data-id={item.id} style={style}>{art}</span>;
          const name = item.unit ? units.find((u) => u.id === item.unit)?.name ?? item.label : label(item.view) || item.label;
          return (
            <button key={item.id} type="button" className="cx-item" data-id={item.id} style={style} aria-label={name} title={name}
              onClick={() => (item.unit ? onOpen?.("unit", item.unit) : onGo?.(item.view!))}>
              {art}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CaseButton({ item, style, art, name, go }: { item: Item; style: CSSProperties; art: ReactNode; name: string; go: () => void }) {
  return <button type="button" className="cx-item" data-id={item.id} style={style} aria-label={name} title={name} onClick={go}>{art}</button>;
}
