import { equipment, formatSpan, operations, publicUrl, visits, type Equipment, type Kind } from "@/lib/shadowbox/model";

type Mark = { src: string; alt: string };
const TASK_FORCES: { id: string; name: string; image: string; when: string; marks: Mark[] }[] = [
  {
    id: "troy",
    name: "CJTF Troy",
    image: "/incoming/troy.png",
    when: "2006",
    marks: [
      { src: "/incoming/52nd-eod.png", alt: "Sponsor \u00b7 52nd EOD" },
      { src: "/incoming/16th-en.png", alt: "Sponsor \u00b7 16th EN" },
      { src: "/incoming/eodmu11.png", alt: "Partner \u00b7 EODMU 11" },
    ],
  },
  {
    id: "ia-army",
    name: "Task Force Iron Shield",
    image: "/incoming/cram.png",
    when: "2008\u20132009",
    marks: [
      { src: "/incoming/11th-ada.png", alt: "Admin \u00b7 11th ADA" },
      { src: "/incoming/332nd-aew.png", alt: "Customer \u00b7 332nd AEW" },
    ],
  },
  {
    id: "cjsotf",
    name: "CJSOTF-A",
    image: "/incoming/cjsotf-a.png",
    when: "2010\u20132011",
    marks: [{ src: "/incoming/3rd-sfg.png", alt: "Customer \u00b7 3rd SFG" }],
  },
  {
    id: "sojtf",
    name: "SOJTF-A",
    image: "/incoming/sojtf-a.png",
    when: "2012\u20132013",
    marks: [
      { src: "/incoming/290jcss.png", alt: "Partner \u00b7 290th JCSS" },
      { src: "/incoming/75th-rgr.svg", alt: "Customer \u00b7 75th Ranger Regiment" },
    ],
  },
];

const CAMPAIGN_LABEL: Record<string, string> = {
  "oif-2006": "OIF I",
  "oif-2009": "OIF II",
  "oef-2010": "OEF I",
  "oef-2012": "OEF II",
};

const CAMPAIGN_MARKS: Record<string, Mark[]> = {
  "oif-2006": [
    { src: "/incoming/52nd-eod.png", alt: "Sponsor \u00b7 52nd EOD" },
    { src: "/incoming/16th-en.png", alt: "Sponsor \u00b7 16th EN" },
    { src: "/incoming/eodmu11.png", alt: "Partner \u00b7 EODMU 11" },
  ],
  "oif-2009": [
    { src: "/incoming/11th-ada.png", alt: "Admin \u00b7 11th ADA" },
    { src: "/incoming/332nd-aew.png", alt: "Customer \u00b7 332nd AEW" },
  ],
  "oef-2010": [{ src: "/incoming/3rd-sfg.png", alt: "Customer \u00b7 3rd SFG" }],
  "oef-2012": [
    { src: "/incoming/290jcss.png", alt: "Partner \u00b7 290th JCSS" },
    { src: "/incoming/75th-rgr.svg", alt: "Customer \u00b7 75th Ranger Regiment" },
  ],
};

const EXERCISE_CRESTS: Record<string, { image: string; host: string; marks: Mark[] }> = {
  "cobra-gold": {
    image: "/incoming/cobra-gold.png",
    host: "Host \u00b7 Royal Thai Navy \u00b7 2004 and 2005",
    marks: [{ src: "/incoming/rtn.png", alt: "Royal Thai Navy" }],
  },
  "talisman-saber": {
    image: "/incoming/talisman-saber.png",
    host: "Host \u00b7 Australian Clearance Diving Team \u00b7 2005 and 2007",
    marks: [{ src: "/incoming/auscdt-1.png", alt: "Australian Clearance Diving Team" }],
  },
};

export function Ops({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const exercises = visits.filter((visit) => visit.kind === "exercise");
  return (
    <main className="sheet">
      <h2>Ops</h2>
      <p>Task forces are Troy, Iron Shield, CJSOTF-A, and SOJTF-A. Campaigns are OIF I, OIF II, OEF I, and OEF II. Marks are admin, sponsor, partner, and customer. Exercises are Cobra Gold, Talisman Saber, and the other recorded training. Years that were not entered stay blank.</p>
      <h3>Task forces</h3>
      <ol className="uniform-grid equipment-grid">
        {TASK_FORCES.map((force) => (
          <li key={force.id}>
            <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("unit", force.id)}>
              <img className="equipment-photo" src={publicUrl(force.image)} alt="" />
              <span className="card-marks">
                {force.marks.map((mark) => <img key={mark.src} src={publicUrl(mark.src)} alt={mark.alt} />)}
              </span>
              <strong>{force.name}</strong>
              <span>{force.when}</span>
            </button>
          </li>
        ))}
      </ol>
      <h3>Campaigns</h3>
      <ul className="stack">
        {operations.map((op) => (
          <li key={op.id}>
            <button type="button" className="row-btn" onClick={() => onOpen("operation", op.id)}>
              <strong>{formatSpan(op.start, op.end)}</strong>
              <span className="row-main">
                {CAMPAIGN_LABEL[op.id] ?? op.name}
                {CAMPAIGN_MARKS[op.id]?.length ? (
                  <span className="card-marks">
                    {CAMPAIGN_MARKS[op.id].map((mark) => <img key={mark.src} src={publicUrl(mark.src)} alt={mark.alt} />)}
                  </span>
                ) : null}
              </span>
              <em>{op.phase}</em>
            </button>
          </li>
        ))}
      </ul>
      <h3>Exercises</h3>
      <ol className="uniform-grid equipment-grid">
        {exercises.map((visit) => {
          const crest = EXERCISE_CRESTS[visit.id];
          return (
            <li key={visit.id}>
              <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("place", visit.placeId)}>
                {crest ? <img className="equipment-photo" src={publicUrl(crest.image)} alt="" /> : null}
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
              {item.image ? <img className={item.cutout ? "equipment-photo" : "equipment-photo is-photo"} src={publicUrl(item.image)} alt="" loading="lazy" /> : null}
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

export function OffDuty({ onOpen, title }: { onOpen: (k: Kind, id: string) => void; title: string }) {
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>Cars, motorcycles, residences, cities, and the C-5 and C-9 from the AS-40 tour. Hobbies have not been entered.</p>
      <GearList label="Cars" items={inGroup("cars")} onOpen={onOpen} />
      <GearList label="Motorcycles" items={inGroup("motorcycles")} onOpen={onOpen} />
      <GearList label="Aircraft" items={inGroup("aircraft").filter((item) => item.id === "c-5" || item.id === "c-9")} onOpen={onOpen} />
      <GearList label="Residences" items={inGroup("residences")} onOpen={onOpen} />
      <GearList label="Cities" items={inGroup("cities")} onOpen={onOpen} />
      <h3>Hobbies</h3>
      <p className="quiet">None entered.</p>
    </main>
  );
}
