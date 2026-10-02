import {
  awards, certificates, equipment, insignia, instances, milestones, necs, operations, photos, places,
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
  { title: "Admin", kindLabel: "Page", snippet: "Schools, in the order recorded", open: { view: "admin" } },
  { title: "Timeline", kindLabel: "Page", snippet: "Rank, assignments, and deployments", open: { view: "timeline" } },
  { title: "Linha do tempo", kindLabel: "Página", snippet: "Posto, funções e deslocamentos", open: { view: "timeline" } },
  { title: "Uniforms", kindLabel: "Page", snippet: "Uniforms worn across the career", open: { view: "uniforms" } },
  { title: "Uniformes", kindLabel: "Página", snippet: "Uniformes usados na carreira", open: { view: "uniforms" } },
  { title: "Decorations", kindLabel: "Page", snippet: "Ribbons, medals, and what the devices count", open: { view: "decorations" } },
  { title: "Condecorações", kindLabel: "Página", snippet: "Fitas, medalhas e o que os dispositivos contam", open: { view: "decorations" } },
  { title: "On Duty", kindLabel: "Page", snippet: "Equipment, gear, vehicles, ships, and aircraft", open: { view: "onduty" } },
  { title: "Em serviço", kindLabel: "Página", snippet: "Equipamento, viaturas, navios e aeronaves", open: { view: "onduty" } },
  { title: "Off Duty", kindLabel: "Page", snippet: "Cars, motorcycles, residences, cities, and hobbies", open: { view: "offduty" } },
  { title: "Fora de serviço", kindLabel: "Página", snippet: "Carros, motos, residências, cidades e passatempos", open: { view: "offduty" } },
  { title: "Ops", kindLabel: "Page", snippet: "Task forces, campaigns, exercises", open: { view: "ops" } },
  { title: "Operações", kindLabel: "Página", snippet: "Forças-tarefa, campanhas, exercícios", open: { view: "ops" } },
  { title: "Map", kindLabel: "Page", snippet: "Stations and deployments", open: { view: "map" } },
  { title: "Mapa", kindLabel: "Página", snippet: "Estações e deslocamentos", open: { view: "map" } },
  { title: "Schools", kindLabel: "Page", snippet: "Courses in the order recorded", open: { view: "admin" } },
  { title: "Escolas", kindLabel: "Página", snippet: "Cursos na ordem do registro", open: { view: "admin" } },
  { title: "Sources", kindLabel: "Page", snippet: "Credits and licenses", open: { view: "sources" } },
  { title: "Fontes", kindLabel: "Página", snippet: "Créditos e licenças", open: { view: "sources" } },
  { title: "Contact", kindLabel: "Page", snippet: "Contact", open: { view: "contact" } },
  { title: "Contato", kindLabel: "Página", snippet: "Contato", open: { view: "contact" } },
  { title: "Guestbook", kindLabel: "Page", snippet: "Guestbook", open: { view: "guestbook" } },
  { title: "Livro de visitas", kindLabel: "Página", snippet: "Livro de visitas", open: { view: "guestbook" } },
  { title: "Memories", kindLabel: "Page", snippet: "Notes kept in this browser", open: { view: "memories" } },
  { title: "Memórias", kindLabel: "Página", snippet: "Notas guardadas neste navegador", open: { view: "memories" } },
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
    ...certificates.map((item) => row(item.name, "Certificate", item.explanation, { kind: "certificate", id: item.id })),
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
