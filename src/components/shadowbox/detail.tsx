import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import supplementJson from "@/data/supplement.json";
import {
  photosFor,
  awards,
  formatSpan,
  medalFor,
  necById,
  operations,
  placeById,
  pinNumbersFor,
  publicUrl,
  reflectionFor,
  toSubject,
  units,
  visits,
  type Kind,
  type Selection,
  type Stop,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";
import { MedalArt, RibbonArt } from "@/components/shadowbox/marks";

const COMMAND_LINKS: Record<string, { kind: Kind; id: string; label: string }[]> = {
  ncts: [{ kind: "unit", id: "tortuga", label: "TAD \u00b7 USS Tortuga (LSD-46) \u00b7 ACU 4" }],
  eodmu5: [
    { kind: "unit", id: "troy", label: "Ops \u00b7 CJTF Troy" },
    { kind: "place", id: "u-tapao", label: "Exercise \u00b7 Cobra Gold \u00b7 Royal Thai Navy" },
    { kind: "place", id: "shoalwater-bay", label: "Exercise \u00b7 Talisman Saber \u00b7 Australian Clearance Diving Team" },
  ],
  sercc: [{ kind: "unit", id: "ia-army", label: "IA \u00b7 Task Force Iron Shield" }],
  jcse: [{ kind: "unit", id: "cjsotf", label: "Ops \u00b7 CJSOTF-A" }],
};

const UNIFORM_IMAGE: Record<string, string> = {
  Smurfs: "/uniforms/v12/01-smurfs-boot-camp.jpg",
  "PO Working Whites": "/uniforms/v12/13-summer-white.jpg",
  "PO Working Blues": "/uniforms/v12/12-winter-blue.jpg",
  "PO Dress Blues": "/uniforms/v12/15-sdb-crackerjack.jpg",
  "PO Dress Whites": "/uniforms/v12/16-sdw-crackerjack.jpg",
  Dungarees: "/uniforms/v12/06-dungarees.jpg",
  "Woodland Camo": "/uniforms/v12/19-woodland-bdu.jpg",
  Utilities: "/uniforms/v12/07-utilities.jpg",
  Coveralls: "/uniforms/v12/08-coveralls.jpg",
  "EOD PT": "/uniforms/v12/03-eodmu-5-pt-2-b.jpg",
  "Desert Camo": "/uniforms/v12/20-desert-dcu.jpg",
  "JCSE PT": "/uniforms/v12/04-jcse-pt.jpg",
  ACU: "/uniforms/v12/21-army-acu.jpg",
  "NWU Type I": "/uniforms/v12/09-nwu-type-i.jpg",
  "New PT": "/uniforms/v12/02-navy-ptu.jpg",
  Multicam: "/uniforms/v12/22-army-ocp.jpg",
  "NWU Type III": "/uniforms/v12/23-nwu-type-iii.jpg",
  "Chief Whites": "/uniforms/v12/14-cpo-summer-white.jpg",
  "Chief Blues": "/uniforms/v12/17-cpo-sdb.jpg",
  "Chief Choker": "/uniforms/v12/18-cpo-sdw.jpg",
  "Chief Khakis": "/uniforms/v12/11-cpo-working-khaki.jpg",
  "Peanut Butters": "/uniforms/v12/10-nsu-peanut-butter.jpg",
};
const CREST: Record<string, string> = {
  "EODMU 11": "/incoming/eodmu11.png",
  "52nd EOD": "/incoming/52nd-eod.png",
  "16th EN": "/incoming/16th-en.png",
  "11th ADA": "/incoming/11th-ada.png",
  "3rd SFG": "/incoming/3rd-sfg.png",
  "75th Rangers": "/incoming/75th-rgr.png",
  "ODA 3213": "/incoming/3rd-sfg.png",
  "3rd SFG (ODA 3213)": "/incoming/3rd-sfg.png",
  "Cobra Gold": "/incoming/cobra-gold.png",
  "Cobra Gold 2004": "/incoming/cobra-gold.png",
  "Cobra Gold 2005": "/incoming/cobra-gold.png",
  "Talisman Saber": "/incoming/talisman-saber.png",
  "Talisman Saber 2005": "/incoming/talisman-saber.png",
  "Talisman Saber 2007": "/incoming/talisman-saber.png",
  "LSD-46": "/incoming/lsd-46.png",
  "ACU 4": "/incoming/acu-4.png",
  "Iron Shield": "/incoming/cram.png",
  "Task Force Iron Shield": "/incoming/cram.png",
};

type Block = { kind: string | null; id: string | null; lists: Record<string, string[]> };
type Shot = { name: string; src?: string };
const blocks = supplementJson as unknown as Block[];
const clean = (value: string) => value.replace(/^[A-Z]+-\d+:\s*/, "");
const list = (id: string, field: string) =>
  blocks.find((block) => block.kind === "unit" && block.id === id)?.lists[field]?.map(clean) ?? [];
const joined = (values: string[]) => (values.length ? values.join(", ") : "Not entered");
const crestFor = (name: string) => CREST[name] ?? units.find((unit) => unit.patch === name || unit.abbreviation === name)?.image;

const ON_DUTY = [
  ["Gear", "Gear"],
  ["Equipment", "Equipment"],
  ["Weapons", "Weapons"],
  ["Comms", "Comms"],
  ["Vehicles", "Vehicles"],
  ["Ships", "Ships"],
  ["Aircraft", "Aircraft"],
] as const;
const OFF_DUTY = [
  ["Cities", "Cities/Residences"],
  ["Cars", "POV"],
  ["Motorcycles", "Motorcycles"],
  ["Hobbies", "Hobbies"],
  ["Off-duty work", "Off-duty work"],
] as const;

function ThumbRow({ label, items }: { label: string; items: Shot[] }) {
  if (!items.length) return null;
  const pictured = items.filter((item) => item.src);
  const missing = items.filter((item) => !item.src).map((item) => item.name);
  return (
    <section className="thumb-row">
      <h3>{label}</h3>
      {pictured.length ? (
        <ul>
          {pictured.map((item) => (
            <li key={item.name}>
              <img src={publicUrl(item.src!)} alt={item.name} />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {missing.length ? <p className="quiet">No graphic yet: {missing.join(", ")}</p> : null}
    </section>
  );
}

function UnitDossier({ id }: { id: string }) {
  const unit = units.find((item) => item.id === id);
  if (!unit) return null;
  const nec = necById(unit.necId);
  const gained = list(id, "NEC").filter((code) => !nec || !code.startsWith(nec.code));
  const department = id === "jcse" ? list(id, "Division") : [];
  const division = id === "jcse" ? [] : list(id, "Division");
  const exerciseShots: Shot[] = [
    ...visits.filter((visit) => visit.unitId === id && visit.kind === "exercise").map((visit) => ({
      name: visit.title,
      src: visit.id === "cobra-gold" ? CREST["Cobra Gold"] : visit.id === "talisman-saber" ? CREST["Talisman Saber"] : undefined,
    })),
    ...list(id, "Operation").filter((name) => /cobra gold|talisman saber/i.test(name)).map((name) => ({ name, src: crestFor(name) })),
  ];
  const partnerShots = list(id, "Partner").map((name) => ({ name, src: crestFor(name) }));
  const sponsorShots = list(id, "Sponsor").map((name) => ({ name, src: crestFor(name) }));
  const uniformShots = list(id, "Uniforms").map((name) => ({ name, src: UNIFORM_IMAGE[name] }));
  const awardShots = list(id, "Awards").map((name) => {
    const award = awards.find((item) => item.abbreviation === name || item.name.startsWith(name));
    return { name, src: award?.ribbon };
  });
  const customers = id === "jcse" ? ["3rd SFG (ODA 3213)", "75th Rangers"] : list(id, "Customer");
  const ia = id === "ia-army" || id === "sercc" ? ["Task Force Iron Shield"] : [];
  const countries = list(id, "Countries");
  const rows: { label: string; value: string }[] = [
    { label: "Status", value: unit.designator || "Not entered" },
    { label: "Timeframe", value: unit.start ? formatSpan(unit.start, unit.end) : "Not entered" },
    { label: "Billet NEC", value: nec ? `${nec.code} \u00b7 ${nec.name}` : "Not entered" },
    { label: "Gained NECs", value: joined(gained) },
    { label: "Title", value: joined(list(id, "Title")) },
    { label: "Department", value: joined(department) },
    { label: "Division", value: joined(division) },
    { label: "Workcenter", value: "Not entered" },
    { label: "Temporary Additional Duty", value: joined(list(id, "TAD")) },
    { label: "Individual Augmentee", value: joined(ia) },
    { label: "Customers", value: joined(customers) },
    { label: "Promotion", value: joined(list(id, "Rank")) },
  ];
  return (
    <section className="dossier">
      <ThumbRow label="Uniforms" items={uniformShots} />
      <ThumbRow label="Exercises" items={exerciseShots} />
      <ThumbRow label="Partners" items={partnerShots} />
      <ThumbRow label="Sponsors" items={sponsorShots} />
      <ThumbRow label="Awards" items={awardShots} />
      <dl className="facts">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <h3>On Duty</h3>
      <p><strong>Countries.</strong> {joined(countries)}</p>
      {ON_DUTY.map(([label, field]) => (
        <p key={field}><strong>{label}.</strong> {joined(list(id, field))}</p>
      ))}
      <h3>Off duty</h3>
      <p><strong>Countries.</strong> {joined(countries)}</p>
      {OFF_DUTY.map(([label, field]) => (
        <p key={field}><strong>{label}.</strong> {joined(list(id, field))}</p>
      ))}
    </section>
  );
}

export function DetailPanel({
  selection,
  onSelect,
  onClose,
}: {
  selection: Selection | null;
  onSelect: (sel: Selection) => void;
  onClose: () => void;
}) {
  const subject = selection ? toSubject(selection) : null;
  const photos = selection ? photosFor(selection.kind, selection.id) : [];
  const words = selection ? reflectionFor(selection.kind, selection.id) : null;
  const related = [
    ...(subject?.related ?? []),
    ...(selection?.kind === "unit" ? COMMAND_LINKS[selection.id] ?? [] : []),
  ];
  const stops: Stop[] = useMemo(() => {
    if (!subject) return [];
    return subject.placeIds
      .map((id) => placeById(id))
      .filter((place): place is NonNullable<typeof place> => Boolean(place && place.lat != null))
      .map((place) => ({ place, labels: [place.locality], when: "", n: pinNumbersFor(place.id)[0] }));
  }, [subject]);

  return (
    <Dialog.Root open={Boolean(subject)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="detail-overlay" />
        <Dialog.Content className="detail-panel" aria-describedby={undefined}>
          {subject ? (
            <>
              <div className="detail-head">
                <div>
                  <p className="kicker">{subject.kicker}</p>
                  <Dialog.Title className="detail-title">{subject.title}</Dialog.Title>
                </div>
                <Dialog.Close className="icon-btn" aria-label="Close">
                  <X />
                </Dialog.Close>
              </div>
              {selection?.medal && selection.kind === "award" && medalFor(selection.id) ? (
                <MedalHero key={selection.id} awardId={selection.id} />
              ) : subject.hero ? (
                <figure className={`detail-hero hero-${subject.hero.type === "ribbon" ? "ribbon" : subject.hero.shape}`}>
                  {subject.hero.type === "ribbon" ? (
                    <RibbonArt award={subject.hero.award} className="ribbon-hero" />
                  ) : (
                    <img src={publicUrl(subject.hero.src)} alt={subject.hero.alt} />
                  )}
                </figure>
              ) : null}
              <section className="sidebar-map">
                {stops.length ? (
                  <MapView stops={stops} onSelect={(id) => onSelect({ kind: "place", id })} />
                ) : (
                  <p className="quiet">No map location has been entered for this yet.</p>
                )}
              </section>
              {subject.extraImages?.map((extra) => (
                <figure key={extra.src} className="detail-hero hero-extra">
                  <img src={publicUrl(extra.src)} alt={extra.alt} />
                  <figcaption>{extra.caption}</figcaption>
                </figure>
              ))}
              <div className="detail-body">
                {selection?.kind === "unit" ? <UnitDossier id={selection.id} /> : null}
                <p className="lede">{subject.explanation}</p>
                {subject.criteria ? (
                  <section>
                    <h3>What it takes</h3>
                    <p>{subject.criteria}</p>
                  </section>
                ) : null}
                {selection?.kind !== "unit" && subject.facts.length ? (
                  <dl className="facts">
                    {subject.facts.map((fact) => (
                      <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {subject.usedHere?.length ? (
                  <section className="used-here">
                    <h3>Used here</h3>
                    <ul>
                      {subject.usedHere.map((item) => (
                        <li key={item.kind + item.id}>
                          <button type="button" onClick={() => onSelect({ kind: item.kind, id: item.id })} aria-label={`${item.name}. Open.`}>
                            {item.image ? <img src={publicUrl(item.image)} alt="" loading="lazy" /> : null}
                            <span>{item.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {subject.instances ? (
                  <section>
                    <h3>Each award</h3>
                    <ul className="instance-list">
                      {subject.instances.map((row) => (
                        <li key={row.title + row.detail}>
                          <strong>{row.title}</strong>
                          <span>{row.detail}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                <section>
                  <h3>Photographs</h3>
                  {photos.length ? (
                    <ul className="gallery">
                      {photos.map((photo) => (
                        <li key={photo.id}>
                          <img src={publicUrl(photo.src)} alt={photo.alt} />
                          <p>{photo.caption}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="quiet">No photographs have been added for this yet.</p>
                  )}
                </section>
                <section>
                  <h3>In my words</h3>
                  {words ? <p className="words">{words}</p> : <p className="quiet">Nothing written here yet.</p>}
                </section>
                {related.length ? (
                  <section>
                    <h3>Connected in this record</h3>
                    <ul className="related">
                      {related.map((item) => (
                        <li key={item.kind + item.id + item.label}>
                          <button type="button" onClick={() => onSelect({ kind: item.kind, id: item.id })}>
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedalHero({ awardId }: { awardId: string }) {
  const [face, setFace] = useState<"front" | "back">("front");
  const award = awards.find((entry) => entry.id === awardId);
  const medal = medalFor(awardId);
  if (!award || !medal) return null;
  const showBack = face === "back" && medal.back;
  return (
    <figure className="detail-hero medal-hero">
      <div className="rack-toggle" role="group" aria-label="Medal side">
        <button type="button" className={face === "front" ? "nav-btn on" : "nav-btn"} aria-pressed={face === "front"} onClick={() => setFace("front")}>Front</button>
        <button type="button" className={showBack ? "nav-btn on" : "nav-btn"} aria-pressed={Boolean(showBack)} disabled={!medal.back} onClick={() => setFace("back")}>Back</button>
      </div>
      {showBack ? (
        <div className="back-stage">
          <img className="medal-back" src={publicUrl(medal.back!)} alt={`${award.name}, reverse`} style={{ width: `calc(var(--mi) * ${medal.w})` }} />
        </div>
      ) : (
        <MedalArt award={award} medal={medal} />
      )}
      {!medal.back ? <figcaption className="face-note">Reverse image not available</figcaption> : null}
    </figure>
  );
}
