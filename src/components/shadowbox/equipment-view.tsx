import { useState } from "react";
import usedHereJson from "@/data/used-here.json";
import {
  caseCopy,
  equipment,
  EQUIPMENT_GROUPS,
  operations,
  publicUrl,
  unitById,
  units,
  type Kind,
} from "@/lib/shadowbox/model";

const usedHere = usedHereJson as Record<string, string[]>;

function ownersOf(id: string): string[] {
  const found = new Set<string>();
  const item = equipment.find((row) => row.id === id);
  if (item?.unitId) found.add(item.unitId);
  for (const [owner, ids] of Object.entries(usedHere)) {
    if (ids.includes(id)) found.add(owner);
  }
  return [...found];
}

function ownerLabel(id: string): string {
  const unit = unitById(id) ?? units.find((u) => u.id === id);
  if (unit) return unit.abbreviation || unit.name;
  const op = operations.find((o) => o.id === id);
  if (op) return op.theater || op.name;
  return id;
}

const COMMANDS = [...new Set(equipment.flatMap((item) => ownersOf(item.id)))]
  .map((id) => ({ id, label: ownerLabel(id) }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function EquipmentView({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const [shown, setShown] = useState<string[] | null>(null);
  const toggle = (id: string) =>
    setShown((cur) => {
      if (!cur) return [id];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return next.length === 0 || next.length === COMMANDS.length ? null : next;
    });
  const visible = equipment.filter((item) => {
    const owners = ownersOf(item.id);
    if (!shown) return true;
    if (!owners.length) return false;
    return owners.some((id) => shown.includes(id));
  });

  return (
    <main className="sheet">
      <h2>Gear, Weapons, Comms, Vehicles & Boats</h2>
      <p>{caseCopy.equipmentLead}</p>
      <div className="map-filter" role="group" aria-label="Show gear by command">
        <button type="button" className={`nav-btn${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>All</button>
        {COMMANDS.map((g) => (
          <button key={g.id} type="button" className={`nav-btn${shown?.includes(g.id) ? " on" : ""}`} aria-pressed={!!shown?.includes(g.id)} onClick={() => toggle(g.id)}>
            {g.label}
          </button>
        ))}
      </div>
      {EQUIPMENT_GROUPS.map((group) => {
        const list = visible.filter((item) => item.group === group.id).sort((a, b) => a.order - b.order);
        if (!list.length) return null;
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
