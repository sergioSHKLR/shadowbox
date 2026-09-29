import { caseCopy, equipment, EQUIPMENT_GROUPS, publicUrl, type Kind } from "@/lib/shadowbox/model";

export function EquipmentView({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>Gear, Weapons, Comms, Vehicles &amp; Boats</h2>
      <p>{caseCopy.equipmentLead}</p>
      {EQUIPMENT_GROUPS.map((group) => {
        const list = equipment.filter((item) => item.group === group.id).sort((a, b) => a.order - b.order);
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
