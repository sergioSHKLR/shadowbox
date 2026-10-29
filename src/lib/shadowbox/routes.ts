/**
 * Real page addresses (Oct 21 2026, preview branch "routes"). Every view has its own path; Portuguese mirrors the same
 * paths under /pt/. Every page URL ends in a slash because the static build writes each page as <path>/index.html, and
 * GitHub Pages redirects /logbook to /logbook/ when logbook/ is a folder; the router accepts both forms.
 *
 *   /                       Home (the case)          ?item=case:<case-item>  opens a case item modal
 *   /bio/                   Biography
 *   /logbook/               Logbook (first command)  /logbook/<command>/  that command
 *   /decorations/           Decorations              /decorations/<award>/ that award's card
 *   /gallery/               Gallery                  /gallery/<photo>/   that photo in the lightbox (/gallery/<n>/ = n-th photo)
 *   /timeline/ /uniforms/ /travel-book/ /on-duty/ /off-duty/ /admin/ /guestbook/ /contact/
 *
 * Any other open card (the detail side panel) rides in ?item=<kind>:<id>, e.g. /timeline/?item=unit:jcse.
 * This module only imports JSON data so the static build (scripts/write-route-pages.mjs) can import it too.
 */
import unitsJson from "@/data/units.json";
import awardsJson from "@/data/awards.json";
import type { Kind, Selection } from "@/lib/shadowbox/model";

export type RouteLocale = "en" | "pt";
export type RouteView =
  | "home" | "bio" | "logbook" | "decorations" | "uniforms" | "timeline" | "map" | "onduty" | "offduty" | "gallery" | "admin" | "credentials" | "guestbook" | "contact";

export type Route = {
  locale: RouteLocale;
  view: RouteView;
  /** Logbook: unit id of the open command. */
  command?: string;
  /** Gallery: photo id open in the lightbox. */
  photo?: string;
  /** Detail panel card (on Decorations an award card is the path itself). */
  item?: Selection;
  /** Home: the case item modal (case.json item id). */
  caseItem?: string;
};

export const SITE = "https://shadowbox.shklr.org";

/** View id → path segment (same in both languages). */
export const VIEW_SLUG: Record<RouteView, string> = {
  home: "",
  bio: "bio",
  logbook: "logbook",
  decorations: "decorations",
  uniforms: "uniforms",
  timeline: "timeline",
  map: "travel-book",
  onduty: "on-duty",
  offduty: "off-duty",
  gallery: "gallery",
  admin: "admin",
  credentials: "credentials",
  guestbook: "guestbook",
  contact: "contact",
};
export const ROUTE_VIEWS = Object.keys(VIEW_SLUG) as RouteView[];
/** Older or alternate names that land on the right page. */
const VIEW_ALIAS: Record<string, RouteView> = {
  map: "map", "travelbook": "map", travel: "map", "diario-de-viagem": "map", biography: "bio", biografia: "bio",
  case: "home", home: "home", schools: "admin", equipment: "onduty", onduty: "onduty", offduty: "offduty", "linha-do-tempo": "timeline",
  galeria: "gallery", condecoracoes: "decorations", contato: "contact", uniformes: "uniforms",
};

type UnitRow = { id: string; name: string; abbreviation?: string; start?: string; end?: string };
type AwardRow = { id: string; name: string };
const UNITS = ((unitsJson as unknown as { units?: UnitRow[] }).units ?? (unitsJson as unknown as UnitRow[]));
const AWARDS = ((awardsJson as unknown as { awards?: AwardRow[] }).awards ?? (awardsJson as unknown as AwardRow[]));

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Readable Logbook command slugs; any other unit falls back to its id. */
const COMMAND_SLUG: Record<string, string> = {
  rtc: "rtc-great-lakes",
  tortuga: "uss-tortuga",
  "ntc-great-lakes": "ntc-great-lakes",
  ncts: "ncts-san-diego",
  "frank-cable": "uss-frank-cable",
  eodmu5: "eodmu-5",
  sercc: "sercc",
  jcse: "jcse",
  navhosp: "naval-hospital-jacksonville",
};
export const commandSlug = (unitId: string) => COMMAND_SLUG[unitId] ?? unitId;
export function commandFromSlug(slug: string): string | undefined {
  const hit = Object.entries(COMMAND_SLUG).find(([, s]) => s === slug)?.[0];
  if (hit) return hit;
  return UNITS.some((u) => u.id === slug) ? slug : undefined;
}
export const unitRow = (id: string) => UNITS.find((u) => u.id === id);

/** Award slugs come from the official name ("navy-e-ribbon", "joint-service-commendation-medal"); the short id also works. */
export const awardSlug = (awardId: string) => {
  const a = AWARDS.find((row) => row.id === awardId);
  return a ? slugify(a.name) : awardId;
};
export function awardFromSlug(slug: string): string | undefined {
  return AWARDS.find((a) => slugify(a.name) === slug)?.id ?? AWARDS.find((a) => a.id === slug)?.id;
}
export const awardRow = (id: string) => AWARDS.find((a) => a.id === id);
export const AWARD_IDS = AWARDS.map((a) => a.id);

const KINDS: Kind[] = ["award", "unit", "operation", "school", "nec", "uniform", "warfare", "place", "insignia", "milestone", "photo", "equipment", "rank", "certificate", "branch"];
const ITEM_ID = /^[A-Za-z0-9._~-]+$/;

export function encodeItem(sel: Selection): string {
  return `${sel.kind}:${sel.id}${sel.medal ? ":medal" : ""}`;
}
export function decodeItem(raw: string | null): { item?: Selection; caseItem?: string } {
  if (!raw) return {};
  const [kind, id, flag] = raw.split(":");
  if (!id || !ITEM_ID.test(id)) return {};
  if (kind === "case") return { caseItem: id };
  if (!KINDS.includes(kind as Kind)) return {};
  return { item: { kind: kind as Kind, id, ...(flag === "medal" ? { medal: true } : {}) } };
}

/** Keep ":" readable in ?item= (URLSearchParams would write %3A). */
const q = (s: string) => encodeURIComponent(s).replace(/%3A/gi, ":");

export function pathFor(r: Pick<Route, "locale" | "view" | "command" | "photo"> & { award?: string }): string {
  const parts: string[] = [];
  if (r.locale === "pt") parts.push("pt");
  if (r.view !== "home") parts.push(VIEW_SLUG[r.view]);
  if (r.view === "logbook" && r.command) parts.push(commandSlug(r.command));
  if (r.view === "gallery" && r.photo) parts.push(r.photo);
  if (r.view === "decorations" && r.award) parts.push(awardSlug(r.award));
  return `/${parts.join("/")}${parts.length ? "/" : ""}`;
}

/** Full in-site URL (path + ?item=) for a route. On Decorations an award card is written in the path instead. */
export function hrefFor(r: Route): string {
  const awardInPath = r.view === "decorations" && r.item?.kind === "award" && !r.item.medal ? r.item.id : undefined;
  const path = pathFor({ ...r, award: awardInPath });
  let item = "";
  if (r.view === "home" && r.caseItem) item = `case:${r.caseItem}`;
  else if (r.item && !awardInPath) item = encodeItem(r.item);
  return item ? `${path}?item=${q(item)}` : path;
}

export type Parsed = Route & {
  /** True when the address was not the canonical form (alias, numeric photo, missing slash, unknown slug): replace it. */
  normalize: boolean;
  /** The path named no known page at all (rendered as Home). */
  unknown: boolean;
  /** Bare "/" with no language prefix (lets a saved Portuguese preference win on the plain domain). */
  bare: boolean;
  /** Gallery photo given as a 1-based number, resolved by the app against the photo list. */
  photoNumber?: number;
};

export function parseLocation(pathname: string, search: string, photoIds?: readonly string[]): Parsed {
  let segs = pathname.split("/").filter(Boolean).map((s) => { try { return decodeURIComponent(s); } catch { return s; } });
  if (segs[segs.length - 1] === "index.html") segs = segs.slice(0, -1);
  let locale: RouteLocale = "en";
  if (segs[0] === "pt" || segs[0] === "pt-br" || segs[0] === "pt-BR") { locale = "pt"; segs = segs.slice(1); }
  else if (segs[0] === "en") segs = segs.slice(1);
  const bare = pathname === "/" || pathname === "";
  const out: Parsed = { locale, view: "home", normalize: false, unknown: false, bare };
  const head = (segs[0] ?? "").toLowerCase();
  const view = (head === "" ? "home" : (ROUTE_VIEWS.find((v) => VIEW_SLUG[v] === head) ?? VIEW_ALIAS[head])) as RouteView | undefined;
  if (!view) { out.unknown = true; out.normalize = true; }
  else {
    out.view = view;
    const sub = segs[1];
    if (sub) {
      if (view === "logbook") { out.command = commandFromSlug(sub); if (!out.command) out.normalize = true; }
      else if (view === "gallery") {
        if (photoIds?.includes(sub)) out.photo = sub;
        else if (/^\d+$/.test(sub)) out.photoNumber = Number(sub);
        else if (!photoIds) out.photo = sub;
        else out.normalize = true;
      } else if (view === "decorations") {
        const a = awardFromSlug(sub);
        if (a) out.item = { kind: "award", id: a };
        else out.normalize = true;
      } else out.normalize = true;
      if (segs.length > 2) out.normalize = true;
    }
  }
  const raw = new URLSearchParams(search).get("item");
  const dec = decodeItem(raw);
  if (dec.caseItem && out.view === "home") out.caseItem = dec.caseItem;
  else if (dec.item && !out.item) out.item = dec.item;
  if (!out.unknown) {
    const canonical = hrefFor(out);
    // Unrelated query keys (?v=150 cache busters, utm_*) are not compared; the app keeps them on a replace.
    const current = pathname + (raw ? `?item=${q(raw)}` : "");
    if (current !== canonical) out.normalize = true;
  }
  return out;
}

/* ---------- Page titles and descriptions (runtime document.title and the static HTML head) ---------- */

const VIEW_TITLE: Record<RouteLocale, Record<RouteView, string>> = {
  en: { home: "Shadowbox", bio: "Biography", logbook: "Logbook", decorations: "Decorations", uniforms: "Uniforms", timeline: "Timeline", map: "Travel Book", onduty: "On Duty", offduty: "Off Duty", gallery: "Gallery", admin: "Admin", credentials: "Credentials", guestbook: "Guestbook", contact: "Contact" },
  pt: { home: "Shadowbox", bio: "Biografia", logbook: "Diário de bordo", decorations: "Condecorações", uniforms: "Uniformes", timeline: "Linha do tempo", map: "Diário de Viagem", onduty: "Em serviço", offduty: "Fora de serviço", gallery: "Galeria", admin: "Administração", credentials: "Credenciais", guestbook: "Livro de visitas", contact: "Contato" },
};
const VIEW_DESC: Record<RouteLocale, Record<RouteView, string>> = {
  en: {
    home: "A Navy career, ribbon by ribbon. To honor & instruct",
    bio: "Biography of Chief Petty Officer Sergio Schickler, United States Navy, Retired (1997–2018).",
    logbook: "Sergio Schickler's Navy career command by command: rank, awards, uniforms, gear, photos and the map at each command.",
    decorations: "The ribbons and medals of Chief Petty Officer Sergio Schickler, in order of precedence. Select one to read its story.",
    uniforms: "The Navy uniforms Sergio Schickler wore across his career, from Seaman Recruit to Chief Petty Officer.",
    timeline: "Rank, assignments, deployments and events on one timeline, 1997–2018.",
    map: "Travel Book: every place Sergio Schickler served, deployed or visited during his Navy career, on one map.",
    onduty: "On-duty gear and equipment from Sergio Schickler's Navy career.",
    offduty: "Off-duty life during Sergio Schickler's Navy career.",
    gallery: "Sergio Schickler's own Navy photos in one place, by command, operation and city.",
    admin: "Schools, NECs and qualifications from Sergio Schickler's Navy record.",
    credentials: "A recreation of Sergio Schickler's DD-214, with personal data obscured.",
    guestbook: "Leave a note in the Shadowbox guestbook.",
    contact: "Get in touch about the Shadowbox.",
  },
  pt: {
    home: "Uma carreira na Marinha, fita por fita. Para honrar e instruir",
    bio: "Biografia do Chief Petty Officer Sergio Schickler, Marinha dos Estados Unidos, na reserva (1997–2018).",
    logbook: "A carreira de Sergio Schickler na Marinha, comando por comando: posto, condecorações, uniformes, equipamento, fotos e o mapa de cada comando.",
    decorations: "As fitas e medalhas do Chief Petty Officer Sergio Schickler, em ordem de precedência. Selecione uma para ler a sua história.",
    uniforms: "Os uniformes da Marinha que Sergio Schickler usou ao longo da carreira, de recruta a Chief Petty Officer.",
    timeline: "Posto, funções, deslocamentos e eventos numa só linha do tempo, 1997–2018.",
    map: "Diário de Viagem: todos os lugares onde Sergio Schickler serviu, foi destacado ou visitou na Marinha, num só mapa.",
    onduty: "Equipamento em serviço da carreira de Sergio Schickler na Marinha.",
    offduty: "A vida fora de serviço durante a carreira de Sergio Schickler na Marinha.",
    gallery: "As fotos do próprio Sergio Schickler na Marinha num só lugar, por comando, operação e cidade.",
    admin: "Escolas, NECs e qualificações do registro de Sergio Schickler na Marinha.",
    credentials: "Recriação do DD-214 de Sergio Schickler, com os dados pessoais ocultados.",
    guestbook: "Deixe uma mensagem no livro de visitas do Shadowbox.",
    contact: "Entre em contato sobre o Shadowbox.",
  },
};

const years = (u?: UnitRow) => {
  const a = u?.start?.slice(0, 4), b = u?.end?.slice(0, 4);
  return a && b && a !== b ? `${a}–${b}` : a ?? b ?? "";
};

export type PageMeta = { title: string; description: string; image?: string };

/** Title and description for a page (path-level only; ?item= cards keep their page's head). */
export function metaFor(r: Pick<Route, "locale" | "view" | "command" | "photo"> & { award?: string }, photo?: { caption: string; alt?: string; src?: string }): PageMeta {
  const L = r.locale;
  const base = VIEW_TITLE[L][r.view];
  const suffix = " · Shadowbox";
  if (r.view === "logbook" && r.command) {
    const u = unitRow(r.command);
    const name = u?.name ?? r.command;
    const span = years(u);
    return {
      title: `${name} · ${base}${suffix}`,
      description: L === "pt"
        ? `${name}${span ? `, ${span}` : ""}: posto, condecorações, uniformes, equipamento e fotos deste comando na carreira de Sergio Schickler na Marinha.`
        : `${name}${span ? `, ${span}` : ""}: rank, awards, uniforms, gear and photos from this command in Sergio Schickler's Navy career.`,
    };
  }
  if (r.view === "decorations" && r.award) {
    const a = awardRow(r.award);
    const name = a?.name ?? r.award;
    return {
      title: `${name} · ${base}${suffix}`,
      description: L === "pt" ? `${name}: como e onde o Chief Petty Officer Sergio Schickler a recebeu.` : `${name}: how and where Chief Petty Officer Sergio Schickler earned it.`,
    };
  }
  if (r.view === "gallery" && r.photo) {
    const cap = photo?.caption ?? r.photo;
    return {
      title: `${cap.length > 70 ? `${cap.slice(0, 67)}…` : cap} · ${base}${suffix}`,
      description: photo?.alt || cap,
      image: photo?.src,
    };
  }
  if (r.view === "home") return { title: "Shadowbox", description: VIEW_DESC[L].home };
  return { title: `${base}${suffix}`, description: VIEW_DESC[L][r.view] };
}

export const LOGBOOK_COMMANDS_FALLBACK = Object.keys(COMMAND_SLUG);
