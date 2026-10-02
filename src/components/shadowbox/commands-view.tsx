import { formatSpan, units, type Kind } from "@/lib/shadowbox/model";

const ORDER = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"] as const;

export function Commands({ onOpen, title, lead }: { onOpen: (k: Kind, id: string) => void; title: string; lead: string }) {
  const rows = ORDER.map((id) => units.find((unit) => unit.id === id)).filter((unit) => unit != null);
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>{lead}</p>
      <ul className="stack">
        {rows.map((unit) => (
          <li key={unit.id}>
            <button type="button" className="row-btn" onClick={() => onOpen("unit", unit.id)}>
              <strong>{unit.abbreviation}</strong>
              <span>{unit.name}</span>
              <em>{unit.start ? formatSpan(unit.start, unit.end) : ""}</em>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
