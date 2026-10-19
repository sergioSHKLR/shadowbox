import { useState } from "react";
import { equipment, publicUrl, visits, type Equipment, type Kind } from "@/lib/shadowbox/model";

type Mark = { src: string; alt: string };
const DEPLOYMENTS: { id: string; campaign: string; name: string; phase: string; image: string; when: string; marks: Mark[] }[] = [
  {
    id: "troy",
    campaign: "First Iraq tour",
    name: "CJTF Troy",
    phase: "National Resolution",
    image: "/incoming/troy.webp",
    when: "2006",
    marks: [
      { src: "/incoming/52nd-eod.webp", alt: "Sponsor \u00b7 52nd EOD" },
      { src: "/incoming/16th-en.webp", alt: "Sponsor \u00b7 16th EN" },
      { src: "/incoming/eodmu11.webp", alt: "Partner \u00b7 EODMU 11" },
    ],
  },
  {
    id: "ia-army",
    campaign: "Second Iraq tour",
    name: "Task Force Iron Shield",
    phase: "Iraq Sovereignty",
    image: "/incoming/cram.webp",
    when: "Oct 2008\u20132009",
    marks: [
      { src: "/incoming/11th-ada.webp", alt: "Admin \u00b7 11th ADA" },
      { src: "/incoming/3-3ada.webp", alt: "Partner \u00b7 3-3 ADA" },
      { src: "/incoming/332nd-aew.webp", alt: "Customer \u00b7 332nd AEW" },
    ],
  },
  {
    id: "cjsotf",
    campaign: "OEF I",
    name: "CJSOTF-A",
    phase: "Afghanistan, 2010\u20132011",
    image: "/incoming/cjsotf-a.webp",
    when: "2010\u20132011",
    marks: [{ src: "/incoming/3rd-sfg.webp", alt: "Customer \u00b7 3rd SFG" }],
  },
  {
    id: "sojtf",
    campaign: "OEF II",
    name: "SOJTF-A",
    phase: "Afghanistan, 2012\u20132013",
    image: "/incoming/sojtf-a.webp",
    when: "2012\u20132013",
    marks: [
      { src: "/incoming/290jcss.webp", alt: "Partner \u00b7 290th JCSS" },
      { src: "/incoming/75th-rgr.svg", alt: "Customer \u00b7 75th Rangers" },
    ],
  },
];

const EXERCISE_CRESTS: Record<string, { image: string; host: string; marks: Mark[] }> = {
  "cobra-gold": {
    image: "/incoming/cobra-gold.webp",
    host: "Host \u00b7 Royal Thai Navy \u00b7 2004 and 2005",
    marks: [{ src: "/incoming/rtn.webp", alt: "Royal Thai Navy" }],
  },
  "talisman-saber": {
    image: "/incoming/talisman-saber.webp",
    host: "Host \u00b7 Australian CDT \u00b7 2005 and 2007",
    marks: [{ src: "/incoming/auscdt-1.webp", alt: "Australian CDT" }],
  },
};

export function Ops({ onOpen, title }: { onOpen: (k: Kind, id: string) => void; title: string }) {
  const exercises = visits.filter((visit) => visit.kind === "exercise");
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>Four deployments: the first Iraq tour with CJTF Troy, the second Iraq tour with Task Force Iron Shield, OEF I with CJSOTF-A, and OEF II with SOJTF-A. Marks are admin, sponsor, partner, and customer. Exercises are Cobra Gold, Talisman Saber, and the other recorded training.</p>
      <ol className="uniform-grid equipment-grid">
        {DEPLOYMENTS.map((force) => (
          <li key={force.id}>
            <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("unit", force.id)}>
              <img loading="lazy" className="crest-photo" src={publicUrl(force.image)} alt="" />
              <span className="card-marks">
                {force.marks.map((mark) => <img key={mark.src} src={publicUrl(mark.src)} alt={mark.alt} />)}
              </span>
              <strong>{force.campaign} · {force.name}</strong>
              <span>{force.when}</span>
              <span>{force.phase}</span>
            </button>
          </li>
        ))}
      </ol>
      <h3>Exercises</h3>
      <ol className="uniform-grid equipment-grid">
        {exercises.map((visit) => {
          const crest = EXERCISE_CRESTS[visit.id];
          return (
            <li key={visit.id}>
              <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("place", visit.placeId)}>
                {crest ? <img loading="lazy" className="crest-photo" src={publicUrl(crest.image)} alt="" /> : null}
                {crest?.marks.length ? (
                  <span className="card-marks">
                    {crest.marks.map((mark) => <img key={mark.src} src={publicUrl(mark.src)} alt={mark.alt} />)}
                  </span>
                ) : null}
                <strong>{visit.title}</strong>
                <span>{visit.when}</span>
                <span>{crest?.host ?? "Training"}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

function GearList({ label, items, onOpen }: { label: string; items: Equipment[]; onOpen: (k: Kind, id: string) => void }) {
  if (!items.length) return null;
  const ordered = [...items].sort((a, b) => a.order - b.order);
  return (
    <section className="uniform-group" aria-label={label}>
      <h3>{label}</h3>
      <ol className="uniform-grid equipment-grid">
        {ordered.map((item) => (
          <li key={item.id}>
            <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("equipment", item.id)}>
              {item.image ? <img data-group={item.group} className={item.cutout ? "equipment-photo" : "equipment-photo is-photo"} src={publicUrl(item.image)} alt="" loading="lazy" /> : null}
              <strong>{item.name}</strong>
              {item.caption ? <span>{item.caption}</span> : null}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function inGroup(group: Equipment["group"]): Equipment[] {
  return equipment.filter((item) => item.group === group);
}

/**
 * Off Duty city chips (Sergio, Oct 14 2026): his mapping, each city's own card included. Items can sit under more than
 * one chip. Record notes are kept as written even where they name another place (Frontier: Imperial Beach). Orange Park
 * covers both Jacksonville tours. Santa Rita has its city card only. The C-5/C-9 are not placed.
 */
const OFF_CITIES: { id: string; label: string; items: string[] }[] = [
  { id: "san-diego", label: "San Diego", items: ["city-san-diego", "nissan-frontier"] },
  { id: "tamuning", label: "Tamuning", items: ["city-tamuning", "xt225"] },
  // XT225 under Talofofo too (Sergio, Oct 19 2026: "if Talofofo is selected, XT225 should show"); it stays under Tamuning.
  { id: "talofofo", label: "Talofofo", items: ["city-talofofo", "ford-ranger", "nissan-sentra-red", "nissan-sentra-silver", "xt225"] },
  { id: "santa-rita", label: "Santa Rita", items: ["city-santa-rita"] },
  { id: "orange-park", label: "Orange Park", items: ["city-orange-park", "buell-500", "mitsubishi-outlander", "chevy-spark-white"] },
  { id: "south-tampa", label: "South Tampa", items: ["city-south-tampa", "buell-500", "sportster-1200", "chevy-spark-yellow", "mitsubishi-outlander"] },
];

export function OffDuty({ onOpen, title }: { onOpen: (k: Kind, id: string) => void; title: string }) {
  const [shown, setShown] = useState<string[] | null>(null);
  const toggle = (id: string) =>
    setShown((prev) => {
      const cur = prev ?? [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return next.length === 0 || next.length === OFF_CITIES.length ? null : next;
    });
  const keep = shown ? new Set(OFF_CITIES.filter((c) => shown.includes(c.id)).flatMap((c) => c.items)) : null;
  const pick = (list: Equipment[]) => (keep ? list.filter((item) => keep.has(item.id)) : list);
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>Cars, motorcycles, residences, cities, and the C-5 and C-9 from the USS Frank Cable tour. Hobbies have not been entered.</p>
      <div className="map-filter" role="group" aria-label="Show by city">
        <button type="button" className={`nav-btn${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>All</button>
        {OFF_CITIES.map((c) => (
          <button key={c.id} type="button" className={`nav-btn${shown?.includes(c.id) ? " on" : ""}`} aria-pressed={!!shown?.includes(c.id)} onClick={() => toggle(c.id)}>{c.label}</button>
        ))}
      </div>
      <GearList label="Cars" items={pick(inGroup("cars"))} onOpen={onOpen} />
      <GearList label="Motorcycles" items={pick(inGroup("motorcycles"))} onOpen={onOpen} />
      <GearList label="Aircraft" items={pick(inGroup("aircraft").filter((item) => item.id === "c-5" || item.id === "c-9"))} onOpen={onOpen} />
      <GearList label="Residences" items={pick(inGroup("residences"))} onOpen={onOpen} />
      <GearList label="Cities" items={pick(inGroup("cities"))} onOpen={onOpen} />
      {!shown ? (
        <>
          <h3>Hobbies</h3>
          <p className="quiet">None entered.</p>
        </>
      ) : null}
    </main>
  );
}
