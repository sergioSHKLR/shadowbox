import { useState } from "react";
import {
  awards, formatSpan, insignia, medalFor, photos, profile, publicUrl, ribbonRows, units, visits, warfare,
  type Award, type Kind,
} from "@/lib/shadowbox/model";
import { CareerGlyph } from "@/components/shadowbox/marks";
import supplementJson from "@/data/supplement.json";

const COMMANDS = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
const AWARD_CODE: Record<string, string> = {
  NAM: "nam", GCM: "ngcm", NDSM: "ndsm", PISTOL: "pistol", MUC: "nmuc", "NAVY E": "navy-e",
  HSM: "hsm", SSDR: "ssdr", ICM: "icm", "GWOT-SM": "gwotsm", OSSR: "osr", JSCM: "jscm",
  JSAM: "jsam", JMUA: "jmua", ACM: "acm", NATO: "nato", AAM: "aam", ARCOM: "arcom", NC: "ncm",
};
const DEVICES: Record<string, string[]> = { "frank-cable": ["esws"], jcse: ["exw", "jcse-device"] };
const TOUR_AWARDS: Record<string, string[]> = { navhosp: ["NC"] };
const TOUR_NOTE: Record<string, { nec?: string; workcenter?: string }> = {
  navhosp: { nec: "95PT \u00b7 Command Fitness Leader", workcenter: "CFL Office" },
};
const RANK: Record<string, { start: string; end: string }> = {
  ncts: { start: "E-4", end: "E-5" }, "frank-cable": { start: "E-5", end: "E-6" },
  eodmu5: { start: "E-6", end: "E-6" }, sercc: { start: "E-6", end: "E-6" },
  jcse: { start: "E-6", end: "E-6" }, navhosp: { start: "E-6", end: "E-7" },
};
const COLLAR: Record<string, string> = {
  "E-4": "/incoming/collar-po3.jpg", "E-5": "/incoming/collar-po2.jpg",
  "E-6": "/incoming/collar-po1.jpg", "E-7": "/incoming/collar-cpo.jpg",
};
const SUPPLEMENTAL = [
  { label: "Instruction", ids: ["rtc", "ntc-great-lakes"] },
  { label: "Temporary Additional Duty", ids: ["tortuga"] },
  { label: "Individual Augmentee", ids: ["ia-army"] },
  { label: "Operations", ids: ["troy", "cjsotf"] },
];
const EXERCISE_CREST: Record<string, string> = { "cobra-gold": "/incoming/cobra-gold.png", "talisman-saber": "/incoming/talisman-saber.png" };
type Block = { kind: string | null; id: string | null; lists: Record<string, string[]> };
const blocks = supplementJson as unknown as Block[];
const clean = (value: string) => value.replace(/^[A-Z]+-\d+:\s*/, "");
const list = (id: string, field: string) => blocks.find((block) => block.kind === "unit" && block.id === id)?.lists[field]?.map(clean) ?? [];

function Collar({ grade }: { grade: string }) {
  const src = COLLAR[grade];
  return src ? <img className="collar" src={publicUrl(src)} alt="" /> : null;
}
function HashMarks({ end }: { end?: string }) {
  const years = end ? Number(end) - 1997 : 0;
  const count = Math.floor(years / 4);
  const gold = years >= 12;
  if (!count) return null;
  return (
    <span className="hashes" aria-label={`${count} ${gold ? "gold" : "red"} service stripes`}>
      {Array.from({ length: count }, (_, index) => <img key={index} src={publicUrl(gold ? "/incoming/hash-gold.jpg" : "/incoming/hash-red.jpg")} alt="" />)}
    </span>
  );
}
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
      {items.map((award) => (
        <li key={award.id}>
          <button type="button" onClick={() => onOpen(award.id)} aria-label={`${award.name}, ${award.count}`}>
            <img src={publicUrl(medalFor(award.id)?.front || award.ribbon)} alt="" />
            <span>{award.abbreviation}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Case({ rows: _rows, onOpen }: { rows: ReturnType<typeof ribbonRows>; onOpen: (k: Kind, id: string) => void }) {
  void _rows;
  const [tab, setTab] = useState<"assigned" | "supplemental">("assigned");
  const marks = caseMarks();
  const recruit = photos.find((photo) => photo.id === "recruit-portrait-1997");
  const chief = photos.find((photo) => photo.id === "chief-portrait-2018");
  const plaques = profile.casePlaques;
  const portrait = (photo: (typeof photos)[number] | undefined, lines: string[]) => photo ? (
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
        <div className="case-tabs" role="tablist" aria-label="Case pages">
          <button type="button" role="tab" aria-selected={tab === "assigned"} className={tab === "assigned" ? "case-tab on" : "case-tab"} onClick={() => setTab("assigned")}>Assigned</button>
          <button type="button" role="tab" aria-selected={tab === "supplemental"} className={tab === "supplemental" ? "case-tab on" : "case-tab"} onClick={() => setTab("supplemental")}>Supplemental</button>
        </div>
        <div className="case-frame">
          <h2 className="sr-only">{profile.name}, {profile.rating} {profile.rank}</h2>
          <div className="case-display">
            <div className="case-column">
              {tab === "assigned" ? (
                <>
                  {portrait(recruit, plaques.recruit)}
                  {COMMANDS.map((id) => {
                    const unit = units.find((item) => item.id === id);
                    if (!unit) return null;
                    const codes = list(id, "Awards").length ? list(id, "Awards") : TOUR_AWARDS[id] ?? [];
                    const earned = codes.map((code) => awards.find((award) => award.id === AWARD_CODE[code])).filter((award): award is Award => Boolean(award));
                    const devices = (DEVICES[id] ?? []).map((markId) => marks.find((mark) => mark.id === markId)).filter((mark) => mark);
                    const note = TOUR_NOTE[id];
                    const rank = RANK[id];
                    return (
                      <article key={id} className="command-story">
                        <button type="button" className="story-crest" onClick={() => onOpen("unit", id)} aria-label={`${unit.name}. Open the sidebar.`}>
                          {unit.image ? <img src={publicUrl(unit.image)} alt="" /> : <span>{unit.patch}</span>}
                        </button>
                        <div className="story-copy">
                          <p className="story-rank">
                            {rank ? <span className="rank-pair"><Collar grade={rank.start} /><em>{rank.start}</em><span aria-hidden="true">to</span><Collar grade={rank.end} /><em>{rank.end}</em><HashMarks end={unit.end} /></span> : "Rank not entered"}
                            <span>{formatSpan(unit.start, unit.end)}</span>
                          </p>
                          {note?.nec ? <p>Billet NEC {note.nec}</p> : null}
                          {note?.workcenter ? <p>Workcenter {note.workcenter}</p> : null}
                          <h3>Medals</h3>
                          <AwardStrip items={earned.filter((award) => medalFor(award.id)?.front)} onOpen={(awardId) => onOpen("award", awardId)} />
                          <h3>Ribbons</h3>
                          <AwardStrip items={earned.filter((award) => !medalFor(award.id)?.front)} onOpen={(awardId) => onOpen("award", awardId)} />
                          <h3>Devices</h3>
                          {devices.length ? <ul className="story-awards">{devices.map((mark) => mark ? <li key={mark.id}><button type="button" onClick={() => onOpen(mark.kind, mark.id)} aria-label={mark.name}>{mark.image ? <img src={publicUrl(mark.image)} alt="" /> : <CareerGlyph image={mark.image} glyph={mark.glyph} />}<span>{mark.short}</span></button></li> : null)}</ul> : <p className="quiet">Not entered</p>}
                          <p>{unit.explanation}{id === "navhosp" ? " The Navy and Marine Corps Commendation Medal was awarded at the end of the tour, worksheet year 2018. He worked at the CFL Office. The billet NEC was 95PT, Command Fitness Leader." : ""}</p>
                        </div>
                      </article>
                    );
                  })}
                  <dl className="service-totals" aria-label="Service totals">
                    {[["Active Duty", profile.serviceLength], ["Sea Service", profile.seaService], ["Overseas Sea Service", profile.foreignService]].map(([label, value]) => <div key={label}><dt>{label}:</dt> <dd>{value}</dd></div>)}
                  </dl>
                  {portrait(chief, plaques.chief)}
                </>
              ) : (
                <>
                  {SUPPLEMENTAL.map((group) => (
                    <section key={group.label}>
                      <h3 className="case-label">{group.label}</h3>
                      {group.ids.map((id) => {
                        const unit = units.find((item) => item.id === id);
                        if (!unit) return null;
                        return (
                          <article key={id} className="command-story">
                            <button type="button" className="story-crest" onClick={() => onOpen("unit", id)} aria-label={`${unit.name}. Open the sidebar.`}>
                              {unit.image ? <img src={publicUrl(unit.image)} alt="" /> : <span>{unit.patch}</span>}
                            </button>
                            <div className="story-copy">
                              <p className="story-rank">{unit.name} <span>{unit.start ? formatSpan(unit.start, unit.end) : "Dates not entered"}</span></p>
                              <p>{unit.explanation}</p>
                            </div>
                          </article>
                        );
                      })}
                    </section>
                  ))}
                  <section>
                    <h3 className="case-label">Exercises</h3>
                    {visits.filter((visit) => visit.kind === "exercise").map((visit) => (
                      <article key={visit.id} className="command-story">
                        <button type="button" className="story-crest" onClick={() => onOpen("place", visit.placeId)} aria-label={`${visit.title}. Open the place.`}>
                          {EXERCISE_CREST[visit.id] ? <img src={publicUrl(EXERCISE_CREST[visit.id])} alt="" /> : <span>{visit.title}</span>}
                        </button>
                        <div className="story-copy"><p className="story-rank">{visit.title} <span>{visit.when}</span></p></div>
                      </article>
                    ))}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
