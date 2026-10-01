import {
  formatSpan,
  insignia,
  photos,
  profile,
  publicUrl,
  ribbonRows,
  units,
  warfare,
  type Kind,
} from "@/lib/shadowbox/model";
import { CareerGlyph, RibbonButton } from "@/components/shadowbox/marks";

const CASE_ORDER: { id: string; affiliation: string }[] = [
  { id: "tortuga", affiliation: "TAD" },
  { id: "ncts", affiliation: "Assigned" },
  { id: "frank-cable", affiliation: "Assigned" },
  { id: "eodmu5", affiliation: "Assigned" },
  { id: "troy", affiliation: "Deployment partner" },
  { id: "sercc", affiliation: "Assigned" },
  { id: "ia-army", affiliation: "Deployment" },
  { id: "jcse", affiliation: "Assigned" },
  { id: "cjsotf", affiliation: "Two deployments" },
  { id: "navhosp", affiliation: "Assigned" },
];

const HOSTS = [
  { id: "rtn", name: "Royal Thai Navy", patch: "RTN", affiliation: "Host \u00b7 Cobra Gold \u00d72" },
  { id: "auscdt", name: "Australian Clearance Diving Team", patch: "AUSCDT", affiliation: "Host \u00b7 Talisman Saber \u00d72" },
];

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
  const tiles = CASE_ORDER.map((row) => ({ ...row, unit: units.find((unit) => unit.id === row.id) })).filter((row) => row.unit);
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
              <ul className="patch-row" aria-label="Commands and partners, in career order">
                {tiles.map(({ unit, affiliation }) => unit ? (
                  <li key={unit.id}>
                    <button type="button" className={unit.image ? "patch has-crest" : "patch"} onClick={() => onOpen("unit", unit.id)} aria-label={`${unit.name}, ${affiliation}. Open the sidebar.`}>
                      {unit.image ? <img className="patch-crest" src={publicUrl(unit.image)} alt="" /> : null}
                      <span className="patch-mark">{unit.patch}</span>
                      <span className="designator">{affiliation}</span>
                      <span>{formatSpan(unit.start, unit.end)}</span>
                    </button>
                  </li>
                ) : null)}
                {HOSTS.map((host) => (
                  <li key={host.id}>
                    <button type="button" className="patch" onClick={() => onOpen("unit", "eodmu5")} aria-label={`${host.name}, ${host.affiliation}. Open the EOD Mobile Unit Five sidebar.`}>
                      <span className="patch-mark">{host.patch}</span>
                      <span className="designator">{host.affiliation}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {portraitWithPlaque(chief, plaques.chief)}
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
        </div>
      </section>
    </main>
  );
}
