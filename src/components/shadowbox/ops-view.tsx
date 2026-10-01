import { equipment, EQUIPMENT_GROUPS, formatSpan, operations, publicUrl, visits, type Kind } from "@/lib/shadowbox/model";

const TASK_FORCES = [
  { id: "troy", name: "CJTF Troy", image: "/incoming/troy.png", when: "2006" },
  { id: "ia-army", name: "Task Force Iron Shield", image: "/incoming/cram.png", when: "2008\u20132009" },
  { id: "cjsotf", name: "CJSOTF-A", image: "/incoming/cjsotf-a.png", when: "2010\u20132013" },
];

const EXERCISE_CRESTS: Record<string, { image: string; host: string }> = {
  "cobra-gold": { image: "/incoming/cobra-gold.png", host: "Host \u00b7 Royal Thai Navy \u00d72" },
  "talisman-saber": { image: "/incoming/talisman-saber.png", host: "Host \u00b7 Australian Clearance Diving Team \u00d72" },
};

export function Ops({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const exercises = visits.filter((visit) => visit.kind === "exercise");
  return (
    <main className="sheet">
      <h2>Ops</h2>
      <p>Task forces are Troy, Iron Shield, and CJSOTF-A. Campaigns are the named deployments. Exercises are Cobra Gold, Talisman Saber, and the other recorded training. Years that were not entered stay blank.</p>
      <h3>Task forces</h3>
      <ol className="uniform-grid equipment-grid">
        {TASK_FORCES.map((force) => (
          <li key={force.id}>
            <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("unit", force.id)}>
              <img className="equipment-photo" src={publicUrl(force.image)} alt="" />
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
              <span>{op.name}</span>
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

export function GearGroups({ groups, onOpen }: { groups: string[]; onOpen: (k: Kind, id: string) => void }) {
  return (
    <>
      {EQUIPMENT_GROUPS.filter((group) => groups.includes(group.id)).map((group) => {
        const list = equipment.filter((item) => item.group === group.id).sort((a, b) => a.order - b.order);
        if (!list.length) return null;
        return (
          <section key={group.id} className="uniform-group" aria-label={group.label}>
            <h3>{group.label}</h3>
            <ol className="uniform-grid equipment-grid">
              {list.map((item) => (
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
      })}
    </>
  );
}

export function OffDuty({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>Off Duty</h2>
      <p>Cities, civilian vehicles, and hobbies. Hobbies have not been entered.</p>
      <GearGroups groups={["cars", "motorcycles", "cities"]} onOpen={onOpen} />
      <h3>Hobbies</h3>
      <p className="quiet">None entered.</p>
    </main>
  );
}
