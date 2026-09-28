import { useEffect, useMemo, useState } from "react";
import { ShieldUser } from "lucide-react";
import {
  awards,
  careerStops,
  pinNumbersFor,
  caseCopy,
  credits,
  formatSpan,
  formatWhen,
  insignia,
  milestones,
  necs,
  openRecord,
  operations,
  photos,
  profile,
  ribbonRows,
  medalFor,
  medalRows,
  ranks,
  caseRanks,
  schools,
  timeline,
  uniforms,
  units,
  warfare,
  publicUrl,
  UNIFORM_GROUPS,
  EQUIPMENT_GROUPS,
  equipment,
  bases,
  type Kind,
  type Selection,
} from "@/lib/shadowbox/model";
import { CareerGlyph, MedalBlock, RibbonButton } from "@/components/shadowbox/marks";
import { DetailPanel } from "@/components/shadowbox/detail";
import { MapView } from "@/components/shadowbox/map-view";
import { UniformProgression } from "@/components/shadowbox/uniform-progression";

type View = "case" | "timeline" | "uniforms" | "equipment" | "map" | "sources";

const NAV: { id: View; label: string }[] = [
  { id: "case", label: "Case" },
  { id: "timeline", label: "Timeline" },
  { id: "uniforms", label: "Uniforms" },
  { id: "equipment", label: "Gear & Vehicles" },
  { id: "map", label: "Map" },
  { id: "sources", label: "Sources" },
];

export function ShadowboxApp() {
  const [view, setView] = useState<View>("case");
  const [selection, setSelection] = useState<Selection | null>(null);
  const open = (kind: Kind, id: string) => setSelection({ kind, id });
  const rows = useMemo(() => ribbonRows(awards), []);
  const bars = useMemo(() => timeline(), []);
  const stops = useMemo(() => careerStops(), []);
  const blanks = useMemo(() => openRecord(), []);

  useEffect(() => {
    document.title = profile.pageTitle;
  }, []);

  return (
    <div className="archive">
      <header className="mast">
        <div className="mast-brand">
          <ShieldUser className="mast-icon" color="#DAA520" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <h1 className="wordmark">SHADOWBOX</h1>
            <p className="mast-tagline">Not for gawking but for learning!</p>
          </div>
        </div>
        <nav className="mast-nav" aria-label="Shadowbox sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "nav-btn on" : "nav-btn"}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {view === "case" ? <Case rows={rows} onOpen={open} onOpenMedal={(id) => setSelection({ kind: "award", id, medal: true })} /> : null}
      {view === "timeline" ? <Timeline bars={bars} rows={rows} blanks={blanks} onOpen={open} /> : null}
      {view === "uniforms" ? <Uniforms onOpen={open} /> : null}
      {view === "equipment" ? <EquipmentView onOpen={open} /> : null}
      {view === "map" ? <Stations stops={stops} onOpen={open} /> : null}
      {view === "sources" ? <Sources /> : null}

      <DetailPanel selection={selection} onSelect={setSelection} onClose={() => setSelection(null)} />
    </div>
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

function Case({
  rows,
  onOpen,
  onOpenMedal,
}: {
  rows: ReturnType<typeof ribbonRows>;
  onOpen: (k: Kind, id: string) => void;
  onOpenMedal: (id: string) => void;
}) {
  const marks = caseMarks();
  // Ribbons (the default, the rack as it has always been) or the full-dress view: large medals on the left breast and
  // the ribbon-only awards on the right breast.
  const [rackView, setRackView] = useState<"ribbons" | "medals">("ribbons");
  const withMedal = awards.filter((award) => medalFor(award.id));
  const ribbonOnly = awards.filter((award) => !medalFor(award.id));
  // NAVPERS 15665J art. 5313.1: ribbons without a large medal are centred on the right breast, rows of three with the
  // lesser row on top (art. 5312.1), in precedence "top down and inboard to outboard". Inboard on the right breast is
  // toward the wearer's left, which is the viewer's right, so each row reads senior-first from the right.
  const rightRows = ribbonRows(ribbonOnly).map((row) => [...row].reverse());
  const medalBlockRows = medalRows(withMedal);
  // One centred column at every width, read top to bottom: recruit portrait and plaque, the ET rating mark,
  // ESWS, the rack, EXW, the JCSE badge, the chief's anchor, then the chief portrait and plaque.
  const mark = (id: string) => marks.find((entry) => entry.id === id);
  const etMark = mark("et-rating-mark");
  const esws = mark("esws");
  const exw = mark("exw");
  const jcse = mark("jcse-device");
  const anchor = mark("collar");
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
          {/* The identity and service-totals nameplate (and its duplicate chief portrait) is no longer rendered; the data
              stays in profile.json (rating, rank, name, paygrade, service dates and totals, portrait) so it can come back. */}
          <h2 className="sr-only">{profile.name}, {profile.rating} {profile.rank}</h2>
          <div className="case-display">
            <div className="case-column">
              {portraitWithPlaque(recruit, plaques.recruit)}
              {etMark ? renderMark(etMark, "worn worn-et") : null}
              {esws ? renderMark(esws, "worn worn-pin") : null}
              <div className="rack-toggle" role="group" aria-label="Show the ribbons or the full-size medals">
                <button type="button" className={rackView === "ribbons" ? "nav-btn on" : "nav-btn"} aria-pressed={rackView === "ribbons"} onClick={() => setRackView("ribbons")}>Ribbons</button>
                <button type="button" className={rackView === "medals" ? "nav-btn on" : "nav-btn"} aria-pressed={rackView === "medals"} onClick={() => setRackView("medals")}>Medals</button>
              </div>
              {rackView === "ribbons" ? (
                <div className="rack" aria-label="Ribbon rack, highest award at the top left">
                  {rows.map((row) => (
                    <div key={row.map((a) => a.id).join("-")} className="rack-row">
                      {row.map((award) => (
                        <RibbonButton key={award.id} award={award} onOpen={() => onOpen("award", award.id)} />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="full-dress" aria-label="Full dress: large medals and the ribbons that have no medal">
                  <figure className="dress-group dress-medals">
                    <figcaption>Left breast: large medals ({withMedal.length})</figcaption>
                    <MedalBlock rows={medalBlockRows} onOpen={(award) => onOpenMedal(award.id)} />
                  </figure>
                  <figure className="dress-group dress-ribbons">
                    <figcaption>Right breast: ribbons without a medal ({ribbonOnly.length})</figcaption>
                    <div className="rack ribbon-only" aria-label="Ribbon-only awards, senior at the top and inboard (the viewer's right)">
                      {rightRows.map((row) => (
                        <div key={row.map((a) => a.id).join("-")} className="rack-row">
                          {row.map((award) => (
                            <RibbonButton key={award.id} award={award} onOpen={() => onOpen("award", award.id)} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </figure>
                </div>
              )}
              {exw ? renderMark(exw, "worn worn-pin") : null}
              {jcse ? renderMark(jcse, "worn worn-badge") : null}
              <div className="grade-row" role="group" aria-label="Enlisted pay grades before chief: E-3 to E-6">
                {caseRanks.map((rank) => (
                  <button key={rank.id} type="button" className={`worn worn-grade worn-grade--${rank.id}`} onClick={() => onOpen("rank", rank.id)} aria-label={`${rank.name} (${rank.abbreviation}, ${rank.grade})${rank.date ? `, ${formatWhen(rank.date)}` : ""}`} title={`${rank.abbreviation} · ${rank.grade}`}>
                    <img src={publicUrl(rank.image)} alt="" />
                  </button>
                ))}
              </div>
              {anchor ? renderMark(anchor, "worn worn-anchor") : null}
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
          {/* Command crests sit under the case display again (as before PR #23); rack notes, specialties and schools stay on Timeline. */}
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

function Timeline({
  bars,
  rows,
  blanks,
  onOpen,
}: {
  bars: ReturnType<typeof timeline>;
  rows: ReturnType<typeof ribbonRows>;
  blanks: string[];
  onOpen: (k: Kind, id: string) => void;
}) {
  // Schools and the dated career events in one list, oldest first (they used to be two runs under the case).
  const dated = [
    ...schools.map((school) => ({ key: `school-${school.id}`, when: school.start ?? "", kind: "school" as Kind, id: school.id, title: school.name, note: school.length ?? "length not entered" })),
    ...milestones.map((mark) => ({ key: `milestone-${mark.id}`, when: mark.date ?? "", kind: "milestone" as Kind, id: mark.id, title: mark.title, note: "Career" })),
  ].sort((a, b) => (a.when || "9999").localeCompare(b.when || "9999"));
  return (
    <main className="sheet">
      <h2>{profile.serviceLength}, one line</h2>
      <p>{caseCopy.timelineLead}</p>
      <div className="chart-scroll">
        <Track label="Rank" items={bars.rank} onOpen={onOpen} />
        <Track label="Assignments" items={bars.duty} onOpen={onOpen} />
        <Track label="Deployments" items={bars.ops} onOpen={onOpen} />
        <Track label="Schools" items={bars.study} onOpen={onOpen} />
      </div>
      <h3>Rank progression</h3>
      <ol className="rank-steps">
        {ranks.map((rank) => (
          <li key={rank.id}>
            <button type="button" className="rank-step" onClick={() => onOpen("rank", rank.id)}>
              <img src={publicUrl(rank.image)} alt="" loading="lazy" />
              <strong>{rank.date ? formatWhen(rank.date) : "Date needed"}</strong>
              <span>{rank.abbreviation} · {rank.grade}</span>
              <em>{rank.name}</em>
            </button>
          </li>
        ))}
        <li>
          <div className="rank-step rank-step--end">
            <strong>{formatWhen(profile.serviceEnd)}</strong>
            <span>Retired</span>
            <em>as a Chief Electronics Technician</em>
          </div>
        </li>
      </ol>
      <UniformProgression onOpen={onOpen} />
      <h3>Operations, named as the record names them</h3>
      <ul className="stack">
        {operations.map((op) => (
          <li key={op.id}>
            <button type="button" className="row-btn" onClick={() => onOpen("operation", op.id)}>
              <strong>{formatSpan(op.start, op.end)}</strong>
              <span>{op.name}</span>
              <em>{op.phase}</em>
            </button>
          </li>
        ))}
      </ul>
      <section className="split">
        <div>
          <h3>Schools and dates that matter</h3>
          <ul className="stack">
            {dated.map((item) => (
              <li key={item.key}>
                <button type="button" className="row-btn" onClick={() => onOpen(item.kind, item.id)}>
                  <strong>{formatWhen(item.when)}</strong>
                  <span>{item.title}</span>
                  <em>{item.note}</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Specialties</h3>
          <ul className="stack">
            {necs.map((nec) => (
              <li key={nec.id}>
                <button type="button" className="row-btn" onClick={() => onOpen("nec", nec.id)}>
                  <strong>{nec.code}</strong>
                  <span>{nec.name}</span>
                  <em>{nec.years ?? "tour code"}</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ledger">
        <div>
          <h3>How to read the rack</h3>
          {caseCopy.howToRead.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>{awards.length} ribbons. The top row holds {rows[0]?.length ?? 0}.</p>
        </div>
        <div>
          <h3>What is still blank</h3>
          <ul className="plain">
            {blanks.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Track({
  label,
  items,
  onOpen,
}: {
  label: string;
  items: ReturnType<typeof timeline>["duty"];
  onOpen: (k: Kind, id: string) => void;
}) {
  return (
    <section className="track" aria-label={label}>
      <h3>{label}</h3>
      <div className="track-lanes">
        {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`bar bar--${item.group}${item.kind === "school" ? " bar--school" : ""}`}
              style={{ flexGrow: item.days && item.days > 0 ? item.days : 1 }}
              title={item.detail}
              onClick={() => onOpen(item.kind, item.id)}
            >
              <span className="bar-title">{item.title}</span>
              <span className="bar-days">{item.days == null ? "not entered" : `${item.days.toLocaleString("en-US")} days`}</span>
              <span className="sr-only">{item.detail}</span>
            </button>
          ))}
      </div>
    </section>
  );
}

function Uniforms({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>Uniforms</h2>
      <p>{uniforms.length} uniforms. {caseCopy.uniformsLead}</p>
      {UNIFORM_GROUPS.map((group) => {
        const list = uniforms.filter((uniform) => uniform.group === group.id).sort((a, b) => a.order - b.order);
        if (!list.length) return null;
        return (
          <section key={group.id} className="uniform-group" aria-label={group.label}>
            <h3>{group.label}</h3>
            <ol className="uniform-grid">
              {list.map((uniform) => (
                <li key={uniform.id}>
                  <button type="button" className="uniform-card uniform-card--white" onClick={() => onOpen("uniform", uniform.id)}>
                    <img className="uniform-photo" src={publicUrl(uniform.image)} alt="" loading="lazy" />
                    <strong>{uniform.name}</strong>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </main>
  );
}

function EquipmentView({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>Gear, Weapons, Comms, Vehicles &amp; Boats</h2>
      <p>{caseCopy.equipmentLead}</p>
      {EQUIPMENT_GROUPS.map((group) => {
        const list = equipment.filter((item) => item.group === group.id).sort((a, b) => a.order - b.order);
        if (!list.length) return null;
        return (
          <section key={group.id} className="uniform-group" aria-label={group.label}>
            <h3>{group.label}</h3>
            <ol className="uniform-grid equipment-grid">
              {list.map((item) => (
                <li key={item.id}>
                  <button type="button" className="uniform-card equipment-card" onClick={() => onOpen("equipment", item.id)}>
                    <img className={item.cutout ? "equipment-photo" : "equipment-photo is-photo"} src={publicUrl(item.image)} alt="" loading="lazy" />
                    <strong>{item.name}</strong>
                    {item.caption ? <span>{item.caption}</span> : null}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </main>
  );
}

type PinGroup = "duty" | "base" | "visit";
const PIN_GROUPS: { id: PinGroup; label: string; legend: string }[] = [
  { id: "duty", label: "Commands", legend: "Commands and assignments" },
  { id: "base", label: "Deployments", legend: "Deployment bases" },
  { id: "visit", label: "Visits", legend: "Visits, exercises, schools & transit" },
];
const pinGroupOf = (place: { type?: string | null }): PinGroup => (place.type === "base" ? "base" : place.type === "visit" ? "visit" : "duty");

function Stations({ stops: allStops, onOpen }: { stops: ReturnType<typeof careerStops>; onOpen: (k: Kind, id: string) => void }) {
  // Filter chips: All, or any mix of the three pin groups. Pin numbers stay the same when filtered.
  const [shown, setShown] = useState<PinGroup[] | null>(null);
  const isOn = (g: PinGroup) => !shown || shown.includes(g);
  const toggle = (g: PinGroup) =>
    setShown((cur) => {
      if (!cur) return [g];
      const next = cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g];
      return next.length === 0 || next.length === PIN_GROUPS.length ? null : next;
    });
  const stops = allStops.filter((stop) => isOn(pinGroupOf(stop.place)));
  const extraBases = isOn("base") ? bases.filter((place) => !allStops.some((stop) => stop.place.id === place.id)) : [];
  return (
    <main className="sheet">
      <h2>Where the career went</h2>
      <p>{caseCopy.mapLead}</p>
      <div className="map-filter" role="group" aria-label="Show pins">
        <button type="button" className={`nav-btn${!shown ? " on" : ""}`} aria-pressed={!shown} onClick={() => setShown(null)}>All</button>
        {PIN_GROUPS.map((g) => (
          <button key={g.id} type="button" className={`nav-btn${shown?.includes(g.id) ? " on" : ""}`} aria-pressed={!!shown?.includes(g.id)} onClick={() => toggle(g.id)}>
            <span className={`pin-num ${g.id === "duty" ? "" : g.id}`} aria-hidden="true" />
            {g.label}
          </button>
        ))}
      </div>
      <ul className="map-legend" aria-label="Pin colours">
        {PIN_GROUPS.map((g) => (
          <li key={g.id}><span className={`pin-num ${g.id === "duty" ? "" : g.id}`}>1</span> {g.legend}</li>
        ))}
        <li><span className="pin-num approximate">1</span> Approximate location (dashed ring)</li>
      </ul>
      {stops.length || extraBases.length ? (
        <MapView stops={stops} extra={extraBases} tall onSelect={(id) => onOpen("place", id)} />
      ) : null}
      <ol className="stop-list">
        {stops.map((stop, index) => (
          <li key={`${stop.place.id}-${index}`}>
            <button type="button" onClick={() => onOpen("place", stop.place.id)}>
              <span className={`pin-num ${stop.place.type ? `${stop.place.type} ` : ""}${stop.place.accuracy}`} aria-label={`Pin ${stop.n}`}>{stop.n}</span>
              <strong>{stop.place.name}</strong>
              <span>{stop.labels.join(" · ")}</span>
            </button>
          </li>
        ))}
      </ol>
      {bases.length && isOn("base") ? (
        <>
          <h3>Deployment bases</h3>
          <ol className="stop-list">
            {bases.map((place) => (
              <li key={place.id}>
                <button type="button" onClick={() => onOpen("place", place.id)}>
                  {pinNumbersFor(place.id).length ? (
                    <span className={`pin-num base ${place.accuracy}`} aria-label={`Pin ${pinNumbersFor(place.id).join(", ")}`}>{pinNumbersFor(place.id).join(",")}</span>
                  ) : (
                    <span className={`pip base ${place.accuracy}`} />
                  )}
                  <strong>{place.name}</strong>
                  <span>{place.locality}{place.accuracy === "approximate" ? " · approximate" : ""}</span>
                </button>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </main>
  );
}

function Sources() {
  return (
    <main className="sheet">
      <h2>Where the pictures and the facts come from</h2>
      <p>{caseCopy.sourcesLead}</p>
      <p className="cheat-sheet-link">
        <a className="nav-btn" href={publicUrl("/shadowbox-cheat-sheet.pdf")} download="shadowbox-cheat-sheet.pdf" type="application/pdf">
          Download the cheat sheet (PDF, 5 pages)
        </a>
        <span className="quiet"> The printable code list for what was used where: uniforms, weapons, vehicles, ships, armor, helmets, comms, bases and NECs.</span>
      </p>
      <ul className="credits">
        {credits.map((credit) => (
          <li key={credit.id}>
            <strong>{credit.title}</strong>
            <span>{credit.creator}</span>
            <span>{credit.license}</span>
            {credit.sourceUrl ? <a href={credit.sourceUrl}>{credit.sourceUrl.replace("https://", "")}</a> : null}
            <span className="quiet">{credit.notes}</span>
          </li>
        ))}
      </ul>
      <h3>Insignia in the case</h3>
      <ul className="stack">
        {insignia.map((item) => (
          <li key={item.id}><span className="row-btn static"><strong>{item.name}</strong><span>Image of the insignia</span></span></li>
        ))}
        {warfare.map((pin) => (
          <li key={pin.id}><span className="row-btn static"><strong>{pin.abbreviation}</strong><span>Image of the warfare pin</span></span></li>
        ))}
      </ul>
    </main>
  );
}
