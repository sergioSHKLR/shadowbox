import { caseCopy, credits, insignia, publicUrl, warfare } from "@/lib/shadowbox/model";

export function Sources() {
  return (
    <main className="sheet">
      <h2>Where the pictures and the facts come from</h2>
      <p>{caseCopy.sourcesLead}</p>
      <p className="cheat-sheet-link">
        <a className="nav-btn" href={publicUrl("/shadowbox-cheat-sheet.pdf")} download="shadowbox-cheat-sheet.pdf" type="application/pdf">
          Download the cheat sheet (PDF, 5 pages)
        </a>
        <span className="quiet"> The printable code list for what was used where: uniforms, weapons, vehicles, ships, armor, helmets, comms, bases and NECs.</span>
      </p>
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
          <li key={item.id}><span className="row-btn static"><strong>{item.name}</strong><span>Image of the insignia</span></span></li>
        ))}
        {warfare.map((pin) => (
          <li key={pin.id}><span className="row-btn static"><strong>{pin.abbreviation}</strong><span>Image of the warfare pin</span></span></li>
        ))}
      </ul>
    </main>
  );
}
