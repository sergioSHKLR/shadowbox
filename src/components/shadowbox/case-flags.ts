/**
 * Flag perimeter on the Home case (preview, Sergio, Oct 28 2026: "Standardize non-standard flags to a 2x3 shoulder patch
 * sized. Create an alternate version of the Case at homepage that has flags lining up the perimeter. Chose different
 * sorting variations, alpha, geo, chrono, etc").
 *
 * Every flag is a 3:2 version (public/case/flags/<key>.svg, made in flags-board/build_patch.py: only plain fields,
 * stripes and bands cropped or extended, emblems untouched) drawn at the true size of a 2 x 3 in shoulder patch:
 * 76.2 x 50.8 case units (1 unit = 1 mm). The flags run clockwise from the top-left corner: top row left to right,
 * right column down, bottom row right to left, left column up. Every pair of neighbors has the same gap.
 * Names show only as tooltips; no years.
 */
export type FlagOrder = "alpha" | "geo" | "chrono" | "era" | "grid" | "grid-shirt" | "grid-shirt-plain" | "grid-shirt-aligned";
export const FLAG_ORDERS: FlagOrder[] = ["alpha", "geo", "chrono", "era", "grid", "grid-shirt", "grid-shirt-plain", "grid-shirt-aligned"];
export const PATCH = { w: 76.2, h: 50.8 };

/** Full names, as on the flags board (compose_v2.py LONG / N). */
export const FLAG_NAME: Record<string, string> = {
  canada: "Canada", usa: "United States of America", mexico: "Mexico", brazil: "Brazil", ireland: "Ireland", germany: "Germany",
  kurdistan: "Kurdistan", iraq: "Iraq", kuwait: "Kuwait", qatar: "Qatar", afghanistan: "Afghanistan", "south-korea": "South Korea",
  japan: "Japan", "hong-kong": "Hong Kong", philippines: "Philippines", thailand: "Thailand", cnmi: "Northern Mariana Islands",
  australia: "Australia", "us-wa": "Washington", "us-ca": "California", "us-tx": "Texas", "us-ms": "Mississippi", "us-il": "Illinois",
  "us-fl": "Florida", "us-nc": "North Carolina", "us-va": "Virginia", "us-md": "Maryland", "us-gu": "Guam", "us-hi": "Hawaii",
  "br-mg": "Minas Gerais", "br-rj": "Rio de Janeiro",
};
const KEYS = Object.keys(FLAG_NAME);

/** Chronological by first visit (flags-board/years.json, ties broken by the earliest row of the travel log v10: year,
 *  month, start date, then log sequence). Iraq and Kurdistan share their first row (TL-055): country first.
 *  No log rows: Brazil, Minas Gerais and Rio de Janeiro (family visits 1997-2018, Sergio) after the last 1997 row;
 *  Mexico (no year; "Mexico was during NCTS", Sergio) right after California, the first NCTS row (May 1999). */
const CHRONO = ["usa", "us-fl", "us-il", "us-va", "brazil", "br-mg", "br-rj", "us-ms", "us-ca", "mexico", "us-hi", "us-gu", "japan",
  "cnmi", "hong-kong", "south-korea", "philippines", "thailand", "australia", "us-wa", "canada", "iraq", "kurdistan", "germany",
  "us-tx", "us-md", "kuwait", "qatar", "afghanistan", "us-nc", "ireland"];

/** Around the world, west to east, clockwise from the top-left corner. The United States leads its block and its
 *  states follow west to east by the logged place (Whidbey Island to Little Creek); the block closes the loop with Guam
 *  and Hawaii, so both sit beside the United States (Hawaii next to it across the corner). Canada and Mexico follow the
 *  US block (the block cannot be split), Minas Gerais and Rio de Janeiro follow Brazil, Kurdistan follows Iraq, and
 *  Australia comes before the Northern Mariana Islands so the Marianas sit together beside Guam. */
const GEO = ["usa", "us-wa", "us-ca", "us-tx", "us-ms", "us-il", "us-fl", "us-nc", "us-md", "us-va", "canada", "mexico", "brazil",
  "br-mg", "br-rj", "ireland", "germany", "iraq", "kurdistan", "kuwait", "qatar", "afghanistan", "thailand", "hong-kong",
  "philippines", "south-korea", "japan", "australia", "cnmi", "us-gu", "us-hi"];

/** By command, in service order (the crests' order), each command's flags by first visit: training (RTC / NTC Great
 *  Lakes), NCTS San Diego (Keesler counts as NCTS, as in the Logbook), USS Frank Cable, EODMU 5, SERCC, JCSE, then
 *  Brazil and its states (family visits, no command). */
const ERA = ["usa", "us-fl", "us-il", "us-va", "us-ms", "us-ca", "mexico", "us-hi", "us-gu", "japan", "cnmi", "hong-kong",
  "south-korea", "philippines", "thailand", "australia", "us-wa", "canada", "iraq", "kurdistan", "germany", "us-tx", "us-md",
  "kuwait", "qatar", "afghanistan", "us-nc", "ireland", "brazil", "br-mg", "br-rj"];

/** Grid order (Sergio, Oct 28 2026: "Start with US and states, alpha, then others alpha, country then its states, if
 *  any"): the United States, its states and territories by name, then the other countries by name, each followed by its
 *  states by name. */
const US_KEYS = new Set(["usa", "us-ca", "us-fl", "us-gu", "us-hi", "us-il", "us-md", "us-ms", "us-nc", "us-tx", "us-va", "us-wa"]);
const STATES_OF: Record<string, string[]> = { brazil: ["br-mg", "br-rj"] };
const byName = (a: string, b: string) => FLAG_NAME[a].localeCompare(FLAG_NAME[b], "en");
const SUB = new Set(Object.values(STATES_OF).flat());
const GRID = ["usa", ...[...US_KEYS].filter((k) => k !== "usa").sort(byName),
  ...KEYS.filter((k) => !US_KEYS.has(k) && !SUB.has(k)).sort(byName).flatMap((k) => [k, ...(STATES_OF[k] ?? []).sort(byName)])];

export function flagOrder(o: FlagOrder): string[] {
  if (o === "grid" || o.startsWith("grid-shirt")) return GRID;
  if (o === "alpha") return [...KEYS].sort((a, b) => FLAG_NAME[a].localeCompare(FLAG_NAME[b], "en"));
  return o === "geo" ? GEO : o === "chrono" ? CHRONO : ERA;
}
for (const l of [CHRONO, GEO, ERA, GRID]) if (l.length !== KEYS.length || new Set(l).size !== KEYS.length || l.some((k) => !FLAG_NAME[k])) throw new Error("flag order");

type Pos = Record<string, [number, number]>;
type Size = { w: number; h: number };
type Layout = { pos: Pos; size: Record<string, Size>; tilt: Record<string, number>; w: number; h: number };
export type FlagSpot = { key: string; name: string; x: number; y: number };

/** Margin between the felt edge and the flags, and the least gap between the flags and the case contents. */
const EDGE = 10, INNER = 10, GMIN = 6;

/** Grows the canvas by a band of flags round the given layout; the contents keep their size and are centered inside
 *  (on screen they shrink only by as much as the band needs). a flags on the top and bottom rows (corners included),
 *  c on the left column and c + 1 on the right (31 = 2a + 2c + 1); a is chosen for the largest case on the target
 *  window: aspect A (w / h) for a fitted case, or the narrowest canvas (A = 0) for one that scrolls. */
export function withFlags(l: Layout, order: FlagOrder, A: number): { L: Layout; flags: FlagSpot[] } {
  const { w: fw, h: fh } = PATCH, n = KEYS.length;
  const needW = l.w + 2 * (EDGE + fw + INNER), needH = l.h + 2 * (EDGE + fh + INNER);
  let best: { a: number; c: number; g: number; W: number; H: number; score: number } | null = null;
  for (let a = 3; a <= (n - 1) / 2 - 1; a++) {
    const c = (n - 1) / 2 - a;
    // W = 2E + a fw + (a-1) g ; H = 2E + (c+3) fh + (c+2) g (right column c+1 between the rows, a gap g to each row)
    const gw = (needW - 2 * EDGE - a * fw) / (a - 1), gh = (needH - 2 * EDGE - (c + 3) * fh) / (c + 2);
    const g = Math.max(GMIN, gw, gh);
    const W = 2 * EDGE + a * fw + (a - 1) * g, H = 2 * EDGE + (c + 3) * fh + (c + 2) * g;
    const score = A > 0 ? Math.max(W / A, H) : W * 1e6 + H;
    if (!best || score < best.score) best = { a, c, g, W, H, score };
  }
  const { a, c, g, W, H } = best!;
  const names = flagOrder(order), spots: FlagSpot[] = [];
  let i = 0;
  const put = (x: number, y: number) => { const key = names[i++]; spots.push({ key, name: FLAG_NAME[key], x, y }); };
  const step = fw + g, colStep = fh + g;
  const xR = W - EDGE - fw, yB = H - EDGE - fh;
  for (let j = 0; j < a; j++) put(EDGE + j * step, EDGE);                                   // top, left to right
  for (let j = 0; j < c + 1; j++) put(xR, EDGE + fh + g + j * colStep);                     // right, down
  for (let j = 0; j < a; j++) put(xR - j * step, yB);                                       // bottom, right to left
  const off = (H - 2 * EDGE - 2 * fh - c * fh - (c - 1) * g) / 2;                           // shorter column centered
  for (let j = 0; j < c; j++) put(EDGE, H - EDGE - fh - off - (j + 1) * fh - j * g);        // left, up
  const dx = (W - l.w) / 2, dy = (H - l.h) / 2, pos: Pos = {};
  for (const [id, p] of Object.entries(l.pos)) pos[id] = [p[0] + dx, p[1] + dy];
  return { L: { ...l, pos, w: W, h: H }, flags: spots };
}

/** Grid variant: the case contents stay exactly where they are; the canvas grows downward by a grid of flags below
 *  them, filled row by row, left to right, the last row centered. The column count leaves the fewest empty places in the
 *  last row (ties to more columns); one gap g between flags, between the grid and the case sides,
 *  above the grid and below it. */
const GRID_GAP_MIN = 10, GRID_GAP_MAX = 24;
export function withGrid(l: Layout): { L: Layout; flags: FlagSpot[]; cols: number } {
  const { w: fw, h: fh } = PATCH, names = flagOrder("grid"), n = names.length;
  const maxC = Math.max(1, Math.floor((l.w - GRID_GAP_MIN) / (fw + GRID_GAP_MIN)));
  // 31 is prime, so some row is always short: pick the column count (from 3 up to what fits) whose last row has the
  // fewest empty places, ties to more columns.
  let cols = maxC;
  for (let c = maxC; c >= Math.min(3, maxC); c--) if ((c - (n % c || c)) < (cols - (n % cols || cols))) cols = c;
  const rows = Math.ceil(n / cols);
  const g = Math.min(GRID_GAP_MAX, (l.w - cols * fw) / (cols + 1));
  const x0 = (l.w - cols * fw - (cols - 1) * g) / 2, y0 = l.h + g, spots: FlagSpot[] = [];
  names.forEach((key, i) => {
    const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols);
    const xr = x0 + ((cols - inRow) * (fw + g)) / 2;
    spots.push({ key, name: FLAG_NAME[key], x: xr + c * (fw + g), y: y0 + r * (fh + g) });
  });
  return { L: { ...l, h: y0 + rows * fh + (rows - 1) * g + g }, flags: spots, cols };
}
