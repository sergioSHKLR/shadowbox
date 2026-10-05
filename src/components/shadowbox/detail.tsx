import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { InstanceEntry, useInstanceEdits } from "@/components/shadowbox/instance-form";
import { PhotoRemarks } from "@/components/shadowbox/photo-remarks";
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
  type Photo,
  type Selection,
  type Stop,
  povLabel,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";
import { MedalArt, RibbonArt } from "@/components/shadowbox/marks";

type Mark = { src: string; alt: string };
type Linked = { kind: Kind; id: string; label: string; marks?: Mark[] };
const COMMAND_LINKS: Record<string, Linked[]> = {
  eodmu5: [
    {
      kind: "unit",
      id: "troy",
      label: "In theater \u00b7 CJTF Troy",
      marks: [
        { src: "/incoming/52nd-eod.png", alt: "Sponsor \u00b7 52nd EOD" },
        { src: "/incoming/16th-en.png", alt: "Sponsor \u00b7 16th EN" },
        { src: "/incoming/eodmu11.png", alt: "Partner \u00b7 EODMU 11" },
      ],
    },
    {
      kind: "place",
      id: "u-tapao",
      label: "Exercise \u00b7 Cobra Gold \u00b7 Royal Thai Navy",
      marks: [
        { src: "/incoming/cobra-gold.png", alt: "Cobra Gold" },
        { src: "/incoming/rtn.png", alt: "Royal Thai Navy" },
      ],
    },
    {
      kind: "place",
      id: "shoalwater-bay",
      label: "Exercise \u00b7 Talisman Saber \u00b7 Australian CDT",
      marks: [
        { src: "/incoming/talisman-saber.png", alt: "Talisman Saber" },
        { src: "/incoming/auscdt-1.png", alt: "Australian CDT" },
      ],
    },
  ],
  sercc: [{
    kind: "unit",
    id: "ia-army",
    label: "In theater \u00b7 Task Force Iron Shield",
    marks: [
      { src: "/incoming/11th-ada.png", alt: "Admin \u00b7 11th ADA" },
      { src: "/incoming/3-3ada.png", alt: "Partner \u00b7 3-3 ADA" },
      { src: "/incoming/332nd-aew.png", alt: "Customer \u00b7 332nd AEW" },
    ],
  }],
  jcse: [
    {
      kind: "unit",
      id: "cjsotf",
      label: "In theater \u00b7 CJSOTF-A",
      marks: [{ src: "/incoming/3rd-sfg.png", alt: "Customer \u00b7 3rd SFG" }],
    },
    {
      kind: "unit",
      id: "sojtf",
      label: "In theater \u00b7 SOJTF-A",
      marks: [
        { src: "/incoming/290jcss.png", alt: "Partner \u00b7 290th JCSS" },
        { src: "/incoming/75th-rgr.svg", alt: "Customer \u00b7 75th Rangers" },
      ],
    },
  ],
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
  "3-3 ADA": "/incoming/3-3ada.png",
  "HHB 3-3 ADA": "/incoming/3-3ada.png",
  "332nd AEW": "/incoming/332nd-aew.png",
  "332nd Air Expeditionary Wing": "/incoming/332nd-aew.png",
  "3rd SFG": "/incoming/3rd-sfg.png",
  "75th Rangers": "/incoming/75th-rgr.svg",
  "290th JCSS": "/incoming/290jcss.png",
  "SOJTF-A": "/incoming/sojtf-a.png",
  "ODA 3213": "/incoming/3rd-sfg.png",
  "3rd SFG (ODA 3213)": "/incoming/3rd-sfg.png",
  "Royal Thai Navy": "/incoming/rtn.png",
  "Australian CDT": "/incoming/auscdt-1.png",
  "Australian Clearance Diving Team": "/incoming/auscdt-1.png",
  "Cobra Gold": "/incoming/cobra-gold.png",
  "Cobra Gold 2004": "/incoming/cobra-gold.png",
  "Cobra Gold 2005": "/incoming/cobra-gold.png",
  "Talisman Saber": "/incoming/talisman-saber.png",
  "Talisman Saber 2005": "/incoming/talisman-saber.png",
  "Talisman Saber 2007": "/incoming/talisman-saber.png",
  "LSD-46": "/incoming/lsd-46.png",
  "LHD-2": "/incoming/lhd-2.png",
  "USS Tortuga": "/incoming/lsd-46.png",
  "USS Essex": "/incoming/lhd-2.png",
  "ACU 4": "/incoming/acu-4.png",
  "Iron Shield": "/incoming/cram.png",
  "Task Force Iron Shield": "/incoming/cram.png",
};

type Block = { kind: string | null; id: string | null; lists: Record<string, string[]> };
type Shot = { name: string; src?: string };
const blocks = supplementJson as unknown as Block[];
/** Ship hull numbers in supplement lists display as ship names (data keeps the hull numbers). */
const SHIP_NAME: Record<string, string> = { "LSD-46": "USS Tortuga", "AS-40": "USS Frank Cable", "LHD-2": "USS Essex" };
const clean = (value: string) => {
  const name = value.replace(/^[A-Z]+-\d+:\s*/, "");
  return SHIP_NAME[name] ?? name;
};
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
  ["Cities", "Cities"],
  ["Residences", "Residences"],
  ["Cars", "POV"],
  ["Motorcycles", "Motorcycles"],
  ["Hobbies", "Hobbies"],
  ["Aircraft", "Off-duty aircraft"],
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

function fieldNames(kind: string, id: string, field: string) {
  return blocks.find((block) => block.kind === kind && block.id === id)?.lists[field]?.map(clean) ?? [];
}

function unique(names: string[]) {
  return [...new Set(names)];
}

function uniqueShots(shots: Shot[]) {
  const seen = new Set<string>();
  return shots.filter((shot) => (seen.has(shot.name) ? false : (seen.add(shot.name), true)));
}

function OperationMarks({ id }: { id: string }) {
  const op = operations.find((item) => item.id === id);
  const admin: string[] = [];
  const partner = fieldNames("operation", id, "Partner");
  const sponsor = fieldNames("operation", id, "Sponsor");
  const customer = fieldNames("operation", id, "Customer");
  if (op?.unitId === "troy") {
    partner.push(...fieldNames("unit", "troy", "Partner"));
    sponsor.push(...fieldNames("unit", "troy", "Sponsor"));
  }
  if (id === "oif-2009") {
    admin.push("11th ADA");
    partner.push(...fieldNames("unit", "ia-army", "Partner"));
    customer.push(...fieldNames("unit", "ia-army", "Customer"));
  }
  const shot = (name: string) => ({ name, src: crestFor(name) });
  return (
    <>
      <ThumbRow label="Admin" items={unique(admin).map(shot)} />
      <ThumbRow label="Partners" items={unique(partner).map(shot)} />
      <ThumbRow label="Sponsors" items={unique(sponsor).map(shot)} />
      <ThumbRow label="Customers" items={unique(customer).map(shot)} />
    </>
  );
}

function UnitDossier({ id, hideUniforms = false }: { id: string; hideUniforms?: boolean }) {
  const unit = units.find((item) => item.id === id);
  if (!unit) return null;
  const nec = necById(unit.necId);
  const gained = list(id, "NEC").filter((code) => !nec || !code.startsWith(nec.code));
  const department = id === "jcse" ? list(id, "Division") : [];
  const division = id === "jcse" ? [] : list(id, "Division");
  // One entry per iteration (visits.json trips: Cobra Gold 2004 / 2005, Talisman Saber 2005 / 2007); host partners go to Partners.
  const EXERCISE_HOST: Record<string, { name: string; host: string }> = {
    "cobra-gold": { name: "Cobra Gold", host: "Royal Thai Navy" },
    "talisman-saber": { name: "Talisman Saber", host: "Australian CDT" },
  };
  const unitExercises = visits.filter((visit) => visit.unitId === id && visit.kind === "exercise");
  const exerciseShots: Shot[] = uniqueShots([
    ...unitExercises.flatMap((visit): Shot[] => {
      const known = EXERCISE_HOST[visit.id];
      if (!known) return [{ name: visit.title }];
      const trips = (visit as { trips?: string[] }).trips ?? [];
      return trips.length ? trips.map((year) => ({ name: `${known.name} ${year}`, src: CREST[known.name] })) : [{ name: known.name, src: CREST[known.name] }];
    }),
    ...list(id, "Operation").filter((name) => /cobra gold|talisman saber/i.test(name)).map((name) => ({ name, src: crestFor(name) ?? CREST[/cobra/i.test(name) ? "Cobra Gold" : "Talisman Saber"] })),
  ]);
  const partnerShots = uniqueShots([
    ...list(id, "Partner").map((name) => ({ name, src: crestFor(name) })),
    ...unitExercises.flatMap((visit) => (EXERCISE_HOST[visit.id] ? [{ name: EXERCISE_HOST[visit.id].host, src: CREST[EXERCISE_HOST[visit.id].host] }] : [])),
  ]);
  const sponsorShots = list(id, "Sponsor").map((name) => ({ name, src: crestFor(name) }));
  const uniformShots = list(id, "Uniforms").map((name) => ({ name, src: UNIFORM_IMAGE[name] }));
  const awardShots = list(id, "Awards").map((name) => {
    const award = awards.find((item) => item.abbreviation === name || item.name.startsWith(name));
    return { name, src: award?.ribbon };
  });
  const customers = id === "jcse" ? ["3rd SFG (ODA 3213)", "75th Rangers"] : list(id, "Customer");
  const customerShots = customers.map((name) => ({ name, src: crestFor(name) }));
  const tadShots: Shot[] = list(id, "TAD").map((name) => ({ name, src: crestFor(name) }));
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
    { label: "Workcenter", value: unit.workcenter || "Not entered" },
    { label: "Temporary Additional Duty", value: joined(list(id, "TAD")) },
    { label: "Individual Augmentee", value: joined(ia) },
    { label: "Customers", value: joined(customers) },
    { label: "Promotion", value: joined(list(id, "Rank")) },
  ];
  return (
    <section className="dossier">
      {hideUniforms ? null : <ThumbRow label="Uniforms" items={uniformShots} />}
      <ThumbRow label="Exercises" items={exerciseShots} />
      <ThumbRow label="Partners" items={partnerShots} />
      <ThumbRow label="Sponsors" items={sponsorShots} />
      <ThumbRow label="Customers" items={customerShots} />
      <ThumbRow label="Temporary duty" items={tadShots} />
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
        <p key={field}><strong>{label}.</strong> {joined(field === "POV" || field === "Motorcycles" ? unique(list(id, field).map(povLabel)) : list(id, field))}</p>
      ))}
    </section>
  );
}

export function DetailPanel({
  selection,
  trail = [],
  onSelect,
  onClose,
}: {
  selection: Selection | null;
  trail?: Selection[];
  onSelect: (sel: Selection) => void;
  onClose: () => void;
}) {
  const instanceEditTick = useInstanceEdits();
  const subject = selection ? toSubject(selection) : null;
  const crumbs = trail.length ? trail : selection ? [selection] : [];
  const photos = selection ? photosFor(selection.kind, selection.id) : [];
  const catalog = selection?.kind === "uniform" || selection?.kind === "equipment";
  const heroSrc = subject?.hero && subject.hero.type === "image" ? subject.hero.src : undefined;
  const gallery = photos
    .filter((photo) => photo.src !== heroSrc)
    .sort((a, b) => Number(b.src.startsWith("/uniforms/")) - Number(a.src.startsWith("/uniforms/")));
  const showUsage = selection?.kind === "uniform" || (selection?.kind === "equipment" && (gallery.length > 0 || !heroSrc));
  const words = selection ? reflectionFor(selection.kind, selection.id) : null;
  const related: Linked[] = [
    ...(subject?.related ?? []),
    ...(selection?.kind === "unit" ? COMMAND_LINKS[selection.id] ?? [] : []),
  ];
  const stops: Stop[] = useMemo(() => {
    if (!subject) return [];
    return subject.placeIds
      .map((id) => placeById(id))
      .filter((place): place is NonNullable<typeof place> => Boolean(place && place.lat != null))
      .map((place) => {
        const kind = place.type === "city" || place.type === "visit" ? "port" as const : "base" as const;
        return {
          place,
          labels: [place.locality],
          when: "",
          n: pinNumbersFor(place.id)[0] ?? 0,
          cityId: place.type === "city" ? place.id : null,
          baseId: place.type === "base" ? place.id : null,
          commandId: null,
          kind,
          layers: [kind],
        };
      });
  }, [subject]);

  const frame = typeof document === "undefined" ? null : document.querySelector(".app-shell");
  const [more, setMore] = useState(false);
  const noteScroll = (el: HTMLElement) => setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 24);
  return (
    <Dialog.Root open={Boolean(subject)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal container={typeof HTMLElement !== "undefined" && frame instanceof HTMLElement ? frame : undefined}>
        <Dialog.Overlay className="detail-overlay" />
        <Dialog.Content className="detail-panel" aria-describedby={undefined}>
          {subject ? (
            <>
              <div className="detail-head">
                <div>
                  <p className="kicker">{subject.kicker}</p>
                  <Dialog.Title className="detail-title">{subject.title}</Dialog.Title>
                  {crumbs.length > 1 ? (
                    <nav className="crumb" aria-label="Sidebar path">
                      {crumbs.map((item, index) => {
                        const label = toSubject(item)?.title ?? item.id;
                        const last = index === crumbs.length - 1;
                        return (
                          <span key={`${item.kind}-${item.id}`}>
                            {index ? <span aria-hidden="true"> / </span> : null}
                            <button type="button" disabled={last} onClick={() => onSelect(item)}>{label}</button>
                          </span>
                        );
                      })}
                    </nav>
                  ) : null}
                </div>
                <Dialog.Close className="icon-btn" aria-label="Close">
                  <X />
                </Dialog.Close>
              </div>
              <div className="detail-scroll" onScroll={(event) => noteScroll(event.currentTarget)} ref={(node) => { if (node) noteScroll(node); }}>
              {selection?.medal && selection.kind === "award" && medalFor(selection.id) ? (
                <MedalHero key={selection.id} awardId={selection.id} />
              ) : subject.hero ? (
                <>
                <figure className={`detail-hero hero-${subject.hero.type === "ribbon" ? "ribbon" : subject.hero.shape}${showUsage && gallery.length ? " hero-with-shots" : ""}`}>
                  {subject.hero.type === "ribbon" ? (
                    <RibbonArt award={subject.hero.award} className="ribbon-hero" />
                  ) : subject.hero.src ? (
                    <img src={publicUrl(subject.hero.src)} alt={subject.hero.alt} />
                  ) : null}
                </figure>
                {subject.hero.type === "image" && subject.hero.src && selection?.kind !== "uniform" ? (
                  <PhotoRemarks src={subject.hero.src} />
                ) : null}
                </>
              ) : null}
              {showUsage ? <Photographs photos={gallery} onSelect={onSelect} prominent /> : null}
              {/* Used here first (uniforms live only here); the map sits at the bottom of the sidebar. */}
                {subject.usedHere?.length ? (
                  <section className="used-here used-here-top">
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
              {subject.extraImages?.filter((extra) => extra.src).map((extra) => (
                <figure key={extra.src} className="detail-hero hero-extra">
                  <img src={publicUrl(extra.src)} alt={extra.alt} />
                  <figcaption>{extra.caption}</figcaption>
                </figure>
              ))}
              <div className="detail-body">
                {selection?.kind === "unit" ? <UnitDossier id={selection.id} hideUniforms={Boolean(subject.usedHere?.some((item) => item.kind === "uniform"))} /> : null}
                {selection?.kind === "operation" ? <OperationMarks id={selection.id} /> : null}
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
                {subject.instances ? (
                  <section>
                    <h3>Each award</h3>
                    <ul className="instance-list" data-edits={instanceEditTick}>
                      {subject.instances.map((row) => (
                        <li key={row.id}>
                          {subject.instances && subject.instances.length > 1 ? (
                            <InstanceEntry row={row} />
                          ) : (
                            <>
                              <strong>{row.title}</strong>
                              <span>{row.detail}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {selection?.kind === "photo" || catalog ? null : <Photographs photos={photos} onSelect={onSelect} />}
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
                            {item.marks?.length ? (
                              <span className="related-marks">
                                {item.marks.map((mark) => (
                                  <img key={mark.src} src={publicUrl(mark.src)} alt={mark.alt} />
                                ))}
                              </span>
                            ) : null}
                            <span>{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
              {selection?.kind === "uniform" ? null : (
              <section className="sidebar-map">
                {stops.length ? (
                  <MapView stops={stops} onSelect={(id) => onSelect({ kind: "place", id })} />
                ) : (
                  <p className="quiet">No map location has been entered for this yet.</p>
                )}
              </section>
              )}
              {more ? <span className="detail-more" aria-hidden="true" /> : null}
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Photographs({ photos, onSelect, prominent = false }: { photos: Photo[]; onSelect: (item: Selection) => void; prominent?: boolean }) {
  return (
    <section className={prominent ? "usage-shots" : undefined}>
      <h3>Photographs</h3>
      {photos.length ? (
        <ul className="gallery">
          {photos.map((photo) => (
            <li key={photo.id}>
              <button type="button" className="gallery-open" onClick={() => onSelect({ kind: "photo", id: photo.id })}>
                <img src={publicUrl(photo.src)} alt={photo.alt} />
              </button>
              <p>{photo.caption}</p>
              <PhotoRemarks src={photo.src} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="quiet">No photographs have been added for this yet.</p>
      )}
    </section>
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
