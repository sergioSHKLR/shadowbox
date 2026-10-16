/**
 * Gallery (Oct 16 2026): every real photo on the site, with Command / Operation / City tags derived from the data.
 *
 * Sources
 *  - photos.json: Sergio's own photos (portraits, deployment shots, the *-wear uniform photos).
 *  - equipment.json photo crops credited to Sergio himself (his C-5, C-9, C-130 and C-17 shots). Stock, Wikimedia and
 *    DVIDS photos stay on their own pages but are not in the Gallery (Sergio, Oct 16 2026). Cut-outs on white (`cutout: true`), the
 *    mannequin renders, crests, ribbons and drawings are art, not photos, so they stay out.
 *  - Memories are not included: they live only in the visitor's own browser.
 *
 * Tags (nothing is invented; every tag traces to a record)
 *  - Command: photos.json `unit` subjects; equipment `unitId`; used-here.json lists (command -> items used there).
 *  - Operation: photos.json `operation` subjects; used-here.json operation lists; and a command whose record IS the
 *    deployment (operations.json `unitId`, e.g. CJTF Troy -> OIF 2006), both ways.
 *  - A photo of Sergio's with no command or operation subject: if used-here.json records every one of its gear and
 *    uniform subjects at one and the same command (or operation), and no other in common, it takes that tag.
 *    Commands and operations are judged separately; when two or more remain in common (e.g. multicam -> OEF 2010
 *    and OEF 2012) that group stays untagged.
 *  - City: only a city or residence photo (places.json, else the record's name). Commands do not give a city: a unit's
 *    home base says nothing about where a given photo was taken (EODMU 5 photos are from Guam and from Iraq).
 *  - Date: an ISO date in the photo id (e.g. m4-rack-2006-03-18), else a full date or a year in the caption.
 */
import sequenceJson from "@/data/sequence.json";
import usedHereJson from "@/data/used-here.json";
import { equipment, operations, photos, places, publicUrl, units } from "@/lib/shadowbox/model";

export type TagGroup = "command" | "operation" | "city";
export type GalleryTag = { group: TagGroup; id: string; label: string; title: string };
export type TagSource = { tag: string; from: string };
export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  sub?: string;
  date?: string;
  credit?: { text: string; href?: string };
  origin: "photo" | "equipment";
  tags: GalleryTag[];
  sources: TagSource[];
};

const sequence = sequenceJson as { baseId: string | null; cityId: string | null }[];
const usedHere = usedHereJson as Record<string, string[]>;
const unitById = new Map(units.map((u) => [u.id, u]));
const opById = new Map(operations.map((o) => [o.id, o]));
const placeById = new Map(places.map((p) => [p.id, p]));

/** "Operation Iraqi Freedom" + 2008-10 -> "OIF 2008". */
function opShort(id: string): string {
  const o = opById.get(id);
  if (!o) return id;
  const initials = o.name.split(/\s+/).map((w) => w[0]).join("").toUpperCase();
  return `${initials} ${o.start.slice(0, 4)}`;
}
const commandTag = (id: string): GalleryTag | null => {
  const u = unitById.get(id);
  return u ? { group: "command", id, label: u.abbreviation, title: u.name } : null;
};
const opTag = (id: string): GalleryTag | null => {
  const o = opById.get(id);
  return o ? { group: "operation", id, label: opShort(id), title: `${o.name}, ${o.phase}` } : null;
};
const cityTagFromPlace = (placeId: string | null | undefined): GalleryTag | null => {
  if (!placeId) return null;
  const p = placeById.get(placeId);
  if (!p) return null;
  const cityId = p.type === "city" ? p.id : sequence.find((s) => s.baseId === placeId && s.cityId)?.cityId;
  const c = cityId ? placeById.get(cityId) : null;
  return c ? { group: "city", id: c.id, label: c.name, title: c.name } : null;
};
/** Operations whose deployment record names this command. */
const opsOfUnit = (unitId: string) => operations.filter((o) => o.unitId === unitId).map((o) => o.id);
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function dateOf(id: string, caption: string): string | undefined {
  const iso = /(\d{4}-\d{2}-\d{2})/.exec(id)?.[1];
  if (iso) return iso;
  const full = /\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})\b/i.exec(caption);
  if (full) return `${full[3]}-${String(MONTHS.indexOf(full[2].toLowerCase()) + 1).padStart(2, "0")}-${full[1].padStart(2, "0")}`;
  return /\b(19[89]\d|20[0-2]\d)\b/.exec(caption)?.[1];
}
/** used-here.json keys (commands or operations) that list this item. */
const usedAt = (itemId: string) => Object.entries(usedHere).filter(([, ids]) => ids.includes(itemId)).map(([key]) => key).filter((k) => unitById.has(k) || opById.has(k));
const tagOfKey = (key: string) => (unitById.has(key) ? commandTag(key) : opTag(key));

function add(list: GalleryTag[], sources: TagSource[], tag: GalleryTag | null, from: string) {
  if (!tag || list.some((t) => t.group === tag.group && t.id === tag.id)) return;
  list.push(tag);
  sources.push({ tag: `${tag.group}:${tag.id}`, from });
}

const CITY_GROUPS = new Set(["cities", "residences"]);

function fromPhotos(): GalleryPhoto[] {
  return photos.map((p) => {
    const tags: GalleryTag[] = [];
    const sources: TagSource[] = [];
    const subs = p.subjects ?? [];
    for (const s of subs) if (s.kind === "unit") add(tags, sources, commandTag(s.id), "photos.json subject");
    for (const s of subs) if (s.kind === "operation") add(tags, sources, opTag(s.id), "photos.json subject");
    for (const s of subs) if (s.kind === "unit") for (const op of opsOfUnit(s.id)) add(tags, sources, opTag(op), `operations.json unitId (${s.id})`);
    for (const s of subs) if (s.kind === "operation") add(tags, sources, commandTag(opById.get(s.id)?.unitId ?? ""), `operations.json unitId (${s.id})`);
    for (const s of subs) {
      if (s.kind !== "equipment") continue;
      const e = equipment.find((x) => x.id === s.id);
      if (e && CITY_GROUPS.has(e.group)) add(tags, sources, cityTagFromPlace(e.id) ?? { group: "city", id: e.id, label: e.name, title: e.name }, "photos.json subject (city)");
    }
    if (!subs.some((s) => s.kind === "unit" || s.kind === "operation")) {
      // Commands and operations are judged separately, each with the other folded in (an operation counts as its
      // deployment command and vice versa), so a C-17 used with CJTF Troy and in both OEF tours stays untagged.
      const cmdsOf = (id: string) => [...new Set(usedAt(id).flatMap((k) => (unitById.has(k) ? [k] : [opById.get(k)?.unitId ?? ""])).filter(Boolean))];
      const opsOf = (id: string) => [...new Set(usedAt(id).flatMap((k) => (opById.has(k) ? [k] : opsOfUnit(k))))];
      for (const [of, isOp] of [[cmdsOf, false], [opsOf, true]] as const) {
        const sets = subs.map((s) => of(s.id)).filter((set) => set.length);
        const common = sets.length ? sets.reduce((a, b) => a.filter((k) => b.includes(k))) : [];
        if (common.length !== 1) continue;
        add(tags, sources, isOp ? opTag(common[0]) : commandTag(common[0]), `used-here.json (only ${common[0]} in common for ${subs.map((x) => x.id).join(" + ")})`);
      }
    }
    return { id: p.id, src: publicUrl(p.src), alt: p.alt, caption: p.caption, date: dateOf(p.id, p.caption), origin: "photo" as const, tags, sources };
  });
}

function creditOf(c: { sourceUrl: string; creator: string; license: string } | undefined) {
  if (!c) return undefined;
  if (!c.sourceUrl) return { text: c.creator ? `Photo: ${c.creator}` : "Photo" };
  const host = (() => { try { return new URL(c.sourceUrl).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  const where = host.includes("wikimedia") ? "Wikimedia Commons" : host.includes("dvidshub") ? "DVIDS" : host;
  return { text: [c.creator, where, c.license].filter(Boolean).join(" · "), href: c.sourceUrl };
}

function fromEquipment(): GalleryPhoto[] {
  return equipment
    // Sergio's own only (Oct 16 2026): credited to him, no stock / Wikimedia / DVIDS source.
    .filter((e) => e.image && !e.cutout && !e.image.includes("/cut/") && !e.credit?.sourceUrl && /schickler/i.test(e.credit?.creator ?? ""))
    .map((e) => {
      const tags: GalleryTag[] = [];
      const sources: TagSource[] = [];
      if (e.unitId) add(tags, sources, commandTag(e.unitId), "equipment.json unitId");
      for (const [key, ids] of Object.entries(usedHere)) {
        if (!ids.includes(e.id)) continue;
        if (unitById.has(key)) add(tags, sources, commandTag(key), "used-here.json");
        if (opById.has(key)) add(tags, sources, opTag(key), "used-here.json");
      }
      for (const t of [...tags]) {
        if (t.group === "command") for (const op of opsOfUnit(t.id)) add(tags, sources, opTag(op), `operations.json unitId (${t.id})`);
        if (t.group === "operation") add(tags, sources, commandTag(opById.get(t.id)?.unitId ?? ""), `operations.json unitId (${t.id})`);
      }
      if (CITY_GROUPS.has(e.group)) add(tags, sources, cityTagFromPlace(e.id) ?? { group: "city", id: e.id, label: e.name, title: e.name }, placeById.has(e.id) ? "places.json" : "equipment.json name");
      return {
        id: `eq-${e.id}`,
        src: publicUrl(e.image),
        alt: e.caption || e.name,
        caption: e.fullName || e.name,
        sub: e.caption || undefined,
        date: dateOf("", e.caption ?? ""),
        credit: creditOf(e.credit),
        origin: "equipment" as const,
        tags,
        sources,
      };
    });
}

export const galleryPhotos: GalleryPhoto[] = [...fromPhotos(), ...fromEquipment()];

const ORDER: TagGroup[] = ["command", "operation", "city"];
/** Chip lists per group, in service / time order for commands and operations, A-Z for cities. */
export function galleryTags(): Record<TagGroup, GalleryTag[]> {
  const out: Record<TagGroup, GalleryTag[]> = { command: [], operation: [], city: [] };
  for (const p of galleryPhotos) for (const t of p.tags) if (!out[t.group].some((x) => x.id === t.id)) out[t.group].push(t);
  const unitAt = (id: string) => (unitById.get(id)?.start ?? "9999") + id;
  out.command.sort((a, b) => unitAt(a.id).localeCompare(unitAt(b.id)));
  out.operation.sort((a, b) => (opById.get(a.id)?.start ?? "").localeCompare(opById.get(b.id)?.start ?? ""));
  out.city.sort((a, b) => a.label.localeCompare(b.label));
  return out;
}
export const TAG_GROUPS = ORDER;
