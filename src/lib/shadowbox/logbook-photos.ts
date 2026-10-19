/**
 * Logbook Photos tab (Sergio, Oct 19 2026): every Gallery photo tied to a Logbook command.
 *
 * Nothing is guessed; a photo joins a command only through a recorded link:
 *  1. A Gallery command tag (photos.json `unit` subjects, equipment unitId, used-here.json; see gallery.ts) for the
 *     command itself or for a unit that command-plates.json records on that command's plate (its deployments and
 *     partners: CJTF Troy and EODMU 11 -> EODMU 5, TF Iron Shield -> SERCC, CJSOTF-A and SOJTF-A -> JCSE).
 *  2. A photo with no command tag at all: its full date (YYYY-MM-DD) must fall inside exactly one command's tour
 *     (units.json start/end). A year-only date, a date on a tour boundary shared by two commands, or a date outside
 *     every tour (after retirement) maps nowhere; those are listed for Sergio, not placed.
 * On-hold photos never show, even if a record comes back before Sergio clears it; nor do the stock aircraft shots.
 */
import { galleryPhotos, type GalleryPhoto } from "@/lib/shadowbox/gallery";
import { commandPlates, logbookBeats, units, type LogbookBeat } from "@/lib/shadowbox/model";

/** Held for Sergio (Oct 18 2026; UNBLURRED #15, #25, #26-29) and the removed snow-tent photo: never shown. */
const ON_HOLD = ["img-05459", "img-00064", "arifjan-starbucks-2009-03-20", "m16a1-2", "m4-carbine-4", "sportster-1200-2", "snow-tent-2010-03-31"];
const held = (p: GalleryPhoto) => ON_HOLD.some((k) => p.src.includes(k) || p.id.includes(k));

/**
 * Stock aircraft shots kept off the Photos tabs (Sergio, Oct 19 2026: "Remove aircraft stock photos from Photo tabs").
 * These four equipment.json images (c-5-own, c-9-own, c-130-own, c-17-own) are uncredited art; they stay on the On/Off
 * Duty cards and have also left the Gallery (gallery.ts), so this list is now a safeguard. Sergio's own aircraft photos
 * (C-17 cargo and seats, M-Gator loading, cargo net, cargo aircraft 2010) stay.
 */
const STOCK_AIRCRAFT = new Set(["eq-c-5", "eq-c-9", "eq-c-130", "eq-c-17"]);

const unitById = new Map(units.map((u) => [u.id, u]));

/** The command plus every unit its command plate records (kind "unit" id, or the crest's own unitId). */
export function linkedUnitIds(commandId: string): Set<string> {
  const ids = new Set([commandId]);
  for (const row of commandPlates.filter((r) => r.unitId === commandId)) {
    for (const e of row.extras ?? []) {
      if (e.kind === "unit" && e.id) ids.add(e.id);
      if (e.unitId) ids.add(e.unitId);
    }
  }
  return ids;
}

/** Last day of a units.json date of any precision ("2004" -> 2004-12-31, "1998-12" -> 1998-12-31). */
const endOf = (d: string) => (d.length === 4 ? `${d}-12-31` : d.length === 7 ? `${d}-31` : d);
const startOf = (d: string) => (d.length === 4 ? `${d}-01-01` : d.length === 7 ? `${d}-01` : d);

/** Commands whose tour holds this full date. */
function toursHolding(date: string, commandIds: string[]): string[] {
  return commandIds.filter((id) => {
    const u = unitById.get(id);
    return Boolean(u?.start && u.end && startOf(u.start) <= date && date <= endOf(u.end));
  });
}

export type LogbookPhotoIndex = { byCommand: Map<string, GalleryPhoto[]>; unplaced: GalleryPhoto[] };

export function logbookPhotoIndex(beats: LogbookBeat[] = logbookBeats()): LogbookPhotoIndex {
  const commandIds = beats.map((b) => b.stop.commandId).filter((id): id is string => Boolean(id));
  const links = new Map(commandIds.map((id) => [id, linkedUnitIds(id)]));
  const byCommand = new Map<string, GalleryPhoto[]>(commandIds.map((id) => [id, []]));
  const unplaced: GalleryPhoto[] = [];
  for (const p of galleryPhotos) {
    if (held(p) || STOCK_AIRCRAFT.has(p.id)) continue;
    const tagged = p.tags.filter((t) => t.group === "command").map((t) => t.id);
    let homes: string[];
    if (tagged.length) homes = commandIds.filter((id) => tagged.some((t) => links.get(id)!.has(t)));
    else if (p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
      const hit = toursHolding(p.date, commandIds);
      homes = hit.length === 1 ? hit : [];
    } else homes = [];
    if (!homes.length) unplaced.push(p);
    for (const id of homes) byCommand.get(id)!.push(p);
  }
  return { byCommand, unplaced };
}
