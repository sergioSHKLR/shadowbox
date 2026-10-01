import { formatSpan, operations, publicUrl, visits, type Kind } from "@/lib/shadowbox/model";

export function Ops({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const exercises = visits.filter((visit) => visit.kind === "exercise");
  return (
    <main className="sheet">
      <h2>Ops</h2>
      <p>Campaigns are the named deployments. Exercises are the recorded training and host-nation events. Years that were not entered stay blank.</p>
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
      <ul className="stack">
        {exercises.map((visit) => (
          <li key={visit.id}>
            <button type="button" className="row-btn" onClick={() => onOpen("place", visit.placeId)}>
              <strong>{visit.when}</strong>
              <span>{visit.title}</span>
              <em>{visit.id === "cobra-gold" ? "Host \u00b7 Royal Thai Navy \u00d72" : visit.id === "talisman-saber" ? "Host \u00b7 Australian Clearance Diving Team \u00d72" : "Training"}</em>
            </button>
          </li>
        ))}
      </ul>
    </main>
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

import { equipment, EQUIPMENT_GROUPS } from "@/lib/shadowbox/model";

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
