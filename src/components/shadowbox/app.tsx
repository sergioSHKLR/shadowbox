import { useEffect, useMemo, useState } from "react";
import { ShieldUser } from "lucide-react";
import {
  awards,
  careerStops,
  caseCopy,
  credits,
  formatSpan,
  formatWhen,
  insignia,
  milestones,
  necs,
  openRecord,
  operations,
  pct,
  photos,
  profile,
  ribbonRows,
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
import { CareerGlyph, RibbonButton } from "@/components/shadowbox/marks";
import { DetailPanel } from "@/components/shadowbox/detail";
import { MapView } from "@/components/shadowbox/map-view";

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

      {view === "case" ? <Case rows={rows} blanks={blanks} onOpen={open} /> : null}
      {view === "timeline" ? <Timeline bars={bars} onOpen={open} /> : null}
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
  blanks,
  onOpen,
}: {
  rows: ReturnType<typeof ribbonRows>;
  blanks: string[];
  onOpen: (k: Kind, id: string) => void;
}) {
  const marks = caseMarks();
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
              {anchor ? renderMark(anchor, "worn worn-anchor") : null}
              {portraitWithPlaque(chief, plaques.chief)}
            </div>
          </div>
          <ul className="patch-row">
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

      <section className="ledger">
        <div>
          <h2>How to read the rack</h2>
          {caseCopy.howToRead.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>{awards.length} ribbons. The top row holds {rows[0]?.length ?? 0}.</p>
        </div>
        <div>
          <h2>What is still blank</h2>
          <ul className="plain">
            {blanks.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="split">
        <div>
          <h2>Specialties</h2>
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
        <div>
          <h2>Schools and dates that matter</h2>
          <ul className="stack">
            {schools.map((school) => (
              <li key={school.id}>
                <button type="button" className="row-btn" onClick={() => onOpen("school", school.id)}>
                  <strong>{formatWhen(school.start)}</strong>
                  <span>{school.name}</span>
                  <em>{school.length ?? "length not entered"}</em>
                </button>
              </li>
            ))}
            {milestones.map((mark) => (
              <li key={mark.id}>
                <button type="button" className="row-btn" onClick={() => onOpen("milestone", mark.id)}>
                  <strong>{formatWhen(mark.date)}</strong>
                  <span>{mark.title}</span>
                  <em>Career</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Timeline({ bars, onOpen }: { bars: ReturnType<typeof timeline>; onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>{profile.serviceLength}, one line</h2>
      <p>{caseCopy.timelineLead}</p>
      <div className="ruler" aria-hidden="true">
        {bars.years.filter((y, index) => y % 2 === 1 || index === 0 || index === bars.years.length - 1).map((year) => (
          <span key={year} style={{ left: `${pct(Date.UTC(year, 0, 1))}%` }}>{year}</span>
        ))}
      </div>
      <Track label="Assignments" items={bars.duty} onOpen={onOpen} />
      <Track label="Deployments" items={bars.ops} onOpen={onOpen} />
      <Track label="Schools and career dates" items={bars.study} onOpen={onOpen} />
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
  const lanes = Math.max(1, ...items.map((item) => item.lane)) + 1;
  return (
    <section className="track" aria-label={label}>
      <h3>{label}</h3>
      <div className="track-lanes" style={{ height: `${lanes * 2.6}rem` }}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.point ? "bar point" : "bar"}
            style={{
              left: `${item.left}%`,
              width: `${item.width}%`,
              top: `${item.lane * 2.6}rem`,
            }}
            onClick={() => onOpen(item.kind, item.id)}
          >
            <span>{item.title}</span>
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
                  <button type="button" className="uniform-card" onClick={() => onOpen("uniform", uniform.id)}>
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

function Stations({ stops, onOpen }: { stops: ReturnType<typeof careerStops>; onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>Where the career went</h2>
      <p>{caseCopy.mapLead}</p>
      <MapView stops={stops} extra={bases.filter((place) => !stops.some((stop) => stop.place.id === place.id))} tall onSelect={(id) => onOpen("place", id)} />
      <ol className="stop-list">
        {stops.map((stop, index) => (
          <li key={`${stop.place.id}-${index}`}>
            <button type="button" onClick={() => onOpen("place", stop.place.id)}>
              <span className={`pip ${stop.place.accuracy}`} />
              <strong>{stop.place.name}</strong>
              <span>{stop.labels.join(" · ")}</span>
            </button>
          </li>
        ))}
      </ol>
      {bases.length ? (
        <>
          <h3>Deployment bases</h3>
          <ol className="stop-list">
            {bases.map((place) => (
              <li key={place.id}>
                <button type="button" onClick={() => onOpen("place", place.id)}>
                  <span className={`pip base ${place.accuracy}`} />
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
