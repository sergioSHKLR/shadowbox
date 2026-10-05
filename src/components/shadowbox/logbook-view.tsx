import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatWhen,
  isMapExcludedUnit,
  logbookBeats,
  publicUrl,
  ribbonRows,
  warfare,
  type Kind,
  unitById,
  type LogbookBeat,
  type Stop,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";
import { RibbonArt } from "@/components/shadowbox/marks";
import { Boundary } from "@/components/shadowbox/boundary";

function PinMark({ id, onOpen }: { id: string; onOpen: (k: Kind, id: string) => void }) {
  const pin = warfare.find((row) => row.id === id);
  if (!pin?.image) return null;
  return (
    <button type="button" className="logbook-pin" onClick={() => onOpen("warfare", pin.id)} aria-label={pin.name}>
      <img src={publicUrl(pin.image)} alt="" />
    </button>
  );
}

function UniformPlate({ beat, onOpen }: { beat: LogbookBeat; onOpen: (k: Kind, id: string) => void }) {
  const slide = beat.uniform;
  return (
    <section className="logbook-plate" aria-label="Uniform">
      <p className="logbook-kicker">Uniform</p>
      {slide ? (
        <button type="button" className="logbook-plate-art" onClick={() => beat.rank && onOpen("rank", beat.rank.id)} aria-label={slide.caption}>
          <img src={publicUrl(slide.src)} alt="" />
        </button>
      ) : (
        <p className="quiet">No plate for this date.</p>
      )}
      <p className="logbook-plate-cap">
        {beat.rank ? <strong>{beat.rank.abbreviation}</strong> : null}
        {slide ? <span>{slide.caption}</span> : null}
      </p>
    </section>
  );
}

function RackPlate({ beat, onOpen }: { beat: LogbookBeat; onOpen: (k: Kind, id: string) => void }) {
  const rows = ribbonRows(beat.rack);
  return (
    <section className="logbook-rack" aria-label="Decorations">
      <p className="logbook-kicker">Decorations</p>
      {beat.pinsAbove.length || rows.length || beat.pinsBelow.length ? (
        <div className="logbook-dress">
          {beat.pinsAbove.map((id) => (
            <PinMark key={`above-${id}`} id={id} onOpen={onOpen} />
          ))}
          {rows.length ? (
            <div className="rack logbook-ribbons" aria-label="Ribbon rack">
              {rows.map((row) => (
                <div key={row.map((award) => award.id).join("-")} className="rack-row">
                  {row.map((award) => (
                    <button key={award.id} type="button" className="ribbon" onClick={() => onOpen("award", award.id)} aria-label={award.name}>
                      <RibbonArt award={award} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="quiet">No ribbons on this plate yet.</p>
          )}
          {beat.pinsBelow.map((id) => (
            <PinMark key={`below-${id}`} id={id} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <p className="quiet">No command plate for this command.</p>
      )}
      {beat.plate ? <p className="logbook-plate-cap quiet">As of {unitById(beat.plate.unitId)?.abbreviation ?? beat.plate.unitId}</p> : null}
    </section>
  );
}

function UnitsInset({ beat, onOpen }: { beat: LogbookBeat; onOpen: (k: Kind, id: string) => void }) {
  if (!beat.units.length) return <p className="quiet">No units recorded for this command.</p>;
  return (
    <ul className="logbook-units">
      {beat.units.map((unit) => (
        <li key={unit.id}>
          <button type="button" className="logbook-unit" onClick={() => onOpen("unit", unit.id)} aria-label={unit.name}>
            {unit.image ? <img src={publicUrl(unit.image)} alt="" /> : <strong>{unit.abbreviation}</strong>}
            <span>
              <b>{unit.abbreviation}</b>
              {unit.designator ? <em>{unit.designator}</em> : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function AdminStrip({ beat, onOpen }: { beat: LogbookBeat; onOpen: (k: Kind, id: string) => void }) {
  if (!beat.admin.length) {
    return <p className="logbook-admin-empty quiet">No schools, NECs, or admin facts tied to this command.</p>;
  }
  return (
    <ul className="logbook-admin-list">
      {beat.admin.map((fact) => (
        <li key={`${fact.kind}-${fact.id}`}>
          <button
            type="button"
            onClick={() => onOpen(fact.kind === "milestone" ? "milestone" : fact.kind, fact.id)}
            aria-label={`${fact.label}. ${fact.detail}`}
          >
            <small>{fact.kind}</small>
            <strong>{fact.label}</strong>
            <span>{fact.detail}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function MapInset({
  stops,
  beat,
  onOpen,
}: {
  stops: Stop[];
  beat: LogbookBeat;
  onOpen: (k: Kind, id: string) => void;
}) {
  // Full sequence keeps Leaflet stable; only focus/reveal change per beat.
  // Excluded customer units never become map pins here (their places are not added as extras).
  void isMapExcludedUnit;
  return (
    <div className="logbook-map-frame">
      <Boundary label="logbook map" fallback={<p className="quiet">Map unavailable right now.</p>}>
      <MapView
        stops={stops}
        extra={[]}
        tall={false}
        focusId={beat.stop.place.id}
        focusIndex={beat.index}
        revealedCount={beat.index + 1}
        onSelect={(id) => onOpen("place", id)}
      />
      </Boundary>
    </div>
  );
}

export function Logbook({
  onOpen,
  title,
  lead,
}: {
  onOpen: (k: Kind, id: string) => void;
  title: string;
  lead: string;
}) {
  const beats = useMemo(() => logbookBeats(), []);
  const stops = useMemo(() => beats.map((row) => row.stop), [beats]);
  const [active, setActive] = useState(0);
  const [phonePanel, setPhonePanel] = useState<"map" | "units" | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const beat = beats[Math.min(active, Math.max(0, beats.length - 1))] ?? beats[0];

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !beats.length) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-beat]"));
    if (!nodes.length) return;
    let frame = 0;
    const bind = () => {
      const scrollable = root.scrollHeight > root.clientHeight + 8;
      return new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const top = visible[0];
          if (!top) return;
          const index = Number((top.target as HTMLElement).dataset.beat);
          if (!Number.isFinite(index)) return;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => setActive(index));
        },
        {
          // Desktop: beats panel scrolls. Phone: page scrolls — use viewport.
          root: scrollable ? root : null,
          rootMargin: scrollable ? "-20% 0px -45% 0px" : "-28% 0px -42% 0px",
          threshold: [0.15, 0.35, 0.55, 0.75],
        },
      );
    };
    let observer = bind();
    nodes.forEach((node) => observer.observe(node));
    const onResize = () => {
      observer.disconnect();
      observer = bind();
      nodes.forEach((node) => observer.observe(node));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [beats.length]);

  if (!beat) {
    return (
      <main className="sheet logbook">
        <h2>{title}</h2>
        <p>No command plates to drive the logbook.</p>
      </main>
    );
  }

  return (
    <main className="sheet logbook">
      <header className="logbook-head">
        <h2>{title}</h2>
        <p>{lead}</p>
        <p className="logbook-count quiet" aria-live="polite">
          Command {beat.stop.n} of {beats.length}
          {beat.when ? ` · ${beat.when.length === 4 ? beat.when : formatWhen(beat.when)}` : ""}
        </p>
      </header>

      <div className="logbook-sticky-phone" aria-label="Uniform and decorations">
        <UniformPlate beat={beat} onOpen={onOpen} />
        <RackPlate beat={beat} onOpen={onOpen} />
      </div>

      <div className="logbook-layout">
        <aside className="logbook-side logbook-side-left" aria-label="Uniform for this command">
          <div className="logbook-sticky">
            <UniformPlate beat={beat} onOpen={onOpen} />
          </div>
        </aside>

        <div className="logbook-center">
          <div className="logbook-beats" ref={scrollerRef} tabIndex={0} aria-label="Assigned commands">
            {beats.map((row) => (
              <article
                key={row.stop.n}
                id={`logbook-beat-${row.stop.n}`}
                data-beat={row.index}
                className={row.index === active ? "logbook-beat is-active" : "logbook-beat"}
              >
                <header className="logbook-beat-head">
                  <span className={`pin-num ${row.stop.kind} ${row.stop.place.accuracy}`} aria-hidden="true">
                    {row.stop.n}
                  </span>
                  <div>
                    <h3>{row.lines[0]}</h3>
                    <p className="quiet">
                      Command
                      {row.stop.when ? ` · ${row.stop.when.length === 4 ? row.stop.when : formatWhen(row.stop.when)}` : ""}
                    </p>
                  </div>
                </header>
                <div className="logbook-beat-body">
                  {row.lines.slice(1).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                {row.index === active ? (
                  <div className="logbook-admin" aria-label="Admin for this command">
                    <p className="logbook-kicker">Admin</p>
                    <AdminStrip beat={row} onOpen={onOpen} />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <aside className="logbook-side logbook-side-right" aria-label="Decorations for this command">
          <div className="logbook-sticky">
            <RackPlate beat={beat} onOpen={onOpen} />
          </div>
        </aside>
      </div>

      <div className="logbook-insets" aria-label="Map and units for this command">
        <section className="logbook-inset logbook-inset-map">
          <p className="logbook-kicker">Map</p>
          <p className="logbook-inset-label">
            <span className={`pin-num ${beat.stop.kind}`}>{beat.stop.n}</span>
            {beat.stop.labels[0]}
          </p>
          <MapInset stops={stops} beat={beat} onOpen={onOpen} />
        </section>
        <section className="logbook-inset logbook-inset-units">
          <p className="logbook-kicker">Units</p>
          <UnitsInset beat={beat} onOpen={onOpen} />
        </section>
      </div>

      <div className="logbook-phone-chips" aria-label="Map and units">
        <button
          type="button"
          className={phonePanel === "map" ? "nav-btn on" : "nav-btn"}
          aria-expanded={phonePanel === "map"}
          onClick={() => setPhonePanel((cur) => (cur === "map" ? null : "map"))}
        >
          Map
        </button>
        <button
          type="button"
          className={phonePanel === "units" ? "nav-btn on" : "nav-btn"}
          aria-expanded={phonePanel === "units"}
          onClick={() => setPhonePanel((cur) => (cur === "units" ? null : "units"))}
        >
          Units
        </button>
      </div>
      {phonePanel === "map" ? (
        <section className="logbook-phone-panel" aria-label="Map">
          <p className="logbook-inset-label">
            <span className={`pin-num ${beat.stop.kind}`}>{beat.stop.n}</span>
            {beat.stop.labels[0]}
          </p>
          <MapInset stops={stops} beat={beat} onOpen={onOpen} />
        </section>
      ) : null}
      {phonePanel === "units" ? (
        <section className="logbook-phone-panel" aria-label="Units">
          <UnitsInset beat={beat} onOpen={onOpen} />
        </section>
      ) : null}
    </main>
  );
}
