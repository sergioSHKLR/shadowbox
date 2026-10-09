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
const DUTY = ["armor", "helmets", "weapons", "comms", "vehicles", "ships", "aircraft"];
/** C-5 and C-9 are off duty on the AS-40 tour, so they stay off this page. */
const OFF_DUTY_IDS = new Set(["c-5", "c-9"]);

function ownersOf(id: string): string[] {
  const found = new Set<string>();
  const item = equipment.find((row) => row.id === id);
  if (item?.unitId) found.add(item.unitId);
  for (const [owner, ids] of Object.entries(usedHere)) {
    if (ids.includes(id)) found.add(owner);
  }
  return [...found];
}
/** Short names for the deployment chips. The two Afghanistan tours are OEF I (2010–2011) and OEF II (2012–2013). */
const CHIP_LABEL: Record<string, string> = {
  "oef-2010": "OEF I",
  "oef-2012": "OEF II",
  troy: "OIF I",
  "ia-army": "OIF II",
  cjsotf: "OEF I",
  sojtf: "OEF II",
};
const UNLISTED = "unlisted";

function ownerLabel(id: string): string {
  if (CHIP_LABEL[id]) return CHIP_LABEL[id];
  const unit = unitById(id) ?? units.find((u) => u.id === id);
  if (unit) return unit.abbreviation || unit.name;
  const op = operations.find((o) => o.id === id);
  if (op) return op.theater || op.name;
  return id;
}
/** Date of a command. A unit with no date of its own keeps the previous command's start, the same way the record does. */
function commandWhen(id: string): string {
  const at = units.findIndex((unit) => unit.id === id);
  if (at >= 0) {
    let when = "";
    for (let i = 0; i <= at; i++) if (units[i].start) when = units[i].start as string;
    return when;
  }
  return operations.find((op) => op.id === id)?.start ?? "9999";
}
const COMMANDS = [
  ...[...new Set(equipment.filter((item) => DUTY.includes(item.group)).flatMap((item) => ownersOf(item.id)))]
    .map((id) => ({ id, label: ownerLabel(id) }))
    .sort((a, b) => commandWhen(a.id).localeCompare(commandWhen(b.id)) || a.label.localeCompare(b.label)),
  { id: UNLISTED, label: "Unlisted" },
];

export function OnDuty({ onOpen, title }: { onOpen: (k: Kind, id: string) => void; title: string }) {
  const [shown, setShown] = useState<string[] | null>(null);
  const toggle = (id: string) =>
    setShown((cur) => {
      if (!cur) return [id];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return next.length === 0 || next.length === COMMANDS.length ? null : next;
    });
  const DROPPED = new Set(["iotv-ucp", "plate-carrier-multicam", "ach-tan", "ach-acu-cover"]);
  const visible = equipment.filter((item) => {
    if (DROPPED.has(item.id)) return false;
    if (!DUTY.includes(item.group) || OFF_DUTY_IDS.has(item.id)) return false;
    if (!shown) return true;
    const owners = ownersOf(item.id);
    if (!owners.length) return shown.includes(UNLISTED);
    return owners.some((id) => shown.includes(id));
  });
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>{caseCopy.equipmentLead}</p>
      <div className="map-filter" role="group" aria-label="Show gear by command">
        <button type="button" className={`nav-btn${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>All</button>
        {COMMANDS.map((g) => (
          <button key={g.id} type="button" className={`nav-btn${shown?.includes(g.id) ? " on" : ""}`} aria-pressed={!!shown?.includes(g.id)} onClick={() => toggle(g.id)}>{g.label}</button>
        ))}
      </div>
      {EQUIPMENT_GROUPS.filter((group) => DUTY.includes(group.id)).map((group) => {
        const list = visible.filter((item) => item.group === group.id).sort((a, b) => a.order - b.order);
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
    </main>
  );
}
