import { formatWhen, necs, placeById, schools, type Kind } from "@/lib/shadowbox/model";

export function Schools({
  onOpen,
  title,
  lead,
  necTitle,
  necLead,
  dateNeeded,
}: {
  onOpen: (k: Kind, id: string) => void;
  title: string;
  lead: string;
  necTitle: string;
  necLead: string;
  dateNeeded: string;
}) {
  const courses = [...schools].sort((a, b) => (a.start || "9999").localeCompare(b.start || "9999"));
  const specialties = [...necs].sort((a, b) => (a.awarded || "9999").localeCompare(b.awarded || "9999"));
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>{lead}</p>
      <ul className="stack">
        {courses.map((school) => {
          const place = placeById(school.placeId);
          return (
            <li key={school.id}>
              <button type="button" className="row-btn" onClick={() => onOpen("school", school.id)}>
                <strong>{school.start ? formatWhen(school.start) : dateNeeded}</strong>
                <span>{school.name}</span>
                <em>{[school.abbreviation, school.length, place?.name].filter(Boolean).join(" · ")}</em>
              </button>
            </li>
          );
        })}
      </ul>
      <h2>{necTitle}</h2>
      <p>{necLead}</p>
      <ul className="stack">
        {specialties.map((nec) => (
          <li key={nec.id}>
            <button type="button" className="row-btn" onClick={() => onOpen("nec", nec.id)}>
              <strong>{nec.awarded ? formatWhen(nec.awarded) : dateNeeded}</strong>
              <span>{nec.code} · {nec.name}</span>
              <em>{[nec.currentCode && nec.currentCode !== nec.code ? `now ${nec.currentCode}` : null, nec.role, nec.years].filter(Boolean).join(" · ")}</em>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
