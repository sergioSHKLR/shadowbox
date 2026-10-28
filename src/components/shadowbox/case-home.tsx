import { X } from "lucide-react";
import type { Chrome } from "@/lib/shadowbox/copy";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { awards, publicUrl, ribbonRows, units, type Kind } from "@/lib/shadowbox/model";
import { createPortal } from "react-dom";
import { caseNote } from "@/lib/shadowbox/case-notes";
import type { Locale } from "@/lib/shadowbox/prefs";
import { FLAG_ORDERS, PATCH, gridCols, withFlags, withGrid, type FlagOrder, type FlagSpot } from "./case-flags";

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
// Case shirt preview (Sergio, Oct 18 2026, new incoming/ set 1e20d4c): incoming/plates/khakis/khakis-case.svg, the case
// khaki with the sleeve attached and the collar drawn in (no rack, pins or anchor), same 1455 x 2438 canvas. Measured on
// it: pocket body 249-748 px (centre 498.5), flap edges 238-759 px, flap top 754 px, flap V point ~969 px, flap button
// ~921 px; front buttons 823, 1127, 1429.5, 1734, 2038 px. The buttons below keep the old numbers so the slot height
// (crop between the 4th and 5th button) stays exactly as on main; the new 4th/5th buttons sit 7.5-8.5 px lower.
const SHIRT = { buttons: [mm(817.5), mm(1120.5), mm(1423.5), mm(1726.5), mm(2029.5)], show: 4, pocket: { cx: mm(498.5), top: mm(754), flapCy: mm(969), button: mm(921), flapL: mm(238), flapR: mm(759) } };
// Crop (never scale) halfway between the last shown front button and the next one.
const SHIRT_H = Math.round((SHIRT.buttons[SHIRT.show - 1] + (SHIRT.buttons[SHIRT.show] ?? mm(SHIRT_VB[1]))) / 2);
const SHIRT_W = mm(SHIRT_VB[0]);
const SHIRT_FULL = mm(SHIRT_VB[1]);
// Collar over the awards (Sergio, Oct 19 2026: "place lapel over the awards so esws has small parts obscured"): the collar
// leaf of khakis-case.svg (its last path, the point at 587, 385 px) reaches down onto the ESWS's right wing, but the shirt
// is drawn under the pins. shirt-collar.svg is that one path copied verbatim on the shirt's own 1455 x 2438 canvas, laid
// above the rack and pins at the shirt's origin, so the point covers a little of the pin; elsewhere it lies exactly on
// the shirt's own collar. The leaf ends at 520 px, so the overlay is cropped (never scaled) to the shirt's width x 540 px.
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
  { id: "uniforms", src: "shirt-khakis-case.svg", crop: true, w: SHIRT_W, h: SHIRT_H, gh: SHIRT_FULL, view: "uniforms", label: "Uniforms", wide: [0, 0, 0], z: 1 },
  { id: "lapel", src: "shirt-collar.svg", lapel: true, w: LAPEL.w, h: LAPEL.h, label: "", wide: [0, 0, 0], z: 4 },
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
  // Master EOD badge on the crest (Sergio, Oct 18 2026): eodmu5-crest-master-eod.svg is eodmu5-crest.svg unchanged with
  // eod-master-badge.svg nested in it, centred on the hub where the map's eight grid lines meet (632.95, 302.15 in the
  // crest's units: the western Pacific, about Guam), 15% of the crest's width (Sergio, Oct 18: the smallest preview size), drawn over the map and under the "5" and
  // the lettering. Baked into one file so it scales with the crest in every layout and in the crest pop-up.
  crest("eodmu5", "eodmu5", "eodmu5-crest-master-eod.svg", 719.152 / 717.977, "EODMU 5", DEV.po1),
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
  // Pen (Sergio, Oct 19 2026): raised to the left of the pocket, upright beside its left edge with its top level with
  // the pocket top, as on the phone.
  pos.guestbook = [sx + SHIRT.pocket.flapL - 6 - PEN.w, sy + SHIRT.pocket.top];
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

/** Right edge of the shirt's body below the sleeve (khakis-case.svg x = 800 px), measured on the case at 1440 px. */
const SHIRT_BODY_R = mm(800);
const wideL = (): Layout => {
  // Sergio's sketch (Oct 19 2026, "make wide like this"): shirt (23) flush left with its worn awards (2: ESWS, rack, EXW
  // over the pocket) and the pen (1) left of the pocket, as before. Pocket column: USO (4) under the EXW, memorandum (7)
  // at the bottom. Document column: ID card (3) upright at the top, level with the portraits' top, pink 2M (8), Liberty
  // (5) level with the USO, passport (6) at the bottom, its bottom level with the memorandum's. Portraits (9, 10) with
  // their plaques (9a, 10a) stacked as before. Crests (17-22) 2 x 3 in service order, each with its arrival-rank device
  // (11-15) centred under it.
  const pos: Pos = {}, size: Record<string, Size> = {};
  const right = shirtBlock(pos, 0, 0);
  // Positions here are the final ones: swapCards later lowers the LOWERED cards by LOWER_BY and swaps the contact and
  // admin slots (the admin slot shows the USO card, the contact slot the pink 2M), so set() pre-compensates.
  const set = (id: string, cx: number, top: number) => { const it = byId(id); pos[id] = [cx - it.w / 2, top - (LOWERED.includes(id) ? LOWER_BY : 0)]; };
  // Document column (Sergio, Oct 19 2026, yellow line on the wide case: "push column to the yellow line, sitting in the
  // middle of portrait and first column"): centred midway between the shirt's lower body edge (SHIRT_BODY_R) and the
  // portraits' left edge (the same x3 as below).
  const pcx0 = SHIRT.pocket.cx, dcx = (SHIRT_BODY_R + Math.max(right + G, COL2_X)) / 2, bot = H0 - PAD;
  const memo = byId("logbook"), pass = byId("map"), id3 = byId("onduty");
  set("logbook", pcx0, bot - memo.h);
  set("map", dcx, bot - pass.h);
  // USO and Liberty side by side, centred between the EXW's bottom and the memorandum's top.
  const cardTop = (EXW_BOTTOM + (bot - memo.h) - CARD.h) / 2;
  set("admin", pcx0, cardTop); // USO
  set("offduty", dcx, cardTop); // Liberty
  set("onduty", dcx, G);
  // Pink 2M centred between the ID card's bottom and the Liberty card's top.
  set("contact", dcx, (G + id3.h + cardTop - CARD.h) / 2);
  const ph = (H0 - 2 * G - 2 * (PLAQUE_H + G) - G) / 2;
  const x3 = Math.max(right + G, COL2_X), pw = portraitSize(ph).w, pcx = x3 + pw / 2;
  portraitsStacked(pos, size, pcx, G, ph);
  // Crest block: same crest box size and block width as before (so the canvas keeps its size), each row a crest at its
  // final (CREST_SCALE) size with its device DEV_GAP below, rows spread with equal gaps over the full height.
  const x4 = x3 + pw + G, devH = 2 * DEV_H + 3 * G;
  const c = (H0 - devH - 4 * G) / 3, cf = c * CREST_SCALE;
  const colW = [0, 1].map((i) => Math.max(...R2x3.map((r) => crestSize(r[i], c).w)));
  const w4 = colW[0] + colW[1] + 3 * G;
  const rowH = R2x3.map((r) => cf + DEV_GAP + Math.max(...r.map((id) => devOf(`${id}-dev`).h)));
  const gy = (H0 - rowH.reduce((t, v) => t + v, 0)) / (R2x3.length + 1);
  let ry = gy;
  R2x3.forEach((r, ri) => {
    let x = x4 + G;
    r.forEach((id, i) => {
      const s0 = crestSize(id, c), ccx = x + colW[i] / 2, d = devOf(`${id}-dev`);
      size[id] = s0; pos[id] = [ccx - s0.w / 2, ry - (c - cf) / 2];
      pos[`${id}-dev`] = [ccx - d.w / 2, ry + cf + DEV_GAP];
      x += colW[i] + G;
    });
    ry += rowH[ri] + gy;
  });
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
/**
 * Portrait after Sergio's sketch (Oct 19 2026, "This one for portrait", drawn over a tablet-portrait screenshot):
 *  - portraits (9, 10) side by side with their plaques (9a, 10a);
 *  - crests (17-22) 3 x 2 in service order, each with its arrival-rank device just left of it, centred on its height;
 *  - shirt (23) flush left under crest 21, worn awards (2), collar point and anchor as they are;
 *  - on the shirt: USO (4) on the lower pocket; the document column ID (3, upright), pink 2M (8), Liberty (5) and the
 *    pen (1) lying horizontal, all with equal gaps; on the felt right of the shirt: passport (6), top level with the
 *    ID's, and the memorandum (7) under it.
 * The sketch is to scale: USO, pen and memorandum end on one line a little above the pocket's bottom edge (pocket top
 * + 142 mm, less G), and the ID and passport tops sit 3 G below the shirt top. Everything below that line is bare shirt.
 */
const POCKET_LEN = 142;
/** Portrait shirt length (Sergio, Oct 19 2026: "remove one or two buttons of length from shirt on portrait"): the same
 *  art cropped higher (object-fit cover from the top, never scaled), so the bare lower shirt goes and the case gets
 *  shorter. One button less: halfway between the 3rd and 4th front buttons, the wide shirt's own crop rule. */
// Two buttons less (about 1.75 spacings): cropped PAD below the line the USO, pen and memorandum end on (pocket top +
// 142 mm, less G), clear of the 3rd front button.
const PORTRAIT_SHIRT_H = Math.round(SHIRT.pocket.top + POCKET_LEN - G + PAD);
const GUIDE_PITCH = 77;
const portraitSketch = (): Layout => {
  const pos: Pos = {}, size: Record<string, Size> = {}, tilt: Record<string, number> = {};
  const W = SHIRT_W + G + byId("map").w + 2 * G, c = 100;
  let y = G;
  y += portraitsSide(pos, size, G, y, W - 2 * G) + 2 * G;
  const fin = (id: string) => crestSize(id, c * CREST_SCALE);
  const pairW = (id: string) => devOf(`${id}-dev`).w + G + fin(id).w;
  const colW = [0, 1, 2].map((i) => Math.max(...R3x2.map((r) => pairW(r[i]))));
  const gx = (W - colW.reduce((t, v) => t + v, 0)) / 4;
  R3x2.forEach((r, ri) => {
    const rowTop = y + ri * (c + G);
    let x = gx;
    r.forEach((id, i) => {
      const d = devOf(`${id}-dev`), f = fin(id), s0 = crestSize(id, c), px = x + (colW[i] - pairW(id)) / 2;
      pos[`${id}-dev`] = [px, rowTop + c / 2 - d.h / 2];
      size[id] = s0; pos[id] = [px + d.w + G - (s0.w - f.w) / 2, rowTop];
      x += colW[i] + gx;
    });
  });
  const sy = y + c + G + c; // shirt top: collar just under crest 21
  shirtBlock(pos, 0, sy);
  // Final positions (swapCards lowers LOWERED by LOWER_BY and swaps the slots: admin shows the USO, contact the 2M).
  const set = (id: string, x: number, top: number) => { pos[id] = [x, top - (LOWERED.includes(id) ? LOWER_BY : 0)]; };
  const T = sy + 3 * G, B = sy + SHIRT.pocket.top + POCKET_LEN - G, dcx = DOC_X + DOC_W / 2;
  const uso = byId("admin");
  set("admin", SHIRT.pocket.cx - uso.w / 2, B - uso.h);
  // Document column: ID, 2M, Liberty, then the pen turned 90 degrees (its box stays upright; the rotation is about its
  // centre, so the box is placed by where the turned pen should lie).
  const col = [byId("onduty").h, CARD.h, CARD.h, PEN.w];
  const gap = (B - T - col.reduce((t, v) => t + v, 0)) / 3;
  let yy = T;
  set("onduty", dcx - byId("onduty").w / 2, yy); yy += col[0] + gap;
  set("contact", dcx - CARD.w / 2, yy); yy += CARD.h + gap;
  set("offduty", dcx - CARD.w / 2, yy); yy += CARD.h + gap;
  pos.guestbook = [dcx - PEN.w / 2, yy + PEN.w / 2 - PEN.h / 2];
  tilt.guestbook = 90; // Sergio, Oct 19 2026: "on portrait, rotate pen 180" (was -90); centre unchanged
  // Felt column right of the shirt: passport top level with the ID's, memorandum's bottom on the line.
  const m = byId("map"), n = byId("logbook"), fx = W - PAD - m.w / 2;
  set("map", fx - m.w / 2, T);
  set("logbook", fx - n.w / 2, B - n.h);
  size.uniforms = { w: SHIRT_W, h: PORTRAIT_SHIRT_H };
  // Alignment guides (Sergio, Oct 19 2026, red lines drawn on the phone layout; v2 "move ranks to the left so they fall
  // on the red lines, equally spaced"): six vertical guides at one even pitch, GUIDE_PITCH (his lines average 76.7 mm),
  // devices centred on guides 1, 3, 5 and crests on 2, 4, 6, both rows. The set is centred so the widest device in the
  // left column and the widest crest in the right column keep equal margins to the case edges. The ID, 2M, Liberty and
  // pen column centres on the middle crest guide, the passport and memorandum on the right one. Sizes and vertical
  // positions unchanged.
  const half = (id: string) => (size[id] ?? byId(id)).w * (CRESTS_IN_ORDER.includes(id) ? CREST_SCALE : 1) / 2;
  const dL = Math.max(...R3x2.map((r) => devOf(`${r[0]}-dev`).w / 2)), cR = Math.max(...R3x2.map((r) => half(r[2])));
  const g0 = (W - 5 * GUIDE_PITCH - cR + dL) / 2;
  const guide = (i: number) => g0 + i * GUIDE_PITCH;
  R3x2.forEach((r) => r.forEach((id, i) => {
    const d = devOf(`${id}-dev`);
    pos[`${id}-dev`] = [guide(2 * i) - d.w / 2, pos[`${id}-dev`][1]];
    pos[id] = [guide(2 * i + 1) - size[id].w / 2, pos[id][1]];
  }));
  for (const id of ["onduty", "contact", "offduty", "guestbook"]) pos[id] = [guide(3) - byId(id).w / 2, pos[id][1]];
  for (const id of ["map", "logbook"]) pos[id] = [guide(5) - byId(id).w / 2, pos[id][1]];
  return { pos, size, tilt, w: W, h: sy + PORTRAIT_SHIRT_H };
};
const LOWERED = ["onduty", "contact", "offduty", "logbook", "admin"];
const LOWER_BY = 12;
const CREST_SCALE = 0.8;
/** Sergio (Oct 14): the USO card (contact) and the pink 2M card (admin) trade places in every layout. Same card size, so
 *  swapping their positions keeps every gap. */
const swapCards = (l: Layout): Layout => {
  const { contact, admin } = l.pos;
  if (contact && admin) { l.pos.contact = admin; l.pos.admin = contact; }
  l.tilt.anchor = ANCHOR.tilt; // the collar anchor lies along the lapel in every layout
  // Sergio (Oct 19 2026): "lower all marked by red by about 20px": the ID card, the USO and Liberty cards, the memorandum
  // and the pink 2M card drop 12 case units (about 20 px at the desktop case scale), the same proportion in every layout.
  for (const id of LOWERED) if (l.pos[id]) l.pos[id] = [l.pos[id][0], l.pos[id][1] + LOWER_BY];
  // "Shrink all crests by about 20%": each command crest at 80%, centred where it was.
  for (const id of CRESTS_IN_ORDER) {
    const s = l.size[id] ?? byId(id), p = l.pos[id];
    if (!p) continue;
    const n = { w: s.w * CREST_SCALE, h: s.h * CREST_SCALE };
    l.size[id] = n; l.pos[id] = [p[0] + (s.w - n.w) / 2, p[1] + (s.h - n.h) / 2];
  }
  return l;
};
const LAYOUTS: Record<Mode, Layout> = { wide: swapCards(wideL()), twoL: swapCards(twoL()), twoP: swapCards(portraitSketch()), one: swapCards(portraitSketch()) };
WIDE.w = LAYOUTS.wide.w; WIDE.h = LAYOUTS.wide.h;
/** Breakpoints on the window (Sergio's proposal): laptops (1200 px and wider, or 1000+ px at 1.6 : 1) 3 columns;
 *  phones upright (under 600 px wide) 1 column; other windows wider than tall (wide tablets, sideways phones) 2 columns
 *  landscape; other windows taller than wide (tall tablets) 2 columns portrait. */
const modeFor = (w: number, h: number): Mode =>
  w >= 1200 || (w >= 1000 && w / h >= 1.6) ? "wide" : w < 600 && h > w ? "one" : w > h ? "twoL" : "twoP";
const SCROLLS: Record<Mode, boolean> = { wide: false, twoL: false, twoP: true, one: true };
export const CASE_DIMS = { WIDE, LAYOUTS };
/** Flag perimeter preview (Oct 28 2026): ?flags=alpha|geo|chrono|era puts the 31 patch flags round the case (see
 *  case-flags.ts). Without the parameter Home is unchanged. Target window aspect per mode picks the row/column split. */
const FLAG_ASPECT: Record<Mode, number> = { wide: 1.6, twoL: 1.45, twoP: 0, one: 0 };
const flagCache = new Map<string, { L: Layout; flags: FlagSpot[] }>();
const layoutOf = (m: Mode, flags: FlagOrder | null): { L: Layout; flags: FlagSpot[] } => {
  if (!flags) return { L: LAYOUTS[m], flags: [] };
  const key = `${m}:${flags}`;
  let v = flagCache.get(key);
  if (!v) {
    v = flags === "grid" ? withGrid(LAYOUTS[m]) : flags === "grid-shirt" ? withGrid(evenShirt(m, wholeShirt(LAYOUTS[m]))) : flags === "grid-shirt-plain" ? withGrid(wholeShirt(LAYOUTS[m])) : flags === "grid-shirt-aligned" ? alignedGrid(m) : withFlags(LAYOUTS[m], flags, FLAG_ASPECT[m]);
    flagCache.set(key, v);
  }
  return v;
};
/** Whole-shirt grid preview (Sergio, Oct 28 2026: "Make a version with the whole shirt"): the shirt art
 *  (shirt-khakis-case.svg) is already the whole garment down to its curved hem on its 1455 x 2438 canvas; the case only
 *  crops it (object-fit: cover from the top). Here the crop is lifted: the shirt keeps its place and true scale at its full
 *  height (SHIRT_FULL) and the canvas grows to its hem. Every other item stays where it is. */
const wholeShirt = (l: Layout): Layout => {
  const [, sy] = l.pos.uniforms ?? [0, 0];
  return { ...l, size: { ...l.size, uniforms: { w: SHIRT_W, h: SHIRT_FULL } }, h: Math.max(l.h, sy + SHIRT_FULL) };
};
/** Even felt for the whole-shirt grid (Sergio, Oct 28 2026: "too much empty felt, redistribute empty space evenly").
 *  With the shirt at full length the content runs from the case top to the hem line, so each column of items is spread
 *  over that height with equal gaps above, between and below its items (the hem is the bottom edge). Sizes, order and
 *  columns (x) are unchanged; the shirt, collar, anchor, rack and pins stay put (the chest), and the pen stays by the
 *  pocket. ?flags=grid-shirt-plain keeps the earlier un-spread version for comparison. */
const evenShirt = (m: Mode, l: Layout): Layout => {
  const pos: Pos = { ...l.pos }, sy = (pos.uniforms ?? [0, 0])[1], hem = sy + SHIRT_FULL, chest = sy + EXW_BOTTOM;
  // Visual box of an item (a 90-degree turn swaps its sides about the centre).
  const box = (id: string) => {
    const s = l.size[id] ?? (id.endsWith("-dev") ? devOf(id) : byId(id)), [, y] = pos[id], t = Math.abs(l.tilt[id] ?? 0) % 180 === 90;
    return t ? { y: y + s.h / 2 - s.w / 2, h: s.w } : { y, h: s.h };
  };
  const spread = (units: string[][], y0: number, y1: number) => {
    const us = units.map((u) => u.filter((id) => pos[id])).filter((u) => u.length).map((u) => {
      const b = u.map(box), top = Math.min(...b.map((v) => v.y));
      return { u, top, h: Math.max(...b.map((v) => v.y + v.h)) - top };
    });
    const g = (y1 - y0 - us.reduce((t, v) => t + v.h, 0)) / (us.length + 1);
    let y = y0 + g;
    for (const { u, top, h } of us) { for (const id of u) pos[id] = [pos[id][0], pos[id][1] + y - top]; y += h + g; }
  };
  const crestRow = (r: string[]) => r.flatMap((id) => [id, `${id}-dev`]);
  if (m === "wide") {
    spread([["contact"], ["logbook"]], chest, hem); // pocket column: USO, memorandum
    spread([["onduty"], ["admin"], ["offduty"], ["map"]], 0, hem); // document column: ID, 2M, Liberty, passport
    spread([["bio-sr", "plaque-sr"], ["bio", "plaque"]], 0, hem);
    spread(R2x3.map(crestRow), 0, hem);
  } else if (m === "twoL") {
    spread([["contact"], ["offduty"]], chest, hem); // pocket column: USO, Liberty
    spread([["onduty"], ["map"], ["logbook"], ["admin"]], 0, hem); // ID, passport, memorandum, 2M
    // Portraits stay on top; under them the device grid (3 rows) and the crest grid (2 rows) share the band to the hem.
    const top = Math.max(...["plaque", "plaque-sr"].map((id) => box(id).y + box(id).h));
    spread([0, 1, 2].map((r) => DEVS.slice(r * 2, r * 2 + 2)), top, hem);
    spread(R3x2, top, hem);
  } else {
    // Portrait: portraits and crests stay above the shirt; the shirt's items spread down its full length.
    spread([["onduty"], ["admin"], ["offduty"], ["guestbook"]], sy, hem); // ID, 2M, Liberty, pen (lying across)
    spread([["contact"]], chest, hem); // USO under the pocket
    spread([["map"], ["logbook"]], sy, hem); // felt column: passport, memorandum
  }
  return { ...l, pos };
};
/** Aligned whole-shirt grid (Sergio's sketch, Oct 28 2026, "pretty much right"; "Enlarge both brass portrait plaques").
 *  Landscape (wide; the two-column landscape window uses the same canvas):
 *   - shirt: left axis = the pocket axis (rack and pins as worn, USO card, memorandum); right axis = ID, pink 2M, Liberty,
 *     passport. Top line = the rack group's top = the ID's top; bottom line = memorandum and passport bottoms. The pen
 *     stands upright by the shirt's left edge, level with the USO card's centre. Each column spreads evenly between them.
 *   - portraits stacked, each plaque centred under its portrait at 70% of the frame width (the plaque art scaled up as is);
 *     the bottom plaque ends on the bottom line, the top portrait's top is the crests' top line, just above the rack's.
 *   - crests in their two columns, each with its device on the column axis, rows spread from the top line to the bottom
 *     line (the last devices' bottoms).
 *  Portrait: the same shirt rules on the portrait layout's shirt; plaques enlarged the same way, everything below them
 *  moved down by the extra plaque height. Item sizes are unchanged except the plaques. */
const PLAQUE_SCALE = 0.7;
/** Shirt scale from Sergio's photo in khakis (Oct 28 2026: "See how in this picture the ribbon bar is only slightly
 *  narrower than the pocket? Correct shirt scale"). On the photo (189 x 246 px, pocket about flat-on) the ribbon rack's
 *  outer edges are 107.5 px apart and the pocket flap's 119 px, a rack/pocket ratio of 0.903. The case rack is 3 ribbons
 *  wide (105 mm), so the flap is 105 / 0.903 = 116.2 mm; the art's flap (238-759 px) is 137.9 mm, so the art scales by
 *  116.2 / 137.9. (Supersedes the 37.5 in chest scale, x1.194.) */
// Shirt scale (Sergio, Oct 28 2026: "Use the selfie scale so the pin clears the collar"). In his collar selfie the SW
// pin (2.75 in) sits about 9-12 mm below the collar's lower edge. With the full 7-row rack and the ESWS true size, the
// pin's top clears the art's collar edge (274.341, 323.585)-(587.236, 384.59) px by 102.3 F - 103.1 mm at the pocket
// axis: F = 1.10 gives 9.5 mm (9.3 mm at the closest point of the pin's outline), the least that clears like the photo.
// (F 0.98, the collar edge matched to the pin, still hid the pin's top by about 3 mm; photo 1's 0.843 by about 17 mm.)
const SHIRT_F = 1.1;
/** "Shrink collar to real size": the CPO collar anchor 1 in tall (Uniform Regs 4212), same point and angle. */
const ANCHOR_TRUE_H = 25.4;
/** Scaled shirt (F): the shirt and collar art scale uniformly from the shirt's top-left; the rack, pins and collar
 *  anchor stay true size and follow the anatomy (rack and pins on the scaled pocket axis, rack a quarter inch above the
 *  pocket, EXW above the flap button, anchor on the collar point). Returns the scaled pocket axis x. */
const COLLAR = (() => {
  const pt = [mm(587.236), mm(384.59)], e1 = [mm(274.341) - pt[0], mm(323.585) - pt[1]], e2 = [mm(445.189) - pt[0], mm(166.96) - pt[1]];
  const u = (v: number[]) => { const n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n]; };
  const a = u(e1), b = u(e2), bis = u([a[0] + b[0], a[1] + b[1]]), half = Math.acos(a[0] * b[0] + a[1] * b[1]) / 2;
  return { pt, bis, d: ANCHOR_TRUE_H / Math.sin(half) };
})();
const scaleShirt = (pos: Pos, size: Record<string, Size>, F: number) => {
  const [sx, sy] = pos.uniforms, P = SHIRT.pocket, px = sx + P.cx * F;
  size.uniforms = { w: SHIRT_W * F, h: SHIRT_FULL * F };
  size.lapel = { w: LAPEL.w * F, h: LAPEL.h * F }; pos.lapel = [sx, sy];
  const a = F === 1 ? { w: ANCHOR.w, h: ANCHOR.h } : { w: ANCHOR_TRUE_H * (ANCHOR.w / ANCHOR.h), h: ANCHOR_TRUE_H };
  // Uniform Regs 4212: centred 1 in from the collar's front and lower edges, on the bisector of the collar point. The
  // collar point of shirt-collar.svg is (587.236, 384.59) px, its lower edge runs to (274.341, 323.585) and its front
  // edge to (445.189, 166.96): a 45.8 degree point, so the centre lies 25.4 / sin(22.9 deg) = 65.2 mm up the bisector.
  // Sergio's collar photo (Oct 28 2026) agrees: about 27 mm from the lower edge. Unscaled (F = 1) keeps the old fit.
  const c = F === 1 ? [ANCHOR.cx, ANCHOR.cy] : [COLLAR.pt[0] * F + COLLAR.bis[0] * COLLAR.d, COLLAR.pt[1] * F + COLLAR.bis[1] * COLLAR.d];
  size.anchor = a; pos.anchor = [sx + c[0] - a.w / 2, sy + c[1] - a.h / 2];
  const rackTop = sy + P.top * F - QIN - RACK_H;
  pos.decorations = [px - (3 * RIBBON_W) / 2, rackTop];
  pos.swo = [px - PIN_W / 2, rackTop - QIN - SWO_H];
  pos.exw = [px - EXW_W / 2, sy + P.button * F - (9 * F + 2) - EXW_ART_BOTTOM * EXW_H];
  return px;
};
const alignedShirt = (m: Mode, F = SHIRT_F): Layout => {
  const portrait = m === "twoP" || m === "one";
  const l = wholeShirt(LAYOUTS[portrait ? m : "wide"]);
  const pos: Pos = { ...l.pos }, size: Record<string, Size> = { ...l.size }, tilt = { ...l.tilt };
  const S = (id: string): Size => size[id] ?? (id.endsWith("-dev") ? devOf(id) : byId(id));
  const cx = (id: string) => pos[id][0] + S(id).w / 2;
  const bot = (id: string) => pos[id][1] + S(id).h;
  const put = (id: string, x: number, top: number) => { pos[id] = [x - S(id).w / 2, top]; };
  // Plaques: 70% of their portrait's width, proportional, centred under it.
  const plW = Math.round(PLAQUE_SCALE * S("bio").w * 10) / 10, plH = Math.round(plW * (PLAQUE_H / byId("plaque").w) * 10) / 10;
  const dy = plH - S("plaque").h, plTop = pos.plaque[1];
  for (const [b, pl] of PAIRS) { size[pl] = { w: plW, h: plH }; put(pl, cx(b), pos[pl][1]); }
  if (portrait) for (const id of Object.keys(pos)) if (!PAIRS.flat().includes(id) && pos[id][1] >= plTop) pos[id] = [pos[id][0], pos[id][1] + dy];
  const [sx, sy] = pos.uniforms, SW = SHIRT_W * F, SH = SHIRT_FULL * F;
  const LX = scaleShirt(pos, size, F);
  const awards = ["decorations", "swo", "exw"];
  const T1 = Math.min(...awards.map((id) => pos[id][1])), aBot = Math.max(...awards.map(bot));
  const penX = sx + SHIRT.pocket.flapL * F - 6 - PEN.w; // upright beside the pocket's left edge
  tilt.guestbook = 0;
  if (portrait) {
    // Portrait (Sergio's mockup and "the flags should cover the bottom HALF of the shirt"): every shirt item in the upper
    // half, on two lines. Top line T1 (the rack group's top): memorandum on the shirt's upper right, passport on the felt
    // right of the shirt. Bottom line Bp, one grid gap above the shirt's midpoint, where the flags start: pen upright by
    // the pocket, USO under the awards on the pocket axis, pink 2M and Liberty, ID on the felt. Even gaps across each line.
    const W = Math.max(l.w, SW + G + byId("map").w + 2 * G), shift = (W - l.w) / 2;
    // Portraits and crests keep their sizes and layout, centred on the wider case.
    for (const id of Object.keys(pos)) if (pos[id][1] < sy && id !== "uniforms") pos[id] = [pos[id][0] + shift, pos[id][1]];
    const Bp = sy + SH / 2 - gridCols(W).g, FX = SW + (W - SW) / 2;
    put("map", FX, T1);
    put("onduty", FX, Bp - S("onduty").h);
    const rackR = LX + (3 * RIBBON_W) / 2, mapL = pos.map[0];
    pos.logbook = [rackR + (mapL - rackR - S("logbook").w) / 2, T1];
    put("contact", LX, Bp - CARD.h);
    const cR = pos.contact[0] + CARD.w, idL = pos.onduty[0], cg = (idL - cR - 2 * CARD.w) / 3;
    pos.admin = [cR + cg, Bp - CARD.h];
    pos.offduty = [cR + 2 * cg + CARD.w, Bp - CARD.h];
    pos.guestbook = [penX, Bp - PEN.h];
    const h = Math.max(...Object.keys(pos).map(bot), sy + SH);
    return { ...l, pos, size, tilt, w: W, h };
  }
  // Landscape shirt columns.
  const B = sy + SH - 4 * G;
  put("logbook", LX, B - S("logbook").h);
  const uTop = (aBot + pos.logbook[1] - S("contact").h) / 2;
  put("contact", LX, uTop);
  pos.guestbook = [penX, uTop + S("contact").h / 2 - S("guestbook").h / 2];
  const right = ["onduty", "admin", "offduty", "map"], rh = right.map((id) => S(id).h);
  const rg = (B - T1 - rh.reduce((t, v) => t + v, 0)) / (right.length - 1);
  const rTop: number[] = []; right.reduce((y, _, i) => { rTop.push(y); return y + rh[i] + rg; }, T1);
  // Right axis: as far left as clears the left column (one gutter) wherever their heights overlap.
  const left = [...awards, "contact", "logbook"].map((id) => ({ x: pos[id][0] + S(id).w, y0: pos[id][1], y1: bot(id) }));
  let RX = 0;
  right.forEach((id, i) => left.forEach((b) => { if (rTop[i] < b.y1 && rTop[i] + rh[i] > b.y0) RX = Math.max(RX, b.x + G + S(id).w / 2); }));
  right.forEach((id, i) => put(id, RX, rTop[i]));
  // Portraits and crests keep their sizes; they move with the shirt art's right edge (the sleeve), keeping the unscaled
  // layout's gap to it but at least 2 G clear of the right column, and the case width follows.
  const shirtSet = ["uniforms", "lapel", "anchor", ...awards, "contact", "logbook", "guestbook", ...right];
  const others = Object.keys(pos).filter((id) => !shirtSet.includes(id));
  const oLeft = Math.min(...others.map((id) => pos[id][0])), rRight = Math.max(...right.map((id) => pos[id][0] + S(id).w));
  const dx = Math.max(SW - SHIRT_W, rRight + 2 * G - oLeft);
  for (const id of others) pos[id] = [pos[id][0] + dx, pos[id][1]];
  const w = l.w + dx;
  // Portrait column (Sergio, Oct 28 2026: portraits and crests back up near the case top): top portrait on the top line
  // T0 = 2 G, plaque G under its portrait, 4 G between pairs, the bottom plaque on the bottom line Bc. Bc is the shirt
  // column's bottom line B when the column fits above it, else the column's own bottom (it runs past a short shirt).
  const bh = S("bio").h, colH = 2 * (bh + G + plH), T0 = 2 * G, Bc = Math.max(B, T0 + colH + 4 * G), pg = Bc - T0 - colH;
  let y = T0;
  for (const [b, pl] of PAIRS) { const c = cx(b); put(b, c, y); y += bh + G; put(pl, c, y); y += plH + pg; }
  // Crest rows (crest + its device), first crest top on T0, last device bottom on Bc, equal gaps.
  const rows = R2x3.map((r) => r.flatMap((id) => [id, `${id}-dev`]));
  const box = rows.map((r) => { const t = Math.min(...r.map((id) => pos[id][1])); return { t, h: Math.max(...r.map(bot)) - t }; });
  const g = (Bc - T0 - box.reduce((t, v) => t + v.h, 0)) / (rows.length - 1);
  let ry = T0;
  rows.forEach((r, i) => { for (const id of r) pos[id] = [pos[id][0], pos[id][1] + ry - box[i].t]; ry += box[i].h + g; });
  const h = Math.max(...Object.keys(pos).map(bot), sy + SH);
  return { ...l, pos, size, tilt, w, h };
};
/** Aligned grid: in portrait the flags start one grid gap below the lowest item other than the shirt and no lower than
 *  the shirt's midpoint, drawn over the lower half of the shirt and on past its hem (Sergio, Oct 28 2026). Landscape:
 *  grid below everything. */
const alignedGrid = (m: Mode) => {
  const l = alignedShirt(m);
  if (m !== "twoP" && m !== "one") return withGrid(l);
  const S = (id: string): Size => l.size[id] ?? (id.endsWith("-dev") ? devOf(id) : byId(id));
  const low = Math.max(...Object.keys(l.pos).filter((id) => id !== "uniforms" && id !== "lapel").map((id) => l.pos[id][1] + S(id).h));
  const mid = l.pos.uniforms[1] + (l.size.uniforms?.h ?? SHIRT_FULL) / 2;
  return withGrid(l, Math.min(low, mid - gridCols(l.w).g));
};
const flagParam = (): FlagOrder | null => {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("flags") as FlagOrder | null;
  return v && FLAG_ORDERS.includes(v) ? v : null;
};

/** Ribbon weave on the Home rack (Sergio, Oct 20 2026). The rack SVG shows its weave by itself only when laid out
 *  > 222 px wide (the full-case pop-up). On Home the case is a fixed layout scaled by a transform, so the <img> is laid
 *  out ~105 px wide at every window size, and an <img> SVG cannot see the device-pixel ratio either (tested in
 *  Chromium). So the page measures the rack as drawn and addresses it as #weave when it is >= 150 px wide on a screen
 *  of 2 dppx or more (each ribbon 20+ device px). Phone Home (~75 px) stays off. */
function Rack() {
  const ref = useRef<HTMLImageElement>(null);
  const [sharp, setSharp] = useState(false);
  useEffect(() => {
    const check = () => {
      const w = ref.current?.getBoundingClientRect().width ?? 0;
      setSharp(window.devicePixelRatio >= 2 && w >= 150);
    };
    // The case scale is set after mount, so measure again once it has settled.
    check();
    const raf = requestAnimationFrame(check);
    const t = window.setTimeout(check, 600);
    const mq = window.matchMedia("(min-resolution: 2dppx)");
    mq.addEventListener("change", check);
    window.addEventListener("resize", check);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(t); mq.removeEventListener("change", check); window.removeEventListener("resize", check); };
  }, []);
  return (
    <span className="cx-rack">
      <img ref={ref} className="cx-rack-img" src={caseUrl("ribbon-rack.svg") + (sharp ? "#weave" : "")} alt="" draggable={false} />
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

/** Pop-ups mount inside the fullscreen element while the full case is open: under the Fullscreen API only that element
 *  is drawn, so a modal on document.body stayed invisible and swallowed every tap except the case's own × (Sergio, phone
 *  landscape, Oct 19 2026). */
const layerRoot = (): Element => document.fullscreenElement ?? document.body;

/** Leaves the full case from inside it (the top bar is outside the fullscreen element). */
const exitFull = () => {
  const f = document.querySelector<HTMLElement>(".case-frame[data-cover]");
  if (f) { delete f.dataset.cover; document.dispatchEvent(new Event("fullscreenchange")); }
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
};

export function CaseHome({ onOpen, onGo, label, copy, locale = "en", active = true, caseItem, onCaseItem }: { copy: Chrome["intro"]; locale?: Locale; onOpen?: (k: Kind, id: string) => void; onGo?: (view: string, unit?: string) => void; label: (view: string) => string; active?: boolean; caseItem?: string; onCaseItem?: (id: string | null) => void }) {
  const stage = useRef<HTMLDivElement | null>(null);
  const [intro, setIntro] = useState(false);
  const [hint, setHint] = useState(false);
  // The open item modal lives in the address (?item=case:<id>, routes Oct 21 2026) when the app passes onCaseItem.
  const [ownView, setOwnView] = useState<string | null>(null);
  const controlled = onCaseItem !== undefined;
  const view = controlled ? (caseItem && ORDER.includes(caseItem) ? caseItem : null) : ownView;
  const setView = useCallback((id: string | null) => (controlled ? onCaseItem!(id) : setOwnView(id)), [controlled, onCaseItem]);
  const [mode, setMode] = useState<Mode>("wide");
  const [flags, setFlags] = useState<FlagOrder | null>(null);
  useEffect(() => { setFlags(flagParam()); }, []);
  // First-visit intro: only once Home is actually on screen (a deep link to another page does not get it on top).
  useEffect(() => {
    if (!active) return;
    let seen = true;
    try { seen = localStorage.getItem(INTRO_KEY) === "1"; } catch { /* storage blocked: treat as seen */ }
    if (!seen) { setIntro(true); setHint(true); }
  }, [active]);
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
      // Grid preview: the case keeps its usual size and scale on screen (frame width from the usual layout) and simply
      // grows taller, so the flag grid sits below the fold and the page scrolls.
      const grid = flags === "grid" || !!flags?.startsWith("grid-shirt"), base = LAYOUTS[m];
      const c = layoutOf(m, flags).L, scroll = SCROLLS[m] || grid;
      el.dataset.layout = m;
      if (grid) el.dataset.grid = ""; else delete el.dataset.grid;
      setMode(m);
      (el.closest(".case-frame") as HTMLElement | null)?.style.setProperty("--cx-r", String(grid ? base.w / base.h : c.w / c.h));
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
  }, [flags]);
  const zoomLayer = useRef<HTMLDivElement | null>(null);
  usePinchZoom(stage, zoomLayer);
  const { L, flags: flagSpots } = layoutOf(mode, flags);
  return (
    <>
    <div ref={stage} className={hint ? "cx-stage cx-hint" : "cx-stage"} data-layout="wide" style={{ ["--ratio" as string]: `${WIDE.w} / ${WIDE.h}`, backgroundImage: `url("${caseUrl("felt.svg")}")` }}>
      <div ref={zoomLayer} className="cx-zoom">
      <div className="cx-canvas" data-flags={flags ?? undefined}>
        {flagSpots.map((f) => (
          <span key={f.key} className="cx-item is-static cx-flag" data-flag={f.key} role="img" aria-label={f.name} title={f.name}
            style={{ "--ww": `${PATCH.w}px`, "--wh": `${PATCH.h}px`, "--wx": `${f.x}px`, "--wy": `${f.y}px`, "--wr": "0deg", "--wz": f.z ?? 1 } as CSSProperties}>
            <img className="cx-flag-art" src={caseUrl(`flags/${f.key}.svg`)} alt="" draggable={false} />
          </span>
        ))}
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
      <button type="button" className="cx-exit close-btn close-btn--over" aria-label={copy.exitFull} title={copy.exitFull} onClick={exitFull}><X size={18} strokeWidth={2.25} aria-hidden="true" /></button>
      <button type="button" className="cx-help" aria-label={copy.help} title={copy.help} onClick={() => { setIntro(true); setHint(true); }}>?</button>
    </div>
    {intro ? createPortal(<CaseIntro copy={copy} onClose={closeIntro} />, layerRoot()) : null}
    {view ? <ItemModal id={view} setId={setView} copy={copy} locale={locale} label={label}
      go={(id) => { const t = targetOf(id); exitFull(); if (!controlled) setView(null); if (t.unit) { onGo?.("logbook", t.unit); window.dispatchEvent(new CustomEvent("sb-logbook-command", { detail: t.unit })); } else onGo?.(t.view); }} /> : null}
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
        <button type="button" className="cx-modal-x close-btn" aria-label={c.close} title={c.close} onClick={close}><X size={18} strokeWidth={2.25} aria-hidden="true" /></button>
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
    layerRoot(),
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
        <button type="button" className="cx-intro-x close-btn" aria-label={c.close} title={c.close} onClick={onClose}><X size={18} strokeWidth={2.25} aria-hidden="true" /></button>
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

