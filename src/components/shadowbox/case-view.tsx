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

const COMMANDS = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
const PARTNERS: { id: string; affiliation: string; patch?: string; name?: string; openId?: string }[] = [
  { id: "tortuga", affiliation: "TAD" },
  { id: "rtn", affiliation: "Host \u00b7 Cobra Gold \u00d72", patch: "RTN", name: "Royal Thai Navy", openId: "eodmu5" },
  { id: "auscdt", affiliation: "Host \u00b7 Talisman Saber \u00d72", patch: "AUSCDT", name: "Australian Clearance Diving Team", openId: "eodmu5" },
  { id: "troy", affiliation: "Deployment partner" },
  { id: "ia-army", affiliation: "Deployment", patch: "IRON", name: "Task Force Iron Shield" },
  { id: "cjsotf", affiliation: "Two deployments" },
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
  const commands = COMMANDS.map((id) => units.find((unit) => unit.id === id)).filter((unit) => unit);
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
              <p className="case-label">Commands</p>
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
              <p className="case-label">Partners</p>
              <ul className="patch-row" aria-label="Partners in chronological order">
                {PARTNERS.map((row) => {
                  const unit = units.find((item) => item.id === row.id);
                  const label = row.name ?? unit?.name ?? row.id;
                  const plate = row.patch ?? unit?.patch ?? label;
                  const hasCrest = Boolean(unit?.image) && row.id !== "ia-army";
                  return (
                    <li key={row.id}>
                      <button type="button" className={hasCrest ? "patch has-crest" : "patch"} onClick={() => onOpen("unit", row.openId ?? row.id)} aria-label={`${label}, ${row.affiliation}. Open the sidebar.`}>
                        {hasCrest ? <img className="patch-crest" src={publicUrl(unit!.image!)} alt="" /> : <span className="word-plate">{plate}</span>}
                        <span className="patch-mark">{label}</span>
                        <span className="designator">{row.affiliation}</span>
                        <span>{unit ? formatSpan(unit.start, unit.end) : ""}</span>
                      </button>
                    </li>
                  );
                })}
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
