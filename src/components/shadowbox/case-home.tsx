import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  id: string; src: string; w: number; h: number; view?: string; unit?: string; label: string; obj?: boolean; rack?: boolean; crop?: boolean; lapel?: boolean; gh?: number; dev?: { src: string; h: number; w: number; label: string };
  /** wide: centre x, y and tilt in degrees */ wide: [number, number, number]; z: number;
};
const mm = (px: number) => Math.round((px / PX) * 10) / 10;
const CREST_H = 95;
/** Collar device for the rank on arrival at each command (true size: 23 mm wide, art cropped to its own height). */
const DEV = {
  // Cap-device heights (Sergio): PO3 32, PO2 38, PO1 44, CPO 44 mm; width follows each art's own aspect.
  po3: { src: "po3-silver-collar.svg", h: 32, w: 32 * 23 / 25, label: "PO3" }, po2: { src: "po2-silver-collar.svg", h: 38, w: 38 * 23 / 29.9, label: "PO2" },
  po1: { src: "po1-silver-collar.svg", h: 44, w: 44 * 23 / 32.5, label: "PO1" }, po1g: { src: "po1-gold-collar.svg", h: 44, w: 44 * 23 / 32.5, label: "PO1 (gold)" },
  cpo: { src: "cpo-collar.svg", h: 44, w: 44 * 23 / 32.5, label: "CPO" },
};
const DEV_GAP = 5;
const crest = (id: string, unit: string, file: string, aspect: number, label: string, dev: NonNullable<Item["dev"]>): Item => ({
  id, src: file, dev, w: Math.round(CREST_H * aspect), h: CREST_H, view: "onduty", unit, label, wide: [0, 0, 0], z: 5,
});
const RACK_ROWS = ribbonRows(awards, 3);
const RIBBON_W = 35; // 1 3/8 in
const RIBBON_H = 9.5; // 3/8 in
const PIN_W = 70;
const RACK_H = RACK_ROWS.length * RIBBON_H;

/**
 * Shirt landmarks in mm from the art's top-left, measured on shirt-long.svg (Oct 12 2026). If Sergio's regenerated file
 * moves them, update these numbers only: the crop and the rack, pins and pocket follow.
 */
const SHIRT_VB = [1455.118, 2437.795];
const SHIRT = { buttons: [212.5, 316, 419, 522, 625], show: 3, pocket: { cx: 131.3, top: 224, flapCy: 255, button: 272 } };
// Crop (never scale) halfway between the last shown front button and the next one.
const SHIRT_H = Math.round((SHIRT.buttons[SHIRT.show - 1] + (SHIRT.buttons[SHIRT.show] ?? mm(SHIRT_VB[1]))) / 2);
const SHIRT_W = mm(SHIRT_VB[0]);
const SHIRT_FULL = mm(SHIRT_VB[1]);
// shirt-lapel.svg: Sergio's lapel-only drawing (local-case ff91302), 680.3 x 755.9 px = 180 x 200 mm, same origin as shirt-long.svg.
const LAPEL = { w: mm(680.315), h: mm(755.906) };
const QIN = 6.35; // 1/4 in
const SWO_H = mm(90.7);
const EXW_H = mm(98.3);
/** Worn on the shirt in both layouts: centre relative to the shirt's top-left. */
const ON_SHIRT: Record<string, [number, number]> = {
  lapel: [LAPEL.w / 2, LAPEL.h / 2],
  decorations: [SHIRT.pocket.cx, SHIRT.pocket.top - QIN - RACK_H / 2],
  swo: [SHIRT.pocket.cx, SHIRT.pocket.top - QIN - RACK_H - QIN - SWO_H / 2],
  // EXW centred on the flap, just above the flap button (button radius ~9 mm + 2 mm clearance).
  exw: [SHIRT.pocket.cx, SHIRT.pocket.button - 11 - EXW_H / 2],
};
const CARD = { w: 85.6, h: 54 };
const PORTRAIT = { w: 150, h: 150 * (625 / 640) };
const ITEMS: Item[] = [
  { id: "uniforms", src: "shirt-long.svg", crop: true, w: SHIRT_W, h: SHIRT_H, gh: SHIRT_FULL, view: "uniforms", label: "Uniforms", wide: [0, 0, 0], z: 1 },
  { id: "lapel", src: "shirt-lapel.svg", lapel: true, w: LAPEL.w, h: LAPEL.h, label: "", wide: [0, 0, 0], z: 6 },
  { id: "decorations", src: "", rack: true, w: 3 * RIBBON_W, h: RACK_H, view: "decorations", label: "Decorations", wide: [0, 0, 0], z: 3 },
  { id: "swo", src: "surface-warfare.svg", w: PIN_W, h: SWO_H, view: "decorations", label: "Surface Warfare", wide: [0, 0, 0], z: 3 },
  { id: "exw", src: "expeditionary-warfare.svg", w: PIN_W, h: EXW_H, view: "decorations", label: "Expeditionary Warfare", wide: [0, 0, 0], z: 3 },
  { id: "contact", src: "calling-card.svg", ...CARD, view: "contact", label: "Contact", wide: [0, 0, 0], z: 7 },
  { id: "admin", src: "9527-card.svg", ...CARD, view: "admin", label: "Admin", wide: [0, 0, 0], z: 7 },
  { id: "offduty", src: "liberty-card.svg", ...CARD, view: "offduty", label: "Off Duty", wide: [0, 0, 0], z: 7 },
  { id: "logbook", src: "green-notebook.svg", w: mm(359.055), h: mm(529.134), view: "logbook", label: "Logbook", wide: [0, 0, 0], z: 7 },
  { id: "guestbook", src: "black-pen.svg", w: mm(37.795), h: mm(536.693), view: "guestbook", label: "Guestbook", wide: [0, 0, 0], z: 7 },
  { id: "map", src: "passport-maroon.svg", w: mm(332.598), h: mm(472.441), view: "map", label: "Travel book", wide: [0, 0, 0], z: 3 },
  { id: "onduty", src: "id-card.svg", obj: true, w: 54, h: 54 * (680.11 / 439.297), view: "onduty", label: "Identification card", wide: [0, 0, 0], z: 4 },
  { id: "bio", src: "portrait-chief.webp", ...PORTRAIT, view: "bio", label: "Biography", wide: [0, 0, 0], z: 2 },
  { id: "plaque", src: "brass-plaque.svg", w: mm(264.567), h: mm(89.197), view: "bio", label: "Biography", wide: [0, 0, 0], z: 3 },
];
const CRESTS: Item[] = [
  crest("ncts", "ncts", "ncts-crest.svg", 1, "NCTS", DEV.po3),
  crest("frank-cable", "frank-cable", "as40-crest.svg", 960 / 720, "USS Frank Cable", DEV.po2),
  crest("eodmu5", "eodmu5", "eodmu5-crest.svg", 1, "EODMU-5", DEV.po1),
  crest("sercc", "sercc", "sercc-crest.svg", 341.781 / 298.482, "SERCC", DEV.po1),
  crest("jcse", "jcse", "jcse-crest.svg", 1208.234 / 1700.204, "JCSE", DEV.po1g),
  crest("navhosp", "navhosp", "nhjax-crest.svg", 298.611 / 295.308, "NH Jacksonville", DEV.cpo),
];
const ALL = [...ITEMS, ...CRESTS];
const byId = (id: string) => ALL.find((i) => i.id === id)!;

/**
 * Both layouts are built from the same blocks (Sergio, Oct 13): one gutter G everywhere, canvas hugging the content.
 *  - CRESTS: 3 rows x 2 in service order, each crest with its arrival-rank device centred above it.
 *  - BIO: chief portrait, plaque, then [passport | ID] (88 + G + 54 = 150, the portrait's width).
 * Wide: shirt (3-button crop) against the left, top and bottom edges | crest block | BIO block + Liberty and 2M cards;
 *   memorandum, pen and USO card rest on the shirt's lower front.
 * Grid: crest block | BIO block + Liberty and 2M; full-length shirt bottom-left with [memorandum | pen] over the USO card
 *   on the felt under its sleeve.
 */
const G = 8;
type Pos = Record<string, [number, number]>;
const crestBlock = (x0: number, y0: number, pos: Pos) => {
  const rows = [CRESTS.slice(0, 2), CRESTS.slice(2, 4), CRESTS.slice(4, 6)];
  const w = Math.max(...rows.map((r) => r.reduce((s, c) => s + c.w, 0) + G * (r.length - 1)));
  let y = y0;
  for (const r of rows) {
    const dh = Math.max(...r.map((c) => c.dev!.h));
    const rw = r.reduce((s, c) => s + c.w, 0) + G * (r.length - 1);
    let x = x0 + (w - rw) / 2;
    for (const c of r) { pos[c.id] = [x, y + dh + DEV_GAP]; x += c.w + G; }
    y += dh + DEV_GAP + CREST_H + G;
  }
  return { w, h: y - G - y0 };
};
/** Stack of items centred in a column of width w; returns the height used. */
const column = (x0: number, y0: number, w: number, rows: string[][], pos: Pos) => {
  let y = y0;
  for (const r of rows) {
    const items = r.map(byId);
    const rw = items.reduce((s, i) => s + i.w, 0) + G * (items.length - 1);
    const rh = Math.max(...items.map((i) => i.h));
    let x = x0 + (w - rw) / 2;
    for (const i of items) { pos[i.id] = [x, y + (rh - i.h)]; x += i.w + G; }
    y += rh + G;
  }
  return y - G - y0;
};
const BIO_ROWS = [["bio"], ["plaque"], ["map", "onduty"]];

// ---- Wide
const WP: Pos = {};
const WIDE_H = SHIRT_H;
WP.uniforms = [0, 0];
let WIDE_W = 0;
{
  const cx0 = SHIRT_W + G;
  const cb = crestBlock(cx0, 0, {});
  const cy0 = (WIDE_H - cb.h) / 2;
  crestBlock(cx0, cy0, WP);
  const bx0 = cx0 + cb.w + G;
  const bh = column(bx0, 0, PORTRAIT.w, [...BIO_ROWS, ["offduty"], ["admin"]], {});
  column(bx0, (WIDE_H - bh) / 2, PORTRAIT.w, [...BIO_ROWS, ["offduty"], ["admin"]], WP);
  WIDE_W = bx0 + PORTRAIT.w + G;
  // On the shirt's lower front, bottom-aligned with G clearance: memorandum, pen, USO card.
  const memo = byId("logbook"), pen = byId("guestbook");
  WP.logbook = [G, WIDE_H - G - memo.h];
  WP.guestbook = [G + memo.w + G, WIDE_H - G - pen.h];
  WP.contact = [G + memo.w + G + pen.w + G, WIDE_H - G - CARD.h];
}
const WIDE = { w: WIDE_W, h: WIDE_H };
const TILT: Record<string, number> = {};

/**
 * Wide variations for Sergio to choose from (storyboards, Oct 13): ?layout=a|b|c|d. Same hard rules in each: shirt against
 * left and bottom, rack and pins uncovered under the lapel, crests on shared centre axes with cap devices above, no SN.
 */
const SX = SHIRT_W + G; // first column right of the shirt
/** Crests stacked in one column on a shared centre axis; returns the height used. */
const crestCol = (cx: number, y0: number, ids: string[], pos: Pos, gap = G) => {
  let y = y0;
  for (const id of ids) {
    const c = byId(id);
    pos[id] = [cx - c.w / 2, y + c.dev!.h + DEV_GAP];
    y += c.dev!.h + DEV_GAP + CREST_H + gap;
  }
  return y - gap - y0;
};
const crestColH = (ids: string[], gap = G) => ids.reduce((s, id) => s + byId(id).dev!.h + DEV_GAP + CREST_H, 0) + gap * (ids.length - 1);
const maxW = (ids: string[]) => Math.max(...ids.map((id) => byId(id).w));
const put = (pos: Pos, tilt: Record<string, number>, id: string, cx: number, cy: number, deg = 0) => {
  const it = byId(id); pos[id] = [cx - it.w / 2, cy - it.h / 2]; if (deg) tilt[id] = deg;
};
const L3 = ["ncts", "frank-cable", "eodmu5"], R3 = ["sercc", "jcse", "navhosp"];
type Variant = { pos: Pos; tilt: Record<string, number>; w: number; h: number; size?: Record<string, { w: number; h: number }> };
/** Wide-only size overrides (variant E's tall portrait slot). */
const WSIZE: Record<string, { w: number; h: number }> = {};
const VARIANTS: Record<string, () => Variant> = {
  // A: portrait + plaque at the centre, crests flanking in two columns, cards and books resting on the shirt.
  a: () => {
    const pos: Pos = { uniforms: [0, 0] }, tilt: Record<string, number> = {};
    const H = SHIRT_H, lw = maxW(L3), rw = maxW(R3);
    crestCol(SX + lw / 2, (H - crestColH(L3)) / 2, L3, pos);
    const cx0 = SX + lw + G;
    const ch = column(cx0, 0, PORTRAIT.w, BIO_ROWS, {});
    column(cx0, (H - ch) / 2, PORTRAIT.w, BIO_ROWS, pos);
    const rx0 = cx0 + PORTRAIT.w + G;
    crestCol(rx0 + rw / 2, (H - crestColH(R3)) / 2, R3, pos);
    put(pos, tilt, "logbook", 268, 255, 6);       // sleeve
    put(pos, tilt, "contact", 300, 372, 7);       // sleeve cuff
    put(pos, tilt, "offduty", 62, 428, -6);       // lower front
    put(pos, tilt, "admin", 160, 424, 5);
    put(pos, tilt, "guestbook", 112, 392, 4);
    return { pos, tilt, w: rx0 + rw + G, h: H };
  },
  // B: page order left to right: [Biography on the shoulder, Logbook on the front, Uniforms] > Timeline crests > Travel,
  //    On Duty > Off Duty, Admin > Guestbook, Contact.
  b: () => {
    const pos: Pos = { uniforms: [0, 0] }, tilt: Record<string, number> = {};
    const H = SHIRT_H;
    put(pos, tilt, "bio", 300, 150, -4);
    put(pos, tilt, "plaque", 300, 245, -4);
    put(pos, tilt, "logbook", 62, 390, -4);
    const lw = maxW(L3), rw = maxW(R3);
    crestCol(SX + lw / 2, (H - crestColH(L3)) / 2, L3, pos);
    const c2 = SX + lw + G;
    crestCol(c2 + rw / 2, (H - crestColH(R3)) / 2, R3, pos);
    const x3 = c2 + rw + G, w3 = 88 + G + CARD.w;
    const rows = [["map", "onduty"], ["offduty", "admin"], ["guestbook", "contact"]];
    const h3 = column(x3, 0, w3, rows, {});
    column(x3, (H - h3) / 2, w3, rows, pos);
    return { pos, tilt, w: x3 + w3 + G, h: H };
  },
  // C: formal and symmetric: portrait + plaque on the axis, crests in a 3 x 2 grid below it (each column on one axis),
  //    passport and cards flanking left, ID / pen / USO flanking right; memorandum on the sleeve.
  c: () => {
    const pos: Pos = {}, tilt: Record<string, number> = {};
    const cols = [["ncts", "sercc"], ["frank-cable", "jcse"], ["eodmu5", "navhosp"]];
    const cw = cols.map(maxW);
    const gw = cw.reduce((s, w) => s + w, 0) + G * 2;
    const ch = Math.max(...cols.map((c) => crestColH(c, 4)));
    const topH = PORTRAIT.h + G + byId("plaque").h;
    const H = Math.max(SHIRT_H, G + topH + G + ch + G);
    pos.uniforms = [0, H - SHIRT_H];
    const lw = 88, x1 = SX + lw + G, axis = x1 + gw / 2;
    const y0 = (H - (topH + G + ch)) / 2;
    put(pos, tilt, "bio", axis, y0 + PORTRAIT.h / 2);
    put(pos, tilt, "plaque", axis, y0 + PORTRAIT.h + G + byId("plaque").h / 2);
    let x = x1;
    cols.forEach((c, i) => { crestCol(x + cw[i] / 2, y0 + topH + G, c, pos, 4); x += cw[i] + G; });
    const lh = column(SX, 0, lw, [["map"], ["offduty"], ["admin"]], {});
    column(SX, (H - lh) / 2, lw, [["map"], ["offduty"], ["admin"]], pos);
    const rx = x1 + gw + G, rw2 = CARD.w;
    const rh = column(rx, 0, rw2, [["onduty", "guestbook"], ["contact"]], {});
    column(rx, (H - rh) / 2, rw2, [["onduty", "guestbook"], ["contact"]], pos);
    put(pos, tilt, "logbook", 268, H - SHIRT_H + 255, 6);
    return { pos, tilt, w: rx + rw2 + G, h: H };
  },
  // D: crests in a shallow arc over the portrait, plaque beneath it, documents and cards in a row along the bottom;
  //    memorandum on the sleeve, pen on the lower front.
  // E (Sergio's mark-up, Oct 13): shirt with memo + pen and documents stacked on its right half (passport, ID, Liberty,
  //    2M, USO) | tall portrait slot with the plaque centred under it | crests 2 x 3 on shared centre axes.
  //    Portrait slot 200 x 340 mm is reserved for a future full-body photo (10:17); today's waist-up image is
  //    centred in it with object-fit: cover (sides cropped, nothing added).
  e: () => {
    const pos: Pos = { uniforms: [0, 0] }, tilt: Record<string, number> = {};
    const H = SHIRT_H;
    // Portrait grown into the space the documents freed (10:17, still under the shirt height with the plaque).
    const size = { bio: { w: 420 * (687 / 1024), h: 420 } }; // official portrait, 687 x 1024, shown whole
    byId("bio").src = "portrait-full.webp"; // Sergio's official full-length portrait (portrait-cutout.webp kept, unused)
    const memo = byId("logbook"), pen = byId("guestbook");
    pos.logbook = [G, H - G - memo.h]; // plumb (Sergio)
    pos.guestbook = [G + memo.w + G, H - G - pen.h]; // plumb
    const pass = byId("map"); // passport right of the pen, on the lower shirt front
    pos.map = [G + memo.w + G + pen.w + G, H - G - pass.h];
    // Documents on the shirt (Sergio's mark-up, Oct 13): band between the lapel tip / pocket's right edge and the
    // shirt's right edge, clear of the lapel (x < 180 mm), rack, pins, memo and pen.
    const dw = 88, dx0 = 250;
    // Remaining stack spread evenly over the full height.
    const docs = ["onduty", "offduty", "admin", "contact"].map(byId);
    const gap = (H - docs.reduce((t, d) => t + d.h, 0)) / (docs.length + 1);
    let dy = gap;
    for (const d of docs) { pos[d.id] = [dx0 + (dw - d.w) / 2, dy]; dy += d.h + gap; }
    const px0 = dx0 + dw + G; // overlaps the sleeve edge so the portrait sits nearer the centre
    const plaque = byId("plaque");
    const ph = size.bio.h + G + plaque.h;
    pos.bio = [px0, (H - ph) / 2];
    pos.plaque = [px0 + (size.bio.w - plaque.w) / 2, (H - ph) / 2 + size.bio.h + G];
    // Chronological, read left-to-right then down: NCTS, AS-40 / EODMU-5, SERCC / JCSE, NH Jax.
    const LE = ["ncts", "eodmu5", "jcse"], RE = ["frank-cable", "sercc", "navhosp"];
    const lw = maxW(LE), rw = maxW(RE);
    const c1 = px0 + size.bio.w + G;
    crestCol(c1 + lw / 2, (H - crestColH(LE)) / 2, LE, pos);
    const c2 = c1 + lw + G;
    crestCol(c2 + rw / 2, (H - crestColH(RE)) / 2, RE, pos);
    return { pos, tilt, w: c2 + rw + G, h: H, size };
  },
  d: () => {
    const pos: Pos = { uniforms: [0, 0] }, tilt: Record<string, number> = {};
    const H = SHIRT_H;
    const ids = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
    const dy = [52, 16, 0, 0, 16, 52];
    const rowW = ids.reduce((s, id) => s + byId(id).w, 0) + G * 5;
    let x = SX;
    ids.forEach((id, i) => { const c = byId(id); crestCol(x + c.w / 2, G + dy[i] + (44 - c.dev!.h), [id], pos); x += c.w + G; });
    const axis = SX + rowW / 2;
    const py = G + 44 + DEV_GAP + CREST_H + G;
    put(pos, tilt, "bio", axis, py + PORTRAIT.h / 2);
    put(pos, tilt, "plaque", axis, py + PORTRAIT.h + G + byId("plaque").h / 2);
    const bottom = ["map", "onduty", "offduty", "admin", "contact"];
    const bw = bottom.reduce((s, id) => s + byId(id).w, 0) + G * 4;
    let bx = axis - bw / 2;
    for (const id of bottom) { const it = byId(id); pos[id] = [bx, H - G - it.h]; bx += it.w + G; }
    put(pos, tilt, "logbook", 268, 255, 6);
    put(pos, tilt, "guestbook", 120, 392, 4);
    return { pos, tilt, w: SX + rowW + G, h: H };
  },
};
const VARIANT = typeof location !== "undefined" ? new URLSearchParams(location.search).get("layout")?.toLowerCase() ?? "" : "";
if (VARIANTS[VARIANT]) {
  const v = VARIANTS[VARIANT]();
  for (const k of Object.keys(WP)) delete WP[k];
  Object.assign(WP, v.pos);
  Object.assign(TILT, v.tilt);
  WIDE.w = v.w;
  WIDE.h = v.h;
  Object.assign(WSIZE, v.size ?? {});
}

// ---- Grid (narrow)
const GP: Pos = {};
const GRID_W = Math.ceil(SHIRT_W + G);
let gridH: number;
{
  const cb = crestBlock(0, 0, {});
  const rows = [...BIO_ROWS, ["offduty"], ["admin"]];
  const bh = column(0, 0, PORTRAIT.w, rows, {});
  const x0 = (GRID_W - (cb.w + G + PORTRAIT.w)) / 2;
  const top = Math.max(cb.h, bh);
  crestBlock(x0, G + (top - cb.h) / 2, GP);
  column(x0 + cb.w + G, G + (top - bh) / 2, PORTRAIT.w, rows, GP);
  const sy = G + top + G;
  GP.uniforms = [0, sy];
  // On the felt under the sleeve, against the right edge and the bottom: [memorandum | pen] over the USO card.
  const bottom = sy + SHIRT_FULL;
  const memo = byId("logbook"), pen = byId("guestbook");
  const rx = GRID_W - G;
  GP.contact = [rx - CARD.w, bottom - G - CARD.h];
  GP.guestbook = [rx - pen.w, bottom - G - CARD.h - G - pen.h];
  GP.logbook = [rx - pen.w - G - memo.w, bottom - G - CARD.h - G - memo.h];
  gridH = bottom;
}
const GRID_SIZE = { w: GRID_W, h: Math.ceil(gridH) };

const GRID: Pos = GP;
for (const [layout, pos] of [["wide", WP], ["grid", GP]] as const) {
  const [sx, sy] = pos.uniforms;
  for (const [id, [rx, ry]] of Object.entries(ON_SHIRT)) { const it = byId(id); pos[id] = [sx + rx - it.w / 2, sy + ry - it.h / 2]; }
  if (layout === "wide") for (const it of ALL) { const p = pos[it.id]; if (p) { const z = layout === "wide" ? WSIZE[it.id] ?? it : it; it.wide = [p[0] + z.w / 2, p[1] + z.h / 2, TILT[it.id] ?? 0]; } }
}
export const CASE_DIMS = { WIDE, GRID_SIZE };
export const NARROW_QUERY = "(max-width: 768px), (orientation: portrait)";

function Rack() {
  return (
    <span className="cx-rack">
      {RACK_ROWS.map((row) => (
        <span key={row[0].id} className="cx-row">
          {row.map((award) => <RibbonArt key={award.id} award={award} className="cx-ribbon" />)}
        </span>
      ))}
    </span>
  );
}

export function CaseHome({ onOpen, onGo, label }: { onOpen?: (k: Kind, id: string) => void; onGo?: (view: string) => void; label: (view: string) => string }) {
  const stage = useRef<HTMLDivElement | null>(null);
  const [intro, setIntro] = useState(false);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    let seen = true;
    try { seen = localStorage.getItem(INTRO_KEY) === "1"; } catch { /* storage blocked: treat as seen */ }
    if (!seen) { setIntro(true); setHint(true); }
  }, []);
  useEffect(() => {
    if (intro || !hint) return;
    const t = window.setTimeout(() => setHint(false), 2000);
    return () => window.clearTimeout(t);
  }, [intro, hint]);
  const closeIntro = useCallback(() => {
    setIntro(false);
    try { localStorage.setItem(INTRO_KEY, "1"); } catch { /* ignore */ }
  }, []);
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
      (el.closest(".case-frame") as HTMLElement | null)?.style.setProperty("--cx-r", String(WIDE.w / WIDE.h));
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
    <>
    <div ref={stage} className={hint ? "cx-stage cx-hint" : "cx-stage"} data-layout="wide" style={{ ["--ratio" as string]: `${WIDE.w} / ${WIDE.h}`, backgroundImage: `url("${publicUrl("/case/felt.svg")}")` }}>
      <div className="cx-canvas">
        {ALL.map((item) => {
          const [cx, cy, deg] = item.wide;
          const g = GRID[item.id] ?? [0, 0];
          const ws = WSIZE[item.id] ?? item;
          const style = {
            "--ww": `${ws.w}px`, "--gw": `${item.w}px`,
            "--wx": `${cx - ws.w / 2}px`, "--wy": `${cy - ws.h / 2}px`, "--wr": `${deg}deg`, "--wz": item.z,
            "--gx": `${g[0]}px`, "--gy": `${g[1]}px`, "--wh": `${ws.h}px`, "--gh": `${item.gh ?? item.h}px`,
          } as CSSProperties;
          const dev = item.dev ? (
            <button type="button" key={`${item.id}-dev`} className="cx-item cx-dev" data-id={`${item.id}-dev`} aria-label={`${item.dev.label}: ${label("timeline") || "Timeline"}`} title={`${item.dev.label}: Timeline`} onClick={() => onGo?.("timeline")}
              style={{ width: item.dev.w, height: item.dev.h, "--wx": `${cx - item.dev.w / 2}px`, "--wy": `${cy - item.h / 2 - DEV_GAP - item.dev.h}px`, "--wr": "0deg", "--wz": item.z,
                "--gx": `${g[0] + item.w / 2 - item.dev.w / 2}px`, "--gy": `${g[1] - DEV_GAP - item.dev.h}px` } as CSSProperties}>
              <img className="cx-art" src={publicUrl(`/case/${item.dev.src}`)} alt="" draggable={false} />
            </button>
          ) : null;
          const art = item.lapel
            ? <img className="cx-art cx-lapel" src={publicUrl(`/case/${item.src}`)} alt="" draggable={false} />
            : item.rack ? <Rack /> : item.obj
            ? <object className="cx-art" type="image/svg+xml" data={publicUrl(`/case/${item.src}`)} aria-hidden="true" tabIndex={-1} />
            : <img className={item.crop ? "cx-art is-crop" : item.id === "bio" ? "cx-art is-cover" : "cx-art"} src={publicUrl(`/case/${item.src}`)} alt="" draggable={false} />;
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
      <button type="button" className="cx-help" aria-label="About this shadowbox" title="About this shadowbox" onClick={() => { setIntro(true); setHint(true); }}>?</button>
    </div>
    {intro ? <CaseIntro onClose={closeIntro} /> : null}
    </>
  );
}

const INTRO_KEY = "sb-case-intro-v1";
const WHY: [string, string, string][] = [
  ["Items", "Real medals, devices and uniforms are costly or hard to find", "Every item drawn to scale, at no cost"],
  ["Condition", "Fades, tarnishes and gathers dust behind glass", "Does not deteriorate"],
  ["Meaning", "Much stays unknown unless the owner or someone versed is there to explain", "Each item explains itself and opens its story"],
  ["Access", "Seen only where it hangs", "Open on any device, shared by a link"],
  ["Content", "Objects only", "Text and photos, with room for narrations and interviews"],
];

/** First-visit introduction (Oct 13 2026): Esc, the close button or the backdrop dismiss it; focus stays inside. */
function CaseIntro({ onClose }: { onClose: () => void }) {
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab" || !box.current) return;
      const f = [...box.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])")];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="cx-intro" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="cx-intro-box" role="dialog" aria-modal="true" aria-labelledby="cx-intro-title">
        <button type="button" className="cx-intro-x" aria-label="Close" onClick={onClose}>×</button>
        <h2 id="cx-intro-title">Welcome to the shadowbox</h2>
        <p>This is a digital shadowbox: every item from a Navy career, drawn at its true size. Each one carries its own story, so nothing depends on someone being here to explain it. Items that glow are clickable; select one to open its page.</p>
        <table className="cx-why">
          <caption>Why a digital shadowbox beats a physical one</caption>
          <thead><tr><th scope="col"></th><th scope="col">Physical case</th><th scope="col">This site</th></tr></thead>
          <tbody>{WHY.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}</tbody>
        </table>
        <button type="button" className="cx-intro-go" onClick={onClose}>View the case</button>
      </div>
    </div>
  );
}

function CaseButton({ item, style, art, name, go }: { item: Item; style: CSSProperties; art: ReactNode; name: string; go: () => void }) {
  return <button type="button" className="cx-item" data-id={item.id} style={style} aria-label={name} title={name} onClick={go}>{art}</button>;
}

