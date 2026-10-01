import {
  awards,
  formatSpan,
  insignia,
  medalFor,
  photos,
  profile,
  publicUrl,
  ribbonRows,
  units,
  warfare,
  type Kind,
} from "@/lib/shadowbox/model";
import { CareerGlyph, RibbonButton } from "@/components/shadowbox/marks";

const COMMANDS = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];

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
  rows: _rows,
  onOpen,
}: {
  rows: ReturnType<typeof ribbonRows>;
  onOpen: (k: Kind, id: string) => void;
}) {
  void _rows;
  const marks = caseMarks();
  const mark = (id: string) => marks.find((entry) => entry.id === id);
  const etMark = mark("et-rating-mark");
  const esws = mark("esws");
  const exw = mark("exw");
  const jcse = mark("jcse-device");
  const recruit = photos.find((photo) => photo.id === "recruit-portrait-1997");
  const chief = photos.find((photo) => photo.id === "chief-portrait-2018");
  const plaques = profile.casePlaques;
  const commands = COMMANDS.map((id) => units.find((unit) => unit.id === id)).filter((unit) => unit);
  const medals = awards
    .map((award) => ({ award, medal: medalFor(award.id) }))
    .filter((row) => row.medal?.front)
    .sort((a, b) => a.award.precedence - b.award.precedence);
  const ribbonOnly = ribbonRows(awards.filter((award) => !medalFor(award.id)?.front));
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
  const renderMark = (item: (typeof marks)[number], worn?: string) => (
    <button key={`${item.kind}-${item.id}`} type="button" className={worn ?? "mark"} onClick={() => onOpen(item.kind, item.id)} aria-label={`${item.name}. Open the explanation.`}>
      {worn && item.image ? <img src={publicUrl(item.image)} alt="" /> : <><CareerGlyph image={item.image} glyph={item.glyph} /><span className={item.image ? undefined : "mark-word"}>{item.short}</span></>}
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
              <ul className="patch-row" aria-label="Assigned commands">
                {commands.map((unit) => unit ? (
                  <li key={unit.id}>
                    <button type="button" className={unit.image ? "patch has-crest" : "patch"} onClick={() => onOpen("unit", unit.id)} aria-label={`${unit.name}, assigned. Open the sidebar.`}>
                      {unit.image ? <img className="patch-crest" src={publicUrl(unit.image)} alt="" /> : null}
                      <span className="patch-mark">{unit.patch}</span>
                      <span className="designator">Assigned</span>
                      <span>{formatSpan(unit.start, unit.end)}</span>
                    </button>
                  </li>
                ) : null)}
              </ul>
              {etMark ? renderMark(etMark, "worn worn-et") : null}
              {esws ? renderMark(esws, "worn worn-pin") : null}
              <div className="rack" aria-label="Ribbons that are not medals">
                {ribbonOnly.map((row) => (
                  <div key={row.map((award) => award.id).join("-")} className="rack-row">
                    {row.map((award) => (
                      <RibbonButton key={award.id} award={award} onOpen={() => onOpen("award", award.id)} />
                    ))}
                  </div>
                ))}
              </div>
              <ul className="case-medals" aria-label="Medals">
                {medals.map(({ award, medal }) => (
                  <li key={award.id}>
                    <button type="button" onClick={() => onOpen("award", award.id)} aria-label={`${award.name}. Open the medal.`}>
                      <img src={publicUrl(medal!.front)} alt="" />
                    </button>
                  </li>
                ))}
              </ul>
              {exw ? renderMark(exw, "worn worn-pin") : null}
              {jcse ? renderMark(jcse, "worn worn-badge") : null}
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
              {portraitWithPlaque(chief, plaques.chief)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
