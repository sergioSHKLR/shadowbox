import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { awards, publicUrl, ribbonRows, units, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

/**
 * Home shadowbox case (Sergio, Oct 12 2026): single-item art from incoming/used, every item at its true size on one
 * canvas measured in millimetres (1 canvas unit = 1 mm), scaled by one factor --k. Wide/landscape: items thrown about
 * after shadowbox-case-cleaned.svg, shirt flush left. Three layouts (wide, two-column, one-column): see LAYOUTS.
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
  // Two portraits on one axis (Sergio, Oct 13): Seaman Recruit on top, Chief Petty Officer below, each with its plaque.
  { id: "bio-sr", src: "portrait-recruit.webp", ...PORTRAIT, view: "bio", label: "Biography", wide: [0, 0, 0], z: 2 },
  { id: "plaque-sr", src: "plaque-sr.svg", w: mm(264.567), h: mm(89.197), view: "bio", label: "Biography", wide: [0, 0, 0], z: 3 },
  { id: "bio", src: "portrait-chief.webp", ...PORTRAIT, view: "bio", label: "Biography", wide: [0, 0, 0], z: 2 },
  { id: "plaque", src: "plaque-cpo.svg", w: mm(264.567), h: mm(89.197), view: "bio", label: "Biography", wide: [0, 0, 0], z: 3 },
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
// ---- Layouts (Sergio's proposal drawing, Oct 13). Portraits and crests may be resized; every other item keeps its true
// size. Rank devices (12-17) are their own grid, no longer above the crests. Legend numbers refer to the drawing.
//  wide  (3 columns): shirt block | SR over CPO | devices 3 x 2 over crests 2 x 3.
//  twoL  (2 columns, landscape): shirt block | SR beside CPO over [devices 2 x 3 | crests 3 x 2].
//  twoP  (2 columns, portrait): SR beside CPO, crests 3 x 2, devices in a row, shirt with ID and passport beside it.
//  one   (1 column): SR beside CPO, crests 2 x 3, devices in a row, shirt block.
//  menu  (?layout=menu, study only): the ten pages in menu order, left to right.
type Mode = "wide" | "twoL" | "twoP" | "one" | "menu";
type Size = { w: number; h: number };
type Layout = { pos: Pos; size: Record<string, Size>; tilt: Record<string, number>; w: number; h: number };
const PLAQUE_H = mm(89.197);
const PEN = byId("guestbook");
const CRESTS_IN_ORDER = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
const DEVS = CRESTS_IN_ORDER.map((id) => `${id}-dev`);
const devOf = (id: string) => byId(id.replace(/-dev$/, "")).dev!;
const EXW_BOTTOM = ON_SHIRT.exw[1] + EXW_H / 2;
/** Items spread evenly (equal gaps, edges included) along one axis. */
const spreadY = (pos: Pos, ids: string[], cx: number, y0: number, h: number, size: (id: string) => Size = (id) => byId(id)) => {
  const gap = (h - ids.reduce((s, id) => s + size(id).h, 0)) / (ids.length + 1);
  let y = y0 + gap;
  for (const id of ids) { const s = size(id); pos[id] = [cx - s.w / 2, y]; y += s.h + gap; }
};
/** Common shirt block (1-9): shirt at (sx, sy), worn awards, pen (1) left between the placket and the pocket, 2M (4) and
 * Liberty (5) over the pocket below the EXW, and the column ID (7), passport (8), memorandum (9), USO (6) over the
 * shirt's right side. split: ID and passport move off the shirt to a column at splitX (2-column portrait).
 * Returns the right edge of the block's content. */
const DOC_X = 212.5, DOC_W = 95;
const shirtBlock = (pos: Pos, sx: number, sy: number, split?: number) => {
  const H = SHIRT_H;
  pos.uniforms = [sx, sy];
  for (const [id, [rx, ry]] of Object.entries(ON_SHIRT)) { const it = byId(id); pos[id] = [sx + rx - it.w / 2, sy + ry - it.h / 2]; }
  pos.guestbook = [sx + 40, sy + (EXW_BOTTOM + H) / 2 - PEN.h / 2];
  spreadY(pos, ["admin", "offduty"], sx + SHIRT.pocket.cx, sy + EXW_BOTTOM, H - EXW_BOTTOM);
  if (split === undefined) spreadY(pos, ["onduty", "map", "logbook", "contact"], sx + DOC_X + DOC_W / 2, sy, H);
  else {
    spreadY(pos, ["logbook", "contact"], sx + DOC_X + DOC_W / 2, sy + EXW_BOTTOM - 40, H - EXW_BOTTOM + 40);
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
  DEVS.forEach((id, i) => { const d = devOf(id); pos[id] = [x0 + (i % cols) * cw + (cw - d.w) / 2, y0 + Math.floor(i / cols) * ch + (ch - d.h) / 2]; });
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
  const pos: Pos = {}, size: Record<string, Size> = {};
  const W = SHIRT_W + G + byId("map").w + 2 * G, c = 110;
  let y = G;
  y += portraitsSide(pos, size, G, y, W - 2 * G) + G;
  const ch = 2 * c + 3 * G;
  crestGrid(pos, size, R3x2, c, 0, y, W, ch); y += ch;
  devGrid(pos, 6, G, y, W - 2 * G, DEV_H + 2 * G); y += DEV_H + 2 * G;
  shirtBlock(pos, 0, y, SHIRT_W + G);
  return { pos, size, tilt: {}, w: W, h: y + H0 };
};
const oneL = (): Layout => {
  const pos: Pos = {}, size: Record<string, Size> = {};
  const W = SHIRT_W + G, c = 110;
  let y = G;
  y += portraitsSide(pos, size, G, y, W - 2 * G) + G;
  const ch = 3 * c + 4 * G;
  crestGrid(pos, size, R2x3, c, 0, y, W, ch); y += ch;
  devGrid(pos, 6, G, y, W - 2 * G, DEV_H + 2 * G); y += DEV_H + 2 * G;
  shirtBlock(pos, 0, y);
  return { pos, size, tilt: {}, w: W, h: y + H0 };
};
/** Study: the ten pages in menu order left to right (Biography, Logbook, Uniforms, Timeline, Travel Book, On Duty,
 * Off Duty, Admin, Guestbook, Contact), each column centred vertically. Breaks the shirt-left rule by design. */
const menuL = (): Layout => {
  const pos: Pos = {}, size: Record<string, Size> = {};
  let x = G;
  const col = (w: number, place: (x: number) => void) => { place(x); x += w + G; };
  const ph = 180, pw = portraitSize(ph).w;
  col(pw, (x0) => portraitsStacked(pos, size, x0 + pw / 2, (H0 - 2 * (ph + G + PLAQUE_H) - G) / 2, ph));
  col(byId("logbook").w, (x0) => { pos.logbook = [x0, (H0 - byId("logbook").h) / 2]; });
  col(SHIRT_W, (x0) => {
    pos.uniforms = [x0, 0];
    for (const [id, [rx, ry]] of Object.entries(ON_SHIRT)) { const it = byId(id); pos[id] = [x0 + rx - it.w / 2, ry - it.h / 2]; }
  });
  col(31, (x0) => DEVS.forEach((id, i) => { const d = devOf(id); pos[id] = [x0 + (31 - d.w) / 2, G + i * ((H0 - 2 * G) / 6) + ((H0 - 2 * G) / 6 - d.h) / 2]; }));
  col(byId("map").w, (x0) => { pos.map = [x0, (H0 - byId("map").h) / 2]; });
  const c = 70, cw = Math.max(...CRESTS_IN_ORDER.map((id) => crestSize(id, c).w));
  col(cw, (x0) => {
    spreadY(pos, ["onduty", ...CRESTS_IN_ORDER], x0 + cw / 2, 0, H0, (id) => (id === "onduty" ? byId(id) : crestSize(id, c)));
    for (const id of CRESTS_IN_ORDER) size[id] = crestSize(id, c);
  });
  for (const id of ["offduty", "admin"]) col(CARD.w, (x0) => { pos[id] = [x0, (H0 - CARD.h) / 2]; });
  col(PEN.w, (x0) => { pos.guestbook = [x0, (H0 - PEN.h) / 2]; });
  col(CARD.w, (x0) => { pos.contact = [x0, (H0 - CARD.h) / 2]; });
  return { pos, size, tilt: {}, w: x, h: H0 };
};
const LAYOUTS: Record<Mode, Layout> = { wide: wideL(), twoL: twoL(), twoP: twoP(), one: oneL(), menu: menuL() };
WIDE.w = LAYOUTS.wide.w; WIDE.h = LAYOUTS.wide.h;
/** Breakpoints on the window (Sergio's proposal): laptops (1200 px and wider, or 1000+ px at 1.6 : 1) 3 columns;
 *  phones upright (under 600 px wide) 1 column; other windows wider than tall (wide tablets, sideways phones) 2 columns
 *  landscape; other windows taller than wide (tall tablets) 2 columns portrait. */
const FORCE = typeof location !== "undefined" && new URLSearchParams(location.search).get("layout") === "menu";
const modeFor = (w: number, h: number): Mode =>
  FORCE ? "menu" : w >= 1200 || (w >= 1000 && w / h >= 1.6) ? "wide" : w < 600 && h > w ? "one" : w > h ? "twoL" : "twoP";
const SCROLLS: Record<Mode, boolean> = { wide: false, twoL: false, menu: false, twoP: true, one: true };
export const CASE_DIMS = { WIDE, LAYOUTS };

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

/** Leaves the full case from inside it (the top bar is outside the fullscreen element). */
const exitFull = () => {
  const f = document.querySelector<HTMLElement>(".case-frame[data-cover]");
  if (f) { delete f.dataset.cover; document.dispatchEvent(new Event("fullscreenchange")); }
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
};

export function CaseHome({ onOpen, onGo, label }: { onOpen?: (k: Kind, id: string) => void; onGo?: (view: string) => void; label: (view: string) => string }) {
  const stage = useRef<HTMLDivElement | null>(null);
  const [intro, setIntro] = useState(false);
  const [hint, setHint] = useState(false);
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
  const L = LAYOUTS[mode];
  return (
    <>
    <div ref={stage} className={hint ? "cx-stage cx-hint" : "cx-stage"} data-layout="wide" style={{ ["--ratio" as string]: `${WIDE.w} / ${WIDE.h}`, backgroundImage: `url("${publicUrl("/case/felt.svg")}")` }}>
      <div className="cx-canvas">
        {ALL.map((item) => {
          const p = L.pos[item.id] ?? [0, 0];
          const s = L.size[item.id] ?? item;
          const deg = L.tilt[item.id] ?? 0;
          const style = { "--ww": `${s.w}px`, "--wh": `${s.h}px`, "--wx": `${p[0]}px`, "--wy": `${p[1]}px`, "--wr": `${deg}deg`, "--wz": item.z } as CSSProperties;
          const dev = item.dev ? (
            <button type="button" key={`${item.id}-dev`} className="cx-item cx-dev" data-id={`${item.id}-dev`} aria-label={`${item.dev.label}: ${label("timeline") || "Timeline"}`} title={`${item.dev.label}: Timeline`} onClick={() => onGo?.("timeline")}
              style={{ "--ww": `${item.dev.w}px`, "--wh": `${item.dev.h}px`, "--wx": `${(L.pos[`${item.id}-dev`] ?? [0, 0])[0]}px`, "--wy": `${(L.pos[`${item.id}-dev`] ?? [0, 0])[1]}px`, "--wr": "0deg", "--wz": item.z + 1 } as CSSProperties}>
              <img className="cx-art" src={publicUrl(`/case/${item.dev.src}`)} alt="" draggable={false} />
            </button>
          ) : null;
          const art = item.lapel
            ? <img className="cx-art cx-lapel" src={publicUrl(`/case/${item.src}`)} alt="" draggable={false} />
            : item.rack ? <Rack /> : item.obj
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
      <button type="button" className="cx-exit" aria-label="Exit full case" title="Exit full case" onClick={exitFull}>×</button>
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

