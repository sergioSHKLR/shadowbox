import awardsJson from "@/data/awards.json";
import instancesJson from "@/data/award-instances.json";
import unitsJson from "@/data/units.json";
import operationsJson from "@/data/operations.json";
import schoolsJson from "@/data/schools.json";
import necsJson from "@/data/necs.json";
import uniformsJson from "@/data/uniforms.json";
import placesJson from "@/data/places.json";
import photosJson from "@/data/photos.json";
import reflectionsJson from "@/data/reflections.json";
import warfareJson from "@/data/warfare.json";
import insigniaJson from "@/data/insignia.json";
import milestonesJson from "@/data/milestones.json";
import creditsJson from "@/data/credits.json";
import profileJson from "@/data/profile.json";
import branchesJson from "@/data/branches.json";
import caseJson from "@/data/case.json";
import equipmentJson from "@/data/equipment.json";
import usedHereJson from "@/data/used-here.json";
import visitsJson from "@/data/visits.json";
import medalsJson from "@/data/medals.json";
import ranksJson from "@/data/ranks.json";

/** Public files are served from the base URL: the site root in dev and on https://mil.shklr.org. */
export function publicUrl(path: string): string {
  if (!path || /^(https?:|data:)/.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\//, "")}`;
}

/** Rows that actually have stripe/device art on the cut sheet. Missing rows are empty SVGs. */
const RIBBON_ART_ROWS: Record<string, number[]> = {
  jscm: [1, 2],
  ncm: [1],
  arcom: [1, 2],
  jsam: [1],
  nam: [1, 2, 3, 4, 5],
  aam: [1],
  jmua: [1, 2, 3],
  nmuc: [1, 2, 3, 4, 5],
  "navy-e": [1, 2, 3],
  ngcm: [1, 2, 3, 4, 5, 6],
  ndsm: [1],
  acm: [1, 2],
  icm: [1, 2],
  gwotsm: [1],
  hsm: [1],
  ssdr: [1, 2, 3, 4, 5, 6, 7],
  osr: [1, 2, 3, 4, 5, 6],
  nato: [1],
  rifle: [1],
  pistol: [1],
};

/** Pre-drawn ribbon plate: row 1 is bare, row N+1 has N devices. Falls back to the last drawn row. */
export function ribbonPlate(award: Pick<Award, "id" | "devices">): string {
  const n = award.devices.reduce((sum, d) => sum + d.count, 0);
  const wanted = Math.min(7, Math.max(1, n + 1));
  const rows = RIBBON_ART_ROWS[award.id] ?? [1];
  const fit = [...rows].reverse().find((row) => row <= wanted);
  return `/ribbons/instances/${award.id}-${fit ?? rows[0]}.svg`;
}

export type Kind =
  | "award"
  | "unit"
  | "operation"
  | "school"
  | "nec"
  | "uniform"
  | "warfare"
  | "place"
  | "insignia"
  | "milestone"
  | "photo"
  | "equipment"
  | "rank";

export type Device = {
  kind: "oak" | "star" | "letter";
  metal: "bronze" | "gold" | "silver";
  count: number;
  letter?: string;
  /** Letter devices only: the Battle E (3/16 in block letter) and the marksmanship Expert E (1/4 in slab serif) are different devices. */
  style?: "battle" | "expert";
};

export type Award = {
  id: string;
  name: string;
  abbreviation: string;
  branch: string;
  precedence: number;
  ribbon: string;
  framed: boolean;
  count: number;
  countStatus: string;
  devices: Device[];
  deviceExplanation: string;
  explanation: string;
  criteria: string;
  sourceNote: string;
  commonsFile: string;
  operationIds?: string[];
  open?: string;
};

export type Instance = {
  id: string;
  awardId: string;
  year: number | null;
  unitId: string | null;
  operationId: string | null;
  note: string | null;
};

export type Unit = {
  id: string;
  name: string;
  abbreviation: string;
  patch: string;
  branch: string;
  necId: string | null;
  /** Null when no dates have been entered for this command. */
  start: string | null;
  end: string | null;
  precision: string;
  placeId: string | null;
  explanation: string;
  civilian: string;
  open?: string;
  /** Optional crest or patch image, shown on the unit tile. */
  image?: string;
  /** How he was attached to the command. */
  designator?: Designator;
  /** Further images shown under the crest in the unit popup (e.g. a coin). */
  extraImages?: ExtraImage[];
};

export const DESIGNATORS = ["Instruction", "Assigned", "Deployed", "Assisting", "Parent", "TAD"] as const;
export type Designator = (typeof DESIGNATORS)[number];

export type ExtraImage = { src: string; alt: string; caption: string };

export type Operation = {
  id: string;
  name: string;
  phase: string;
  start: string;
  end: string | null;
  precision: string;
  theater: string;
  unitId: string | null;
  placeId: string | null;
  /** Bases (place ids with type "base") this deployment used. One-line edit per deployment. */
  baseIds?: string[];
  explanation: string;
  open?: string;
};

export type School = {
  id: string;
  name: string;
  abbreviation: string;
  start: string;
  length: string | null;
  placeId: string | null;
  placeConfidence: string;
  explanation: string;
  open?: string;
};

export type Nec = {
  id: string;
  code: string;
  name: string;
  years: string | null;
  role: string;
  explanation: string;
  criteria: string;
};

export type UniformGroup = "pt" | "organizational" | "work" | "dress" | "battle";

export const UNIFORM_GROUPS: { id: UniformGroup; label: string }[] = [
  { id: "pt", label: "PT" },
  { id: "organizational", label: "Organizational" },
  { id: "work", label: "Work" },
  { id: "dress", label: "Dress" },
  { id: "battle", label: "Battle" },
];

export type Uniform = {
  id: string;
  order: number;
  group: UniformGroup;
  name: string;
  branch: string;
  context: string;
  note: string;
  image: string;
};

export type EquipmentGroup = "armor" | "helmets" | "weapons" | "comms" | "vehicles" | "ships";

export const EQUIPMENT_GROUPS: { id: EquipmentGroup; label: string }[] = [
  { id: "armor", label: "Body Armor" },
  { id: "helmets", label: "Helmets" },
  { id: "weapons", label: "Weapons" },
  { id: "comms", label: "Comms & Crypto" },
  { id: "vehicles", label: "Vehicles" },
  { id: "ships", label: "Ships & Boats" },
];

export type Equipment = {
  id: string;
  group: EquipmentGroup;
  order: number;
  name: string;
  caption?: string;
  note: string;
  image: string;
  /** true when the subject is cut out onto white; false for a photo crop */
  cutout: boolean;
  unitId?: string;
  credit: { sourceUrl: string; file: string; creator: string; license: string };
};

export type Place = {
  id: string;
  name: string;
  locality: string;
  lat: number | null;
  lng: number | null;
  accuracy: "public-site" | "approximate" | "placeholder";
  note: string;
  /** "base" marks a deployment base (FOB, air base); "visit" a port visit, exercise, school or other stop. Both get their own pin colour. */
  type?: "base" | "visit";
};

/** A port visit, exercise, school, TAD or secondary duty location, pinned on the map in chronological order. */
export type Visit = {
  id: string;
  placeId: string;
  kind: "port-visit" | "exercise" | "school" | "tad" | "visit" | "duty-location" | "transit";
  title: string;
  /** Display date; approximate periods say so in words. */
  when: string;
  /** Ordering year, and prio within it: below 0 comes before a command that starts that year, above 0 during it. */
  sort: string;
  prio: number;
  approximate: boolean;
  unitId?: string;
  schoolIds?: string[];
  note?: string;
  /** A stop used on several trips keeps one pin; its popup lists every trip. */
  trips?: string[];
};
export const visits = visitsJson as Visit[];

export type Photo = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  kind: Kind;
  subjectId: string;
};

export type Reflection = {
  id: string;
  kind: Kind;
  subjectId: string;
  text: string;
};

export type LinkRef = { kind: Kind; id: string };

export type Warfare = {
  id: string;
  name: string;
  abbreviation: string;
  glyph?: string;
  image?: string;
  explanation: string;
  criteria: string;
  placeIds?: string[];
  related?: LinkRef[];
};

export type Insignia = {
  id: string;
  name: string;
  short: string;
  glyph?: string;
  image?: string;
  explanation: string;
  criteria: string;
  related?: LinkRef[];
};

export type Milestone = {
  id: string;
  date: string;
  precision: string;
  title: string;
  short: string;
  explanation: string;
  placeIds?: string[];
  related?: LinkRef[];
};

export type Credit = {
  id: string;
  title: string;
  file: string | null;
  sourceUrl: string | null;
  creator: string;
  license: string;
  notes: string;
};

/** Opened from the full-size medals view: the award popup shows the medal (with a Front/Back toggle) instead of the ribbon. */
export type Selection = { kind: Kind; id: string; medal?: boolean };

/** A full-size medal. Sizes are in inches (medallion only); the suspension ribbon is always 1 3/8 in wide and each row is
 *  3 1/4 in from the top of the ribbon to the bottom of the medal (NAVPERS 15665J art. 5314.1). */
export type Medal = {
  id: string;
  front: string;
  back: string | null;
  w: number;
  h: number;
  drape: "flat" | "v";
  clasp?: string;
};

export const profile = profileJson;
export const awards = awardsJson as Award[];
export const instances = instancesJson as Instance[];
export const units = unitsJson as Unit[];
export const operations = operationsJson as Operation[];
export const schools = schoolsJson as School[];
export const necs = necsJson as Nec[];
export const uniforms = uniformsJson as Uniform[];
export const places = placesJson as Place[];
export const bases = places.filter((place) => place.type === "base");
export const photos = photosJson as Photo[];
export const reflections = reflectionsJson as Reflection[];
export const warfare = warfareJson as Warfare[];
export const insignia = insigniaJson as Insignia[];
export const milestones = milestonesJson as Milestone[];
export const credits = creditsJson as Credit[];
export const equipment = equipmentJson as Equipment[];
export const branches = branchesJson as Record<string, string>;
export const caseCopy = caseJson;
export const medals = medalsJson as Medal[];
export const medalFor = (awardId: string) => medals.find((medal) => medal.id === awardId);

/** Rows of large medals per NAVPERS 15665J Table 5-3-1 (1-5 one row; 6 = 3+3 ... 13 = 3+5+5; top row first). */
const MEDAL_ROWS: Record<number, number[]> = {
  1: [1], 2: [2], 3: [3], 4: [4], 5: [5], 6: [3, 3], 7: [3, 4], 8: [4, 4], 9: [4, 5], 10: [5, 5],
  11: [3, 4, 4], 12: [4, 4, 4], 13: [3, 5, 5], 14: [4, 5, 5], 15: [5, 5, 5], 16: [4, 4, 4, 4], 17: [3, 4, 5, 5],
  18: [3, 5, 5, 5], 19: [4, 5, 5, 5], 20: [5, 5, 5, 5],
};
export function medalRows(list: Award[]): Award[][] {
  const sorted = [...list].sort((a, b) => a.precedence - b.precedence);
  const nRows = Math.ceil(sorted.length / 5);
  const plan = MEDAL_ROWS[sorted.length] ?? Array.from({ length: nRows }, (_, i) => (i === 0 ? sorted.length - 5 * (nRows - 1) : 5));
  const rows: Award[][] = [];
  let i = 0;
  for (const n of plan) { rows.push(sorted.slice(i, i + n)); i += n; }
  return rows;
}

export function branchName(code: string): string {
  return branches[code] ?? code;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatWhen(value: string): string {
  const [y, m, d] = value.split("-");
  if (!m) return y;
  const month = MONTHS[Number(m) - 1] ?? m;
  if (!d) return `${month} ${y}`;
  return `${Number(d)} ${month} ${y}`;
}

export function formatSpan(start: string | null, end: string | null): string {
  if (!start) return "Dates not entered";
  const a = formatWhen(start);
  if (!end || end === start) return a;
  const b = formatWhen(end);
  if (a === b) return a;
  if (start.length === 4 && end.length === 4) return `${start}–${end}`;
  return `${a} – ${b}`;
}

export function ribbonRows(list: Award[], columns = profile.rackColumns || 3): Award[][] {
  const sorted = [...list].sort((a, b) => a.precedence - b.precedence);
  const rem = sorted.length % columns;
  const rows: Award[][] = [];
  let i = 0;
  if (rem) {
    rows.push(sorted.slice(0, rem));
    i = rem;
  }
  for (; i < sorted.length; i += columns) rows.push(sorted.slice(i, i + columns));
  return rows;
}

export function countPhrase(award: Award): string {
  if (award.count === 1) return "One award";
  return `${award.count} awards`;
}

export function deviceSummary(award: Award): string {
  if (!award.devices.length) return "no device";
  return award.devices
    .map((d) => {
      const what = d.kind === "letter" ? `letter ${d.letter}` : d.kind === "oak" ? "oak leaf" : "star";
      const plural = d.count === 1 ? what : `${what}s`;
      return `${d.count} ${d.metal} ${plural}`;
    })
    .join(", ");
}

function byId<T extends { id: string }>(list: T[], id: string | null | undefined): T | undefined {
  if (!id) return undefined;
  return list.find((item) => item.id === id);
}

export const unitById = (id: string | null) => byId(units, id);
export const placeById = (id: string | null) => byId(places, id);
export const necById = (id: string | null) => byId(necs, id);
export const awardById = (id: string) => byId(awards, id);

const serviceYear = (value: string) => Number(value.slice(0, 4));
const SCALE_START = Date.UTC(serviceYear(profile.serviceStart), 0, 1);
const SCALE_END = Date.UTC(serviceYear(profile.serviceEnd), 11, 31);

export function pct(ms: number): number {
  return ((ms - SCALE_START) / (SCALE_END - SCALE_START)) * 100;
}

function bound(value: string, edge: "start" | "end"): number {
  const [ys, ms, ds] = value.split("-");
  const y = Number(ys);
  const m = ms ? Number(ms) : edge === "end" ? 12 : 1;
  const day = ds ? Number(ds) : edge === "end" ? 28 : 1;
  return Date.UTC(y, m - 1, day);
}

/** Pay grades and promotion dates. The one place to edit them: src/data/ranks.json. */
export type Rank = {
  id: string;
  grade: string;
  abbreviation: string;
  name: string;
  /** YYYY, YYYY-MM or YYYY-MM-DD; null shows "date needed". */
  date: string | null;
  image: string;
  explanation: string;
  note?: string;
};
export const ranks = ranksJson as Rank[];
/** Grades shown as worn badges in the case (the chief is shown by the anchor and rating badge already there). */
export const caseRanks = ranks.filter((r) => r.id !== "etc");

export type Bar = {
  key: string;
  kind: Kind;
  id: string;
  title: string;
  detail: string;
  start: number;
  end: number;
  group: "duty" | "ops" | "study" | "rank";
  lane: number;
  point: boolean;
  /** Length of this bar. Null when the record has no duration. */
  days: number | null;
  left: number;
  width: number;
};

/** Shared transfer time is split so two bars never cover the same stretch. */
function meet<T extends { start: number; end: number }>(items: T[]): T[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i];
    const right = sorted[i + 1];
    if (left.end <= right.start) continue;
    const overlapStart = Math.max(left.start, right.start);
    const overlapEnd = Math.min(left.end, right.end);
    const mid = overlapStart + Math.floor((overlapEnd - overlapStart) / 2);
    left.end = mid;
    right.start = mid;
  }
  return sorted;
}

function courseDays(length: string | null): number | null {
  if (!length) return null;
  const weeks = /^(\d+)\s+weeks?$/i.exec(length);
  if (weeks) return Number(weeks[1]) * 7;
  const days = /^(\d+)\s+days?$/i.exec(length);
  if (days) return Number(days[1]);
  return null;
}

function finish(bars: Bar[]): Bar[] {
  return bars.map((bar) => {
    if (bar.days != null || bar.point) return bar;
    return { ...bar, days: Math.max(0, Math.round((bar.end - bar.start) / 86_400_000)) };
  });
}
function pack(items: Omit<Bar, "lane" | "left" | "width">[]): Bar[] {
  const sorted = meet(items);
  const placed = sorted.map((item, index) => {
    const left = pct(item.start);
    const span = Math.max(pct(item.end) - left, 0);
    const width = item.point ? 7.2 : span;
    return { ...item, lane: index % 2, left: Math.min(left, 98), width };
  });
  for (let i = 0; i < placed.length; i++) {
    const next = placed[i + 1];
    if (!next) continue;
    const room = next.left - placed[i].left - 0.2;
    if (placed[i].width > room) placed[i].width = Math.max(room, 0.35);
  }
  return placed;
}

/** One assignment at a time. A tour that sits wholly inside a longer command (Troy inside EODMU 5, CJSOTF-A inside JCSE) stays on the Deployments track. Year-only dates include the shared transfer year on both bars; that overlap is split in half so the bars meet. */
function assignmentBars(): Omit<Bar, "lane" | "left" | "width">[] {
  const dated = units.filter((unit): unit is Unit & { start: string } => Boolean(unit.start));
  const spanOf = (unit: Unit & { start: string }) => ({
    start: bound(unit.start, "start"),
    end: bound(unit.end ?? unit.start, "end"),
  });
  const nested = new Set(
    dated
      .filter((unit) => {
        const span = spanOf(unit);
        return dated.some((other) => {
          if (other.id === unit.id) return false;
          const parent = spanOf(other);
          return span.start >= parent.start && span.end <= parent.end && parent.end - parent.start > span.end - span.start;
        });
      })
      .map((unit) => unit.id),
  );
  const bars = dated
    .filter((unit) => !nested.has(unit.id))
    .map((unit) => ({
      key: unit.id,
      kind: "unit" as const,
      id: unit.id,
      title: unit.abbreviation,
      detail: unit.name,
      ...spanOf(unit),
      group: "duty" as const,
      point: false,
      days: null,
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  for (let i = 0; i < bars.length - 1; i++) {
    const left = bars[i];
    const right = bars[i + 1];
    if (left.end <= right.start) continue;
    const overlapStart = Math.max(left.start, right.start);
    const overlapEnd = Math.min(left.end, right.end);
    const mid = overlapStart + Math.floor((overlapEnd - overlapStart) / 2);
    left.end = mid;
    right.start = mid;
  }
  return bars;
}

function opChipTitle(op: Operation): string {
  const placeId = op.placeId || op.baseIds?.[0];
  const place = placeId ? places.find((entry) => entry.id === placeId) : undefined;
  if (!place) return op.theater;
  if (place.id === "jb-balad") return "JB Balad";
  return place.name;
}

export function timeline(): { duty: Bar[]; ops: Bar[]; study: Bar[]; rank: Bar[]; years: number[] } {
  const duty = finish(pack(assignmentBars()));
  const ops = finish(pack(
    operations.map((op) => ({
      key: op.id,
      kind: "operation" as const,
      id: op.id,
      title: opChipTitle(op),
      detail: op.phase,
      start: bound(op.start, "start"),
      end: bound(op.end ?? op.start, "end"),
      group: "ops" as const,
      point: false,
      days: null,
    })),
  ));
  const study = finish(pack(
    schools.map((school) => ({
      key: school.id,
      kind: "school" as const,
      id: school.id,
      title: school.abbreviation,
      detail: school.name,
      start: bound(school.start, "start"),
      end: bound(school.start, "start"),
      group: "study" as const,
      point: true,
      days: courseDays(school.length),
    })),
  ));
  const dated = ranks.filter((r): r is Rank & { date: string } => !!r.date);
  const rank = finish(pack(
    dated.map((r, i) => ({
      key: `rank-${r.id}`,
      kind: "rank" as const,
      id: r.id,
      title: r.abbreviation,
      detail: `${r.name} (${r.grade})`,
      start: bound(r.date, "start"),
      end: dated[i + 1] ? bound(dated[i + 1].date, "start") : bound(profile.serviceEnd, "end"),
      group: "rank" as const,
      point: false,
      days: null,
    })),
  ));
  const first = serviceYear(profile.serviceStart);
  const last = serviceYear(profile.serviceEnd);
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  return { duty, ops, study, rank, years };
}

/** Undated commands keep their place in the list by borrowing the sort key of the dated command before them. */
function unitSortKeys(): { unit: Unit; sort: string }[] {
  let last = "";
  return units.map((unit) => {
    if (unit.start) last = unit.start;
    return { unit, sort: unit.start ?? last };
  });
}

/** n: the stop's number on the map pins and in the lists (chronological, 1-based). */
export type Stop = { place: Place; labels: string[]; when: string; n?: number };

export function careerStops(): Stop[] {
  const events = [
    ...unitSortKeys().filter(({ unit: u }) => u.placeId).map(({ unit: u, sort }) => ({ sort, prio: 0, tie: "", placeId: u.placeId as string, label: `${formatSpan(u.start, u.end)} · ${u.abbreviation}` })),
    // An operation that belongs to a tour begun in an earlier year sorts just ahead of a unit starting in its year
    // (Iraq Sovereignty, 2009, closes the 2008 IA tour before JCSE starts in 2009).
    // Every base a deployment used gets its own numbered stop (CJTF Troy: FOB Sykes, then FOB Tal Afar).
    ...operations
      .filter((o) => o.baseIds?.length || o.placeId)
      .flatMap((o) => (o.baseIds?.length ? o.baseIds : [o.placeId as string]).map((placeId) => ({ sort: o.start, prio: unitById(o.unitId ?? "")?.start?.slice(0, 4) === o.start.slice(0, 4) ? 0 : -0.5, tie: "", placeId, label: `${formatSpan(o.start, o.end)} · ${o.phase}` }))),
    // Port visits, exercises, schools and other stops, in the order given in visits.json within the same year and prio.
    ...visits.map((visit, index) => ({ sort: visit.sort, prio: visit.prio, tie: String(index).padStart(3, "0"), placeId: visit.placeId, label: `${visit.when} · ${visit.title}` })),
  ].sort((a, b) => a.sort.localeCompare(b.sort) || a.prio - b.prio || a.tie.localeCompare(b.tie) || a.label.localeCompare(b.label));

  const stops: Stop[] = [];
  for (const event of events) {
    const place = placeById(event.placeId);
    if (!place) continue;
    const last = stops[stops.length - 1];
    if (last && last.place.id === place.id) {
      last.labels.push(event.label);
      continue;
    }
    stops.push({ place, labels: [event.label], when: event.sort, n: stops.length + 1 });
  }
  return stops;
}

let pinNumbers: Map<string, number[]> | undefined;
/** The map-pin number(s) of a place, matching the Map tab's pins and list. Empty if the place is not a stop. */
export function pinNumbersFor(placeId: string): number[] {
  if (!pinNumbers) {
    pinNumbers = new Map();
    for (const stop of careerStops()) pinNumbers.set(stop.place.id, [...(pinNumbers.get(stop.place.id) ?? []), stop.n!]);
  }
  return pinNumbers.get(placeId) ?? [];
}

export type SubjectView = {
  kind: Kind;
  id: string;
  kicker: string;
  title: string;
  explanation: string;
  criteria?: string;
  facts: { label: string; value: string }[];
  instances?: { title: string; detail: string }[];
  placeIds: string[];
  related: { kind: Kind; id: string; label: string }[];
  /** The graphic that was clicked, shown large at the top of the panel. */
  hero?: Hero;
  /** Further captioned images shown under the hero. */
  extraImages?: ExtraImage[];
  /** Uniforms, weapons, vehicles and ships used at this unit, school or deployment. */
  usedHere?: UsedItem[];
};

export type UsedItem = { kind: "uniform" | "equipment"; id: string; name: string; image: string; group: string };

/**
 * What was used where. One line per unit, school or deployment id, listing
 * uniform and equipment ids (see the cheat sheet codes). Edit src/data/used-here.json.
 */
export const usedHere = usedHereJson as Record<string, string[]>;

const USED_ORDER = ["uniform", "armor", "helmets", "weapons", "comms", "vehicles", "ships"];

export function usedHereFor(subjectId: string): UsedItem[] {
  const items: UsedItem[] = [];
  for (const id of usedHere[subjectId] ?? []) {
    const uniform = uniforms.find((entry) => entry.id === id);
    if (uniform) {
      items.push({ kind: "uniform", id, name: uniform.name, image: uniform.image, group: "uniform" });
      continue;
    }
    const item = equipment.find((entry) => entry.id === id);
    if (item) items.push({ kind: "equipment", id, name: item.name, image: item.image, group: item.group });
  }
  return items.sort((a, b) => USED_ORDER.indexOf(a.group) - USED_ORDER.indexOf(b.group));
}

/** Units, schools and deployments whose "Used here" list includes this item. */
function usedAt(itemId: string) {
  return Object.entries(usedHere)
    .filter(([, ids]) => ids.includes(itemId))
    .map(([subjectId]) => {
      const unit = unitById(subjectId);
      if (unit) return rel("unit", unit.id, unit.name);
      const op = operations.find((entry) => entry.id === subjectId);
      if (op) return rel("operation", op.id, `${op.name} — ${op.phase}`);
      const school = schools.find((entry) => entry.id === subjectId);
      return school ? rel("school", school.id, school.name) : null;
    })
    .filter((link): link is ReturnType<typeof rel> => Boolean(link));
}

export type Hero =
  | { type: "ribbon"; award: Award }
  | { type: "image"; src: string; alt: string; shape: "tall" | "square" | "wide" | "photo" | "landscape" };

function rel(kind: Kind, id: string, label: string) {
  return { kind, id, label };
}

function linkLabel(link: LinkRef): string | null {
  if (link.kind === "unit") return unitById(link.id)?.name ?? null;
  if (link.kind === "operation") {
    const op = byId(operations, link.id);
    return op ? op.phase : null;
  }
  if (link.kind === "insignia") return byId(insignia, link.id)?.name ?? null;
  if (link.kind === "rank") return byId(ranks, link.id)?.name ?? null;
  if (link.kind === "uniform") return byId(uniforms, link.id)?.name ?? null;
  if (link.kind === "milestone") return byId(milestones, link.id)?.title ?? null;
  if (link.kind === "warfare") return byId(warfare, link.id)?.name ?? null;
  if (link.kind === "place") return placeById(link.id)?.name ?? null;
  if (link.kind === "school") return byId(schools, link.id)?.name ?? null;
  if (link.kind === "nec") return necById(link.id)?.name ?? null;
  if (link.kind === "award") return awardById(link.id)?.name ?? null;
  return null;
}

function resolveLinks(links: LinkRef[] | undefined) {
  return (links ?? []).flatMap((link) => {
    const label = linkLabel(link);
    return label ? [rel(link.kind, link.id, label)] : [];
  });
}

export function openRecord(): string[] {
  const lines: string[] = [];
  for (const award of awards) {
    const missing = instances.filter((item) => item.awardId === award.id && item.year == null).length;
    if (missing) lines.push(`${missing} of ${award.count} ${award.abbreviation} have no year.`);
  }
  for (const item of [...awards, ...units, ...schools, ...operations]) {
    if ("open" in item && item.open) lines.push(item.open);
  }
  if (!reflections.length) lines.push("No personal note has been written yet.");
  if (!photos.length) lines.push("No photograph is in the case.");
  else if (photos.length === 1) lines.push("One photograph is in the case.");
  return lines;
}

export function toSubject(sel: Selection): SubjectView | null {
  if (sel.kind === "photo") {
    const photo = byId(photos, sel.id);
    if (!photo) return null;
    const subject = linkLabel({ kind: photo.kind, id: photo.subjectId });
    return {
      kind: "photo",
      id: photo.id,
      kicker: "Photograph",
      title: photo.caption,
      explanation: photo.alt,
      facts: [],
      placeIds: [],
      related: subject ? [rel(photo.kind, photo.subjectId, subject)] : [],
      hero: { type: "image", src: photo.src, alt: photo.alt, shape: "photo" },
    };
  }

  if (sel.kind === "award") {
    const award = awardById(sel.id);
    if (!award) return null;
    const rows = instances.filter((item) => item.awardId === award.id);
    const related = new Map<string, SubjectView["related"][number]>();
    for (const row of rows) {
      const unit = unitById(row.unitId);
      const op = byId(operations, row.operationId);
      if (unit) related.set(unit.id, rel("unit", unit.id, unit.name));
      if (op) related.set(op.id, rel("operation", op.id, `${op.name} — ${op.phase}`));
    }
    for (const id of award.operationIds ?? []) {
      const op = byId(operations, id);
      if (op) related.set(op.id, rel("operation", op.id, op.phase));
    }
    return {
      kind: "award",
      id: award.id,
      kicker: `${award.branch === "foreign" ? "Foreign award" : "Decoration"} · ${award.abbreviation}`,
      title: award.name,
      explanation: award.explanation,
      criteria: award.criteria,
      facts: [
        { label: "On this rack", value: countPhrase(award) },
        { label: "Devices", value: award.deviceExplanation },
        { label: "Record", value: award.sourceNote },
      ],
      instances: rows.map((row, index) => ({
        title: row.year ? String(row.year) : `Award ${index + 1}`,
        detail: [
          row.year ? null : "Year not entered",
          unitById(row.unitId)?.abbreviation,
          byId(operations, row.operationId)?.phase,
          row.note,
        ].filter(Boolean).join(" · "),
      })),
      placeIds: [...related.values()]
        .map((item) => (item.kind === "operation" ? byId(operations, item.id)?.placeId : unitById(item.id)?.placeId))
        .filter((id): id is string => Boolean(id)),
      related: [...related.values()],
      hero: { type: "ribbon", award },
    };
  }

  if (sel.kind === "unit") {
    const unit = unitById(sel.id);
    if (!unit) return null;
    const nec = necById(unit.necId);
    const ops = operations.filter((op) => op.unitId === unit.id);
    // The unit's own pin plus every base its deployments used (e.g. CJTF Troy: FOB Sykes and FOB Tal Afar).
    const unitPlaceIds = [...new Set([unit.placeId, ...ops.flatMap((op) => op.baseIds ?? []), ...visits.filter((visit) => visit.unitId === unit.id).map((visit) => visit.placeId)].filter((id): id is string => Boolean(id && placeById(id))))];
    const related = [
      ...(nec ? [rel("nec", nec.id, `${nec.code} ${nec.name}`)] : []),
      ...ops.map((op) => rel("operation", op.id, op.phase)),
      ...unitPlaceIds.map((id) => rel("place", id, placeById(id)!.name)),
    ];
    return {
      kind: "unit",
      id: unit.id,
      kicker: branchName(unit.branch),
      title: unit.name,
      explanation: `${unit.explanation} ${unit.civilian}`,
      facts: [
        ...(unit.designator ? [{ label: "Designator", value: unit.designator }] : []),
        { label: "When", value: formatSpan(unit.start, unit.end) },
        ...(unit.start ? [{ label: "Precision", value: unit.precision === "year" ? "Years only — months were not recorded" : "Month recorded" }] : []),
        ...(nec ? [{ label: "NEC on this tour", value: `${nec.code} · ${nec.name}` }] : []),
      ],
      placeIds: unitPlaceIds,
      related,
      hero: unit.image ? { type: "image", src: unit.image, alt: `Crest, ${unit.name}`, shape: "square" } : undefined,
      extraImages: unit.extraImages,
      usedHere: usedHereFor(unit.id),
    };
  }

  if (sel.kind === "operation") {
    const op = byId(operations, sel.id);
    if (!op) return null;
    const unit = unitById(op.unitId);
    const opBases = (op.baseIds ?? []).map((id) => placeById(id)).filter((place): place is Place => Boolean(place));
    return {
      kind: "operation",
      id: op.id,
      kicker: op.theater,
      title: op.name,
      explanation: op.explanation,
      facts: [
        { label: "Phase", value: op.phase },
        { label: "When", value: formatSpan(op.start, op.end) },
      ],
      placeIds: opBases.length ? opBases.map((place) => place.id) : op.placeId ? [op.placeId] : [],
      related: [
        ...(unit ? [rel("unit", unit.id, unit.name)] : []),
        ...(op.placeId ? [rel("place", op.placeId, placeById(op.placeId)?.name ?? "Place")] : []),
        ...opBases.map((place) => rel("place", place.id, place.name)),
      ],
      usedHere: usedHereFor(op.id),
    };
  }

  if (sel.kind === "school") {
    const school = byId(schools, sel.id);
    if (!school) return null;
    return {
      kind: "school",
      id: school.id,
      kicker: "School",
      title: school.name,
      explanation: school.explanation,
      facts: [
        { label: "When", value: formatWhen(school.start) },
        ...(school.length ? [{ label: "Length", value: school.length }] : []),
        { label: "Place", value: school.placeId ? (school.placeConfidence === "inferred" ? "Inferred — confirm" : "Recorded") : "Not entered" },
      ],
      placeIds: school.placeId ? [school.placeId] : [],
      related: school.placeId ? [rel("place", school.placeId, placeById(school.placeId)?.name ?? "Place")] : [],
      usedHere: usedHereFor(school.id),
    };
  }

  if (sel.kind === "nec") {
    const nec = necById(sel.id);
    if (!nec) return null;
    const holders = units.filter((unit) => unit.necId === nec.id);
    return {
      kind: "nec",
      id: nec.id,
      kicker: `NEC ${nec.code}`,
      title: nec.name,
      explanation: nec.explanation,
      criteria: nec.criteria,
      facts: [
        { label: "Time in the NEC", value: nec.years ?? "Not stated as a duration" },
        { label: "In these notes", value: nec.role === "favorite" ? "Called the favorite" : nec.role === "primary" ? "Called the primary" : nec.role === "listed-first" ? "Listed first" : "Held" },
      ],
      placeIds: holders.map((unit) => unit.placeId).filter((id): id is string => Boolean(id)),
      related: holders.map((unit) => rel("unit", unit.id, unit.abbreviation)),
    };
  }

  if (sel.kind === "uniform") {
    const uniform = byId(uniforms, sel.id);
    if (!uniform) return null;
    return {
      kind: "uniform",
      id: uniform.id,
      kicker: branchName(uniform.branch),
      title: uniform.name,
      explanation: uniform.note,
      facts: [
        { label: "Context", value: uniform.context },
      ],
      placeIds: [],
      related: usedAt(uniform.id),
      hero: { type: "image", src: uniform.image, alt: uniform.name, shape: "tall" },
    };
  }

  if (sel.kind === "equipment") {
    const item = byId(equipment, sel.id);
    if (!item) return null;
    const group = EQUIPMENT_GROUPS.find((entry) => entry.id === item.group);
    const unit = item.unitId ? unitById(item.unitId) : undefined;
    return {
      kind: "equipment",
      id: item.id,
      kicker: group?.label ?? "Equipment",
      title: item.name,
      explanation: item.note,
      facts: [
        ...(item.caption ? [{ label: "Shown", value: item.caption }] : []),
        { label: "Photo", value: `${item.credit.creator}. ${item.credit.license}.` },
      ],
      placeIds: unit?.placeId ? [unit.placeId] : [],
      related: [
        ...(unit ? [rel("unit", unit.id, unit.name)] : []),
        ...usedAt(item.id).filter((link) => link.id !== unit?.id),
      ],
      hero: { type: "image", src: item.image, alt: item.caption ? `${item.name}: ${item.caption}` : item.name, shape: item.cutout ? "landscape" : "photo" },
    };
  }

  if (sel.kind === "warfare") {
    const pin = byId(warfare, sel.id);
    if (!pin) return null;
    return {
      kind: "warfare",
      id: pin.id,
      kicker: "Warfare qualification",
      title: pin.name,
      explanation: pin.explanation,
      criteria: pin.criteria,
      facts: [{ label: "Pin", value: pin.abbreviation }],
      placeIds: pin.placeIds ?? [],
      related: resolveLinks(pin.related),
      hero: pin.image ? { type: "image", src: pin.image, alt: `${pin.name} pin`, shape: "wide" } : undefined,
    };
  }

  if (sel.kind === "insignia") {
    const item = byId(insignia, sel.id);
    if (!item) return null;
    return {
      kind: "insignia",
      id: item.id,
      kicker: "Insignia",
      title: item.name,
      explanation: item.explanation,
      criteria: item.criteria,
      facts: item.id === "stripes" ? [{ label: "On this case", value: `${profile.serviceStripes} ${profile.serviceStripeColor} stripes` }] : [],
      placeIds: [],
      related: resolveLinks(item.related),
      hero: item.image ? { type: "image", src: item.image, alt: item.name, shape: item.id === "rating-badge" ? "tall" : "square" } : undefined,
    };
  }

  if (sel.kind === "rank") {
    const item = byId(ranks, sel.id);
    if (!item) return null;
    const i = ranks.indexOf(item);
    const next = ranks[i + 1];
    const facts = [
      { label: "Pay grade", value: `${item.grade} · ${item.abbreviation}` },
      { label: item.id === "sn" ? "Date" : "Promoted", value: item.date ? formatWhen(item.date) : "Date needed" },
      { label: "Held until", value: next?.date ? `${formatWhen(next.date)} (${next.abbreviation})` : `${formatWhen(profile.serviceEnd)} (retired)` },
    ];
    if (item.note) facts.push({ label: "Note", value: item.note });
    const petty = ["E-4", "E-5", "E-6"].includes(item.grade);
    return {
      kind: "rank",
      id: item.id,
      kicker: `Pay grade ${item.grade}`,
      title: `${item.name} (${item.abbreviation})`,
      explanation: petty
        ? `${item.explanation} On dress blues, petty officers E-4 to E-6 with under 12 years of service wear red chevrons with a white eagle and specialty mark; gold chevrons come with 12 years of continuous good conduct.`
        : item.explanation,
      facts,
      placeIds: [],
      related: [...(item.id === "etc" ? [rel("milestone", "cpo", "Promoted to Chief Petty Officer")] : [])],
      hero: { type: "image", src: item.image, alt: `${item.name} (${item.abbreviation}) insignia`, shape: item.id === "sn" ? "square" : "tall" },
    };
  }

  if (sel.kind === "milestone") {
    const mark = byId(milestones, sel.id);
    if (!mark) return null;
    return {
      kind: "milestone",
      id: mark.id,
      kicker: "Career",
      title: mark.title,
      explanation: mark.explanation,
      facts: [{ label: "Date", value: formatWhen(mark.date) }],
      placeIds: mark.placeIds ?? [],
      related: resolveLinks(mark.related),
    };
  }

  if (sel.kind === "place") {
    const place = placeById(sel.id);
    if (!place) return null;
    const here = [
      ...units.filter((unit) => unit.placeId === place.id).map((unit) => rel("unit", unit.id, unit.name)),
      ...operations.filter((op) => op.placeId === place.id && !op.baseIds?.includes(place.id)).map((op) => rel("operation", op.id, op.phase)),
      ...schools.filter((school) => school.placeId === place.id).map((school) => rel("school", school.id, school.name)),
      ...visits.filter((visit) => visit.placeId === place.id && visit.unitId && !units.some((unit) => unit.id === visit.unitId && unit.placeId === place.id)).map((visit) => rel("unit", visit.unitId!, unitById(visit.unitId!)?.name ?? visit.unitId!)),
      ...operations.filter((op) => op.baseIds?.includes(place.id)).map((op) => rel("operation", op.id, `${op.name} — ${op.phase}`)),
    ];
    return {
      kind: "place",
      id: place.id,
      kicker: (pinNumbersFor(place.id).length ? `Map pin ${pinNumbersFor(place.id).join(", ")} · ` : "") + (place.type === "visit"
        ? (visits.some((visit) => visit.placeId === place.id) && visits.filter((visit) => visit.placeId === place.id).every((visit) => visit.kind === "transit") ? "Transit / stopover" : "Visit, exercise or school") +
          (place.accuracy === "approximate" ? " · approximate location" : "")
        : place.type === "base"
        ? place.accuracy === "approximate" ? "Deployment base · approximate location" : "Deployment base"
        : place.accuracy === "placeholder" ? "Placeholder location" : place.accuracy === "approximate" ? "Approximate location" : "Duty station"),
      title: place.name,
      explanation: place.note,
      facts: [
        { label: "Shown as", value: place.locality },
        { label: "Coordinates", value: place.lat != null ? `${place.lat.toFixed(3)}, ${place.lng?.toFixed(3)}` : "Not entered" },
        ...visits.filter((visit) => visit.placeId === place.id).flatMap((visit) => visit.trips?.length ? visit.trips.map((trip, i) => ({ label: i === 0 ? visit.title : "Also", value: trip })) : [{ label: visit.title, value: visit.when }]),
      ],
      placeIds: [place.id],
      related: here,
    };
  }

  return null;
}

export function photosFor(kind: Kind, id: string): Photo[] {
  return photos.filter((photo) => photo.kind === kind && photo.subjectId === id);
}

export function reflectionFor(kind: Kind, id: string): string | null {
  const found = reflections.find((item) => item.kind === kind && item.subjectId === id);
  const text = found?.text?.trim();
  return text ? text : null;
}
