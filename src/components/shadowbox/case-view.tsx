import {
  formatSpan,
  formatWhen,
  insignia,
  photos,
  profile,
  publicUrl,
  ribbonRows,
  units,
  warfare,
  caseRanks,
  type Kind,
} from "@/lib/shadowbox/model";
import { CareerGlyph, RibbonButton } from "@/components/shadowbox/marks";

function caseMarks() {
  const marks: { kind: Kind; id: string; short: string; glyph?: string; image?: string; name: string }[] = [];
  for (const mark of profile.caseMarks) {
    if (mark.kind === "insignia") {
      const item = insignia.find((entry) => entry.id === mark.id);
      if (item) marks.push({ kind: "insignia", id: item.id, short: item.short, glyph: item.glyph, image: item.image, name: item.name });
    } else if (mark.kind === "warfare") {
      const pin = warfare.find((entry) => entry.id === mark.id);
      if (pin) marks.push({ kind: "warfare", id: pin.id, short: pin.abbreviation, glyph: pin.glyph, image: pin.image, name: pin.name });
    }
  }
  return marks;
}

export function Case({
  rows,
  onOpen,
}: {
  rows: ReturnType<typeof ribbonRows>;
  onOpen: (k: Kind, id: string) => void;
}) {
  const marks = caseMarks();
  const mark = (id: string) => marks.find((entry) => entry.id === id);
  const etMark = mark("et-rating-mark");
  const esws = mark("esws");
  const exw = mark("exw");
  const jcse = mark("jcse-device");
  const recruit = photos.find((photo) => photo.id === "recruit-portrait-1997");
  const chief = photos.find((photo) => photo.id === "chief-portrait-2018");
  const plaques = profile.casePlaques;
  const portraitWithPlaque = (photo: (typeof photos)[number] | undefined, lines: string[]) =>
    photo ? (
      <figure className="case-portrait">
        <button type="button" className="case-photo" onClick={() => onOpen("photo", photo.id)} aria-label={`${photo.caption}. Open the photograph.`}>
          <img src={publicUrl(photo.src)} alt={photo.alt} loading="lazy" />
        </button>
        <figcaption className="plaque">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </figcaption>
      </figure>
    ) : null;
  const renderMark = (mark: (typeof marks)[number], worn?: string) => (
    <button
      key={`${mark.kind}-${mark.id}`}
      type="button"
      className={worn ?? "mark"}
      onClick={() => onOpen(mark.kind, mark.id)}
      aria-label={`${mark.name}. Open the explanation.`}
    >
      {worn && mark.image ? (
        <img src={publicUrl(mark.image)} alt="" />
      ) : (
        <>
          <CareerGlyph image={mark.image} glyph={mark.glyph} />
          <span className={mark.image ? undefined : "mark-word"}>{mark.short}</span>
        </>
      )}
    </button>
  );
  return (
    <main>
      <section className="case" aria-label="Shadowbox">
        <div className="case-frame">
          <h2 className="sr-only">{profile.name}, {profile.rating} {profile.rank}</h2>
          <div className="case-display">
            <div className="case-column">
              {portraitWithPlaque(recruit, plaques.recruit)}
              {etMark ? renderMark(etMark, "worn worn-et") : null}
              {esws ? renderMark(esws, "worn worn-pin") : null}
              <div className="rack" aria-label="Ribbon rack, highest award at the top left">
                {rows.map((row) => (
                  <div key={row.map((a) => a.id).join("-")} className="rack-row">
                    {row.map((award) => (
                      <RibbonButton key={award.id} award={award} onOpen={() => onOpen("award", award.id)} />
                    ))}
                  </div>
                ))}
              </div>
              {exw ? renderMark(exw, "worn worn-pin") : null}
              {jcse ? renderMark(jcse, "worn worn-badge") : null}
              <div className="grade-row" role="group" aria-label="Enlisted pay grades, E-3 to E-7">
                {caseRanks.map((rank) => (
                  <button key={rank.id} type="button" className={`worn worn-grade worn-grade--${rank.id}`} onClick={() => onOpen("rank", rank.id)} aria-label={`${rank.name} (${rank.abbreviation}, ${rank.grade})${rank.date ? `, ${formatWhen(rank.date)}` : ""}`} title={`${rank.abbreviation} · ${rank.grade}`}>
                    <img src={publicUrl(rank.image)} alt="" />
                  </button>
                ))}
              </div>
              {portraitWithPlaque(chief, plaques.chief)}
              <dl className="service-totals" aria-label="Service totals">
                {[
                  ["Active Duty", profile.serviceLength],
                  ["Sea Service", profile.seaService],
                  ["Overseas Sea Service", profile.foreignService],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}:</dt> <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <ul className="patch-row" aria-label="Commands, in order">
            {units.map((unit) => (
              <li key={unit.id}>
                <button type="button" className={unit.image ? "patch has-crest" : "patch"} onClick={() => onOpen("unit", unit.id)} aria-label={`${unit.name}${unit.designator ? `, ${unit.designator}` : ""}, ${formatSpan(unit.start, unit.end)}. Open the explanation.`}>
                  {unit.image ? <img className="patch-crest" src={publicUrl(unit.image)} alt="" /> : null}
                  <span className="patch-mark">{unit.patch}</span>
                  {unit.designator ? <span className="designator">{unit.designator}</span> : null}
                  <span>{formatSpan(unit.start, unit.end)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
