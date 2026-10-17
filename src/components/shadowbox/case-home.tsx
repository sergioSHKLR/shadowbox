import type { Chrome } from "@/lib/shadowbox/copy";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { awards, publicUrl, ribbonRows, units, type Kind } from "@/lib/shadowbox/model";
import { createPortal } from "react-dom";
import { caseNote } from "@/lib/shadowbox/case-notes";
import type { Locale } from "@/lib/shadowbox/prefs";

/**
 * Home shadowbox case (Sergio, Oct 12 2026): single-item art from incoming/used, every item at its true size on one
 * canvas measured in millimetres (1 canvas unit = 1 mm), scaled by one factor --k. Wide/landscape: items thrown about
 * after shadowbox-case-cleaned.svg, shirt flush left. Three layouts (wide, two-column, one-column): see LAYOUTS.
 * Google Drawings exports are 96 dpi, so mm = px / 3.7795 (CAC 323.5 px = 85.6 mm).
 */
/** Case art URL with its content hash (?v=), so a changed file is never served from a stale cache. */
const caseUrl = (file: string) => publicUrl(`/case/${file}`);
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
  // Home-art set (Sergio, Oct 15 2026): po3.svg, po2.svg, po1-silver.svg, po1-gold.svg, cpo-anchor.svg; aspects from their viewBoxes.
  po3: { src: "po3-silver-collar.svg", h: 32, w: 32 * 298.512 / 273.135, label: "Petty Officer Third Class (PO3)" }, po2: { src: "po2-silver-collar.svg", h: 38, w: 38 * 298.176 / 345.115, label: "Petty Officer Second Class (PO2)" },
  po1: { src: "po1-silver-collar.svg", h: 44, w: 44 * 278.076 / 376.851, label: "Petty Officer First Class (PO1)" }, po1g: { src: "po1-gold-collar.svg", h: 44, w: 44 * 278.077 / 376.851, label: "Petty Officer First Class (PO1), gold" },
  cpo: { src: "cpo-collar.svg", h: 44, w: 44 * 240.838 / 366.897, label: "Chief Petty Officer (CPO)" },
};
const DEV_GAP = 5;
const crest = (id: string, unit: string, file: string, aspect: number, label: string, dev?: Item["dev"]): Item => ({
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
// Re-measured on Sergio's flat khakis.svg (Oct 14 2026, the old numbers were for the previous drawing): front buttons below
// the collar one, pocket edges 245.5-744.5 px, top 678.5 px, flap seam 892.5 px, flap button 826.5 px. His
// khakis-with-ribbons.svg puts the rack 105 mm wide centred on the pocket with its bottom ~1/4 in above the pocket top.
// Re-measured again on the home-art khakis-no-lapel.svg (Oct 15 2026, same 1455 x 2438 canvas): front buttons 817.5,
// 1120.5, 1423.5, 1726.5, 2029.5 px; pocket body edges 249-748 px, flap edges 236-761 px (the flap now overhangs the
// pocket), flap top 669.5 px, flap V point 885.3 px, flap button 831 px.
const SHIRT = { buttons: [mm(817.5), mm(1120.5), mm(1423.5), mm(1726.5), mm(2029.5)], show: 4, pocket: { cx: mm(498.5), top: mm(669.5), flapCy: mm(885.3), button: mm(831), flapL: mm(236), flapR: mm(761) } };
// Crop (never scale) halfway between the last shown front button and the next one.
const SHIRT_H = Math.round((SHIRT.buttons[SHIRT.show - 1] + (SHIRT.buttons[SHIRT.show] ?? mm(SHIRT_VB[1]))) / 2);
const SHIRT_W = mm(SHIRT_VB[0]);
const SHIRT_FULL = mm(SHIRT_VB[1]);
// shirt-lapel.svg: Sergio's home-art lapel.svg, drawn on the shirt's own 1455 x 2438 canvas (bare shirt + lapel = his
// khakis.svg). Its art ends at 525 px, so the overlay is cropped (never scaled) to the shirt's width x 540 px.
const LAPEL = { w: SHIRT_W, h: mm(540) };
// CPO collar anchor on the lapel (the old lapel had it drawn in; now cpo-anchor.svg is placed): fitted to the old
// drawing's anchor, 112 px tall, centred at (437, 281) px on the shirt, rotated -54 degrees.
const ANCHOR = { h: mm(112), w: mm(112) * 240.838 / 366.897, cx: mm(437), cy: mm(281), tilt: -54 };
const QIN = 6.35; // 1/4 in
// Sergio's pins (Oct 13 2026), tight viewBoxes: ESWS fills its box; the EXW metal spans 92.6% of its width and ends at
// 86.5% of its height (soft shadow below), so the box is widened to keep the art 70 mm wide.
const SWO_H = PIN_W * (129.012 / 377.953);
const EXW_W = PIN_W * 0.942 / 0.926, EXW_H = EXW_W * (134.144 / 377.953), EXW_ART_BOTTOM = 0.995;
/** Worn on the shirt in both layouts: centre relative to the shirt's top-left. */
const ON_SHIRT: Record<string, [number, number]> = {
  lapel: [LAPEL.w / 2, LAPEL.h / 2],
  anchor: [ANCHOR.cx, ANCHOR.cy],
  decorations: [SHIRT.pocket.cx, SHIRT.pocket.top - QIN - RACK_H / 2],
  swo: [SHIRT.pocket.cx, SHIRT.pocket.top - QIN - RACK_H - QIN - SWO_H / 2],
  // EXW centred on the flap, just above the flap button (button radius ~9 mm + 2 mm clearance).
  exw: [SHIRT.pocket.cx, SHIRT.pocket.button - 11 - EXW_ART_BOTTOM * EXW_H + EXW_H / 2],
};
const CARD = { w: 85.6, h: 54 };
const PORTRAIT = { w: 150, h: 150 * (625 / 640) };
const ITEMS: Item[] = [
  { id: "uniforms", src: "shirt-long.svg", crop: true, w: SHIRT_W, h: SHIRT_H, gh: SHIRT_FULL, view: "uniforms", label: "Uniforms", wide: [0, 0, 0], z: 1 },
  { id: "lapel", src: "shirt-lapel.svg", lapel: true, w: LAPEL.w, h: LAPEL.h, label: "", wide: [0, 0, 0], z: 6 },
  { id: "anchor", src: "cpo-collar.svg", w: ANCHOR.w, h: ANCHOR.h, label: "", wide: [0, 0, 0], z: 7 },
  { id: "decorations", src: "", rack: true, w: 3 * RIBBON_W, h: RACK_H, view: "decorations", label: "Decorations", wide: [0, 0, 0], z: 3 },
  { id: "swo", src: "esws-pin.svg", w: PIN_W, h: SWO_H, view: "decorations", label: "Surface Warfare", wide: [0, 0, 0], z: 3 },
  { id: "exw", src: "exw-pin.svg", w: EXW_W, h: EXW_H, view: "decorations", label: "Expeditionary Warfare", wide: [0, 0, 0], z: 3 },
  { id: "contact", src: "calling-card.svg", ...CARD, view: "contact", label: "Contact", wide: [0, 0, 0], z: 7 },
  { id: "admin", src: "9527-card.svg", ...CARD, view: "admin", label: "Admin", wide: [0, 0, 0], z: 7 },
  { id: "offduty", src: "liberty-card.svg", ...CARD, view: "offduty", label: "Off Duty", wide: [0, 0, 0], z: 7 },
  { id: "logbook", src: "green-notebook.svg", w: mm(359.055), h: mm(529.134), view: "logbook", label: "Logbook", wide: [0, 0, 0], z: 7 },
  { id: "guestbook", src: "black-pen.svg", w: mm(37.795), h: mm(517.795), view: "guestbook", label: "Guestbook", wide: [0, 0, 0], z: 7 },
  { id: "map", src: "passport-maroon.svg", w: mm(332.598), h: mm(472.441), view: "map", label: "Travel book", wide: [0, 0, 0], z: 3 },
  { id: "onduty", src: "id-card.svg", obj: true, w: 54, h: 54 * (680.11 / 439.297), view: "onduty", label: "Identification card", wide: [0, 0, 0], z: 4 },
  // Two portraits on one axis (Sergio, Oct 13): Seaman Recruit on top, Chief Petty Officer below, each with its plaque.
  { id: "bio-sr", src: "portrait-recruit.webp", ...PORTRAIT, view: "bio", label: "Biography", wide: [0, 0, 0], z: 2 },
  { id: "plaque-sr", src: "plaque-sr.svg", w: mm(264.567), h: mm(89.197), view: "bio", label: "Biography", wide: [0, 0, 0], z: 3 },
  { id: "bio", src: "portrait-chief.webp", ...PORTRAIT, view: "bio", label: "Biography", wide: [0, 0, 0], z: 2 },
  { id: "plaque", src: "plaque-cpo.svg", w: mm(264.567), h: mm(89.197), view: "bio", label: "Biography", wide: [0, 0, 0], z: 3 },
];
const CRESTS: Item[] = [
  crest("ncts", "ncts", "ncts-crest.svg", 1, "NCTS", DEV.po3),
  crest("frank-cable", "frank-cable", "as40-crest.svg", 710.007 / 710.963, "USS Frank Cable", DEV.po2),
  crest("eodmu5", "eodmu5", "eodmu5-crest.svg", 719.152 / 717.977, "EODMU 5", DEV.po1),
  crest("sercc", "sercc", "sercc-crest.svg", 341.781 / 298.482, "SERCC", DEV.po1),
  crest("jcse", "jcse", "jcse-crest.svg", 1208.234 / 1693.748, "JCSE", DEV.po1g),
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
    const dh = Math.max(...r.map((c) => c.dev?.h ?? 0));
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
// ---- Layouts (Sergio's proposal drawing, Oct 13). Portraits and crests may be resized; every other item keeps its true
// size. Rank devices (12-17) are their own grid, no longer above the crests. Legend numbers refer to the drawing.
//  wide  (3 columns): shirt block | SR over CPO | devices 3 x 2 over crests 2 x 3.
//  twoL  (2 columns, landscape): shirt block | SR beside CPO over [devices 2 x 3 | crests 3 x 2].
//  twoP  (2 columns, portrait): SR beside CPO, crests 3 x 2, devices in a row, shirt with ID and passport beside it.
//  one   (1 column): SR beside CPO, crests 2 x 3, devices in a row, shirt block.
type Mode = "wide" | "twoL" | "twoP" | "one";
type Size = { w: number; h: number };
type Layout = { pos: Pos; size: Record<string, Size>; tilt: Record<string, number>; w: number; h: number };
const PLAQUE_H = mm(89.197);
const PEN = byId("guestbook");
const CRESTS_IN_ORDER = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
// One PO1 silver device only (Sergio): five devices, PO3, PO2, PO1 silver, PO1 gold, CPO.
const DEVS = CRESTS_IN_ORDER.filter((id) => byId(id).dev).map((id) => `${id}-dev`);
const devOf = (id: string) => byId(id.replace(/-dev$/, "")).dev!;
const EXW_BOTTOM = ON_SHIRT.exw[1] - EXW_H / 2 + EXW_ART_BOTTOM * EXW_H; // bottom of the EXW art (its soft shadow may overlap)
/** Items spread evenly (equal gaps, edges included) along one axis. */
const spreadY = (pos: Pos, ids: string[], cx: number, y0: number, h: number, size: (id: string) => Size = (id) => byId(id)) => {
  const gap = (h - ids.reduce((s, id) => s + size(id).h, 0)) / (ids.length + 1);
  let y = y0 + gap;
  for (const id of ids) { const s = size(id); pos[id] = [cx - s.w / 2, y]; y += s.h + gap; }
};
/** Items spread down to yEnd: equal gaps above and between, the last item's bottom exactly on yEnd. */
const spreadTo = (pos: Pos, ids: string[], cx: number, y0: number, yEnd: number) => {
  const gap = (yEnd - y0 - ids.reduce((s, id) => s + byId(id).h, 0)) / ids.length;
  let y = y0 + gap;
  for (const id of ids) { const s = byId(id); pos[id] = [cx - s.w / 2, y]; y += s.h + gap; }
};
/** Padding line (Sergio): items that sit low keep this inset from the felt's bottom and right edges (the shirt itself
 *  still touches the left and bottom edges). */
const PAD = 22;
/** Common shirt block (1-9): shirt at (sx, sy), worn awards, pen (1) left between the placket and the pocket, 2M (4) and
 * Liberty (5) over the pocket below the EXW, and the column ID (7), passport (8), memorandum (9), USO (6) over the
 * shirt's right side. split: ID and passport move off the shirt to a column at splitX (2-column portrait).
 * Returns the right edge of the block's content. */
const DOC_X = 212.5, DOC_W = 95;
const shirtBlock = (pos: Pos, sx: number, sy: number, split?: number) => {
  const H = SHIRT_H;
  pos.uniforms = [sx, sy];
  for (const [id, [rx, ry]] of Object.entries(ON_SHIRT)) { const it = byId(id); pos[id] = [sx + rx - it.w / 2, sy + ry - it.h / 2]; }
  pos.guestbook = [sx + 40, sy + H - PAD - PEN.h];
  spreadTo(pos, ["admin", "offduty"], sx + SHIRT.pocket.cx, sy + EXW_BOTTOM, sy + H - PAD);
  if (split === undefined) spreadTo(pos, ["onduty", "map", "logbook", "contact"], sx + DOC_X + DOC_W / 2, sy, sy + H - PAD);
  else {
    spreadTo(pos, ["logbook", "contact"], sx + DOC_X + DOC_W / 2, sy + EXW_BOTTOM - 40, sy + H - PAD);
    spreadY(pos, ["onduty", "map"], split + byId("map").w / 2, sy + H / 3, (2 * H) / 3);
  }
  return sx + DOC_X + DOC_W;
};
/** Two portraits, each with its plaque centred under it; portraits scaled to height ph. */
const portraitSize = (ph: number): Size => ({ w: ph * (PORTRAIT.w / PORTRAIT.h), h: ph });
const PAIRS = [["bio-sr", "plaque-sr"], ["bio", "plaque"]];
const portraitsStacked = (pos: Pos, size: Record<string, Size>, cx: number, y0: number, ph: number) => {
  const s = portraitSize(ph); let y = y0;
  for (const [b, pl] of PAIRS) { size[b] = s; pos[b] = [cx - s.w / 2, y]; y += ph + G; pos[pl] = [cx - byId(pl).w / 2, y]; y += PLAQUE_H + G; }
  return { w: s.w, h: y - G - y0 };
};
const portraitsSide = (pos: Pos, size: Record<string, Size>, x0: number, y0: number, w: number) => {
  const s = portraitSize(((w - G) / 2) * (PORTRAIT.h / PORTRAIT.w));
  PAIRS.forEach(([b, pl], i) => {
    const cx = x0 + (w / 2) * i + (w / 2 - G / 2) / 2 + (i ? G / 2 : 0);
    size[b] = s; pos[b] = [cx - s.w / 2, y0]; pos[pl] = [cx - byId(pl).w / 2, y0 + s.h + G];
  });
  return s.h + G + PLAQUE_H;
};
/** Crests at height c in a grid of rows (shared column axes), spread evenly over w x h. */
const crestSize = (id: string, c: number): Size => ({ w: (byId(id).w / CREST_H) * c, h: c });
const crestGrid = (pos: Pos, size: Record<string, Size>, rows: string[][], c: number, x0: number, y0: number, w: number, h: number) => {
  const cols = rows[0].length;
  const colW = [...Array(cols).keys()].map((i) => Math.max(...rows.map((r) => (r[i] ? crestSize(r[i], c).w : 0))));
  const gx = (w - colW.reduce((s, v) => s + v, 0)) / (cols + 1), gy = (h - rows.length * c) / (rows.length + 1);
  rows.forEach((r, ri) => {
    let x = x0 + gx;
    r.forEach((id, i) => { const s = crestSize(id, c); size[id] = s; pos[id] = [x + (colW[i] - s.w) / 2, y0 + gy + ri * (c + gy)]; x += colW[i] + gx; });
  });
  return colW.reduce((s, v) => s + v, 0);
};
/** Rank devices on a grid of cols x rows, each centred in its cell (true size). */
const devGrid = (pos: Pos, cols: number, x0: number, y0: number, w: number, h: number) => {
  const rows = Math.ceil(DEVS.length / cols), cw = w / cols, ch = h / rows;
  // A short last row is centred under the full ones (3 over 2), same column pitch.
  DEVS.forEach((id, i) => { const d = devOf(id), r = Math.floor(i / cols), n = Math.min(cols, DEVS.length - r * cols), off = (cols - n) * cw / 2;
    pos[id] = [x0 + off + (i % cols) * cw + (cw - d.w) / 2, y0 + r * ch + (ch - d.h) / 2]; });
};
const DEV_H = 44;
const R2x3 = [["ncts", "frank-cable"], ["eodmu5", "sercc"], ["jcse", "navhosp"]];
const R3x2 = [["ncts", "frank-cable", "eodmu5"], ["sercc", "jcse", "navhosp"]];
const H0 = SHIRT_H;
/** Next column starts here: over the sleeve edge, leaving enough of the shirt visible. */
const COL2_X = 360;

const wideL = (): Layout => {
  const pos: Pos = {}, size: Record<string, Size> = {};
  const right = shirtBlock(pos, 0, 0);
  // Oct 15 (Sergio): as on the phone, the ID card moves onto the pocket below the EXW (ID, then the USO and Liberty
  // slots), and the document column (passport, memorandum, pink 2M slot) stacks up from the bottom padding with the
  // pocket column's gap, so both columns share one gap and nothing overlaps.
  const pocketIds = ["onduty", "admin", "offduty"], docIds = ["map", "logbook", "contact"];
  spreadTo(pos, pocketIds, SHIRT.pocket.cx, EXW_BOTTOM, H0 - PAD);
  { const bot = H0 - PAD, pgap = (bot - EXW_BOTTOM - pocketIds.reduce((t, id) => t + byId(id).h, 0)) / pocketIds.length;
    let yy = bot; for (const id of [...docIds].reverse()) { const it = byId(id); yy -= it.h; pos[id] = [DOC_X + DOC_W / 2 - it.w / 2, yy]; yy -= pgap; } }
  const ph = (H0 - 2 * G - 2 * (PLAQUE_H + G) - G) / 2;
  const x3 = Math.max(right + G, COL2_X), pw = portraitSize(ph).w, pcx = x3 + pw / 2;
  portraitsStacked(pos, size, pcx, G, ph);
  const x4 = x3 + pw + G, devH = 2 * DEV_H + 3 * G;
  const c = (H0 - devH - 4 * G) / 3;
  const cw = crestGrid(pos, size, R2x3, c, x4, devH, 0, H0 - devH);
  const w4 = cw + 3 * G;
  crestGrid(pos, size, R2x3, c, x4, devH, w4, H0 - devH);
  devGrid(pos, 3, x4, G, w4, devH - G);
  return { pos, size, tilt: {}, w: x4 + w4, h: H0 };
};
const twoL = (): Layout => {
  const pos: Pos = {}, size: Record<string, Size> = {};
  const right = shirtBlock(pos, 0, 0);
  const x2 = Math.max(right + G, COL2_X);
  // Devices get roomy cells (sideways phones still need 44 px taps); crests take the largest height that fits.
  const devW = 140;
  let c = 120, w2 = 0, top = 0;
  for (; c > 60; c--) {
    w2 = devW + crestGrid({}, {}, R3x2, c, 0, 0, 0, 0) + 4 * G;
    top = (portraitSize(((w2 - G) / 2) * (PORTRAIT.h / PORTRAIT.w)).h) + G + PLAQUE_H;
    if (G + top + 3 * G + 2 * c + 3 * G <= H0) break;
  }
  portraitsSide(pos, size, x2, G, w2);
  const y2 = G + top + 3 * G, h2 = H0 - y2;
  devGrid(pos, 2, x2, y2, devW, h2);
  crestGrid(pos, size, R3x2, c, x2 + devW, y2, w2 - devW, h2);
  return { pos, size, tilt: {}, w: x2 + w2 + G, h: H0 };
};
const twoP = (): Layout => {
  // Sergio's drawing: SR | CPO; crests 18-20 across; crests 21 and 22 with the shirt's collar and shoulder beneath them
  // and 23 at the right over the device grid (12-14 / 15-17) on the right shoulder; ID and passport on the felt to the
  // right of the shirt. Crest 21 stays clear of the lapel above the collar.
  const pos: Pos = {}, size: Record<string, Size> = {};
  const W = SHIRT_W + G + byId("map").w + 2 * G, c = 100;
  let y = G;
  y += portraitsSide(pos, size, G, y, W - 2 * G) + 2 * G;
  crestGrid(pos, size, [R3x2[0]], c, 0, y - G, W, c + 2 * G); y += c + G;
  // Second row: each crest centred under the one above it (21 under 18, 22 under 19, 23 under 20).
  R3x2[1].forEach((id, i) => { const top = R3x2[0][i], s2 = crestSize(id, c); size[id] = s2; pos[id] = [pos[top][0] + size[top].w / 2 - s2.w / 2, y]; });
  const c22 = R3x2[1][1];
  const sy = y + c; // shirt top: collar just under crest 21
  const dx = pos[c22][0] + crestSize(c22, c).w + G;
  devGrid(pos, 3, dx, sy + G, W - G - dx, 2 * DEV_H + 3 * G);
  shirtBlock(pos, 0, sy, SHIRT_W + G);
  // One baseline for pen, Liberty, USO and passport; 2M's bottom level with the memorandum's (Sergio).
  const base = sy + H0 - PAD, bottom = (id: string, b: number) => { pos[id] = [pos[id][0], b - byId(id).h]; };
  for (const id of ["guestbook", "offduty", "contact", "map"]) bottom(id, base);
  const memoBottom = base - CARD.h - G;
  bottom("logbook", memoBottom); bottom("admin", memoBottom);
  const devBottom = sy + G + 2 * DEV_H + 3 * G, passTop = base - byId("map").h;
  pos.onduty = [pos.onduty[0], (devBottom + passTop) / 2 - byId("onduty").h / 2];
  // Memorandum's top level with the ID card's top (Sergio); 2M keeps its place.
  pos.logbook = [pos.logbook[0], pos.onduty[1]];
  // Four columns distributed with equal gaps between the pen's left edge and the passport's right edge (Sergio):
  // pen | 2M + Liberty | USO + memo | passport + ID; each item centred in its column, vertical positions kept.
  const dcols = [["guestbook"], ["admin", "offduty"], ["contact", "logbook"], ["map", "onduty"]];
  const dcw = dcols.map((ids) => Math.max(...ids.map((id) => byId(id).w)));
  const left = pos.guestbook[0], right = W - PAD;
  const dgap = (right - left - dcw.reduce((t, v) => t + v, 0)) / (dcols.length - 1);
  let dx0 = left;
  dcols.forEach((ids, i) => { for (const id of ids) pos[id] = [dx0 + (dcw[i] - byId(id).w) / 2, pos[id][1]]; dx0 += dcw[i] + dgap; });
  // Memorandum's top level with the ID card's (Sergio); 2M keeps its place (bottom where the memo's used to be).
  pos.logbook = [pos.logbook[0], pos.onduty[1]];
  return { pos, size, tilt: {}, w: W, h: sy + H0 };
};
const oneL = (): Layout => {
  const pos: Pos = {}, size: Record<string, Size> = {};
  const W = SHIRT_W + G, c = 110;
  let y = G;
  y += portraitsSide(pos, size, G, y, W - 2 * G) + G;
  const ch = 3 * c + 4 * G;
  crestGrid(pos, size, R2x3, c, 0, y, W, ch);
  // Phone v2 (Sergio, Oct 15): each crest column centred under its portrait (SR left, ETC/CPO right), and the five rank
  // devices as one column (PO3 at the top to CPO) centred in the gap between the crest columns, spread over the crest rows.
  const pcx = (id: string) => pos[id][0] + size[id].w / 2;
  R2x3.forEach((r) => r.forEach((id, i) => { pos[id] = [pcx(i ? "bio" : "bio-sr") - size[id].w / 2, pos[id][1]]; }));
  // v3 (Sergio): the column is centred on the gap between the two portraits.
  const dcx = (pos["bio-sr"][0] + size["bio-sr"].w + pos.bio[0]) / 2;
  const dgap = (ch - DEVS.reduce((t, id) => t + devOf(id).h, 0)) / (DEVS.length + 1);
  let dy = y + dgap;
  for (const id of DEVS) { const d = devOf(id); pos[id] = [dcx - d.w / 2, dy]; dy += d.h + dgap; }
  y += ch;
  shirtBlock(pos, 0, y);
  // Bottom (Sergio): Liberty above the USO card in the pocket column (swapCards puts the USO in admin's slot, so the two
  // slots trade here), and the pink 2M (contact's slot before the swap) above the memorandum in the document column.
  // v3 (Sergio, Oct 15): the ID card moves onto the pocket below the EXW, Liberty below it (between the pocket and the
  // USO card), USO at the bottom; the document column re-spreads passport, pink 2M, memorandum with even gaps.
  spreadTo(pos, ["onduty", "offduty", "admin"], SHIRT.pocket.cx, y + EXW_BOTTOM, y + H0 - PAD);
  // v4: pink 2M, passport, memorandum, stacked up from the bottom padding with the pocket column's card gap.
  { const ids = ["contact", "map", "logbook"], bot = y + H0 - PAD;
    const pgap = (bot - y - EXW_BOTTOM - ["onduty", "offduty", "admin"].reduce((t, id) => t + byId(id).h, 0)) / 3;
    // v5 (Sergio, Oct 17): the column is centred on the right crest column's axis (SERCC, NH Jacksonville), not the shirt's
    // document column; phone portrait only. True sizes and vertical positions unchanged.
    const docCx = pcx("bio");
    let yy = bot; for (const id of [...ids].reverse()) { const it = byId(id); yy -= it.h; pos[id] = [docCx - it.w / 2, yy]; yy -= pgap; } }
  // Pen upright beside the pocket's left edge, its top level with the pocket top (the pocket is 142 mm tall, the pen 142).
  pos.guestbook = [SHIRT.pocket.flapL - 6 - PEN.w, y + SHIRT.pocket.top];
  return { pos, size, tilt: {}, w: W, h: y + H0 };
};
/** Sergio (Oct 14): the USO card (contact) and the pink 2M card (admin) trade places in every layout. Same card size, so
 *  swapping their positions keeps every gap. */
const swapCards = (l: Layout): Layout => {
  const { contact, admin } = l.pos;
  if (contact && admin) { l.pos.contact = admin; l.pos.admin = contact; }
  l.tilt.anchor = ANCHOR.tilt; // the collar anchor lies along the lapel in every layout
  return l;
};
const LAYOUTS: Record<Mode, Layout> = { wide: swapCards(wideL()), twoL: swapCards(twoL()), twoP: swapCards(twoP()), one: swapCards(oneL()) };
WIDE.w = LAYOUTS.wide.w; WIDE.h = LAYOUTS.wide.h;
/** Breakpoints on the window (Sergio's proposal): laptops (1200 px and wider, or 1000+ px at 1.6 : 1) 3 columns;
 *  phones upright (under 600 px wide) 1 column; other windows wider than tall (wide tablets, sideways phones) 2 columns
 *  landscape; other windows taller than wide (tall tablets) 2 columns portrait. */
const modeFor = (w: number, h: number): Mode =>
  w >= 1200 || (w >= 1000 && w / h >= 1.6) ? "wide" : w < 600 && h > w ? "one" : w > h ? "twoL" : "twoP";
const SCROLLS: Record<Mode, boolean> = { wide: false, twoL: false, twoP: true, one: true };
export const CASE_DIMS = { WIDE, LAYOUTS };

function Rack() {
  return (
    <span className="cx-rack">
      <img className="cx-rack-img" src={caseUrl("ribbon-rack.svg")} alt="" draggable={false} />
    </span>
  );
}

/** The pins that share the rack's tap target. */
const GROUP_PINS = ["swo", "exw"];
const GROUP_IDS = ["decorations", ...GROUP_PINS];

/** Ribbon rack + warfare pins as one button (Oct 16 2026). The button spans the union of the three boxes; each art keeps
 *  its exact layout position, offset by the union's top-left. The ID card (z 4) still sits above and takes its own taps. */
function RackGroup({ L, rack, name, go }: { L: Layout; rack: ReactNode; name: string; go: () => void }) {
  const boxes = GROUP_IDS.map((id) => {
    const it = byId(id);
    const p = L.pos[id] ?? [0, 0];
    const s = L.size[id] ?? it;
    return { id, x: p[0], y: p[1], w: s.w, h: s.h, it };
  });
  const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w)), y1 = Math.max(...boxes.map((b) => b.y + b.h));
  const style = { "--ww": `${x1 - x0}px`, "--wh": `${y1 - y0}px`, "--wx": `${x0}px`, "--wy": `${y0}px`, "--wr": "0deg", "--wz": 3 } as CSSProperties;
  return (
    <button type="button" className="cx-item cx-group" data-id="decorations" style={style} aria-label={name} title={name} onClick={go}>
      {boxes.map((b) => (
        <span key={b.id} className="cx-group-part" data-part={b.id}
          style={{ "--ww": `${b.w}px`, "--wh": `${b.h}px`, "--wx": `${b.x - x0}px`, "--wy": `${b.y - y0}px` } as CSSProperties}>
          {b.id === "decorations" ? rack : <img className="cx-art" src={caseUrl(b.it.src)} alt="" draggable={false} />}
        </span>
      ))}
    </button>
  );
}

/** The rack and both pins in the modal (Oct 16 2026): laid out from the wide case's own boxes, so their spacing and
 *  relative sizes are the real ones, then scaled as one block to fit the art area (nothing clipped at any width). */
function ModalGroup() {
  const L = LAYOUTS.wide;
  const boxes = GROUP_IDS.map((id) => {
    const p = L.pos[id] ?? [0, 0];
    const sz = L.size[id] ?? byId(id);
    return { id, x: p[0], y: p[1], w: sz.w, h: sz.h };
  });
  const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
  const W = Math.max(...boxes.map((b) => b.x + b.w)) - x0, H = Math.max(...boxes.map((b) => b.y + b.h)) - y0;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <span className="cx-modal-group" style={{ ["--gar" as string]: String(W / H) }}>
      {boxes.map((b) => (
        <img key={b.id} className="cx-modal-part" data-part={b.id} src={caseUrl(b.id === "decorations" ? "ribbon-rack.svg" : byId(b.id).src)} alt="" draggable={false}
          style={{ left: pct(b.x - x0, W), top: pct(b.y - y0, H), width: pct(b.w, W), height: pct(b.h, H) }} />
      ))}
    </span>
  );
}

/** Touch pinch-zoom on the case (Oct 16 2026). Touch pointers only, so mouse and desktop are untouched.
 *  - Two fingers pinch between 1x and 4x around their midpoint; one finger pans while zoomed.
 *  - At 1x the browser keeps one-finger page scroll (touch-action: pan-x pan-y); zoomed, the case takes all touches.
 *  - A double tap on the felt zooms to 2.5x there, or resets when zoomed. A tap on an item still opens it; a tap that
 *    ended a pan or pinch is swallowed so it doesn't open anything.
 *  The transform is on .cx-zoom, so the layout script (--k, --ox, --oy on .cx-canvas) is untouched. */
const ZMIN = 1, ZMAX = 4;
function usePinchZoom(stage: React.RefObject<HTMLDivElement | null>, layer: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = stage.current, zl = layer.current;
    if (!el || !zl) return;
    let z = 1, tx = 0, ty = 0;
    const pts = new Map<number, { x: number; y: number }>();
    let start: { z: number; tx: number; ty: number; d: number; mx: number; my: number } | null = null;
    let moved = false, lastTap = { t: 0, x: 0, y: 0 }, downAt = { x: 0, y: 0 };
    const apply = (animate = false) => {
      const w = el.clientWidth, h = el.clientHeight;
      z = Math.min(ZMAX, Math.max(ZMIN, z));
      tx = Math.min(0, Math.max(w - w * z, tx));
      ty = Math.min(0, Math.max(h - h * z, ty));
      zl.style.transition = animate ? "transform 0.2s ease-out" : "";
      zl.style.transform = z === 1 ? "" : `translate(${tx}px, ${ty}px) scale(${z})`;
      el.classList.toggle("is-zoomed", z > 1);
    };
    const local = (e: { clientX: number; clientY: number }) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const zoomAt = (nz: number, px: number, py: number) => { nz = Math.min(ZMAX, Math.max(ZMIN, nz)); tx = px - ((px - tx) / z) * nz; ty = py - ((py - ty) / z) * nz; z = nz; };
    const begin = () => {
      const [a, b] = [...pts.values()];
      if (b) start = { z, tx, ty, d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      else start = { z, tx, ty, d: 1, mx: a.x, my: a.y };
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      pts.set(e.pointerId, local(e));
      if (pts.size === 1) { moved = false; downAt = local(e); }
      if (pts.size === 2 || z > 1) { el.setPointerCapture?.(e.pointerId); }
      begin();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || !pts.has(e.pointerId) || !start) return;
      pts.set(e.pointerId, local(e));
      const [a, b] = [...pts.values()];
      if (b) {
        const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const nz = Math.min(ZMAX, Math.max(ZMIN, start.z * (d / start.d)));
        // Keep the canvas point under the start midpoint under the current midpoint.
        tx = mx - ((start.mx - start.tx) / start.z) * nz; ty = my - ((start.my - start.ty) / start.z) * nz; z = nz;
        moved = true; apply(); e.preventDefault();
      } else if (z > 1) {
        const dx = a.x - start.mx, dy = a.y - start.my;
        if (Math.hypot(a.x - downAt.x, a.y - downAt.y) > 8) moved = true;
        tx = start.tx + dx; ty = start.ty + dy; apply(); e.preventDefault();
      } else if (Math.hypot(a.x - downAt.x, a.y - downAt.y) > 8) moved = true;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || !pts.has(e.pointerId)) return;
      const p = local(e);
      const wasMulti = pts.size > 1;
      pts.delete(e.pointerId);
      if (pts.size) { begin(); return; }
      start = null;
      if (e.type === "pointercancel" || moved || wasMulti) { lastTap.t = 0; return; }
      // Double tap on the felt (not on an item): zoom in there, or reset.
      const onItem = (e.target as Element | null)?.closest?.(".cx-item");
      const now = performance.now();
      if (!onItem && now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) {
        if (z > 1) { z = 1; tx = 0; ty = 0; } else zoomAt(2.5, p.x, p.y);
        // The browser hit-tests the click after this jump, so swallow it or it opens whatever is now under the finger.
        apply(true); lastTap.t = 0; moved = true; return;
      }
      lastTap = { t: now, x: p.x, y: p.y };
    };
    // A tap that ended a pan or pinch must not open the item under the finger.
    const click = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    const resize = () => { if (z > 1) apply(); };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move, { passive: false });
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    window.addEventListener("resize", resize);
    return () => {
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true); window.removeEventListener("resize", resize);
    };
  }, [stage, layer]);
}

/** Leaves the full case from inside it (the top bar is outside the fullscreen element). */
const exitFull = () => {
  const f = document.querySelector<HTMLElement>(".case-frame[data-cover]");
  if (f) { delete f.dataset.cover; document.dispatchEvent(new Event("fullscreenchange")); }
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
};

export function CaseHome({ onOpen, onGo, label, copy, locale = "en" }: { copy: Chrome["intro"]; locale?: Locale; onOpen?: (k: Kind, id: string) => void; onGo?: (view: string) => void; label: (view: string) => string }) {
  const stage = useRef<HTMLDivElement | null>(null);
  const [intro, setIntro] = useState(false);
  const [hint, setHint] = useState(false);
  const [view, setView] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("wide");
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
    const fit = () => {
      const m = modeFor(window.innerWidth, window.innerHeight);
      const c = LAYOUTS[m], scroll = SCROLLS[m];
      el.dataset.layout = m;
      setMode(m);
      (el.closest(".case-frame") as HTMLElement | null)?.style.setProperty("--cx-r", String(c.w / c.h));
      el.style.setProperty("--ratio", `${c.w} / ${c.h}`);
      const w = el.clientWidth;
      const k = scroll ? w / c.w : Math.min(w / c.w, el.clientHeight / c.h);
      if (scroll) el.style.height = `${c.h * k}px`; else el.style.removeProperty("height");
      el.style.setProperty("--k", String(k));
      el.style.setProperty("--cw", `${c.w}px`);
      el.style.setProperty("--ch", `${c.h}px`);
      el.style.setProperty("--ox", `${scroll ? 0 : (w - c.w * k) / 2}px`);
      el.style.setProperty("--oy", `${scroll ? 0 : (el.clientHeight - c.h * k) / 2}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, []);
  const zoomLayer = useRef<HTMLDivElement | null>(null);
  usePinchZoom(stage, zoomLayer);
  const L = LAYOUTS[mode];
  return (
    <>
    <div ref={stage} className={hint ? "cx-stage cx-hint" : "cx-stage"} data-layout="wide" style={{ ["--ratio" as string]: `${WIDE.w} / ${WIDE.h}`, backgroundImage: `url("${caseUrl("felt.svg")}")` }}>
      <div ref={zoomLayer} className="cx-zoom">
      <div className="cx-canvas">
        {ALL.map((item) => {
          const p = L.pos[item.id] ?? [0, 0];
          const s = L.size[item.id] ?? item;
          const deg = L.tilt[item.id] ?? 0;
          const style = { "--ww": `${s.w}px`, "--wh": `${s.h}px`, "--wx": `${p[0]}px`, "--wy": `${p[1]}px`, "--wr": `${deg}deg`, "--wz": item.z } as CSSProperties;
          const dev = item.dev ? (
            <button type="button" key={`${item.id}-dev`} className="cx-item cx-dev" data-id={`${item.id}-dev`} aria-label={`${item.dev.label}: ${label("timeline") || "Timeline"}`} title={`${item.dev.label}: Timeline`} onClick={() => setView(`${item.id}-dev`)}
              style={{ "--ww": `${item.dev.w}px`, "--wh": `${item.dev.h}px`, "--wx": `${(L.pos[`${item.id}-dev`] ?? [0, 0])[0]}px`, "--wy": `${(L.pos[`${item.id}-dev`] ?? [0, 0])[1]}px`, "--wr": "0deg", "--wz": item.z + 1 } as CSSProperties}>
              <img className="cx-art" src={caseUrl(item.dev.src)} alt="" draggable={false} />
            </button>
          ) : null;
          const art = item.lapel
            ? <img className="cx-art cx-lapel is-crop" src={caseUrl(item.src)} alt="" draggable={false} />
            : item.rack ? <Rack /> : item.obj
            ? <object className="cx-art" type="image/svg+xml" data={caseUrl(item.src)} aria-hidden="true" tabIndex={-1} />
            : <img
                className={item.crop ? "cx-art is-crop" : "cx-art"}
                src={caseUrl(item.src)}
                // QA Oct 16: the portraits get a 320 px copy for small screens; the shirt and portraits load first (LCP).
                srcSet={item.src.startsWith("portrait-") ? `${caseUrl(item.src.replace(".webp", "-320.webp"))} 320w, ${caseUrl(item.src)} 640w` : undefined}
                sizes={item.src.startsWith("portrait-") ? "(max-width: 700px) 40vw, 18vw" : undefined}
                fetchPriority={item.id === "uniforms" || item.src.startsWith("portrait-") ? "high" : undefined}
                alt=""
                draggable={false}
              />;
          if (dev) return [dev, <CaseButton key={item.id} item={item} style={style} art={art} name={item.unit ? units.find((u) => u.id === item.unit)?.name ?? item.label : item.label} go={() => setView(item.id)} />];
          if (!item.view) return <span key={item.id} className="cx-item is-static" data-id={item.id} style={style}>{art}</span>;
          // Rack + ESWS + EXW are one target (Sergio, Oct 16 2026): the pins render inside the rack's group button.
          if (GROUP_PINS.includes(item.id)) return null;
          if (item.id === "decorations") return <RackGroup key={item.id} L={L} rack={art} name={copy.rackGroup} go={() => setView("decorations")} />;
          const name = item.unit ? units.find((u) => u.id === item.unit)?.name ?? item.label : label(item.view) || item.label;
          return (
            <button key={item.id} type="button" className="cx-item" data-id={item.id} style={style} aria-label={name} title={name}
              onClick={() => setView(item.id)}>
              {art}
            </button>
          );
        })}
      </div>
      </div>
      <button type="button" className="cx-exit" aria-label={copy.exitFull} title={copy.exitFull} onClick={exitFull}>×</button>
      <button type="button" className="cx-help" aria-label={copy.help} title={copy.help} onClick={() => { setIntro(true); setHint(true); }}>?</button>
    </div>
    {intro ? <CaseIntro copy={copy} onClose={closeIntro} /> : null}
    {view ? <ItemModal id={view} setId={setView} copy={copy} locale={locale} label={label}
      go={(id) => { const t = targetOf(id); setView(null); if (t.unit) { onGo?.("logbook"); window.dispatchEvent(new CustomEvent("sb-logbook-command", { detail: t.unit })); } else onGo?.(t.view); }} /> : null}
    </>
  );
}

/** Reading order for prev/next (Sergio, Oct 14 2026): portraits with their plaques, each command's arrival device then
 *  its crest in service order, then the shirt (uniform, rack, pins) and the cards and documents on it. */
const ORDER = ["bio-sr", "plaque-sr", "bio", "plaque", ...CRESTS_IN_ORDER.flatMap((id) => (byId(id).dev ? [`${id}-dev`, id] : [id])),
  "uniforms", "decorations", "onduty", "map", "logbook", "contact", "admin", "offduty", "guestbook"];
/** Crests open the Logbook on that command (Sergio, Oct 14 2026; never a sidebar from Home); a device the Timeline, everything else its page. */
const targetOf = (id: string): { view: string; unit?: string } => {
  if (id.endsWith("-dev")) return { view: "timeline" };
  const it = byId(id);
  return it.unit ? { view: "logbook", unit: it.unit } : { view: it.view ?? "" };
};
const nameOf = (id: string, label: (v: string) => string) => {
  if (id.endsWith("-dev")) return devOf(id).label;
  const it = byId(id);
  if (it.unit) return units.find((u) => u.id === it.unit)?.name ?? it.label;
  if (id === "swo" || id === "exw") return it.label;
  if (id.startsWith("plaque") || id.startsWith("bio")) return `${label("bio") || it.label}${id.endsWith("-sr") ? " · Seaman Recruit (SR)" : id === "bio" || id === "plaque" ? " · Chief Petty Officer (CPO)" : ""}`;
  return label(it.view ?? "") || it.label;
};

/** Item modal (Sergio, Oct 14 2026): the item in full over a dark backdrop, one sentence from the record, and a button to
 *  its page. Arrows and Left/Right step through ORDER; Esc, the backdrop or X close; focus is trapped and returns to the
 *  item that opened it. */
function ItemModal({ id, setId, copy: c, locale, label, go }: { id: string; setId: (id: string | null) => void; copy: Chrome["intro"]; locale: Locale; label: (v: string) => string; go: (id: string) => void }) {
  const box = useRef<HTMLDivElement | null>(null);
  const opener = useRef<string>(id);
  const at = ORDER.indexOf(id);
  const step = useCallback((d: number) => setId(ORDER[(at + d + ORDER.length) % ORDER.length]), [at, setId]);
  const close = useCallback(() => setId(null), [setId]);
  useEffect(() => {
    const back = opener.current;
    return () => { document.querySelector<HTMLElement>(`.cx-item[data-id="${back}"]`)?.focus(); };
  }, []);
  useEffect(() => { opener.current = id; }, [id]);
  useEffect(() => { box.current?.querySelector<HTMLElement>(".cx-modal-x")?.focus(); }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
      if (e.key !== "Tab" || !box.current) return;
      const f = [...box.current.querySelectorAll<HTMLElement>("button:not([disabled])")];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [close, step]);
  const dev = id.endsWith("-dev");
  const it = dev ? null : byId(id);
  const name = id === "decorations" ? c.rackGroup : nameOf(id, label);
  const note = caseNote(id, locale);
  const t = targetOf(id);
  const page = t.unit ? `${label("logbook") || "Logbook"} · ${units.find((u) => u.id === t.unit)?.abbreviation ?? name}` : label(t.view) || t.view;
  const src = dev ? devOf(id).src : it!.src;
  const ratio = dev ? devOf(id).w / devOf(id).h : it!.crop ? SHIRT_W / SHIRT_FULL : it!.w / it!.h;
  return createPortal(
    <div className="cx-modal" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={box} className="cx-modal-box" role="dialog" aria-modal="true" aria-labelledby="cx-modal-title" aria-describedby={note ? "cx-modal-note" : undefined}>
        <button type="button" className="cx-modal-x" aria-label={c.close} title={c.close} onClick={close}>×</button>
        <div className="cx-modal-art" style={{ ["--ar" as string]: String(ratio) }}>
          {it?.rack ? <ModalGroup />
            // The ID card SVG pulls its photo, flag, barcode and seal from sibling files; an <img> blocks those, so it
            // shows as an <object> here, as on the case.
            : it?.obj ? <object type="image/svg+xml" data={caseUrl(src)} aria-hidden="true" tabIndex={-1} />
            : <img className={id === "bio" || id === "bio-sr" ? "cx-print" : undefined} src={caseUrl(src)} alt="" draggable={false} />}
        </div>
        <h2 id="cx-modal-title">{name}</h2>
        {note ? <p id="cx-modal-note">{note}</p> : null}
        <div className="cx-modal-nav">
          <button type="button" className="cx-modal-step" aria-label={c.prev} title={c.prev} onClick={() => step(-1)}>‹</button>
          <button type="button" className="cx-modal-go" onClick={() => go(id)}>{c.openPage.replace("{page}", page)}</button>
          <button type="button" className="cx-modal-step" aria-label={c.next} title={c.next} onClick={() => step(1)}>›</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const INTRO_KEY = "sb-case-intro-v1";

/** First-visit introduction (Oct 13 2026): Esc, the close button or the backdrop dismiss it; focus stays inside. */
function CaseIntro({ onClose, copy: c }: { onClose: () => void; copy: Chrome["intro"] }) {
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
        <button type="button" className="cx-intro-x" aria-label={c.close} onClick={onClose}>×</button>
        <h2 id="cx-intro-title">{c.title}</h2>
        <p>{c.body}</p>
        <table className="cx-why">
          <caption>{c.caption}</caption>
          <thead><tr><th scope="col"></th><th scope="col">{c.physical}</th><th scope="col">{c.site}</th></tr></thead>
          <tbody>{c.rows.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}</tbody>
        </table>
        <p className="cx-intro-note">{c.aiNote}</p>
        <button type="button" className="cx-intro-go" onClick={onClose}>{c.go}</button>
      </div>
    </div>
  );
}

function CaseButton({ item, style, art, name, go }: { item: Item; style: CSSProperties; art: ReactNode; name: string; go: () => void }) {
  return <button type="button" className="cx-item" data-id={item.id} style={style} aria-label={name} title={name} onClick={go}>{art}</button>;
}

