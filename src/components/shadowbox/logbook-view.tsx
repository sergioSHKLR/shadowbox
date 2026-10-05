import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  branchName,
  formatSpan,
  formatWhen,
  isMapExcludedUnit,
  logbookBeats,
  publicUrl,
  ribbonRows,
  warfare,
  type Kind,
  unitById,
  type LogbookAdminFact,
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

type Open = (k: Kind, id: string) => void;

export type LogbookTab = "overview" | "command" | "admin";
const TABS: LogbookTab[] = ["overview", "command", "admin"];
const TAB_LABEL: Record<LogbookTab, string> = { overview: "Overview", command: "Command", admin: "Admin" };

const ADMIN_GROUPS: { kind: LogbookAdminFact["kind"]; label: string }[] = [
  { kind: "rank", label: "Rank" },
  { kind: "nec", label: "NEC" },
  { kind: "school", label: "Schools" },
  { kind: "milestone", label: "Milestones" },
];

function AdminPanel({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  if (!beat.admin.length) {
    return <p className="logbook-admin-empty quiet">No schools, NECs, or admin facts tied to this command.</p>;
  }
  return (
    <div className="logbook-admin-groups">
      {ADMIN_GROUPS.map((group) => {
        const facts = beat.admin.filter((fact) => fact.kind === group.kind);
        if (!facts.length) return null;
        return (
          <section key={group.kind} className="logbook-admin-group" aria-label={group.label}>
            <p className="logbook-kicker">{group.label}</p>
            <ul className="logbook-admin-list">
              {facts.map((fact) => (
                <li key={`${fact.kind}-${fact.id}`}>
                  <button type="button" onClick={() => onOpen(fact.kind, fact.id)} aria-label={`${fact.label}. ${fact.detail}`}>
                    <strong>{fact.label}</strong>
                    <span>{fact.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

function OverviewPanel({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  const command = beat.stop.commandId ? unitById(beat.stop.commandId) : undefined;
  const span = command ? formatSpan(command.start, command.end) : beat.when ? formatWhen(beat.when) : "";
  return (
    <div className="logbook-panel-body">
      <dl className="logbook-facts">
        <Fact label="Place">
          <button type="button" className="logbook-link" onClick={() => onOpen("place", beat.stop.place.id)}>
            {beat.stop.place.name}
          </button>
        </Fact>
        {span ? <Fact label="Tour">{span}</Fact> : null}
        {beat.rank ? (
          <Fact label="Rank">
            <button type="button" className="logbook-link" onClick={() => onOpen("rank", beat.rank!.id)}>
              {beat.rank.abbreviation}
            </button>{" "}
            <span className="quiet">{beat.rank.name}</span>
          </Fact>
        ) : null}
      </dl>
      {command?.civilian ? <p className="logbook-plain">{command.civilian}</p> : null}
    </div>
  );
}

function CommandPanel({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  const command = beat.stop.commandId ? unitById(beat.stop.commandId) : undefined;
  if (!command) return <p className="quiet">No command recorded for this stop.</p>;
  return (
    <div className="logbook-panel-body">
      <p className="logbook-command-name">
        <button type="button" className="logbook-link" onClick={() => onOpen("unit", command.id)}>
          {command.name}
        </button>
      </p>
      <dl className="logbook-facts">
        <Fact label="Branch">{branchName(command.branch)}</Fact>
        {command.designator ? <Fact label="Attached">{command.designator}</Fact> : null}
        {command.workcenter ? <Fact label="Workcenter">{command.workcenter}</Fact> : null}
      </dl>
      {command.explanation ? <p className="logbook-plain">{command.explanation}</p> : null}
    </div>
  );
}

function BeatTabs({
  beat,
  tab,
  onTab,
  onOpen,
}: {
  beat: LogbookBeat;
  tab: LogbookTab;
  onTab: (tab: LogbookTab, beatIndex: number) => void;
  onOpen: Open;
}) {
  const base = `logbook-${beat.stop.n}`;
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    event.stopPropagation();
    const at = TABS.indexOf(tab);
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (at + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    onTab(TABS[next], beat.index);
    window.requestAnimationFrame(() => document.getElementById(`${base}-tab-${TABS[next]}`)?.focus());
  };
  return (
    <div className="logbook-tabbed">
      <div className="logbook-tabs" role="tablist" aria-label={`${beat.lines[0]} details`} onKeyDown={onKey}>
        {TABS.map((name) => (
          <button
            key={name}
            id={`${base}-tab-${name}`}
            type="button"
            role="tab"
            aria-selected={tab === name}
            aria-controls={`${base}-panel-${name}`}
            tabIndex={tab === name ? 0 : -1}
            className={tab === name ? "nav-btn on" : "nav-btn"}
            onClick={() => onTab(name, beat.index)}
          >
            {TAB_LABEL[name]}
            {name === "admin" && beat.admin.length ? <span className="logbook-tab-count">{beat.admin.length}</span> : null}
          </button>
        ))}
      </div>
      <div className="logbook-panel" role="tabpanel" id={`${base}-panel-${tab}`} aria-labelledby={`${base}-tab-${tab}`}>
        {tab === "overview" ? <OverviewPanel beat={beat} onOpen={onOpen} /> : null}
        {tab === "command" ? <CommandPanel beat={beat} onOpen={onOpen} /> : null}
        {tab === "admin" ? <AdminPanel beat={beat} onOpen={onOpen} /> : null}
      </div>
    </div>
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
  const [tab, setTab] = useState<LogbookTab>("overview");
  const [phonePanel, setPhonePanel] = useState<"map" | "units" | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickyPhoneRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  /** While a programmatic scroll settles, the scroll tracker must not override the chosen beat. */
  const lockUntil = useRef(0);
  const beat = beats[Math.min(active, Math.max(0, beats.length - 1))] ?? beats[0];
  activeRef.current = active;

  /** Desktop: the beats panel is its own scroller. Phone: the page scrolls. */
  const panelScrolls = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return false;
    return getComputedStyle(root).overflowY !== "visible" && root.scrollHeight > root.clientHeight + 4;
  }, []);

  const phoneTop = useCallback(() => {
    const sticky = stickyPhoneRef.current;
    if (!sticky || getComputedStyle(sticky).display === "none") return 56;
    return Math.max(56, sticky.getBoundingClientRect().bottom);
  }, []);

  const scrollToBeat = useCallback(
    (index: number, smooth = true) => {
      const root = scrollerRef.current;
      const node = root?.querySelector<HTMLElement>(`[data-beat="${index}"]`);
      if (!root || !node) return;
      const behavior: ScrollBehavior =
        smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto";
      lockUntil.current = performance.now() + (behavior === "smooth" ? 900 : 120);
      setActive(index);
      if (panelScrolls()) {
        const top = node.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 8;
        root.scrollTo({ top: Math.max(0, top), behavior });
      } else {
        const top = node.getBoundingClientRect().top + window.scrollY - phoneTop() - 10;
        window.scrollTo({ top: Math.max(0, top), behavior });
      }
    },
    [panelScrolls, phoneTop],
  );

  // Scroll-position tracking (not IntersectionObserver): the active beat is the last one whose
  // top has crossed the reading line. Reaching the end of the scroll always activates the last beat,
  // and a bottom spacer gives the last beat room to reach the reading line.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !beats.length) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (performance.now() < lockUntil.current) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-beat]"));
      if (!nodes.length) return;
      const inPanel = panelScrolls();
      let line: number;
      let atEnd: boolean;
      let atStart: boolean;
      if (inPanel) {
        const box = root.getBoundingClientRect();
        line = box.top + box.height * 0.3;
        atEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 4;
        atStart = root.scrollTop <= 2;
      } else {
        const top = phoneTop();
        line = top + (window.innerHeight - top) * 0.25;
        const doc = document.documentElement;
        atEnd = window.scrollY + window.innerHeight >= doc.scrollHeight - 4;
        atStart = nodes[0].getBoundingClientRect().top >= line;
      }
      let next = 0;
      if (atEnd) next = nodes.length - 1;
      else if (!atStart) {
        nodes.forEach((node, i) => {
          if (node.getBoundingClientRect().top <= line) next = i;
        });
      }
      if (next !== activeRef.current) setActive(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [beats.length, panelScrolls, phoneTop]);

  const onBeatsKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
    let next: number | null = null;
    if (event.key in keys) next = activeRef.current + keys[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = beats.length - 1;
    if (next == null) return;
    event.preventDefault();
    scrollToBeat(Math.max(0, Math.min(beats.length - 1, next)));
  };

  const chooseTab = (name: LogbookTab, beatIndex: number) => {
    setTab(name);
    if (beatIndex !== activeRef.current) scrollToBeat(beatIndex);
    else {
      // Every card switches tab together; keep the active card pinned at the reading line.
      window.requestAnimationFrame(() => scrollToBeat(beatIndex, false));
    }
  };

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

      <div className="logbook-sticky-phone" ref={stickyPhoneRef} aria-label="Uniform and decorations">
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
          <nav className="logbook-steps" aria-label="Commands">
            {beats.map((row) => (
              <button
                key={row.stop.n}
                type="button"
                className={row.index === active ? "logbook-step on" : "logbook-step"}
                aria-current={row.index === active ? "step" : undefined}
                aria-label={`${row.stop.n}. ${row.lines[0]}`}
                title={row.lines[0]}
                onClick={() => scrollToBeat(row.index)}
              >
                <span className={`pin-num ${row.stop.kind}`} aria-hidden="true">
                  {row.stop.n}
                </span>
                <span className="logbook-step-label">{row.lines[0]}</span>
              </button>
            ))}
          </nav>
          <div
            className="logbook-beats"
            ref={scrollerRef}
            tabIndex={0}
            aria-label="Assigned commands. Arrow keys move between commands."
            onKeyDown={onBeatsKey}
          >
            {beats.map((row) => (
              <article
                key={row.stop.n}
                id={`logbook-beat-${row.stop.n}`}
                data-beat={row.index}
                className={row.index === active ? "logbook-beat is-active" : "logbook-beat"}
                aria-current={row.index === active ? "step" : undefined}
              >
                <header className="logbook-beat-head" onClick={() => row.index !== active && scrollToBeat(row.index)}>
                  <span className={`pin-num ${row.stop.kind} ${row.stop.place.accuracy}`} aria-hidden="true">
                    {row.stop.n}
                  </span>
                  <div>
                    <h3>{row.lines[0]}</h3>
                    <p className="quiet">{row.lines[1] ?? "Command"}</p>
                  </div>
                </header>
                <BeatTabs beat={row} tab={tab} onTab={chooseTab} onOpen={onOpen} />
              </article>
            ))}
            <div className="logbook-beats-end" aria-hidden="true" />
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
