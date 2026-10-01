import { useEffect, useRef, useState } from "react";
import {
  awards, formatSpan, insignia, medalFor, photos, profile, publicUrl, ribbonRows, units, warfare,
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
const DEVICE_ART: Record<string, string> = { esws: "/incoming/esws.png", exw: "/incoming/exw.png", "jcse-device": "/incoming/jcse-breast.png" };
const TOUR_AWARDS: Record<string, string[]> = { navhosp: ["NC"] };
const RANK: Record<string, { start: string; end: string }> = {
  ncts: { start: "E-4", end: "E-5" }, "frank-cable": { start: "E-5", end: "E-6" },
  eodmu5: { start: "E-6", end: "E-6" }, sercc: { start: "E-6", end: "E-6" },
  jcse: { start: "E-6", end: "E-6" }, navhosp: { start: "E-6", end: "E-7" },
};
const PATCH: Record<string, string> = {
  "E-4": "/uniforms/pieces/patch-e4-red.svg", "E-5": "/uniforms/pieces/patch-e5-red.svg",
  "E-6": "/uniforms/pieces/patch-e6-red.svg", "E-6-gold": "/uniforms/pieces/patch-e6-gold.svg",
  "E-7": "/uniforms/pieces/patch-e7-gold.svg",
};
const RANK_ID: Record<string, string> = { "E-4": "et3", "E-5": "et2", "E-6": "et1", "E-7": "etc" };
type Card = { title: string; src?: string; open?: Kind; id?: string; children?: Card[] };
const FELT: Card[] = [
  { title: "Instruction", children: [
    { title: "Recruit Training Command", id: "rtc", open: "unit" },
    { title: "Naval Training Center Great Lakes", id: "ntc-great-lakes", open: "unit" },
  ]},
  { title: "Temporary Additional Duty", children: [
    { title: "USS Tortuga", id: "tortuga", open: "unit", children: [{ title: "ACU 4", src: "/incoming/acu-4.png" }] },
  ]},
  { title: "EOD Mobile Unit Five", id: "eodmu5", open: "unit", children: [
    { title: "Cobra Gold", src: "/incoming/cobra-gold.png", children: [{ title: "Royal Thai Navy", src: "/incoming/rtn.png" }] },
    { title: "Talisman Saber", src: "/incoming/talisman-saber.png", children: [{ title: "AUSCDT", src: "/incoming/auscdt-1.png" }] },
    { title: "Operation Iraqi Freedom", src: "/incoming/troy.png", open: "unit", id: "troy", children: [
      { title: "EODMU 11", src: "/incoming/eodmu11.png" }, { title: "52nd EOD", src: "/incoming/52nd-eod.png" }, { title: "16th EN", src: "/incoming/16th-en.png" },
    ]},
  ]},
  { title: "Southeast Region Correctional Command", id: "sercc", open: "unit", children: [
    { title: "Individual Augmentee", src: "/incoming/ia-army.png", open: "unit", id: "ia-army" },
    { title: "Operation Iraqi Freedom", open: "unit", id: "ia-army", children: [{ title: "11th ADA", src: "/incoming/11th-ada.png" }] },
  ]},
  { title: "Joint Communications Support Element", id: "jcse", open: "unit", children: [
    { title: "Operation Enduring Freedom, 2010", src: "/incoming/cjsotf.png", open: "unit", id: "cjsotf", children: [{ title: "3rd SFG", src: "/incoming/3rd-sfg.png" }] },
    { title: "Operation Enduring Freedom, 2012", src: "/incoming/cjsotf.png", open: "unit", id: "cjsotf", children: [{ title: "75th Rangers", src: "/incoming/75th-rgr.png" }] },
  ]},
];
type Block = { kind: string | null; id: string | null; lists: Record<string, string[]> };
const blocks = supplementJson as unknown as Block[];
const clean = (value: string) => value.replace(/^[A-Z]+-\d+:\s*/, "");
const list = (id: string, field: string) => blocks.find((block) => block.kind === "unit" && block.id === id)?.lists[field]?.map(clean) ?? [];
function crest(card: Card) { return card.src || units.find((unit) => unit.id === card.id)?.image; }
function Collar({ grade, gold, onOpen }: { grade: string; gold?: boolean; onOpen: (k: Kind, id: string) => void }) {
  const src = gold && grade === "E-6" ? PATCH["E-6-gold"] : PATCH[grade];
  const id = RANK_ID[grade];
  return src ? <button type="button" className="line-hit" onClick={() => id && onOpen("rank", id)} aria-label={`${grade} rate. Open the rank.`}><img className="rate-patch" src={publicUrl(src)} alt="" /></button> : null;
}
const HASH = (count: number, gold: boolean) => `/incoming/hash-${count}-${gold ? "gold" : "red"}.png`;
function HashMarks({ end, grade, onOpen }: { end?: string; grade?: string; onOpen: (k: Kind, id: string) => void }) {
  const years = end ? Number(end) - 1997 : 0;
  const count = Math.floor(years / 4);
  const gold = years >= 12;
  const id = grade ? RANK_ID[grade] : undefined;
  if (!count) return null;
  return <button type="button" className="line-hit hashes" onClick={() => id && onOpen("rank", id)} aria-label={`${count} ${gold ? "gold" : "red"} service stripes. Open the rank they were worn with.`}><img src={publicUrl(HASH(count, gold))} alt="" /></button>;
}
function caseMarks() {
  const marks: { kind: Kind; id: string; short: string; image?: string; glyph?: string; name: string }[] = [];
  for (const mark of profile.caseMarks) {
    if (mark.kind === "insignia") {
      const item = insignia.find((entry) => entry.id === mark.id);
      if (item) marks.push({ kind: "insignia", id: item.id, short: item.short, image: item.image, glyph: item.glyph, name: item.name });
    } else if (mark.kind === "warfare") {
      const pin = warfare.find((entry) => entry.id === mark.id);
      if (pin) marks.push({ kind: "warfare", id: pin.id, short: pin.abbreviation, image: pin.image, glyph: pin.glyph, name: pin.name });
    }
  }
  return marks;
}
function AwardStrip({ items, onOpen, kind }: { items: Award[]; onOpen: (id: string) => void; kind: "ribbon" | "medal" }) {
  if (!items.length) return null;
  return <ul className={`story-awards ${kind}-line`}>{items.map((award) => <li key={award.id}><button type="button" onClick={() => onOpen(award.id)} aria-label={`${award.name}, ${award.count}`}><img className={kind === "medal" ? "medal-line" : "ribbon-line"} src={publicUrl(medalFor(award.id)?.front || award.ribbon)} alt="" /></button></li>)}</ul>;
}
function Felt({ query, onOpen, onBack }: { query: string; onOpen: (k: Kind, id: string) => void; onBack: (back: (() => void) | undefined) => void }) {
  const [path, setPath] = useState<Card[]>([]);
  const [moreDown, setMoreDown] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const cards = (path.length ? path[path.length - 1].children ?? [] : FELT).filter((card) => card.title.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { onBack(path.length ? () => setPath(path.slice(0, -1)) : undefined); }, [path, onBack]);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setMoreDown(el.scrollHeight - el.scrollTop - el.clientHeight > 24);
    check();
    el.addEventListener("scroll", check);
    return () => el.removeEventListener("scroll", check);
  }, [path, query]);
  return (
    <div className="felt-window">
      {path.length ? <button type="button" className="felt-left" onClick={() => setPath(path.slice(0, -1))} aria-label="Back" /> : null}
      <div className="felt-track" style={{ transform: `translateX(-${path.length * 33.333}%)` }}>
        {[0, 1, 2].map((pane) => {
          const shown = pane === path.length;
          return (
            <section key={pane} className="felt-pane" aria-hidden={!shown} ref={shown ? scroller : undefined}>
              <ul>
                {(shown ? cards : []).map((card) => {
                  const image = crest(card);
                  return (
                    <li key={card.title}>
                      <button type="button" onClick={() => { if (card.open && card.id) onOpen(card.open, card.id); if (card.children?.length) setPath([...path, card]); }} aria-label={card.title}>
                        {image ? <img src={publicUrl(image)} alt="" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      {moreDown ? <span className="felt-down" aria-hidden="true" /> : null}
    </div>
  );
}

export function Case({ rows: _rows, onOpen, query: outerQuery = "" }: { rows: ReturnType<typeof ribbonRows>; onOpen: (k: Kind, id: string) => void; query?: string }) {
  void _rows;
  const [tab, setTab] = useState<"assigned" | "supplemental">("assigned");
  const [localQuery, setQuery] = useState("");
  const query = outerQuery || localQuery;
  const [back, setBack] = useState<(() => void) | undefined>();
  const [moreDown, setMoreDown] = useState(false);
  const marks = caseMarks();
  const recruit = photos.find((photo) => photo.id === "recruit-portrait-1997");
  const chief = photos.find((photo) => photo.id === "chief-portrait-2018");
  useEffect(() => {
    const el = document.querySelector(".felt-surface");
    if (!el) return;
    const check = () => setMoreDown(el.scrollHeight - el.scrollTop - el.clientHeight > 24);
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => { el.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, [tab]);
  const portrait = (photo: (typeof photos)[number] | undefined, lines: string[]) => photo ? (
    <figure className="case-portrait">
      <button type="button" className="case-photo" onClick={() => onOpen("photo", photo.id)} aria-label={`${photo.caption}. Open the photograph.`}><img src={publicUrl(photo.src)} alt={photo.alt} loading="lazy" /></button>
      <figcaption className="plaque">{lines.map((line) => <span key={line}>{line}</span>)}</figcaption>
    </figure>
  ) : null;
  return (
    <main>
      <section className="case" aria-label="Shadowbox">
        <div className="case-pages"><button type="button" className={tab === "assigned" ? "page-link on" : "page-link"} onClick={() => setTab("assigned")}>Assigned</button><button type="button" className={tab === "supplemental" ? "page-link on" : "page-link"} onClick={() => setTab("supplemental")}>Supplemental</button></div>
          <h2 className="sr-only">{profile.name}, {profile.rating} {profile.rank}</h2>
          <div className="case-display"><div className="case-column">
            {tab === "assigned" ? (
              <>
                {portrait(recruit, ["Seaman Recruit", "Sergio Schickler", "30 Jun 1997"])}
                {COMMANDS.filter((id) => (units.find((item) => item.id === id)?.name ?? "").toLowerCase().includes(query.toLowerCase())).map((id) => {
                  const unit = units.find((item) => item.id === id);
                  if (!unit) return null;
                  const codes = list(id, "Awards").length ? list(id, "Awards") : TOUR_AWARDS[id] ?? [];
                  const earned = codes.map((code) => awards.find((award) => award.id === AWARD_CODE[code])).filter((award): award is Award => Boolean(award));
                  const devices = (DEVICES[id] ?? []).map((markId) => marks.find((mark) => mark.id === markId)).filter((mark) => mark);
                  const rank = RANK[id];
                  const gold = Number(unit.end) - 1997 >= 12;
                  return (
                    <article key={id} className="command-line">
                      <button type="button" className="story-crest" onClick={() => onOpen("unit", id)} aria-label={`${unit.name}. Open the sidebar.`}>{unit.image ? <img src={publicUrl(unit.image)} alt="" /> : null}</button>
                      <div className="line-body">
                      <p className="line-name">{unit.name}{unit.designator ? <span> ({unit.designator})</span> : null}</p>
                      <div className="line-marks">
                        {rank ? <Collar grade={rank.start} onOpen={onOpen} /> : null}
                        {rank ? <Collar grade={rank.end} gold={gold} onOpen={onOpen} /> : null}
                        <HashMarks end={unit.end} grade={rank?.end} onOpen={onOpen} />
                        <AwardStrip kind="ribbon" items={earned.filter((award) => !medalFor(award.id)?.front)} onOpen={(awardId) => onOpen("award", awardId)} />
                        <AwardStrip kind="medal" items={earned.filter((award) => medalFor(award.id)?.front)} onOpen={(awardId) => onOpen("award", awardId)} />
                        {devices.length ? <ul className="story-awards device-line">{devices.map((mark) => mark ? <li key={mark.id}><button type="button" onClick={() => onOpen(mark.kind, mark.id)} aria-label={mark.name}>{<img src={publicUrl(DEVICE_ART[mark.id] || mark.image || "")} alt="" />}</button></li> : null)}</ul> : null}
                      </div>
                      </div>
                    </article>
                  );
                })}
                {portrait(chief, ["Chief Petty Officer", "Sergio Schickler", "28 Feb 2018"])}
              </>
            ) : <Felt query={query} onOpen={onOpen} onBack={setBack} />}
          </div></div>
          {moreDown ? <span className="page-down" aria-hidden="true" /> : null}
      </section>
    </main>
  );
}
