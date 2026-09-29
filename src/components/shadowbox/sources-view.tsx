import { caseCopy, credits, insignia, warfare } from "@/lib/shadowbox/model";

export function Sources() {
  return (
    <main className="sheet">
      <h2>Where the pictures and the facts come from</h2>
      <p>{caseCopy.sourcesLead}</p>
      <ul className="credits">
        {credits.map((credit) => (
          <li key={credit.id}>
            <strong>{credit.title}</strong>
            <span>{credit.creator}</span>
            <span>{credit.license}</span>
            {credit.sourceUrl ? <a href={credit.sourceUrl}>{credit.sourceUrl.replace("https://", "")}</a> : null}
            <span className="quiet">{credit.notes}</span>
          </li>
        ))}
      </ul>
      <h3>Insignia in the case</h3>
      <ul className="stack">
        {insignia.map((item) => (
          <li key={item.id}><span className="row-btn static"><strong>{item.name}</strong></span></li>
        ))}
        {warfare.map((pin) => (
          <li key={pin.id}><span className="row-btn static"><strong>{pin.abbreviation}</strong><span>{pin.name}</span></span></li>
        ))}
      </ul>
    </main>
  );
}
