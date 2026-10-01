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
  type Award,
  type Kind,
} from "@/lib/shadowbox/model";
import { CareerGlyph } from "@/components/shadowbox/marks";
import supplementJson from "@/data/supplement.json";

const COMMANDS = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
const AWARD_CODE: Record<string, string> = {
  NAM: "nam", GCM: "ngcm", NDSM: "ndsm", PISTOL: "pistol", MUC: "nmuc", "NAVY E": "navy-e",
  HSM: "hsm", SSDR: "ssdr", ICM: "icm", "GWOT-SM": "gwotsm", OSSR: "osr", JSCM: "jscm",
  JSAM: "jsam", JMUA: "jmua", ACM: "acm", NATO: "nato", AAM: "aam", ARCOM: "arcom", NC: "ncm",
};
const DEVICES: Record<string, string[]> = {
  "frank-cable": ["esws"],
  jcse: ["exw", "jcse-device"],
};
const TOUR_AWARDS: Record<string, string[]> = { navhosp: ["NC"] };
const TOUR_NOTE: Record<string, { nec?: string; workcenter?: string }> = {
  navhosp: { nec: "95PT \u00b7 Command Fitness Leader", workcenter: "CFL Office" },
};

type Block = { kind: string | null; id: string | null; lists: Record<string, string[]> };
const blocks = supplementJson as unknown as Block[];
const clean = (value: string) => value.replace(/^[A-Z]+-\d+:\s*/, "");
const list = (id: string, field: string) =>
  blocks.find((block) => block.kind === "unit" && block.id === id)?.lists[field]?.map(clean) ?? [];

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

function AwardStrip({ items, onOpen }: { items: Award[]; onOpen: (id: string) => void }) {
  if (!items.length) return <p className="quiet">Not entered</p>;
  return (
    <ul className="story-awards">
      {items.map((award) => {
        const medal = medalFor(award.id);
        return (
          <li key={award.id}>
            <button type="button" onClick={() => onOpen(award.id)} aria-label={award.name}>
              <img src={publicUrl(medal?.front || award.ribbon)} alt="" />
              <span>{award.abbreviation}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
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
  const recruit = photos.find((photo) => photo.id === "recruit-portrait-1997");
  const chief = photos.find((photo) => photo.id === "chief-portrait-2018");
  const plaques = profile.casePlaques;
  const portrait = (photo: (typeof photos)[number] | undefined, lines: string[]) =>
    photo ? (
      <figure className="case-portrait">
        <button type="button" className="case-photo" onClick={() => onOpen("photo", photo.id)} aria-label={`${photo.caption}. Open the photograph.`}>
          <img src={publicUrl(photo.src)} alt={photo.alt} loading="lazy" />
        </button>
        <figcaption className="plaque">{lines.map((line) => <span key={line}>{line}</span>)}</figcaption>
      </figure>
    ) : null;
  return (
    <main>
      <section className="case" aria-label="Shadowbox">
        <div className="case-frame">
          <h2 className="sr-only">{profile.name}, {profile.rating} {profile.rank}</h2>
          <div className="case-display">
            <div className="case-column">
              {portrait(recruit, plaques.recruit)}
              {COMMANDS.map((id) => {
                const unit = units.find((item) => item.id === id);
                if (!unit) return null;
                const codes = list(id, "Awards").length ? list(id, "Awards") : TOUR_AWARDS[id] ?? [];
                const earned = codes.map((code) => awards.find((award) => award.id === AWARD_CODE[code])).filter((award): award is Award => Boolean(award));
                const medals = earned.filter((award) => medalFor(award.id)?.front);
                const ribbons = earned.filter((award) => !medalFor(award.id)?.front);
                const devices = (DEVICES[id] ?? []).map((markId) => marks.find((mark) => mark.id === markId)).filter((mark) => mark);
                const note = TOUR_NOTE[id];
                return (
                  <article key={id} className="command-story">
                    <button type="button" className="story-crest" onClick={() => onOpen("unit", id)} aria-label={`${unit.name}. Open the sidebar.`}>
                      {unit.image ? <img src={publicUrl(unit.image)} alt="" /> : <span>{unit.patch}</span>}
                    </button>
                    <div className="story-copy">
                      <p className="story-rank">Rank {list(id, "Rank")[0] || "Not entered"} <span>{formatSpan(unit.start, unit.end)}</span></p>
                      {note?.nec ? <p>Billet NEC {note.nec}</p> : null}
                      {note?.workcenter ? <p>Workcenter {note.workcenter}</p> : null}
                      <h3>Medals</h3>
                      <AwardStrip items={medals} onOpen={(awardId) => onOpen("award", awardId)} />
                      <h3>Ribbons</h3>
                      <AwardStrip items={ribbons} onOpen={(awardId) => onOpen("award", awardId)} />
                      <h3>Devices</h3>
                      {devices.length ? (
                        <ul className="story-awards">
                          {devices.map((mark) => mark ? (
                            <li key={mark.id}>
                              <button type="button" onClick={() => onOpen(mark.kind, mark.id)} aria-label={mark.name}>
                                {mark.image ? <img src={publicUrl(mark.image)} alt="" /> : <CareerGlyph image={mark.image} glyph={mark.glyph} />}
                                <span>{mark.short}</span>
                              </button>
                            </li>
                          ) : null)}
                        </ul>
                      ) : <p className="quiet">Not entered</p>}
                      <p>{unit.explanation}{id === "navhosp" ? " The Navy and Marine Corps Commendation Medal was awarded at the end of the tour, worksheet year 2018. He worked at the CFL Office. The billet NEC was 95PT, Command Fitness Leader." : ""}</p>
                    </div>
                  </article>
                );
              })}
              <dl className="service-totals" aria-label="Service totals">
                {[
                  ["Active Duty", profile.serviceLength],
                  ["Sea Service", profile.seaService],
                  ["Overseas Sea Service", profile.foreignService],
                ].map(([label, value]) => (
                  <div key={label}><dt>{label}:</dt> <dd>{value}</dd></div>
                ))}
              </dl>
              {portrait(chief, plaques.chief)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
