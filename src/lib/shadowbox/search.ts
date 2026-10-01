import {
  awards, equipment, insignia, instances, milestones, necs, operations, photos, places,
  ranks, reflections, schools, uniforms, units, visits, warfare,
  type Kind,
} from "@/lib/shadowbox/model";

export type Hit = {
  title: string;
  kindLabel: string;
  snippet: string;
  open: { kind: Kind; id: string } | { view: string };
};

const fold = (value: string) => value.toLowerCase();

function clip(text: string, query: string): string {
  const hay = fold(text);
  const needle = fold(query);
  const at = hay.indexOf(needle);
  const start = at < 0 ? 0 : Math.max(0, at - 32);
  const slice = text.slice(start, start + needle.length + 64).replace(/\s+/g, " ").trim();
  return `${start ? "\u2026" : ""}${slice}${slice.length < text.length - start ? "\u2026" : ""}`;
}

function row(title: string, kindLabel: string, text: string, open: Hit["open"]): { text: string; hit: Omit<Hit, "snippet"> } {
  return { text: `${title} ${text}`, hit: { title, kindLabel, open } };
}

const PAGES: Hit[] = [
  { title: "Case", kindLabel: "Page", snippet: "Assigned commands and supplemental felt", open: { view: "case" } },
  { title: "Uniforms", kindLabel: "Page", snippet: "Uniform film", open: { view: "uniforms" } },
  { title: "Decorations", kindLabel: "Page", snippet: "Ribbons and medals", open: { view: "decorations" } },
  { title: "Timeline", kindLabel: "Page", snippet: "Duty, deployments, schools, ranks", open: { view: "timeline" } },
  { title: "Ops", kindLabel: "Page", snippet: "Operations", open: { view: "ops" } },
  { title: "On Duty", kindLabel: "Page", snippet: "Gear and vehicles", open: { view: "onduty" } },
  { title: "Off Duty", kindLabel: "Page", snippet: "Off duty", open: { view: "offduty" } },
  { title: "Map", kindLabel: "Page", snippet: "Stations and deployments", open: { view: "map" } },
  { title: "Sources", kindLabel: "Page", snippet: "Credits and licenses", open: { view: "sources" } },
  { title: "Contact", kindLabel: "Page", snippet: "Contact", open: { view: "contact" } },
  { title: "Guestbook", kindLabel: "Page", snippet: "Guestbook", open: { view: "guestbook" } },
  { title: "Memories", kindLabel: "Page", snippet: "Notes kept in this browser", open: { view: "memories" } },
];

function index(): { text: string; hit: Omit<Hit, "snippet"> }[] {
  const notes = new Map<string, string[]>();
  for (const item of instances) {
    if (!item.note) continue;
    notes.set(item.awardId, [...(notes.get(item.awardId) ?? []), item.note]);
  }
  return [
    ...units.map((item) => row(item.name, "Command", `${item.abbreviation} ${item.explanation} ${item.civilian} ${item.designator ?? ""}`, { kind: "unit", id: item.id })),
    ...awards.map((item) => row(item.name, "Award", `${item.abbreviation} ${item.explanation} ${item.criteria} ${item.deviceExplanation} ${(notes.get(item.id) ?? []).join(" ")}`, { kind: "award", id: item.id })),
    ...operations.map((item) => row(item.name, "Deployment", `${item.phase} ${item.theater} ${item.explanation}`, { kind: "operation", id: item.id })),
    ...schools.map((item) => row(item.name, "School", `${item.abbreviation} ${item.explanation}`, { kind: "school", id: item.id })),
    ...necs.map((item) => row(item.name, "NEC", `${item.code} ${item.role} ${item.explanation} ${item.criteria}`, { kind: "nec", id: item.id })),
    ...uniforms.map((item) => row(item.name, "Uniform", `${item.context} ${item.note}`, { kind: "uniform", id: item.id })),
    ...warfare.map((item) => row(item.name, "Warfare", `${item.abbreviation} ${item.explanation} ${item.criteria}`, { kind: "warfare", id: item.id })),
    ...insignia.map((item) => row(item.name, "Insignia", `${item.short} ${item.explanation} ${item.criteria}`, { kind: "insignia", id: item.id })),
    ...places.map((item) => row(item.name, "Place", `${item.locality} ${item.note}`, { kind: "place", id: item.id })),
    ...visits.map((item) => row(item.title, "Visit", `${item.when} ${item.note ?? ""} ${(item.trips ?? []).join(" ")}`, { kind: "place", id: item.placeId })),
    ...milestones.map((item) => row(item.title, "Milestone", `${item.short} ${item.explanation}`, { kind: "milestone", id: item.id })),
    ...photos.map((item) => row(item.caption || item.alt, "Photo", item.alt, { kind: "photo", id: item.id })),
    ...equipment.map((item) => row(item.name, "Gear", `${item.caption ?? ""} ${item.note}`, { kind: "equipment", id: item.id })),
    ...ranks.map((item) => row(item.name, "Rank", `${item.abbreviation} ${item.grade} ${item.explanation} ${item.note ?? ""}`, { kind: "rank", id: item.id })),
    ...reflections.map((item) => row("Reflection", "Note", item.text, { kind: item.kind, id: item.subjectId })),
    ...PAGES.map((item) => ({ text: `${item.title} ${item.snippet}`, hit: { title: item.title, kindLabel: item.kindLabel, open: item.open } })),
  ];
}

let cached: ReturnType<typeof index> | null = null;

export function searchRecord(query: string, limit = 12): Hit[] {
  const needle = fold(query.trim());
  if (needle.length < 2) return [];
  cached ??= index();
  return cached
    .filter((entry) => fold(entry.text).includes(needle))
    .slice(0, limit)
    .map((entry) => ({ ...entry.hit, snippet: clip(entry.text, query.trim()) }));
}
