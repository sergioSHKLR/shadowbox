import { useState } from "react";
import { caseCopy, equipment, EQUIPMENT_GROUPS, publicUrl, type EquipmentGroup, type Kind } from "@/lib/shadowbox/model";

export function EquipmentView({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const [shown, setShown] = useState<EquipmentGroup[] | null>(null);
  const isOn = (g: EquipmentGroup) => !shown || shown.includes(g);
  const toggle = (g: EquipmentGroup) =>
    setShown((cur) => {
      if (!cur) return [g];
      const next = cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g];
      return next.length === 0 || next.length === EQUIPMENT_GROUPS.length ? null : next;
    });
  const groups = EQUIPMENT_GROUPS.filter((group) => isOn(group.id) && equipment.some((item) => item.group === group.id));

  return (
    <main className="sheet">
      <h2>Gear, Weapons, Comms, Vehicles & Boats</h2>
      <p>{caseCopy.equipmentLead}</p>
      <div className="map-filter" role="group" aria-label="Show gear">
        <button type="button" className={`nav-btn${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>All</button>
        {EQUIPMENT_GROUPS.map((g) => (
          <button key={g.id} type="button" className={`nav-btn${shown?.includes(g.id) ? " on" : ""}`} aria-pressed={!!shown?.includes(g.id)} onClick={() => toggle(g.id)}>
            {g.label}
          </button>
        ))}
      </div>
      {groups.map((group) => {
        const list = equipment.filter((item) => item.group === group.id).sort((a, b) => a.order - b.order);
        return (
          <section key={group.id} className="uniform-group" aria-label={group.label}>
            <h3>{group.label}</h3>
            <ol className="uniform-grid equipment-grid">
              {list.map((item) => (
                <li key={item.id}>
                  <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("equipment", item.id)}>
                    <img className={item.cutout ? "equipment-photo" : "equipment-photo is-photo"} src={publicUrl(item.image)} alt="" loading="lazy" />
                    <strong>{item.name}</strong>
                    {item.caption ? <span>{item.caption}</span> : null}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
