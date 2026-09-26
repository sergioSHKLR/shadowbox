import { useMemo, useState } from "react";
import {
  awards,
  careerStops,
  credits,
  formatSpan,
  formatWhen,
  insignia,
  milestones,
  necs,
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
  type Kind,
  type Selection,
} from "@/lib/shadowbox/model";
import { Anchor, EswsPin, ExwPin, RatingBadge, RibbonButton, ServiceStripes, UniformPlate } from "@/components/shadowbox/marks";
import { DetailPanel } from "@/components/shadowbox/detail";
import { MapView } from "@/components/shadowbox/map-view";

type View = "case" | "timeline" | "uniforms" | "map" | "sources";

const NAV: { id: View; label: string }[] = [
  { id: "case", label: "Case" },
  { id: "timeline", label: "Timeline" },
  { id: "uniforms", label: "Uniforms" },
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

  return (
    <div className="archive">
      <header className="mast">
        <div className="mast-copy">
          <p className="kicker">United States Navy · 1997–2018</p>
          <h1>ETC Sergio Schickler</h1>
          <p className="mast-sub">Chief Electronics Technician · Fleet Reserve · Honorable</p>
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

      {view === "case" ? <Case rows={rows} onOpen={open} /> : null}
      {view === "timeline" ? <Timeline bars={bars} onOpen={open} /> : null}
      {view === "uniforms" ? <Uniforms onOpen={open} /> : null}
      {view === "map" ? <Stations stops={stops} onOpen={open} /> : null}
      {view === "sources" ? <Sources /> : null}

      <footer className="colophon">
        <p>
          A private reading copy of one career. No Social Security number, date of birth, or home address is stored here.
          Discharge papers are not in this project. Add them only after those fields are covered.
        </p>
      </footer>
      <DetailPanel selection={selection} onSelect={setSelection} onClose={() => setSelection(null)} />
    </div>
  );
}

function Case({ rows, onOpen }: { rows: ReturnType<typeof ribbonRows>; onOpen: (k: Kind, id: string) => void }) {
  return (
    <main>
      <section className="case" aria-label="Shadowbox">
        <div className="case-frame">
          <div className="nameplate">
            <img className="portrait" src={profile.portrait} alt="Sergio Schickler in Navy dress blues, ribbons on the chest and a warfare pin above them." />
            <div>
              <p className="kicker">Electronics Technician Chief</p>
              <h2>Sergio Schickler</h2>
              <p>E-7 · {formatWhen(profile.serviceStart)} – {formatWhen(profile.serviceEnd)}</p>
              <p className="quiet">{profile.serviceLength} active. Sea service {profile.seaService}. Foreign service {profile.foreignService}.</p>
            </div>
          </div>
          <div className="insignia-row">
            <button type="button" className="mark" onClick={() => onOpen("insignia", "collar")} aria-label="Chief petty officer collar device. Open the explanation.">
              <Anchor />
              <span>Chief</span>
            </button>
            <button type="button" className="mark" onClick={() => onOpen("warfare", "esws")} aria-label="Enlisted Surface Warfare Specialist pin. Open the explanation.">
              <EswsPin />
              <span>ESWS</span>
            </button>
            <button type="button" className="mark" onClick={() => onOpen("warfare", "exw")} aria-label="Enlisted Expeditionary Warfare Specialist pin. Open the explanation.">
              <ExwPin />
              <span>EXW</span>
            </button>
            <button type="button" className="mark" onClick={() => onOpen("insignia", "rating-badge")} aria-label="Electronics Technician chief rating badge. Open the explanation.">
              <RatingBadge />
              <span>ET</span>
            </button>
            <button type="button" className="mark" onClick={() => onOpen("insignia", "stripes")} aria-label={`${profile.serviceStripes} gold service stripes. Open the explanation.`}>
              <ServiceStripes count={profile.serviceStripes} />
              <span>{profile.serviceStripes} stripes</span>
            </button>
          </div>
          <div className="rack" aria-label="Ribbon rack, highest award at the top left">
            {rows.map((row) => (
              <div key={row.map((a) => a.id).join("-")} className="rack-row">
                {row.map((award) => (
                  <RibbonButton key={award.id} award={award} onOpen={() => onOpen("award", award.id)} />
                ))}
              </div>
            ))}
          </div>
          <p className="rack-note">Highest award is the top left. Devices sit on the ribbon: gold stars for Navy personal awards, bronze stars for unit and sea ribbons, oak leaves for joint and Army awards.</p>
          <ul className="patch-row">
            {units.map((unit) => (
              <li key={unit.id}>
                <button type="button" className="patch" onClick={() => onOpen("unit", unit.id)}>
                  <span className="patch-mark">{unit.patch}</span>
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
          <p>Navy racks run in rows of three, from the wearer’s right, which is the left side of this case. The top row is short when the number of ribbons is not divisible by three. Twenty ribbons means the top row holds two.</p>
          <p>A star or an oak leaf is not extra decoration. It counts awards. A silver star on the Good Conduct Medal replaces five gold stars. Two bronze stars on a campaign medal are campaign phases, not two more medals. The Navy E uses a letter instead of a star.</p>
        </div>
        <div>
          <h2>What is still blank</h2>
          <ul className="plain">
            <li>Four of the seven sea-service ribbons, and three of the six overseas ribbons, have no year.</li>
            <li>Four of the five Meritorious Unit Commendations, and two of the three Joint Meritorious Unit Awards, have no year.</li>
            <li>The humanitarian operation is unnamed. FLLDP is not expanded. The 2009 Army unit is unnamed.</li>
            <li>No personal note has been written yet. The portrait is the only photograph.</li>
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
      <h2>Twenty-one years, one line</h2>
      <p>Assignments sit on the first track, including the tours that overlap a longer command. Deployments are the second track. Schools and the three dated career events are marks, not bars, because only a start month or a single day was recorded.</p>
      <div className="ruler" aria-hidden="true">
        {bars.years.filter((y) => y % 2 === 1 || y === 1997 || y === 2018).map((year) => (
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
      <h2>Uniforms, in the order they were worn</h2>
      <p>Fourteen uniforms. The photograph is the dress blues. Patterns that are not confirmed are drawn as a generic plate and said so in the note. Dinner dress was not worn.</p>
      <ol className="uniform-grid">
        {uniforms.map((uniform) => (
          <li key={uniform.id}>
            <button type="button" className="uniform-card" onClick={() => onOpen("uniform", uniform.id)}>
              <UniformPlate variant={uniform.variant} />
              <span className="ord">{uniform.order}</span>
              <strong>{uniform.name}</strong>
              <span>{uniform.dateLabel}</span>
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}

function Stations({ stops, onOpen }: { stops: ReturnType<typeof careerStops>; onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>Where the career went</h2>
      <p>The line is the order of the record, not a claim about the route flown. Gold is a known public site. A hollow pin is approximate. A square is a placeholder for a country, not a base.</p>
      <MapView stops={stops} onSelect={(id) => onOpen("place", id)} />
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
    </main>
  );
}

function Sources() {
  return (
    <main className="sheet">
      <h2>Where the pictures and the facts come from</h2>
      <p>Facts are taken from the discharge form’s award, school, specialty, and service blocks, and from the shadowbox worksheet for years, units, and campaign phases. Identification blocks on that form are not copied. {photos.length === 1 ? "One photograph is in the case." : null}</p>
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
      <h3>Insignia drawn here</h3>
      <ul className="stack">
        {insignia.map((item) => (
          <li key={item.id}><span className="row-btn static"><strong>{item.name}</strong><span>Diagram, not a copied seal</span></span></li>
        ))}
        {warfare.map((pin) => (
          <li key={pin.id}><span className="row-btn static"><strong>{pin.abbreviation}</strong><span>Diagram of the warfare pin</span></span></li>
        ))}
      </ul>
    </main>
  );
}
