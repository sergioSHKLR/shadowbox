import { formatWhen, placeById, schools, type Kind } from "@/lib/shadowbox/model";

export function Schools({ onOpen, title, lead }: { onOpen: (k: Kind, id: string) => void; title: string; lead: string }) {
  const list = [...schools].sort((a, b) => (a.start || "9999").localeCompare(b.start || "9999"));
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>{lead}</p>
      <ul className="stack">
        {list.map((school) => {
          const place = placeById(school.placeId);
          return (
            <li key={school.id}>
              <button type="button" className="row-btn" onClick={() => onOpen("school", school.id)}>
                <strong>{school.start ? formatWhen(school.start) : "Date needed"}</strong>
                <span>{school.name}</span>
                <em>{[school.abbreviation, school.length, place?.name].filter(Boolean).join(" · ")}</em>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
