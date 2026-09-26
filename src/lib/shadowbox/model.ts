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

/** Public files are served from the site root in dev, and from /shadowbox/ on GitHub Pages. */
export function publicUrl(path: string): string {
  if (!path || /^(https?:|data:)/.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\//, "")}`;
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
  | "equipment";

export type Device = {
  kind: "oak" | "star" | "letter";
  metal: "bronze" | "gold" | "silver";
  count: number;
  letter?: string;
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
  start: string;
  end: string | null;
  precision: string;
  placeId: string | null;
  explanation: string;
  civilian: string;
  open?: string;
  /** Optional crest or patch image, shown on the unit tile. */
  image?: string;
};

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

export type EquipmentGroup = "weapons" | "vehicles" | "ships";

export const EQUIPMENT_GROUPS: { id: EquipmentGroup; label: string }[] = [
  { id: "weapons", label: "Weapons" },
  { id: "vehicles", label: "Vehicles" },
  { id: "ships", label: "Ships" },
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
};

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

export type Selection = { kind: Kind; id: string };

export const profile = profileJson;
export const awards = awardsJson as Award[];
export const instances = instancesJson as Instance[];
export const units = unitsJson as Unit[];
export const operations = operationsJson as Operation[];
export const schools = schoolsJson as School[];
export const necs = necsJson as Nec[];
export const uniforms = uniformsJson as Uniform[];
export const places = placesJson as Place[];
export const photos = photosJson as Photo[];
export const reflections = reflectionsJson as Reflection[];
export const warfare = warfareJson as Warfare[];
export const insignia = insigniaJson as Insignia[];
export const milestones = milestonesJson as Milestone[];
export const credits = creditsJson as Credit[];
export const equipment = equipmentJson as Equipment[];
export const branches = branchesJson as Record<string, string>;
export const caseCopy = caseJson;

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

export function formatSpan(start: string, end: string | null): string {
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

export type Bar = {
  key: string;
  kind: Kind;
  id: string;
  title: string;
  detail: string;
  start: number;
  end: number;
  group: "duty" | "ops" | "study";
  lane: number;
  point: boolean;
  left: number;
  width: number;
};

function pack(items: Omit<Bar, "lane" | "left" | "width">[]): Bar[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  const laneRight: number[] = [];
  return sorted.map((item) => {
    const left = pct(item.start);
    const span = pct(item.end) - left;
    const width = item.point ? 7.2 : Math.max(span, 6.4);
    const right = left + width;
    let lane = laneRight.findIndex((end) => end <= left + 0.15);
    if (lane < 0) {
      lane = laneRight.length;
      laneRight.push(right);
    } else {
      laneRight[lane] = right;
    }
    return { ...item, lane, left: Math.min(left, 92), width };
  });
}

export function timeline(): { duty: Bar[]; ops: Bar[]; study: Bar[]; years: number[] } {
  const duty = pack(
    units.map((unit) => ({
      key: unit.id,
      kind: "unit" as const,
      id: unit.id,
      title: unit.abbreviation,
      detail: unit.name,
      start: bound(unit.start, "start"),
      end: bound(unit.end ?? unit.start, "end"),
      group: "duty" as const,
      point: false,
    })),
  );
  const ops = pack(
    operations.map((op) => ({
      key: op.id,
      kind: "operation" as const,
      id: op.id,
      title: op.theater,
      detail: op.phase,
      start: bound(op.start, "start"),
      end: bound(op.end ?? op.start, "end"),
      group: "ops" as const,
      point: false,
    })),
  );
  const study = pack([
    ...schools.map((school) => ({
      key: school.id,
      kind: "school" as const,
      id: school.id,
      title: school.abbreviation,
      detail: school.name,
      start: bound(school.start, "start"),
      end: bound(school.start, "start"),
      group: "study" as const,
      point: true,
    })),
    ...milestones.map((mark) => ({
      key: mark.id,
      kind: "milestone" as const,
      id: mark.id,
      title: mark.short || mark.title,
      detail: mark.title,
      start: bound(mark.date, "start"),
      end: bound(mark.date, "start"),
      group: "study" as const,
      point: true,
    })),
  ]);
  const first = serviceYear(profile.serviceStart);
  const last = serviceYear(profile.serviceEnd);
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  return { duty, ops, study, years };
}

export type Stop = { place: Place; labels: string[]; when: string };

export function careerStops(): Stop[] {
  const events = [
    ...units.filter((u) => u.placeId).map((u) => ({ sort: u.start, placeId: u.placeId as string, label: `${formatSpan(u.start, u.end)} · ${u.abbreviation}` })),
    ...operations.filter((o) => o.placeId).map((o) => ({ sort: o.start, placeId: o.placeId as string, label: `${formatSpan(o.start, o.end)} · ${o.phase}` })),
  ].sort((a, b) => a.sort.localeCompare(b.sort) || a.label.localeCompare(b.label));

  const stops: Stop[] = [];
  for (const event of events) {
    const place = placeById(event.placeId);
    if (!place) continue;
    const last = stops[stops.length - 1];
    if (last && last.place.id === place.id) {
      last.labels.push(event.label);
      continue;
    }
    stops.push({ place, labels: [event.label], when: event.sort });
  }
  return stops;
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
};

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
    const related = [
      ...(nec ? [rel("nec", nec.id, `${nec.code} ${nec.name}`)] : []),
      ...ops.map((op) => rel("operation", op.id, op.phase)),
      ...(unit.placeId && placeById(unit.placeId) ? [rel("place", unit.placeId, placeById(unit.placeId)!.name)] : []),
    ];
    return {
      kind: "unit",
      id: unit.id,
      kicker: branchName(unit.branch),
      title: unit.name,
      explanation: `${unit.explanation} ${unit.civilian}`,
      facts: [
        { label: "When", value: formatSpan(unit.start, unit.end) },
        { label: "Precision", value: unit.precision === "year" ? "Years only — months were not recorded" : "Month recorded" },
        ...(nec ? [{ label: "NEC on this tour", value: `${nec.code} · ${nec.name}` }] : []),
      ],
      placeIds: unit.placeId ? [unit.placeId] : [],
      related,
      hero: unit.image ? { type: "image", src: unit.image, alt: `Crest, ${unit.name}`, shape: "square" } : undefined,
    };
  }

  if (sel.kind === "operation") {
    const op = byId(operations, sel.id);
    if (!op) return null;
    const unit = unitById(op.unitId);
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
      placeIds: op.placeId ? [op.placeId] : [],
      related: [
        ...(unit ? [rel("unit", unit.id, unit.name)] : []),
        ...(op.placeId ? [rel("place", op.placeId, placeById(op.placeId)?.name ?? "Place")] : []),
      ],
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
      related: [],
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
      related: unit ? [rel("unit", unit.id, unit.name)] : [],
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
      hero: item.image ? { type: "image", src: item.image, alt: item.name, shape: item.id === "stripes" ? "wide" : item.id === "rating-badge" ? "tall" : "square" } : undefined,
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
      ...operations.filter((op) => op.placeId === place.id).map((op) => rel("operation", op.id, op.phase)),
      ...schools.filter((school) => school.placeId === place.id).map((school) => rel("school", school.id, school.name)),
    ];
    return {
      kind: "place",
      id: place.id,
      kicker: place.accuracy === "placeholder" ? "Placeholder location" : place.accuracy === "approximate" ? "Approximate location" : "Duty station",
      title: place.name,
      explanation: place.note,
      facts: [
        { label: "Shown as", value: place.locality },
        { label: "Coordinates", value: place.lat != null ? `${place.lat.toFixed(3)}, ${place.lng?.toFixed(3)}` : "Not entered" },
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
