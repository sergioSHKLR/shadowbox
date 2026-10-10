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
import { patchedInstance } from "@/lib/shadowbox/instance-edits";
import branchesJson from "@/data/branches.json";
import caseJson from "@/data/case.json";
import equipmentJson from "@/data/equipment.json";
import usedHereJson from "@/data/used-here.json";
import visitsJson from "@/data/visits.json";
import sequenceJson from "@/data/sequence.json";
import medalsJson from "@/data/medals.json";
import ranksJson from "@/data/ranks.json";
import supplementJson from "@/data/supplement.json";
import worldEventsJson from "@/data/world-events.json";
import certificatesJson from "@/data/certificates.json";
import commandPlatesJson from "@/data/command-plates.json";
import deploymentGearJson from "@/data/deployment-gear.json";
import commandDutiesJson from "@/data/command-duties.json";
import commandProfilesJson from "@/data/command-profiles.json";

/** Public files are served from the base URL: the site root in dev and on https://shadowbox.shklr.org. */
export function publicUrl(path: string): string {
  if (!path || /^(https?:|data:)/.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\//, "")}`;
}

/** Base ribbon art. Device sheets overlay separately when present. */
export function ribbonPlate(award: Pick<Award, "ribbon">): string {
  return award.ribbon || "";
}

/** Full-ribbon device sheet drawn on the same 11:3 canvas as the stripe art. */
export function ribbonDevicePlate(award: Pick<Award, "devices">): string {
  const devices = award.devices ?? [];
  if (!devices.length) return "";
  const letter = devices.find((d) => d.kind === "letter");
  if (letter?.style === "battle") {
    const n = Math.min(3, letter.count);
    return n ? `/devices/battle-${n}.svg` : "";
  }
  const oaks = devices.filter((d) => d.kind === "oak");
  if (oaks.length && oaks.every((d) => d.metal === "bronze")) {
    const n = oaks.reduce((s, d) => s + d.count, 0);
    if (n === 1 || n === 2) return `/devices/oak-${n}.svg`;
  }
  const stars = devices.filter((d) => d.kind === "star");
  if (stars.length === 1) {
    const s = stars[0];
    if (s.metal === "gold" && s.count >= 1 && s.count <= 4) return `/devices/gold-${s.count}.svg`;
    if (s.metal === "bronze" && s.count >= 1 && s.count <= 4) return `/devices/bronze-${s.count}.svg`;
    if (s.metal === "silver" && s.count === 1) return `/devices/silver-1.svg`;
  }
  if (
    stars.length === 2 &&
    stars.some((d) => d.metal === "silver" && d.count === 1) &&
    stars.some((d) => d.metal === "bronze" && d.count === 1)
  ) {
    return "/devices/silver-bronze.svg";
  }
  return "";
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
  | "rank"
  | "certificate"
  | "branch";

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
  /** Shop or workcenter on this tour, when recorded. */
  workcenter?: string;
  /** False for a school, TAD, operation, or customer. Those stay in the record but are not case commands. */
  onCase?: boolean;
  /** Further images shown under the crest in the unit popup (e.g. a coin). */
  extraImages?: ExtraImage[];
  /** Tour length in months when start/end are year-only. */
  months?: number;
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
  /** Boots-on-ground length in months when start/end are year-only. */
  months?: number;
  explanation: string;
  open?: string;
};

export type School = {
  id: string;
  name: string;
  abbreviation: string;
  start: string;
  end?: string | null;
  length: string | null;
  placeId: string | null;
  placeConfidence: string;
  explanation: string;
  open?: string;
  /** The command whose tour this school belongs to, when stated outright (overrides date/place matching). */
  commandId?: string;
  commandNote?: string;
};

export type Nec = {
  id: string;
  code: string;
  name: string;
  awarded: string | null;
  currentCode: string | null;
  years: string | null;
  role: string;
  explanation: string;
  criteria: string;
  /** Where the NEC was GAINED, as stated by Sergio: a units.json command id, or "pipeline" (before any Logbook command). Overrides date matching. */
  gainedAt?: string;
  gainedNote?: string;
  /** Where its school was taken (places.json). Admin only; NECs are never Map pins. */
  placeId?: string;
  commandNote?: string;
  /** The school(s) that awarded it (CIN / name in criteria). Admin lists the NEC instead of these schools. */
  schoolIds?: string[];
  /** Shown instead of the name when this NEC is a command's billet NEC (e.g. 0000 · No NEC billet). */
  billetLabel?: string;
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

export type EquipmentGroup = "armor" | "helmets" | "weapons" | "comms" | "vehicles" | "ships" | "aircraft" | "cars" | "motorcycles" | "cities" | "residences";

export const EQUIPMENT_GROUPS: { id: EquipmentGroup; label: string }[] = [
  { id: "armor", label: "Body Armor" },
  { id: "helmets", label: "Helmets" },
  { id: "weapons", label: "Weapons" },
  { id: "comms", label: "Comms & Crypto" },
  { id: "vehicles", label: "Vehicles" },
  { id: "ships", label: "Ships & Boats" },
  { id: "aircraft", label: "Aircraft" },
  { id: "cars", label: "Cars" },
  { id: "motorcycles", label: "Motorcycles" },
  { id: "cities", label: "Cities" },
  { id: "residences", label: "Residences" },
];

export type Equipment = {
  id: string;
  group: EquipmentGroup;
  order: number;
  name: string;
  /** Sidebar title when the card label is a short code (e.g. "OTV" → "Outer Tactical Vest (OTV)"). */
  fullName?: string;
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
  /** Legacy place shape. Map filters use sequence `kind`, not this field. */
  type?: "city" | "base" | "visit";
  /** Optional pin colour override (rare). */
  pin?: "red";
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

export type PhotoSubject = { kind: Kind; id: string };

export type Photo = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  /** One still can list several On Duty, Off Duty, command, operation, or uniform records. */
  subjects: PhotoSubject[];
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
/**
 * The command a school belongs to when the data says so outright: its own commandId, or the commandId of the
 * NEC it awarded (necs.json schoolIds). Otherwise null, and date / place matching decides.
 */
export function schoolCommandId(school: School): string | null {
  if (school.commandId) return school.commandId;
  const nec = (necsJson as { schoolIds?: string[]; gainedAt?: string }[]).find(
    (row) => row.gainedAt && row.gainedAt !== "pipeline" && row.schoolIds?.includes(school.id),
  );
  return nec?.gainedAt ?? null;
}
export const necs = necsJson as Nec[];
/** Numbered v12 mannequins. Cover cards stay these files; personal *-wear.jpg shots live in photos.json. */
const UNIFORM_FIGURINE: Record<string, string> = {
  smurfs: "/uniforms/v12/01-smurfs-boot-camp.webp",
  "navy-ptu": "/uniforms/v12/02-navy-ptu.webp",
  "eodmu5-pt-2": "/uniforms/v12/03-eodmu-5-pt-2-b.webp",
  "jcse-pt": "/uniforms/v12/04-jcse-pt.webp",
  "eodmu5-pt-1": "/uniforms/v12/05-eodmu-5-pt-1.webp",
  "jcse-afg": "/uniforms/v12/24-afg-civilian-attire-c.webp",
  dungarees: "/uniforms/v12/06-dungarees.webp",
  utilities: "/uniforms/v12/07-utilities.webp",
  coveralls: "/uniforms/v12/08-coveralls.webp",
  "working-whites": "/uniforms/v12/13-summer-white.webp",
  johnny: "/uniforms/v12/12-winter-blue.webp",
  nwu: "/uniforms/v12/09-nwu-type-i.webp",
  "nwu-type-iii": "/uniforms/v12/23-nwu-type-iii.webp",
  "peanut-butters": "/uniforms/v12/10-nsu-peanut-butter.webp",
  "cpo-summer-white": "/uniforms/v12/14-cpo-summer-white.webp",
  "cpo-khaki": "/uniforms/v12/11-cpo-working-khaki.webp",
  "dress-whites": "/uniforms/v12/16-sdw-crackerjack.webp",
  "dress-blues": "/uniforms/v12/15-sdb-crackerjack.webp",
  "cpo-sdw": "/uniforms/v12/18-cpo-sdw.webp",
  "cpo-sdb": "/uniforms/v12/17-cpo-sdb.webp",
  "green-camo": "/uniforms/v12/19-woodland-bdu.webp",
  desert: "/uniforms/v12/20-desert-dcu.webp",
  awu: "/uniforms/v12/21-army-acu.webp",
  multicam: "/uniforms/v12/22-army-ocp.webp",
};

export const uniforms = (uniformsJson as Uniform[]).map((uniform) => ({
  ...uniform,
  image: UNIFORM_FIGURINE[uniform.id] ?? uniform.image,
}));
export const places = placesJson as Place[];
export const bases = places.filter((place) => place.type === "base");
export const photos = photosJson as Photo[];
export const reflections = reflectionsJson as Reflection[];
export const warfare = warfareJson as Warfare[];
export const insignia = insigniaJson as Insignia[];
export const milestones = milestonesJson as Milestone[];
export type Certificate = { id: string; name: string; explanation: string };
export const certificates = certificatesJson as Certificate[];
export const credits = creditsJson as Credit[];
/** Items marked hidden in equipment.json (e.g. the Ford Transit Connect) stay in the data but never show on the site. */
export const equipment = (equipmentJson as (Equipment & { hidden?: boolean })[]).filter((item) => !item.hidden) as Equipment[];
export const branches = branchesJson as Record<string, string>;
export const caseCopy = caseJson;
export const medals = medalsJson as Medal[];

const decorationSlideArt = import.meta.glob("../../../incoming/decorations/*.{png,svg,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type DecorationSlide = { src: string; file: string; from: string | null; month: number | null; caption: string };

function slideFromPath(path: string, src: string): DecorationSlide {
  const file = path.split("/").pop() ?? path;
  const stem = file.replace(/\.[^.]+$/, "");
  const match = stem.match(/(\d{4})(?:-(\d{2}))?/);
  const from = match ? (match[2] ? `${match[1]}-${match[2]}` : match[1]) : null;
  const month = match ? Number(match[1]) * 12 + (match[2] ? Number(match[2]) - 1 : 0) : null;
  return { src, file, from, month, caption: stem.replace(/[-_]/g, " ") };
}

export const decorationSlides: DecorationSlide[] = Object.entries(decorationSlideArt)
  .map(([path, src]) => slideFromPath(path, src))
  .sort((a, b) => (a.month ?? 1e9) - (b.month ?? 1e9) || a.file.localeCompare(b.file));

export function decorationSlideAt(month: number): DecorationSlide | null {
  const dated = decorationSlides.filter((slide) => slide.month != null && slide.month <= month);
  return dated.at(-1) ?? decorationSlides[0] ?? null;
}

const uniformSlideArt = import.meta.glob("../../../incoming/plates/*.{png,svg,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type UniformLook = "blue" | "white" | "khaki";
export type UniformSlide = {
  src: string;
  file: string;
  look: UniformLook;
  from: string | null;
  month: number | null;
  caption: string;
};

const UNIFORM_LOOK: Record<string, UniformLook> = {
  blue: "blue",
  blues: "blue",
  sdb: "blue",
  white: "white",
  whites: "white",
  sdw: "white",
  choker: "white",
  khaki: "khaki",
  khakis: "khaki",
};

/** incoming/plates/e1-blues.svg … e7-nh-khakis.svg (Sergio's set, Oct 2026). Grade, then the E-6 tour index (1 USS Frank Cable … 4 JCSE)
 * or the E-7 command (jcse = CPO at JCSE, with the JCSE badge; nh = Naval Hospital Jacksonville), then the look.
 * E-7 blues are look-first: e7-blues-jcse.svg and e7-blues-nh.svg. */
const PLATE_FILE: Record<string, { look: UniformLook; y: number; m: number; caption: string }> = {
  "e1-blues": { look: "blue", y: 1997, m: 6, caption: "SR · dress blues" },
  "e1-whites": { look: "white", y: 1997, m: 6, caption: "SR · dress whites" },
  "e3-blues": { look: "blue", y: 1997, m: 9, caption: "SN · dress blues" },
  "e3-whites": { look: "white", y: 1997, m: 9, caption: "SN · dress whites" },
  "e4-blues": { look: "blue", y: 1998, m: 12, caption: "ET3 · dress blues" },
  "e4-whites": { look: "white", y: 1998, m: 12, caption: "ET3 · dress whites" },
  "e5-blues": { look: "blue", y: 2001, m: 1, caption: "ET2 · dress blues" },
  "e5-whites": { look: "white", y: 2001, m: 1, caption: "ET2 · dress whites" },
  "e6-1-blues": { look: "blue", y: 2004, m: 1, caption: "ET1 · dress blues" },
  "e6-1-whites": { look: "white", y: 2004, m: 1, caption: "ET1 · dress whites" },
  "e6-2-blues": { look: "blue", y: 2007, m: 1, caption: "ET1 · dress blues" },
  "e6-2-whites": { look: "white", y: 2007, m: 1, caption: "ET1 · dress whites" },
  "e6-3-blues": { look: "blue", y: 2009, m: 6, caption: "ET1 · dress blues" },
  "e6-3-whites": { look: "white", y: 2009, m: 6, caption: "ET1 · dress whites" },
  "e6-4-blues": { look: "blue", y: 2014, m: 1, caption: "ET1 · dress blues" },
  "e6-4-whites": { look: "white", y: 2014, m: 1, caption: "ET1 · dress whites" },
  "e7-blues-jcse": { look: "blue", y: 2014, m: 9, caption: "ETC · dress blues" },
  "e7-jcse-whites": { look: "white", y: 2014, m: 9, caption: "ETC · dress whites" },
  "e7-jcse-khakis": { look: "khaki", y: 2014, m: 9, caption: "ETC · khakis" },
  // NAVHOSP's start is year-only (2015); m: 1 is only a sort key so these follow the JCSE CPO set. Not shown as a date.
  "e7-blues-nh": { look: "blue", y: 2015, m: 1, caption: "ETC · dress blues" },
  "e7-nh-whites": { look: "white", y: 2015, m: 1, caption: "ETC · dress whites" },
  "e7-nh-khakis": { look: "khaki", y: 2015, m: 1, caption: "ETC · khakis" },
};

const PLATE_LOOK = "(?:blues?|whites?|khakis?|sdb|sdw|choker)";
const PLATE_LOOK_SUFFIX = new RegExp(`-${PLATE_LOOK}$`);
/** e7-blues-jcse.svg keeps the command after the look. e6-2-blues.svg keeps the look at the end. */
const PLATE_LOOK_FIRST = new RegExp(`^(e\\d+)-${PLATE_LOOK}-(.+)$`);

/** Plate set a file belongs to: "e6-2-blues.svg" → "e6-2"; "e7-blues-jcse.svg" → "e7-jcse". */
export function plateGroup(file: string | null | undefined): string {
  const stem = (file ?? "").replace(/\.[^.]+$/, "").toLowerCase();
  const swapped = stem.match(PLATE_LOOK_FIRST);
  if (swapped) return `${swapped[1]}-${swapped[2]}`;
  return stem.replace(PLATE_LOOK_SUFFIX, "");
}

function uniformFromPath(path: string, src: string): UniformSlide {
  const file = path.split("/").pop() ?? path;
  const stem = file.replace(/\.[^.]+$/, "");
  const plate = PLATE_FILE[stem.toLowerCase()];
  if (plate) {
    return {
      src,
      file,
      look: plate.look,
      from: `${plate.y}-${String(plate.m).padStart(2, "0")}`,
      month: plate.y * 12 + (plate.m - 1),
      caption: plate.caption,
    };
  }
  const lookHit = stem.toLowerCase().match(/\b(blue|blues|sdb|white|whites|sdw|choker|khaki|khakis)\b/);
  const dateHit = stem.match(/(\d{4})(?:-(\d{2}))?/);
  const look = (lookHit ? UNIFORM_LOOK[lookHit[1]] : undefined) ?? "blue";
  const y = dateHit ? Number(dateHit[1]) : undefined;
  const mo = dateHit ? (dateHit[2] ? Number(dateHit[2]) : 1) : undefined;
  const from = y == null ? null : dateHit?.[2] ? `${y}-${String(mo).padStart(2, "0")}` : String(y);
  const month = y != null && mo != null ? y * 12 + (mo - 1) : null;
  return { src, file, look, from, month, caption: stem.replace(/[-_]/g, " ") };
}

export const uniformSlides: UniformSlide[] = Object.entries(uniformSlideArt)
  .map(([path, src]) => uniformFromPath(path, src))
  .sort((a, b) => (a.month ?? 1e9) - (b.month ?? 1e9) || a.file.localeCompare(b.file));

export const uniformLooks: UniformLook[] = (["blue", "white", "khaki"] as const).filter((look) =>
  uniformSlides.some((slide) => slide.look === look),
);

export function uniformSlideAt(month: number, look: UniformLook): UniformSlide | null {
  const dated = uniformSlides.filter((slide) => slide.look === look && slide.month != null && slide.month <= month);
  return dated.at(-1) ?? null;
}

export function firstUniformSlide(look: UniformLook): UniformSlide | null {
  return uniformSlides.find((slide) => slide.look === look && slide.month != null) ?? null;
}

/** Command walk on Timeline. SR/RTC opens; CPO plates are JCSE last year, then NAVHOSP. */
const UNIFORM_STEP_PLATES: { unitId: string; stem: string; id?: string; label?: string; span?: string }[] = [
  { unitId: "rtc", stem: "e1-blues" },
  { unitId: "ncts", stem: "e5-blues" },
  { unitId: "frank-cable", stem: "e6-1-blues" },
  { unitId: "eodmu5", stem: "e6-2-blues" },
  { unitId: "sercc", stem: "e6-3-blues" },
  { unitId: "jcse", stem: "e6-4-blues" },
  { unitId: "jcse", stem: "e7-blues-jcse", id: "jcse-cpo", label: "CPO", span: "2014" },
  { unitId: "navhosp", stem: "e7-blues-nh" },
];

/** Logbook plate sets per command (end-of-tour snapshot). RTC is Seaman Recruit (E-1); Tortuga (Seaman TAD) wears the SN set; NTC ends as ET3. */
const LOGBOOK_PLATE_SETS: Record<string, string[]> = {
  rtc: ["e1"],
  tortuga: ["e3"],
  "ntc-great-lakes": ["e4"],
  ncts: ["e5"],
  "frank-cable": ["e6-1"],
  eodmu5: ["e6-2"],
  sercc: ["e6-3"],
  jcse: ["e6-4", "e7-jcse"],
  navhosp: ["e7-nh"],
};

/** Plate sets a command's Logbook shows, oldest first (JCSE: ET1 e6-4, then the CPO e7-jcse set). */
export function logbookPlateSets(unitId: string | null | undefined): string[] {
  return unitId ? [...(LOGBOOK_PLATE_SETS[unitId] ?? [])] : [];
}

export type UniformStep = {
  id: string;
  unitId: string;
  label: string;
  span: string;
  from: string;
  month: number;
  crest?: string;
  uim?: string;
};

function spanForUnit(unit: Unit): string {
  if (!unit.start) return "Dates not entered";
  const a = unit.start.length === 4 ? unit.start : unit.start.slice(0, 4);
  if (!unit.end) return a;
  const b = unit.end.length === 4 ? unit.end : unit.end.slice(0, 4);
  return a === b ? a : `${a}–${b}`;
}

const UIM: Record<string, string> = {
  ncts: "NCTS SAN DIEGO",
  "frank-cable": "USS FRANK CABLE",
  eodmu5: "EOD MOBILE UNIT FIVE",
  sercc: "SERCC JACKSONVILLE",
  jcse: "JOINT COMM SPT ELMT",
  navhosp: "NAVHOSP JACKSONVILLE",
};
export const uniformSteps: UniformStep[] = UNIFORM_STEP_PLATES.flatMap(({ unitId, stem, id, label, span }) => {
  const unit = units.find((row) => row.id === unitId);
  const plate = PLATE_FILE[stem];
  if (!unit || !plate) return [];
  return [{
    id: id ?? unitId,
    unitId,
    label: label ?? unit.abbreviation,
    crest: unit.image,
    uim: UIM[unitId],
    span: span ?? spanForUnit(unit),
    from: `${plate.y}-${String(plate.m).padStart(2, "0")}`,
    month: plate.y * 12 + (plate.m - 1),
  }];
});

export function uniformStepsForLook(look: UniformLook): UniformStep[] {
  return uniformSteps.filter((step) => uniformSlideAt(step.month, look));
}

const medalArt = import.meta.glob("../../../incoming/medals/*.{png,svg,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const MEDAL_FILE: Record<string, string> = {
  jscm: "JSCM.webp",
  ncm: "NC.webp",
  arcom: "AC.webp",
  jsam: "JSAM.webp",
  nam: "NAM.webp",
  aam: "AAM.webp",
  ngcm: "GCM.webp",
  ndsm: "NDSM.webp",
  acm: "ACM.webp",
  icm: "ICM.webp",
  gwotsm: "GWOT-SM.webp",
  hsm: "HSM.webp",
  pistol: "PISTOL.webp",
  rifle: "RIFLE.webp",
};

function medalArtFor(id: string): string {
  const aliases = new Set([id.toLowerCase().replace(/[-_]/g, "")]);
  if (id === "ncm") aliases.add("nc");
  if (id === "ngcm") aliases.add("gcm");
  if (id === "arcom") aliases.add("ac");
  if (id === "gwotsm") aliases.add("gwotsm");
  for (const [path, url] of Object.entries(medalArt)) {
    const stem = (path.split("/").pop() ?? "").replace(/\.[^.]+$/, "").toLowerCase().replace(/[-_]/g, "");
    if (aliases.has(stem)) return url;
  }
  const file = MEDAL_FILE[id];
  return file ? `/incoming/medals/${file}` : "";
}

export const medalFor = (awardId: string) => {
  const medal = medals.find((row) => row.id === awardId);
  if (!medal) return null;
  const front = medalArtFor(awardId);
  if (!front) return null;
  return { ...medal, front };
};

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

export type TourFocus = {
  kind: "rank" | "unit" | "operation";
  id: string;
  label: string;
  start: string;
  end: string;
};

function dayKey(value: string): string {
  const [y, m, d] = value.split("-");
  return `${y}-${(m ?? "01").padStart(2, "0")}-${(d ?? "01").padStart(2, "0")}`;
}

export function tourFocus(kind: Kind, id: string): TourFocus | null {
  if (kind === "rank") {
    const dated = ranks.filter((rank): rank is Rank & { date: string } => Boolean(rank.date));
    const index = dated.findIndex((rank) => rank.id === id);
    if (index < 0) return null;
    const rank = dated[index];
    return {
      kind: "rank",
      id,
      label: `${rank.abbreviation} · ${rank.grade}`,
      start: rank.date,
      end: dated[index + 1]?.date ?? profile.serviceEnd,
    };
  }
  if (kind === "unit") {
    const unit = units.find((entry) => entry.id === id);
    if (!unit?.start) return null;
    return {
      kind: "unit",
      id,
      label: unit.abbreviation,
      start: unit.start,
      end: unit.end ?? profile.serviceEnd,
    };
  }
  if (kind === "operation") {
    const op = operations.find((entry) => entry.id === id);
    if (!op) return null;
    return {
      kind: "operation",
      id,
      label: opChipTitle(op),
      start: op.start,
      end: op.end ?? op.start,
    };
  }
  return null;
}

export function tourItems(tour: TourFocus) {
  const y0 = Number(tour.start.slice(0, 4));
  const y1 = Number(tour.end.slice(0, 4));
  const a = dayKey(tour.start);
  const b = dayKey(tour.end);
  const awardHits = instances
    .filter((row) => row.year != null && row.year >= y0 && row.year <= y1)
    .map((row) => {
      const award = awards.find((entry) => entry.id === row.awardId);
      return award ? { instance: row, award } : null;
    })
    .filter((row): row is { instance: Instance; award: Award } => Boolean(row));
  const deviceHits = awards.filter((award) => award.devices.length && awardHits.some((hit) => hit.award.id === award.id));
  const schoolHits = schools.filter((school) => school.start && dayKey(school.start) >= a && dayKey(school.start) <= b);
  return { awardHits, deviceHits, schoolHits };
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
      const plural = d.count === 1 ? what : d.kind === "oak" ? "oak leaves" : `${what}s`;
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
const SCALE_START = bound(profile.serviceStart, "start");
const SCALE_END = bound(profile.serviceEnd, "end");

/** Pay grades and promotion dates. The one place to edit them: src/data/ranks.json. */
export type Rank = {
  id: string;
  grade: string;
  abbreviation: string;
  name: string;
  /** YYYY, YYYY-MM or YYYY-MM-DD; null shows "date needed". */
  date: string | null;
  /** Optional rating-badge art. Absent while insignia files are off the site. */
  image?: string;
  /** Metal collar device in public/incoming. */
  collar?: string;
  explanation: string;
  note?: string;
};

export type PlateEntry = { id: string; count: number; campaignStars?: number };
export type PlateExtra = {
  src: string;
  title: string;
  /** This unit's role for this command (shown on the Logbook crest instead of the unit's own designator), e.g. "TAD". */
  role?: string;
  unit: string;
  date: string;
  kind: Kind;
  id: string;
  /** The crest's own units.json record, when kind/id point somewhere else (e.g. RTN → U-Tapao on the Commands page). */
  unitId?: string;
};
export type CommandPlate = {
  unitId: string;
  inRank: string;
  outRank: string;
  pinsAbove: string[];
  pinsBelow: string[];
  rack: PlateEntry[];
  extras?: PlateExtra[];
  note?: string;
  rankNote?: string;
};
export const commandPlates = commandPlatesJson as CommandPlate[];

function devicesForPlate(id: string, count: number, campaignStars?: number): Device[] {
  if (id === "acm" || id === "icm") {
    const n = campaignStars ?? 0;
    return n > 0 ? [{ kind: "star", metal: "bronze", count: n }] : [];
  }
  if (id === "navy-e") {
    return count > 0 ? [{ kind: "letter", metal: "silver", letter: "E", count: Math.min(3, count), style: "battle" }] : [];
  }
  if (id === "rifle" || id === "pistol") {
    return [{ kind: "letter", metal: "silver", letter: "E", count: 1, style: "expert" }];
  }
  if (count <= 1) return [];
  if (id === "jscm" || id === "arcom" || id === "jmua") {
    return [{ kind: "oak", metal: "bronze", count: count - 1 }];
  }
  if (id === "nam" || id === "ncm") {
    return [{ kind: "star", metal: "gold", count: count - 1 }];
  }
  const extra = count - 1;
  const silver = Math.floor(extra / 5);
  const bronze = extra % 5;
  const devices: Device[] = [];
  if (silver) devices.push({ kind: "star", metal: "silver", count: silver });
  if (bronze) devices.push({ kind: "star", metal: "bronze", count: bronze });
  return devices;
}

/** A command's ending rack, with devices for that tour's counts rather than the career rack. */
export function plateAwards(entries: PlateEntry[]): Award[] {
  return entries.flatMap((entry) => {
    const base = awardById(entry.id);
    if (!base) return [];
    return [{
      ...base,
      count: entry.count,
      devices: devicesForPlate(entry.id, entry.count, entry.campaignStars),
    }];
  });
}
export const ranks = ranksJson as Rank[];
/** Grades shown as worn badges in the case, Seaman Recruit through Chief. */
export const caseRanks = ranks;

export type Bar = {
  key: string;
  kind: Kind;
  id: string;
  title: string;
  detail: string;
  start: number;
  end: number;
  group: "duty" | "ops" | "study" | "rank" | "world";
  lane: number;
  point: boolean;
  /** Length of this bar. Null when the record has no duration. */
  days: number | null;
  left: number;
  width: number;
  href?: string;
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
    end: Math.min(bound(unit.end ?? unit.start, "end"), bound(profile.serviceEnd, "end")),
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
      days: unit.months ? Math.round(unit.months * 30.44) : null,
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
  if (op.id === "oif-2006") return "OIF I (National Resolution)";
  if (op.id === "oif-2009") return "OIF II (Iraq Sovereignty)";
  if (op.id === "oef-2010") return "OEF I (Consolidation I)";
  if (op.id === "oef-2012") return "OEF II (Consolidation II)";
  return op.theater;
}

export function timeline(): { duty: Bar[]; ops: Bar[]; study: Bar[]; rank: Bar[]; world: Bar[]; years: number[] } {
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
      days: op.months ? Math.round(op.months * 30.44) : null,
    })),
  ));
  const study = finish(pack(
    schools.filter((school) => school.start).map((school) => ({
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
  const worldEvents = worldEventsJson as { id: string; date: string; title: string; detail: string; url?: string }[];
  const world = finish(pack(
    worldEvents.map((event, i) => ({
      key: `world-${event.id}`,
      kind: "milestone" as const,
      id: event.id,
      title: event.title,
      detail: event.detail,
      start: bound(event.date, "start"),
      end: worldEvents[i + 1] ? bound(worldEvents[i + 1].date, "start") : bound(profile.serviceEnd, "end"),
      group: "world" as const,
      point: false,
      days: null,
      href: event.url,
    })),
  ));
  const first = serviceYear(profile.serviceStart);
  const last = serviceYear(profile.serviceEnd);
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  return { duty, ops, study, rank, world, years };
}

const SUPPLEMENT_FIELDS = ["Collateral", "Title", "Watch Station", "Division", "TAD", "Layover", "Partner", "Sponsor", "Customer", "Port Visit", "Countries", "Hobbies", "Off-duty work", "Under Instruction"];

function supplementLabel(value: string): string {
  return value.replace(/^[A-Z]+-\d+:\s*/, "");
}

/** Crosswalk rows from src/data/supplement.csv. Dated JSON still wins; this only adds fields the record did not have. */
export function supplementFacts(kind: string, id: string): { label: string; value: string }[] {
  const blocks = supplementJson as unknown as { kind: string | null; id: string | null; lists: Record<string, string[]> }[];
  return blocks
    .filter((block) => block.kind === kind && block.id === id)
    .flatMap((block) =>
      SUPPLEMENT_FIELDS.filter((field) => block.lists[field]?.length).map((field) => ({
        label: field,
        value: block.lists[field].map(supplementLabel).join(", "),
      })),
    );
}

/** One row of Sergio's ordered place sequence. */
export type SequenceEntry = {
  order: number;
  label: string;
  cityId: string | null;
  baseId: string | null;
  commandId: string | null;
  /** Primary Map category (pin colour). Mutually exclusive except San Diego, which may also list `command` in alsoKinds. */
  kind: StopLayer;
  /** Optional extra filter membership. Only San Diego uses this (Instruction + Command host). */
  alsoKinds?: StopLayer[];
  when: string | null;
};

/** Map pin categories. One stop, one primary kind — except San Diego (instruction + command host). */
export type StopLayer = "command" | "instruction" | "base" | "field" | "port" | "layover" | "stopover";

export const STOP_LAYERS: StopLayer[] = ["command", "instruction", "base", "field", "port", "layover", "stopover"];

/** n: fixed sequence order (1-based). Never renumbered when categories are filtered. */
export type Stop = {
  place: Place;
  labels: string[];
  when: string;
  n: number;
  cityId: string | null;
  baseId: string | null;
  commandId: string | null;
  kind: StopLayer;
  /** Filter membership: primary kind, plus alsoKinds (San Diego only). */
  layers: StopLayer[];
};

export const sequence = sequenceJson as SequenceEntry[];

function schoolById(id: string | null | undefined) {
  if (!id) return undefined;
  return schools.find((school) => school.id === id);
}

/** Pin place for a sequence row: base, else city, else the command's recorded place. */
export function sequencePinPlace(entry: Pick<SequenceEntry, "cityId" | "baseId" | "commandId">): Place | undefined {
  if (entry.baseId) return placeById(entry.baseId);
  if (entry.cityId) return placeById(entry.cityId);
  if (entry.commandId) {
    const unit = unitById(entry.commandId);
    if (unit?.placeId) return placeById(unit.placeId);
    const school = schoolById(entry.commandId);
    if (school?.placeId) return placeById(school.placeId);
  }
  return undefined;
}

/**
 * The Map's label for a place: the label of its own Map stop in sequence.json (a place row, not a school/NEC
 * row such as "… (1460)"). A place with no Map stop falls back to its places.json name, which uses the same
 * "Base, City, ST" convention the Map labels follow.
 */
export function mapPlaceLabel(placeId: string | null | undefined): string {
  if (!placeId) return "";
  const rows = sequence.filter((row) => row.baseId === placeId || (!row.baseId && row.cityId === placeId));
  const own = rows.find((row) => !row.commandId || unitById(row.commandId)) ?? rows[0];
  return own?.label ?? placeById(placeId)?.name ?? "";
}

/** Pin place is fixed per stop. Filters hide whole stops; they do not swap the pin. */
export function stopPlaceForLayers(stop: Stop, _shown: StopLayer[] | null): Place {
  return stop.place;
}

export function careerStops(): Stop[] {
  const stops: Stop[] = [];
  for (const entry of [...sequence].sort((a, b) => a.order - b.order)) {
    const place = sequencePinPlace(entry);
    if (!place) continue;
    const kind = entry.kind;
    const extras = (entry.alsoKinds ?? []).filter((layer) => layer !== kind);
    stops.push({
      place,
      labels: [entry.label],
      when: entry.when ?? "",
      n: entry.order,
      cityId: entry.cityId,
      baseId: entry.baseId,
      commandId: entry.commandId,
      kind,
      layers: [kind, ...extras],
    });
  }
  return stops;
}

/** Date key YYYY-MM-DD for ordering (month/day default to 01). */
function dateKey(value: string | null | undefined): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  if (!y) return "";
  return `${y}-${(m ?? "01").padStart(2, "0")}-${(d ?? "01").padStart(2, "0")}`;
}

function monthKey(value: string | null | undefined): number | null {
  const key = dateKey(value);
  if (!key) return null;
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
  return y * 12 + (m - 1);
}

/** Assigned-command plates in career order (Commands page). */
const PLATE_UNIT_IDS = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"] as const;
/** Pre-NCTS Logbook commands (Sergio): boot camp, the Tortuga TAD, and A-school, in tour order (units.json dates). */
export const LOGBOOK_PIPELINE_UNIT_IDS = ["rtc", "tortuga", "ntc-great-lakes"] as const;
/** Every Logbook command, in career order. */
const LOGBOOK_UNIT_IDS = [...LOGBOOK_PIPELINE_UNIT_IDS, ...PLATE_UNIT_IDS] as const;

/** Customers/partners kept off the Map inset (still OK as unit chips from structured data). */
const MAP_EXCLUDED_UNIT_IDS = new Set(["52nd-ordnance", "3rd-sfg", "75th-ranger", "eodmu11", "rtn", "auscdt", "acu4"]);

export type LogbookUnitChip = {
  id: string;
  name: string;
  abbreviation: string;
  image: string | null;
  designator: string | null;
  /** Partner recorded only on the command plate (no units.json record of its own): crest + label, no detail page. */
  plateOnly?: boolean;
};

export type LogbookAdminFact = {
  kind: "school" | "nec" | "rank" | "milestone";
  id: string;
  label: string;
  detail: string;
};

export type LogbookBeat = {
  index: number;
  stop: Stop;
  /** Carried-forward when the sequence row has no date. */
  when: string;
  month: number | null;
  rank: Rank | null;
  uniform: UniformSlide | null;
  plate: CommandPlate | null;
  rack: Award[];
  pinsAbove: string[];
  pinsBelow: string[];
  /** Crest/units shown in the Units inset (may include assisting partners). */
  units: LogbookUnitChip[];
  /** Schools, NECs, ranks, milestones tied to this beat — no invented prose. */
  admin: LogbookAdminFact[];
  /** Structured lines only (label, place, command, duty window). Never reminiscence. */
  lines: string[];
};

function unitChip(unit: Unit): LogbookUnitChip {
  return {
    id: unit.id,
    name: unit.name,
    abbreviation: unit.abbreviation,
    image: unit.image ?? null,
    designator: unit.designator ?? null,
  };
}

function plateForStop(stop: Stop, when: string): CommandPlate | null {
  if (stop.commandId) {
    const direct = commandPlates.find((row) => row.unitId === stop.commandId);
    if (direct) return direct;
  }
  const key = dateKey(when);
  let best: CommandPlate | null = null;
  let bestStart = "";
  for (const unitId of PLATE_UNIT_IDS) {
    const unit = unitById(unitId);
    const plate = commandPlates.find((row) => row.unitId === unitId);
    if (!unit || !plate || !unit.start) continue;
    const start = dateKey(unit.start);
    // Year-only ends count through Dec 31 of that year.
    const endRaw = unit.end ? (unit.end.length === 4 ? `${unit.end}-12-31` : unit.end) : "9999-12-31";
    const end = dateKey(endRaw);
    if (!start) continue;
    if (key && (start > key || end < key)) continue;
    if (!key || start >= bestStart) {
      best = plate;
      bestStart = start;
    }
  }
  return best;
}

function rankAt(when: string): Rank | null {
  const key = dateKey(when);
  if (!key) return ranks[0] ?? null;
  let best: Rank | null = null;
  for (const rank of ranks) {
    if (!rank.date) continue;
    if (dateKey(rank.date) <= key) best = rank;
  }
  return best;
}

function lookForRank(rank: Rank | null): UniformLook {
  return rank?.grade === "E-7" ? "khaki" : "blue";
}

function schoolsForBeat(stop: Stop, when: string): School[] {
  const placeIds = new Set([stop.place.id, stop.cityId, stop.baseId].filter(Boolean) as string[]);
  const key = dateKey(when);
  const year = key.slice(0, 4);
  return schools.filter((school) => {
    const pinned = schoolCommandId(school);
    if (pinned) return pinned === stop.commandId;
    if (!school.start) {
      return Boolean(school.placeId && placeIds.has(school.placeId));
    }
    const start = dateKey(school.start);
    const end = dateKey(school.end ?? school.start);
    const overlaps = Boolean(key && start && end && start <= key && key <= end);
    const sameYear = Boolean(year && school.start.startsWith(year));
    const samePlace = Boolean(school.placeId && placeIds.has(school.placeId));
    // Same place alone is not enough — later Great Lakes courses must not ride on RTC.
    if (samePlace) return overlaps || sameYear;
    return overlaps || sameYear;
  });
}

function necsForBeat(when: string): Nec[] {
  const key = dateKey(when);
  if (!key) return [];
  const year = key.slice(0, 4);
  return necs.filter((nec) => {
    if (!nec.awarded) return false;
    const awarded = dateKey(nec.awarded);
    if (awarded === key) return true;
    return awarded.startsWith(year) && Math.abs(Number(awarded.slice(0, 4)) - Number(year)) === 0;
  });
}

function milestonesForBeat(when: string): Milestone[] {
  const key = dateKey(when);
  if (!key) return [];
  return milestones.filter((row) => dateKey(row.date) === key || (key.length >= 7 && dateKey(row.date).startsWith(key.slice(0, 7))));
}

function unitsForBeat(stop: Stop, plate: CommandPlate | null, when: string): LogbookUnitChip[] {
  const out: LogbookUnitChip[] = [];
  const seen = new Set<string>();
  const add = (unit: Unit | undefined) => {
    if (!unit || seen.has(unit.id)) return;
    seen.add(unit.id);
    out.push(unitChip(unit));
  };
  if (stop.commandId) add(unitById(stop.commandId));
  if (plate) add(unitById(plate.unitId));
  if (plate?.extras) {
    for (const extra of plate.extras) {
      if (extra.kind !== "unit") continue;
      add(unitById(extra.id));
    }
  }
  const key = dateKey(when);
  const placeIds = new Set([stop.place.id, stop.cityId, stop.baseId].filter(Boolean) as string[]);
  for (const unit of units) {
    if (seen.has(unit.id)) continue;
    if (unit.placeId && placeIds.has(unit.placeId)) {
      const start = dateKey(unit.start);
      const end = dateKey(unit.end ?? unit.start);
      if (!key || !start || (start <= key && (!end || key <= end || unit.end?.length === 4))) {
        add(unit);
      }
    }
  }
  return out;
}

/** Uniform slide tied to a command plate stem (Commands / Timeline walk). */
function uniformForPlateUnit(unitId: string, look: UniformLook): UniformSlide | null {
  const set = LOGBOOK_PLATE_SETS[unitId]?.[0];
  if (set) {
    const own = uniformSlides.filter((slide) => plateGroup(slide.file) === set);
    const hit = own.find((slide) => slide.look === look) ?? own.find((slide) => slide.look === "blue") ?? own[0];
    if (hit) return hit;
  }
  const step =
    UNIFORM_STEP_PLATES.find((row) => row.unitId === unitId && !row.id) ??
    UNIFORM_STEP_PLATES.find((row) => row.unitId === unitId);
  if (!step) return null;
  const stem = step.stem.toLowerCase();
  const byFile = uniformSlides.find((slide) => slide.file.replace(/\.[^.]+$/, "").toLowerCase() === stem);
  if (byFile) return byFile;
  const meta = PLATE_FILE[stem];
  if (!meta) return null;
  const month = meta.y * 12 + (meta.m - 1);
  return uniformSlideAt(month, look) ?? uniformSlideAt(month, meta.look) ?? uniformSlideAt(month, "blue");
}

/** Schools / NECs / milestones that fall inside a command tour window. */
function inTour(when: string | null | undefined, start: string | null | undefined, end: string | null | undefined): boolean {
  const key = dateKey(when);
  if (!key) return false;
  const a = dateKey(start);
  if (!a) return false;
  const endRaw = end ? (end.length === 4 ? `${end}-12-31` : end) : "9999-12-31";
  const b = dateKey(endRaw);
  return a <= key && key <= b;
}

function schoolsForCommand(stop: Stop, unit: Unit | undefined, when: string): School[] {
  if (!unit?.start) return schoolsForBeat(stop, when);
  const placeIds = new Set([stop.place.id, stop.cityId, stop.baseId, unit.placeId].filter(Boolean) as string[]);
  return schools.filter((school) => {
    const pinned = schoolCommandId(school);
    if (pinned) return pinned === unit.id;
    const overlapsTour = inTour(school.start, unit.start, unit.end) || inTour(school.end ?? school.start, unit.start, unit.end);
    const samePlace = Boolean(school.placeId && placeIds.has(school.placeId));
    if (samePlace) return overlapsTour || !school.start;
    return overlapsTour;
  });
}

function necsForCommand(unit: Unit | undefined, when: string): Nec[] {
  if (!unit?.start) return necsForBeat(when).filter((nec) => !nec.gainedAt);
  return necs.filter((nec) => (nec.gainedAt ? nec.gainedAt === unit.id : Boolean(nec.awarded && inTour(nec.awarded, unit.start, unit.end))));
}

function milestonesForCommand(unit: Unit | undefined, when: string): Milestone[] {
  if (!unit?.start) return milestonesForBeat(when);
  return milestones.filter((row) => inTour(row.date, unit.start, unit.end));
}

function ranksForCommand(unit: Unit | undefined, plate: CommandPlate | null): Rank[] {
  const out: Rank[] = [];
  const seen = new Set<string>();
  const add = (id: string | null | undefined) => {
    if (!id || seen.has(id)) return;
    const rank = ranks.find((row) => row.id === id);
    if (!rank) return;
    seen.add(id);
    out.push(rank);
  };
  if (plate) {
    add(plate.inRank);
    add(plate.outRank);
  }
  if (unit?.start) {
    for (const rank of ranks) {
      if (rank.date && inTour(rank.date, unit.start, unit.end)) add(rank.id);
    }
  }
  return out;
}

function unitsForCommandBeat(stop: Stop, plate: CommandPlate | null): LogbookUnitChip[] {
  const out: LogbookUnitChip[] = [];
  const seen = new Set<string>();
  const add = (unit: Unit | undefined) => {
    if (!unit || seen.has(unit.id)) return;
    seen.add(unit.id);
    out.push(unitChip(unit));
  };
  if (stop.commandId) add(unitById(stop.commandId));
  if (plate) add(unitById(plate.unitId));
  if (plate?.extras) {
    for (const extra of plate.extras) {
      // A role on the plate (e.g. "TAD", "Partner · Cobra Gold") puts the unit on the crests, even a Map-excluded
      // partner; the Map never reads these chips.
      if (extra.role) {
        // unitId points a crest at its own unit record when kind/id link elsewhere (the Commands page keeps kind/id).
        const unit = extra.unitId ? unitById(extra.unitId) : extra.kind === "unit" ? unitById(extra.id) : undefined;
        if (unit && !seen.has(unit.id)) {
          add(unit);
          out[out.length - 1].designator = extra.role;
          out[out.length - 1].image = extra.src || out[out.length - 1].image;
        } else if (!unit || seen.has(unit.id)) {
          const key = `plate:${extra.unit}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ id: key, name: extra.unit, abbreviation: extra.unit, image: extra.src || null, designator: extra.role, plateOnly: true });
        }
        continue;
      }
      if (extra.kind !== "unit") continue;
      if (MAP_EXCLUDED_UNIT_IDS.has(extra.id)) continue;
      add(unitById(extra.id));
    }
  }
  return out;
}

/**
 * One scroll beat per assigned command that has a ready uniform/command plate.
 * Map page keeps the full place sequence; Logbook does not.
 * Tortuga/Essex stay off until plates exist in command-plates.json.
 */
export function logbookBeats(): LogbookBeat[] {
  const plateIds = new Set(commandPlates.map((row) => row.unitId));
  const pipeline = new Set<string>(LOGBOOK_PIPELINE_UNIT_IDS);
  // Assigned commands are their "command" pins; the pipeline / TAD commands (RTC, USS Tortuga, NTC) are sequence pins
  // of another kind. NTC appears twice in sequence.json (before and after the Tortuga TAD): its later pin is kept, so the
  // order follows units.json dates (RTC Jun–Sep 1997, Tortuga 1997–98, NTC 1998 – Dec 1998).
  const picked = new Map<string, Stop>();
  for (const stop of careerStops()) {
    if (!stop.commandId || !plateIds.has(stop.commandId)) continue;
    if (stop.kind === "command" ? pipeline.has(stop.commandId) : !pipeline.has(stop.commandId)) continue;
    if (stop.kind === "command" && picked.has(stop.commandId)) continue;
    picked.delete(stop.commandId);
    picked.set(stop.commandId, stop);
  }
  const order = LOGBOOK_UNIT_IDS as readonly string[];
  const commandStops = [...picked.values()].sort((a, b) => order.indexOf(a.commandId!) - order.indexOf(b.commandId!));
  return commandStops.map((raw, index) => {
    const stop: Stop = { ...raw, n: index + 1 };
    const command = stop.commandId ? unitById(stop.commandId) : undefined;
    const when = stop.when || command?.start || profile.serviceStart || "1997-06-30";
    // Prefer out-plate timing (end of tour) so the sticky uniform matches the ready snapshot.
    const plateWhen = command?.end || when;
    const month = monthKey(plateWhen) ?? monthKey(when);
    const plate = commandPlates.find((row) => row.unitId === stop.commandId) ?? plateForStop(stop, when);
    const outRank = plate ? ranks.find((row) => row.id === plate.outRank) ?? null : null;
    const rank = outRank ?? rankAt(plateWhen) ?? rankAt(when);
    const look = lookForRank(rank);
    const uniform =
      (stop.commandId ? uniformForPlateUnit(stop.commandId, look) : null) ??
      (month != null ? uniformSlideAt(month, look) ?? uniformSlideAt(month, "blue") : null) ??
      firstUniformSlide(look) ??
      firstUniformSlide("blue");
    const rack = plate ? plateAwards(plate.rack) : [];
    const schoolRows = schoolsForCommand(stop, command, when);
    const necRows = necsForCommand(command, when);
    const mileRows = milestonesForCommand(command, when);
    const admin: LogbookAdminFact[] = [
      ...ranksForCommand(command, plate).map((row) => ({
        kind: "rank" as const,
        id: row.id,
        label: row.abbreviation,
        detail: [row.name, row.date ? formatWhen(row.date) : ""].filter(Boolean).join(" · "),
      })),
      ...schoolRows.map((school) => ({
        kind: "school" as const,
        id: school.id,
        label: school.abbreviation || school.name,
        detail: [school.name, school.start ? formatSpan(school.start, school.end ?? null) : ""].filter(Boolean).join(" · "),
      })),
      ...necRows.map((nec) => ({
        kind: "nec" as const,
        id: nec.id,
        label: `NEC ${nec.code}`,
        detail: [nec.name, nec.awarded ? formatWhen(nec.awarded) : ""].filter(Boolean).join(" · "),
      })),
      ...mileRows.map((row) => ({
        kind: "milestone" as const,
        id: row.id,
        label: row.short || row.title,
        detail: row.title,
      })),
    ];
    const lines = [
      command?.abbreviation ?? stop.labels[0],
      [stop.place.name, command ? formatSpan(command.start, command.end) : stop.when ? (stop.when.length === 4 ? stop.when : formatWhen(stop.when)) : null]
        .filter(Boolean)
        .join(" · "),
      command?.designator ? command.designator : null,
      command?.name && command.name !== command.abbreviation ? command.name : null,
      rank ? `${rank.abbreviation} · ${rank.name}` : null,
    ].filter((line): line is string => Boolean(line && line.trim()));
    return {
      index,
      stop,
      when: plateWhen,
      month,
      rank,
      uniform,
      plate,
      rack,
      pinsAbove: plate?.pinsAbove ?? [],
      pinsBelow: plate?.pinsBelow ?? [],
      units: unitsForCommandBeat(stop, plate),
      admin,
      lines,
    };
  });
}

/** True when a unit crest must stay off the Logbook map inset. */
export function isMapExcludedUnit(unitId: string): boolean {
  return MAP_EXCLUDED_UNIT_IDS.has(unitId);
}


let pinNumbers: Map<string, number[]> | undefined;
/** The map-pin number(s) of a place, matching the Map tab's pins and list. Empty if the place is not a stop. */
export function pinNumbersFor(placeId: string): number[] {
  if (!pinNumbers) {
    pinNumbers = new Map();
    for (const stop of careerStops()) {
      for (const id of [stop.place.id, stop.cityId, stop.baseId].filter(Boolean) as string[]) {
        pinNumbers.set(id, [...(pinNumbers.get(id) ?? []), stop.n]);
      }
    }
  }
  return pinNumbers.get(placeId) ?? [];
}

export type AwardInstanceView = {
  id: string;
  year: number | null;
  unitId: string | null;
  operationId: string | null;
  note: string | null;
  title: string;
  detail: string;
};

export type SubjectView = {
  kind: Kind;
  id: string;
  kicker: string;
  title: string;
  explanation: string;
  criteria?: string;
  facts: { label: string; value: string }[];
  instances?: AwardInstanceView[];
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

const USED_ORDER = ["uniform", "armor", "helmets", "weapons", "comms", "vehicles", "ships", "aircraft", "cars", "motorcycles", "cities", "residences"];

export function usedHereFor(subjectId: string): UsedItem[] {
  const items: UsedItem[] = [];
  for (const id of usedHere[subjectId] ?? []) {
    const uniform = uniforms.find((entry) => entry.id === id);
    if (uniform) {
      items.push({ kind: "uniform", id, name: uniform.name, image: uniform.image, group: "uniform" });
      continue;
    }
    const item = equipment.find((entry) => entry.id === id);
    if (item) items.push({ kind: "equipment", id, name: displayEquipmentName(item), image: item.image, group: item.group });
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
  if (link.kind === "certificate") return byId(certificates, link.id)?.name ?? null;
  if (link.kind === "equipment") return byId(equipment, link.id)?.name ?? null;
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

  if (sel.kind === "branch") {
    const branches: Record<string, { title: string; established: string; strength: string; history: string; recruit: string; recruitLabel: string; seal: string }> = {
      army: {
        title: "United States Army",
        seal: "/incoming/Emblem_of_the_United_States_Department_of_the_Army.svg",
        established: "14 June 1775",
        strength: "454,000",
        history: "The land service. The Continental Congress established the Army on 14 June 1775. It is the senior service and the ground component of the joint force.",
        recruit: "https://www.goarmy.com/",
        recruitLabel: "goarmy.com",
      },
      marines: {
        title: "United States Marine Corps",
        seal: "/incoming/Emblem_of_the_United_States_Marine_Corps.svg",
        established: "10 November 1775",
        strength: "172,300",
        history: "The naval expeditionary force. Established 10 November 1775. Marines serve as a separate service inside the Department of the Navy.",
        recruit: "https://www.marines.com/",
        recruitLabel: "marines.com",
      },
      navy: {
        title: "United States Navy",
        seal: "/incoming/Seal_of_the_United_States_Department_of_the_Navy.svg",
        established: "13 October 1775",
        strength: "344,600",
        history: "The sea service. The Continental Congress established the Navy on 13 October 1775. Ships, submarines, and aircraft are its force.",
        recruit: "https://www.navy.com/",
        recruitLabel: "navy.com",
      },
      "air-force": {
        title: "United States Air Force",
        seal: "/incoming/U.S._Air_Force_service_mark.svg",
        established: "18 September 1947",
        strength: "321,500",
        history: "The air service. It became a separate service on 18 September 1947, from the Army Air Forces. Air and space power were its charge until the Space Force stood up in 2019.",
        recruit: "https://www.airforce.com/",
        recruitLabel: "airforce.com",
      },
    };
    const branch = branches[sel.id];
    if (!branch) return null;
    return {
      kind: "branch",
      id: sel.id,
      kicker: "Service",
      title: branch.title,
      explanation: branch.history,
      facts: [
        { label: "Established", value: branch.established },
        { label: "FY2026 authorized active strength", value: branch.strength },
        { label: "Recruiting", value: branch.recruitLabel },
      ],
      placeIds: [],
      related: [],
      hero: { type: "image", src: branch.seal, alt: `${branch.title} seal`, shape: "square" },
    };
  }

  if (sel.kind === "photo") {
    const photo = byId(photos, sel.id);
    if (!photo) return null;
    return {
      kind: "photo",
      id: photo.id,
      kicker: "Photograph",
      title: photo.caption,
      explanation: photo.alt,
      facts: [],
      placeIds: [],
      related: photo.subjects.flatMap((entry) => {
        const label = linkLabel({ kind: entry.kind, id: entry.id });
        return label ? [rel(entry.kind, entry.id, label)] : [];
      }),
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
      instances: rows.map((raw, index) => {
        const row = patchedInstance(raw);
        return {
          id: row.id,
          year: row.year,
          unitId: row.unitId,
          operationId: row.operationId,
          note: row.note,
          title: row.year ? String(row.year) : `Award ${index + 1}`,
          detail: [
            row.year ? null : "Year not entered",
            unitById(row.unitId)?.abbreviation,
            byId(operations, row.operationId)?.phase,
            row.note,
          ].filter(Boolean).join(" · "),
        };
      }),
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
        ...(unit.workcenter ? [{ label: "Workcenter", value: unit.workcenter }] : []),
        ...supplementFacts("unit", unit.id),
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
      title: opChipTitle(op),
      explanation: op.explanation,
      facts: [
        { label: "Phase", value: op.phase },
        { label: "When", value: formatSpan(op.start, op.end) },
        ...supplementFacts("operation", op.id),
      ],
      placeIds: opBases.length ? opBases.map((place) => place.id) : op.placeId ? [op.placeId] : [],
      related: [
        ...(unit ? [rel("unit", unit.id, unit.name)] : []),
        ...(op.placeId ? [rel("place", op.placeId, placeById(op.placeId)?.name ?? "Place")] : []),
        ...opBases.map((place) => rel("place", place.id, place.name)),
      ],
      usedHere: usedHereFor(op.id).length ? usedHereFor(op.id) : usedHereFor(op.unitId),
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
      title: item.fullName ?? displayEquipmentName(item),
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
      hero: item.image ? { type: "image", src: item.image, alt: item.caption ? `${item.name}: ${item.caption}` : item.name, shape: item.cutout ? "landscape" : "photo" } : undefined,
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
    const endDate = next?.date ?? profile.serviceEnd;
    const tir = timeInRate(item.date, endDate);
    const facts = [
      { label: "Pay grade", value: `${item.grade} · ${item.abbreviation}` },
      {
        label: "Date of Rate",
        value: item.date ? `${formatWhen(item.date)}${dayPrecision(item.date) ? "" : " (day not recorded)"}` : "Date needed",
      },
      { label: "Time in Rate", value: tir ?? "Not computable (date missing)" },
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
      hero: item.image ? { type: "image", src: item.image, alt: `${item.name} (${item.abbreviation}) insignia`, shape: item.id === "sn" ? "square" : "tall" } : undefined,
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

  if (sel.kind === "certificate") {
    const certificate = byId(certificates, sel.id);
    if (!certificate) return null;
    return {
      kind: "certificate",
      id: certificate.id,
      kicker: "Unofficial certificate",
      title: certificate.name,
      explanation: certificate.explanation,
      facts: [{ label: "Worn", value: "Not worn. This is not a decoration on the rack." }],
      placeIds: [],
      related: [],
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
      kicker: (pinNumbersFor(place.id).length ? `Map pin ${pinNumbersFor(place.id).join(", ")} · ` : "") + (place.type === "city"
        ? (place.accuracy === "approximate" ? "City · approximate location" : "City")
        : place.type === "visit"
        ? (visits.some((visit) => visit.placeId === place.id) && visits.filter((visit) => visit.placeId === place.id).every((visit) => visit.kind === "transit") ? "Transit / stopover" : "Visit, exercise or school") +
          (place.accuracy === "approximate" ? " · approximate location" : "")
        : place.type === "base"
        ? place.accuracy === "approximate" ? "Base or field site · approximate location" : "Base or field site"
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
  return photos.filter((photo) => photo.subjects.some((entry) => entry.kind === kind && entry.id === id));
}

export function reflectionFor(kind: Kind, id: string): string | null {
  const found = reflections.find((item) => item.kind === kind && item.subjectId === id);
  const text = found?.text?.trim();
  return text ? text : null;
}

/* ---------- Logbook side column: Uniforms / On Duty / Off Duty, all from src/data ---------- */

const LOGBOOK_DUTY_GROUPS: EquipmentGroup[] = ["armor", "helmets", "weapons", "comms", "vehicles", "ships", "aircraft"];
const LOGBOOK_OFF_GROUPS: EquipmentGroup[] = ["cars", "motorcycles", "residences", "cities"];
/** C-5 and C-9 are off duty on the AS-40 tour (same rule as the On Duty / Off Duty pages). */
const LOGBOOK_OFF_DUTY_AIRCRAFT = new Set(["c-5", "c-9"]);

/** Per-command card order (Sergio): these ids lead their group, in this order; everything else keeps its usual order after them. */
const COMMAND_GEAR_FIRST: Record<string, string[]> = {
  navhosp: ["mitsubishi-outlander", "chevy-spark-white"],
  eodmu5: ["nissan-sentra-red"],
};

function equipmentForCommand(unitId: string): Equipment[] {
  const ids = new Set(usedHere[unitId] ?? []);
  const first = COMMAND_GEAR_FIRST[unitId] ?? [];
  const lead = (item: Equipment) => {
    const at = first.indexOf(item.id);
    return at < 0 ? first.length : at;
  };
  return equipment
    .filter((item) => (item as Equipment & { unitId?: string }).unitId === unitId || ids.has(item.id))
    .sort((a, b) => {
      const ga = EQUIPMENT_GROUPS.findIndex((g) => g.id === a.group);
      const gb = EQUIPMENT_GROUPS.findIndex((g) => g.id === b.group);
      return ga - gb || lead(a) - lead(b) || a.order - b.order;
    });
}

export type LogbookGearGroup = { id: EquipmentGroup; label: string; items: Equipment[] };

function groupGear(items: Equipment[]): LogbookGearGroup[] {
  return EQUIPMENT_GROUPS.map((group) => ({ id: group.id, label: group.label, items: items.filter((item) => item.group === group.id) })).filter(
    (group) => group.items.length,
  );
}

/** Duty gear recorded for a command (equipment.json + used-here.json). */
export function onDutyForCommand(unitId: string | null | undefined): LogbookGearGroup[] {
  if (!unitId) return [];
  return groupGear(
    equipmentForCommand(unitId).filter((item) => LOGBOOK_DUTY_GROUPS.includes(item.group) && !LOGBOOK_OFF_DUTY_AIRCRAFT.has(item.id)),
  );
}

/** Off-duty cars, motorcycles, residences, cities (and the AS-40 C-5/C-9 hops) recorded for a command. */
export function offDutyForCommand(unitId: string | null | undefined): LogbookGearGroup[] {
  if (!unitId) return [];
  return groupGear(
    equipmentForCommand(unitId).filter((item) => LOGBOOK_OFF_GROUPS.includes(item.group) || LOGBOOK_OFF_DUTY_AIRCRAFT.has(item.id)),
  );
}

/** Ready uniform plates for a command (e.g. NCTS → e5 blues / whites; JCSE → e6-4 plus the e7-jcse CPO set; NAVHOSP → e7-nh). */
export function uniformPlatesForCommand(unitId: string | null | undefined): UniformSlide[] {
  if (!unitId) return [];
  const sets = LOGBOOK_PLATE_SETS[unitId];
  if (!sets) return [];
  return uniformSlides.filter((slide) => sets.includes(plateGroup(slide.file)));
}

export type WardrobeItem = { uniform: Uniform; via: string[] };

/** A chief's uniform (E7 khaki / whites / dress): never shown before the first E-7 date of rank. */
export function isChiefUniform(uniform: Pick<Uniform, "id" | "context">): boolean {
  return uniform.id.startsWith("cpo-") || /chief petty officer|after promotion/i.test(uniform.context ?? "");
}

/**
 * Logbook Wardrobe: every uniform used-here.json lists for this command, its own deployed / assisting /
 * parent units, and the operations those units ran (operations.json unitId). Ordered as uniforms.json.
 * Chief uniforms are dropped unless the beat's rank (as of the end of the command) is E-7 or above.
 * Nothing is inferred: a uniform not listed in used-here.json for these subjects does not appear.
 */
export function wardrobeForBeat(beat: LogbookBeat): { items: WardrobeItem[]; withheld: Uniform[] } {
  const commandId = beat.stop.commandId;
  if (!commandId) return { items: [], withheld: [] };
  const unitIds = [commandId, ...beat.units.map((unit) => unit.id).filter((id) => id !== commandId)];
  const subjects: { id: string; label: string | null }[] = unitIds.map((id) => ({
    id,
    label: id === commandId ? null : (unitById(id)?.abbreviation ?? id),
  }));
  for (const op of operations) {
    if (op.unitId && unitIds.includes(op.unitId)) {
      subjects.push({ id: op.id, label: unitById(op.unitId)?.abbreviation ?? op.unitId });
    }
  }
  const via = new Map<string, Set<string>>();
  const own = new Set<string>();
  for (const subject of subjects) {
    for (const id of usedHere[subject.id] ?? []) {
      if (!uniforms.some((uniform) => uniform.id === id)) continue;
      if (!via.has(id)) via.set(id, new Set());
      if (subject.label) via.get(id)!.add(subject.label);
      else own.add(id);
    }
  }
  const chief = Number((beat.rank?.grade ?? "").replace(/\D/g, "")) >= 7;
  const listed = uniforms.filter((uniform) => via.has(uniform.id)).sort((a, b) => a.order - b.order);
  const withheld = chief ? [] : listed.filter(isChiefUniform);
  const items = listed
    .filter((uniform) => chief || !isChiefUniform(uniform))
    .map((uniform) => ({ uniform, via: own.has(uniform.id) ? [] : [...via.get(uniform.id)!] }));
  return { items, withheld };
}

/** uniforms.json entries whose recorded context names this command. */
export function uniformsNamingCommand(unitId: string | null | undefined) {
  const unit = unitId ? units.find((row) => row.id === unitId) : undefined;
  if (!unit) return [];
  return uniforms.filter((uniform) => (uniform.context ?? "").includes(unit.name));
}

/**
 * Rank path for one Logbook command. Arrival and transfer ranks come from command-plates.json (inRank / outRank);
 * the promotions shown are the ranks.json steps after the arrival rank through the transfer rank, with their dates.
 * A promotion in the school pipeline before reporting (e.g. ET3, Dec 1998, before NCTS) is therefore not a
 * promotion at that command. Without a plate, falls back to ranks.json dates against the tour window.
 */
export function logbookRankPath(beats: LogbookBeat[], index: number): { arrival: Rank | null; promotions: Rank[] } {
  const beat = beats[index];
  const plate = beat ? commandPlates.find((row) => row.unitId === beat.stop.commandId) : undefined;
  const order = ranks.map((rank) => rank.id);
  if (plate) {
    const from = order.indexOf(plate.inRank);
    const to = order.indexOf(plate.outRank);
    const arrival = ranks[from] ?? null;
    if (from < 0 || to < 0 || to <= from) return { arrival: arrival ?? beat?.rank ?? null, promotions: [] };
    return { arrival, promotions: ranks.slice(from + 1, to + 1) };
  }
  const endKey = (row: LogbookBeat | undefined) => {
    const unit = row?.stop.commandId ? unitById(row.stop.commandId) : undefined;
    const raw = unit?.end ? (unit.end.length === 4 ? `${unit.end}-12-31` : unit.end) : "";
    return dateKey(raw);
  };
  const dated = ranks.filter((rank) => rank.date).sort((x, y) => dateKey(x.date).localeCompare(dateKey(y.date)));
  const to = endKey(beat);
  if (!to || !dated.length) return { arrival: beat?.rank ?? null, promotions: [] };
  const from = index > 0 ? endKey(beats[index - 1]) : dateKey(dated[0].date);
  const promotions = dated.filter((rank) => dateKey(rank.date) > from && dateKey(rank.date) <= to);
  const before = dated.filter((rank) => dateKey(rank.date) <= from);
  return { arrival: before.at(-1) ?? null, promotions };
}

/** Logbook Admin tab: NECs held and schools completed as of the end of a command (from necs.json / schools.json). */
export function logbookAdminAsOf(beat: LogbookBeat): {
  necsHeld: { nec: Nec; isNew: boolean; gained: boolean }[];
  schoolsThisTour: School[];
} {
  const unit = beat.stop.commandId ? unitById(beat.stop.commandId) : undefined;
  const tourNecIds = new Set(beat.admin.filter((fact) => fact.kind === "nec").map((fact) => fact.id));
  const tourSchoolIds = new Set(beat.admin.filter((fact) => fact.kind === "school").map((fact) => fact.id));
  // Not cumulative (Sergio): the billet NEC line (units.json necId) plus the NECs GAINED during this command.
  // gainedAt in necs.json pins the command outright; otherwise a date that fits two year-precision tours
  // counts at the first Logbook command whose tour holds it.
  const billetId = unit?.necId ?? null;
  const order = LOGBOOK_UNIT_IDS as readonly string[];
  const here = order.indexOf(beat.stop.commandId ?? "");
  const earlier = order.slice(0, Math.max(0, here)).map((id) => unitById(id)).filter(Boolean) as Unit[];
  const gainedEarlier = (nec: Nec) =>
    !nec.gainedAt && Boolean(nec.awarded) && earlier.some((row) => row.start && inTour(nec.awarded!, row.start, row.end));
  const gained = necs.filter((nec) => tourNecIds.has(nec.id) && nec.id !== "nec-0000" && !gainedEarlier(nec));
  const billet = billetId ? necById(billetId) : undefined;
  // The billet line comes first; when the billet NEC was also gained here (EODMU 5's 1460) it carries both marks.
  const necsHeld = [
    ...(billet ? [{ nec: billet, isNew: true, gained: gained.some((nec) => nec.id === billet.id) }] : []),
    ...gained
      .filter((nec) => nec.id !== billetId)
      .sort((x, y) => dateKey(x.awarded).localeCompare(dateKey(y.awarded)))
      .map((nec) => ({ nec, isNew: false, gained: true })),
  ];
  const byDate = (a: School, b: School) => dateKey(a.start).localeCompare(dateKey(b.start));
  // Dedupe: a school that awarded an NEC shown here is listed under that NEC, not again as a school.
  const viaNec = new Set(necsHeld.flatMap(({ nec }) => nec.schoolIds ?? []));
  const schoolsThisTour = schools.filter((school) => tourSchoolIds.has(school.id) && !viaNec.has(school.id)).sort(byDate);
  return { necsHeld, schoolsThisTour };
}

/* ---------- Logbook On Duty: deployment body armor + helmets (deployment-gear.json) ---------- */
/** equipmentId: the On Duty card (equipment.json) for this armor / helmet. */
type GearName = { short: string; name: string; equipmentId?: string };
type DeploymentGearFile = {
  deployments: { unitId: string; label: string; bodyArmor: GearName | null; helmet: GearName | null; pattern?: string; attachedTo?: string[]; note?: string }[];
};
const deploymentGear = deploymentGearJson as DeploymentGearFile;

export type GearCard = { id: string; label: string; name: string; image: string | null };
/** equipment.json card for a deployment-gear.json entry (short label on the card, full name in the sidebar). */
export function gearCard(gear: GearName | null | undefined): GearCard | null {
  if (!gear) return null;
  const item = gear.equipmentId ? equipment.find((row) => row.id === gear.equipmentId) : undefined;
  if (!item) return null;
  return { id: item.id, label: gear.short, name: item.fullName ?? gear.name, image: item.image || null };
}
export const DEPLOYMENT_GEAR_IDS = new Set(["deploy-otv", "deploy-iotv", "deploy-ach", "deploy-ech"]);

export type LogbookDeployment = {
  unitId: string;
  label: string;
  unitName: string;
  unitAbbreviation: string;
  span: string;
  theater: string | null;
  bodyArmor: GearName | null;
  /** Helmet worn on this deployment (Sergio, Oct 6, 2026). */
  helmet: GearName | null;
  /** Camouflage pattern of the armor / helmet cover on this deployment (DCU, ACU (UCP), MultiCam). */
  pattern: string | null;
  /** Units the deployment was attached to (OIF II: 11th ADA, 3-3 ADA), as abbreviations. */
  attachedTo: string[];
  note: string | null;
};

/** Deployments that fall inside a command's tour (by the deployment unit's dates), with their recorded armor and helmets. */
export function deploymentsForCommand(unitId: string | null | undefined): LogbookDeployment[] {
  const command = unitId ? units.find((row) => row.id === unitId) : undefined;
  if (!command?.start) return [];
  return deploymentGear.deployments.flatMap((row) => {
    const unit = units.find((u) => u.id === row.unitId);
    if (!unit?.start || !inTour(unit.start, command.start, command.end)) return [];
    const op = operations.find((o) => (o as { unitId?: string }).unitId === row.unitId);
    return [{
      unitId: row.unitId,
      label: row.label,
      unitName: unit.name,
      unitAbbreviation: unit.abbreviation,
      span: formatSpan(unit.start, unit.end),
      theater: (op as { theater?: string } | undefined)?.theater ?? null,
      bodyArmor: row.bodyArmor,
      helmet: row.helmet,
      pattern: row.pattern ?? null,
      attachedTo: (row.attachedTo ?? []).map((id) => units.find((u) => u.id === id)?.abbreviation ?? id),
      note: row.note ?? null,
    }];
  });
}

/* ---------- Logbook Admin: collateral duties and watch stations (command-duties.json) ---------- */
export type CommandDuty = { label: string; abbreviation?: string };
export type CommandDuties = { titles: CommandDuty[]; departments: CommandDuty[]; divisions: CommandDuty[]; collateralDuties: CommandDuty[]; watches: CommandDuty[] };
export function commandDutiesFor(unitId: string | null | undefined): CommandDuties {
  const row = unitId ? (commandDutiesJson as unknown as Record<string, Partial<CommandDuties> | string>)[unitId] : undefined;
  if (!row || typeof row === "string") return { titles: [], departments: [], divisions: [], collateralDuties: [], watches: [] };
  return { titles: row.titles ?? [], departments: row.departments ?? [], divisions: row.divisions ?? [], collateralDuties: row.collateralDuties ?? [], watches: row.watches ?? [] };
}

/* ---------- Rank drawer: Date of Rate and Time in Rate from ranks.json (never invents a day) ---------- */
const dayPrecision = (date: string | null | undefined) => /^\d{4}-\d{2}-\d{2}$/.test(date ?? "");
/** Time from this date of rate to the next one (or retirement), in months, or years + months from one year up.
 *  "~" when either date is recorded to the month (or year) only; the day is never invented. */
export function timeInRate(from: string | null | undefined, to: string | null | undefined): string | null {
  const parse = (d: string) => /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d);
  const a = from ? parse(from) : null;
  const b = to ? parse(to) : null;
  if (!a || !b) return null;
  const exact = Boolean(a[3] && b[3]);
  let months = (Number(b[1]) - Number(a[1])) * 12 + (Number(b[2] ?? 1) - Number(a[2] ?? 1));
  if (exact && Number(b[3]) < Number(a[3])) months -= 1;
  months = Math.max(0, months);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const text = years ? `${plural(years, "year")}${rest ? `, ${plural(rest, "month")}` : ""}` : plural(rest, "month");
  return exact ? text : `~${text}`;
}

/* ---------- POV labels: Make + Model + color; year stays in the data only (Sergio, Oct 2026: Sentras need Red/Grey). ---------- */
const POV_GROUPS = new Set(["cars", "motorcycles"]);
const POV_YEAR = /,\s*(?:19|20)\d{2}(?:\s+or\s+(?:19|20)\d{2})?$/i;
/** "Nissan Sentra, red, 1991" → "Nissan Sentra, red"; "Chevy Spark, white" → "Chevy Spark, white". */
export function povLabel(name: string): string {
  return name.replace(POV_YEAR, "").trim() || name;
}
export const isPovGroup = (group: string) => POV_GROUPS.has(group);
export const displayEquipmentName = (item: { group: string; name: string }) => (isPovGroup(item.group) ? povLabel(item.name) : item.name);

/* ---------- Logbook: official name, purpose and short history per command (command-profiles.json, sourced) ---------- */
export type CommandProfile = {
  unitId: string;
  officialName: string;
  purpose: string;
  history: string;
  sources: { label: string; url: string }[];
  sourceNote?: string;
};
const commandProfiles = commandProfilesJson as CommandProfile[];
export function commandProfileFor(unitId: string | null | undefined): CommandProfile | undefined {
  return unitId ? commandProfiles.find((row) => row.unitId === unitId) : undefined;
}
