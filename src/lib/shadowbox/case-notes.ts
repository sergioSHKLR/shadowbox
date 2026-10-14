import type { Locale } from "@/lib/shadowbox/prefs";
import { ranks, units, warfare } from "@/lib/shadowbox/model";

/**
 * One short sentence per Home case item for the item modal (Sergio, Oct 14 2026). EN is read from the record at build
 * time (first sentence of the unit, warfare or rank explanation, or the page snippet / lead already in the site copy);
 * PT is a direct translation of that same sentence (page snippets and the Decorations lead already had PT). No new facts.
 * Items with no source text (contact, guestbook, both plaques) have no entry: the modal shows the name only.
 */
const first = (text: string | undefined) => (text ?? "").match(/^.*?[.!?](?=\s|$)/)?.[0] ?? "";
const unitS = (id: string) => first(units.find((u) => u.id === id)?.explanation);
const warS = (id: string) => first(warfare.find((w) => w.id === id)?.explanation);
const rankS = (id: string, n = 0) => ((ranks.find((r) => r.id === id) as { explanation?: string } | undefined)?.explanation ?? "").split(/(?<=[.!?])\s+/)[n] ?? "";

type Note = { en: string; pt: string };
const NOTES: Record<string, () => Note> = {
  ncts: () => ({ en: unitS("ncts"), pt: "Um comando em terra que operava os serviços de computação e telecomunicações da Marinha em San Diego." }),
  "frank-cable": () => ({ en: unitS("frank-cable"), pt: "Um tênder de submarinos: um navio que repara, abastece e aloja as tripulações de submarinos." }),
  eodmu5: () => ({ en: unitS("eodmu5"), pt: "Explosive Ordnance Disposal Mobile Unit Five, uma unidade de desativação de explosivos da Marinha, então baseada em Guam." }),
  sercc: () => ({ en: unitS("sercc"), pt: "O Centro Regional de Calibração do Sudeste da Marinha, na Naval Air Station Jacksonville." }),
  jcse: () => ({ en: unitS("jcse"), pt: "Uma unidade conjunta, sediada na MacDill Air Force Base, na Flórida, que envia rapidamente pequenas equipes de comunicações para operações especiais e outros comandantes conjuntos." }),
  navhosp: () => ({ en: unitS("navhosp"), pt: "O hospital da Marinha em Jacksonville, na Flórida, e o último comando na ativa." }),
  swo: () => ({ en: warS("esws"), pt: "Um distintivo de qualificação para marinheiros de navios de superfície." }),
  exw: () => ({ en: warS("exw"), pt: "A versão expedicionária de um distintivo de guerra, para marinheiros de unidades que atuam em terra ou a partir do mar, e não como tripulação de um navio." }),
  "ncts-dev": () => ({ en: rankS("et3"), pt: "Primeiro grau de petty officer." }),
  "frank-cable-dev": () => ({ en: rankS("et2"), pt: "Petty officer de segunda classe." }),
  "eodmu5-dev": () => ({ en: rankS("et1"), pt: "Petty officer de primeira classe." }),
  "jcse-dev": () => ({ en: "Chevrons and service stripes go gold in 2009.", pt: "As divisas e as listras de serviço passam a ser douradas em 2009." }),
  "navhosp-dev": () => ({ en: rankS("etc"), pt: "Chief petty officer." }),
  "bio-sr": () => ({ en: rankS("sr", 1), pt: "O retrato do boot camp é como SR." }),
  bio: () => ({ en: rankS("etc"), pt: "Chief petty officer." }),
  decorations: () => ({ en: "The ribbons as worn, in order of precedence.", pt: "As fitas como usadas, em ordem de precedência." }),
  uniforms: () => ({ en: "Uniforms worn across the career.", pt: "Uniformes usados na carreira." }),
  onduty: () => ({ en: "Equipment, gear, vehicles, ships, and aircraft.", pt: "Equipamento, viaturas, navios e aeronaves." }),
  offduty: () => ({ en: "Cars, motorcycles, residences, cities, and hobbies.", pt: "Carros, motos, residências, cidades e passatempos." }),
  logbook: () => ({ en: "Uniform, rack, map, and units synced to each assigned command.", pt: "Uniforme, rack, mapa e unidades por comando." }),
  map: () => ({ en: "Stations and deployments.", pt: "Estações e deslocamentos." }),
  admin: () => ({ en: "Schools, in the order recorded.", pt: "Cursos na ordem do registro." }),
};
// jcse-dev EN is the third sentence of ranks.json et1 ("Chevrons and service stripes go gold in 2009; ..."), cut at the semicolon.

export function caseNote(id: string, locale: Locale): string {
  const n = NOTES[id]?.();
  return n ? (locale === "pt" ? n.pt : n.en) : "";
}
