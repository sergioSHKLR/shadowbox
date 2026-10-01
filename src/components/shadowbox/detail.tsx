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

type Block = { kind: string | null; id: string | null; lists: Record<string, string[]> };
const blocks = supplementJson as unknown as Block[];
const clean = (value: string) => value.replace(/^[A-Z]+-\d+:\s*/, "");
const list = (id: string, field: string) =>
  blocks.find((block) => block.kind === "unit" && block.id === id)?.lists[field]?.map(clean) ?? [];
const joined = (values: string[]) => (values.length ? values.join(", ") : "Not entered");

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

function UnitDossier({ id }: { id: string }) {
  const unit = units.find((item) => item.id === id);
  if (!unit) return null;
  const nec = necById(unit.necId);
  const gained = list(id, "NEC").filter((code) => !nec || !code.startsWith(nec.code));
  const department = id === "jcse" ? list(id, "Division") : [];
  const division = id === "jcse" ? [] : list(id, "Division");
  const exercises = [
    ...visits.filter((visit) => visit.unitId === id && visit.kind === "exercise").map((visit) => visit.title),
    ...list(id, "Partner").map((name) => `Partner \u00b7 ${name}`),
  ];
  const ops = [
    ...operations.filter((op) => op.unitId === id).map((op) => op.name),
    ...list(id, "Operation"),
    ...list(id, "Sponsor").map((name) => `Sponsor \u00b7 ${name}`),
    ...list(id, "Partner").map((name) => `Partner \u00b7 ${name}`),
  ];
  const customers = id === "jcse" ? ["3rd SFG (ODA 3213)", "75th Rangers"] : list(id, "Customer");
  const ia = id === "ia-army" ? ["Task Force Iron Shield"] : id === "sercc" ? ["Task Force Iron Shield"] : [];
  const rows: { label: string; value: string }[] = [
    { label: "Status", value: unit.designator || "Not entered" },
    { label: "Timeframe", value: unit.start ? formatSpan(unit.start, unit.end) : "Not entered" },
    { label: "Billet NEC", value: nec ? `${nec.code} \u00b7 ${nec.name}` : "Not entered" },
    { label: "Gained NECs", value: joined(gained) },
    { label: "Title", value: joined(list(id, "Title")) },
    { label: "Department", value: joined(department) },
    { label: "Division", value: joined(division) },
    { label: "Workcenter", value: "Not entered" },
    { label: "Exercises (and partners)", value: joined(exercises) },
    { label: "Temporary Additional Duty", value: joined(list(id, "TAD")) },
    { label: "Individual Augmentee", value: joined(ia) },
    { label: "Operations (and sponsors & partners)", value: joined([...new Set(ops)]) },
    { label: "Countries", value: joined(list(id, "Countries")) },
    { label: "Customers", value: joined(customers) },
    { label: "Uniforms", value: joined(list(id, "Uniforms")) },
    { label: "Promotion", value: joined(list(id, "Rank")) },
    { label: "Awards", value: joined(list(id, "Awards")) },
  ];
  return (
    <section className="dossier">
      <dl className="facts">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <h3>On Duty</h3>
      {ON_DUTY.map(([label, field]) => (
        <p key={field}><strong>{label}.</strong> {joined(list(id, field))}</p>
      ))}
      <h3>Off duty</h3>
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
              {subject.extraImages?.map((extra) => (
                <figure key={extra.src} className="detail-hero hero-extra">
                  <img src={publicUrl(extra.src)} alt={extra.alt} />
                  <figcaption>{extra.caption}</figcaption>
                </figure>
              ))}
              <div className="detail-body">
                <p className="lede">{subject.explanation}</p>
                {selection?.kind === "unit" ? <UnitDossier id={selection.id} /> : null}
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
                  <h3>Map</h3>
                  {stops.length ? (
                    <>
                      <MapView stops={stops} onSelect={(id) => onSelect({ kind: "place", id })} />
                      <ul className="place-list">
                        {stops.map((stop) => (
                          <li key={stop.place.id}>
                            <button type="button" onClick={() => onSelect({ kind: "place", id: stop.place.id })}>
                              {stop.place.name}
                              {stop.place.accuracy === "placeholder" ? " \u00b7 placeholder" : ""}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="quiet">No map location has been entered for this yet.</p>
                  )}
                </section>
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
