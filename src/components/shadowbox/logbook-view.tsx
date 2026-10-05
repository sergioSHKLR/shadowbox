import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  deploymentsForCommand,
  formatSpan,
  formatWhen,
  isMapExcludedUnit,
  logbookAdminAsOf,
  logbookBeats,
  medalFor,
  medalRows,
  offDutyForCommand,
  onDutyForCommand,
  publicUrl,
  ribbonRows,
  uniformPlatesForCommand,
  uniformsNamingCommand,
  unitById,
  warfare,
  type Award,
  type Kind,
  type LogbookBeat,
  type LogbookGearGroup,
  type Stop,
  type UniformSlide,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";
import { MedalBlock, RibbonArt } from "@/components/shadowbox/marks";
import { Boundary } from "@/components/shadowbox/boundary";

type Open = (k: Kind, id: string) => void;
type MainTab = "rank" | "admin";

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="logbook-kicker">{children}</p>;
}

function PinMark({ id, onOpen }: { id: string; onOpen: Open }) {
  const pin = warfare.find((row) => row.id === id);
  if (!pin?.image) return null;
  return (
    <button type="button" className="logbook-pin" onClick={() => onOpen("warfare", pin.id)} aria-label={pin.name} title={pin.name}>
      <img src={publicUrl(pin.image)} alt="" />
    </button>
  );
}

/** Rank & Awards as of the end of this command: rank insignia, warfare pins, ribbons, medals (command-plates.json). */
function RankAwards({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  const rank = beat.rank;
  const rows = ribbonRows(beat.rack);
  const medalList = beat.rack.filter((award) => medalFor(award.id));
  const pins = [...beat.pinsAbove, ...beat.pinsBelow];
  return (
    <div className="logbook-ra">
      <section className="logbook-ra-rank" aria-label="Rank insignia">
        <Kicker>Rank</Kicker>
        {rank ? (
          <button type="button" className="logbook-rank" onClick={() => onOpen("rank", rank.id)} aria-label={`${rank.abbreviation}, ${rank.name}`}>
            {rank.image ? <img className="logbook-rank-patch" src={publicUrl(rank.image)} alt="" /> : null}
            {rank.collar ? <img className="logbook-rank-collar" src={publicUrl(rank.collar)} alt="" /> : null}
            <span>
              <strong>{rank.abbreviation}</strong>
              <small>{[rank.grade, rank.name].filter(Boolean).join(" · ")}</small>
            </span>
          </button>
        ) : (
          <p className="quiet">No rank recorded for this command.</p>
        )}
        <p className="logbook-ra-note quiet">Service stripes: shown on the uniform plate; the count is not entered in the record.</p>
      </section>
      {pins.length ? (
        <section aria-label="Warfare and qualification pins">
          <Kicker>Pins</Kicker>
          <div className="logbook-pins">
            {pins.map((id) => (
              <PinMark key={id} id={id} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ) : null}
      <section aria-label="Ribbons">
        <Kicker>Ribbons</Kicker>
        {rows.length ? (
          <div className="rack logbook-ribbons" aria-label="Ribbon rack">
            {rows.map((row) => (
              <div key={row.map((award) => award.id).join("-")} className="rack-row">
                {row.map((award) => (
                  <button key={award.id} type="button" className="ribbon" onClick={() => onOpen("award", award.id)} aria-label={award.name} title={award.name}>
                    <RibbonArt award={award} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="quiet">No ribbons on this command plate.</p>
        )}
      </section>
      <section aria-label="Medals">
        <Kicker>Medals</Kicker>
        {medalList.length ? (
          <div className="logbook-medals">
            <MedalBlock rows={medalRows(medalList)} onOpen={(award: Award) => onOpen("award", award.id)} />
          </div>
        ) : (
          <p className="quiet">No medal art for this command plate.</p>
        )}
      </section>
    </div>
  );
}

/** Admin as of the end of this command: NECs held and schools (necs.json / schools.json). */
function AdminAsOf({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  const { necsHeld, schoolsThisTour, schoolsEarlier } = logbookAdminAsOf(beat);
  const schoolBtn = (school: (typeof schoolsThisTour)[number]) => (
    <li key={school.id}>
      <button type="button" onClick={() => onOpen("school", school.id)} aria-label={school.name}>
        <strong>{school.abbreviation || school.name}</strong>
        <span>{[school.abbreviation ? school.name : "", school.start ? formatSpan(school.start, school.end ?? null) : ""].filter(Boolean).join(" · ")}</span>
      </button>
    </li>
  );
  return (
    <div className="logbook-admin-groups">
      <section aria-label="NECs held">
        <Kicker>NECs held</Kicker>
        {necsHeld.length ? (
          <ul className="logbook-admin-list">
            {necsHeld.map(({ nec, isNew }) => (
              <li key={nec.id}>
                <button type="button" onClick={() => onOpen("nec", nec.id)} aria-label={`NEC ${nec.code}, ${nec.name}`}>
                  <strong>
                    NEC {nec.code}
                    {isNew ? <em className="logbook-new">this tour</em> : null}
                  </strong>
                  <span>{[nec.name, nec.awarded ? formatWhen(nec.awarded) : ""].filter(Boolean).join(" · ")}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="quiet">No NEC recorded by the end of this command.</p>
        )}
      </section>
      <section aria-label="Schools this tour">
        <Kicker>Schools this tour</Kicker>
        {schoolsThisTour.length ? <ul className="logbook-admin-list">{schoolsThisTour.map(schoolBtn)}</ul> : <p className="quiet">No schools recorded during this command.</p>}
      </section>
      {schoolsEarlier.length ? (
        <details className="logbook-earlier">
          <summary>Earlier schools ({schoolsEarlier.length})</summary>
          <ul className="logbook-admin-list">{schoolsEarlier.map(schoolBtn)}</ul>
        </details>
      ) : null}
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
  // Full sequence, all six pins shown; only the focus changes per beat (shrinking the reveal mid-flight trips markercluster).
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
        revealedCount={stops.length}
        onSelect={(id) => onOpen("place", id)}
      />
      </Boundary>
    </div>
  );
}

function ComingSoon({ what }: { what: string }) {
  return (
    <div className="logbook-soon">
      <strong>Coming soon</strong>
      <span className="quiet">No {what} recorded for this command yet.</span>
    </div>
  );
}

function GearPanel({ groups, what, onOpen }: { groups: LogbookGearGroup[]; what: string; onOpen: Open }) {
  if (!groups.length) return <ComingSoon what={what} />;
  return (
    <div className="logbook-gear">
      {groups.map((group) => (
        <section key={group.id} aria-label={group.label}>
          <p className="logbook-kicker">{group.label}</p>
          <ul className="logbook-gear-list">
            {group.items.map((item) => (
              <li key={item.id}>
                <button type="button" className="logbook-gear-item" onClick={() => onOpen("equipment", item.id)} aria-label={item.name}>
                  {item.image ? <img src={publicUrl(item.image)} alt="" loading="lazy" /> : <span className="logbook-gear-blank" aria-hidden="true" />}
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

type Look = "white" | "blue" | "khaki";
const LOOKS: { id: Look; label: string }[] = [
  { id: "white", label: "Whites" },
  { id: "blue", label: "Blues" },
  { id: "khaki", label: "Khakis" },
];

/** The active command's own plate for a uniform (command-plates.json + its ready plates). Never another command's. */
function plateFor(beat: LogbookBeat, look: Look): UniformSlide | null {
  const plates = uniformPlatesForCommand(beat.stop.commandId).filter((slide) => slide.look === look);
  if (!plates.length) return null;
  const code = (file?: string) => (file ?? "").replace(/\.[^.]+$/, "").replace(/[a-z]+$/i, "");
  const own = code(beat.uniform?.file);
  return plates.find((slide) => code(slide.file) === own) ?? plates[0];
}

/** Uniforms: Whites / Blues / Khakis segmented control + the mannequin plate for the active command. */
function UniformsPanel({
  beat,
  look,
  onLook,
  onOpen,
}: {
  beat: LogbookBeat;
  look: Look;
  onLook: (look: Look) => void;
  onOpen: Open;
}) {
  const plate = plateFor(beat, look);
  const worn = uniformsNamingCommand(beat.stop.commandId);
  return (
    <div className="logbook-gear">
      <div className="logbook-seg" role="radiogroup" aria-label="Uniform">
        {LOOKS.map((row) => (
          <button
            key={row.id}
            type="button"
            role="radio"
            aria-checked={look === row.id}
            className={look === row.id ? "logbook-seg-btn on" : "logbook-seg-btn"}
            onClick={() => onLook(row.id)}
          >
            {row.label}
          </button>
        ))}
      </div>
      {plate ? (
        <figure className="logbook-mannequin">
          <button type="button" className="logbook-plate-art" onClick={() => beat.rank && onOpen("rank", beat.rank.id)} aria-label={plate.caption}>
            <img key={plate.file} src={publicUrl(plate.src)} alt="" />
          </button>
          <figcaption>
            {beat.rank ? <strong>{beat.rank.abbreviation}</strong> : null} <span>{plate.caption}</span>
          </figcaption>
        </figure>
      ) : (
        <div className="logbook-soon logbook-mannequin-empty">
          <strong>Not available</strong>
          <span className="quiet">No {LOOKS.find((row) => row.id === look)?.label.toLowerCase()} plate for {beatTitle(beat)}.</span>
        </div>
      )}
      {worn.length ? (
        <section aria-label="Command uniforms">
          <Kicker>Command gear</Kicker>
          <ul className="logbook-gear-list">
            {worn.map((item) => (
              <li key={item.id}>
                <button type="button" className="logbook-gear-item" onClick={() => onOpen("uniform", item.id)} aria-label={item.name}>
                  {item.image ? <img src={publicUrl(item.image)} alt="" loading="lazy" /> : <span className="logbook-gear-blank" aria-hidden="true" />}
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/** On Duty: deployment body armor + helmets (deployment-gear.json), then the command's other duty gear
 *  (equipment.json + used-here.json). Armor and helmets come only from deployment-gear.json. */
function OnDutyPanel({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  const deployments = deploymentsForCommand(beat.stop.commandId);
  const groups = onDutyForCommand(beat.stop.commandId).filter((group) => group.id !== "armor" && group.id !== "helmets");
  if (!deployments.length && !groups.length) return <ComingSoon what="duty gear" />;
  return (
    <div className="logbook-gear">
      {deployments.length ? (
        <section aria-label="Deployments">
          <Kicker>Deployments</Kicker>
          <ul className="logbook-deploys">
            {deployments.map((dep) => (
              <li key={dep.unitId} className="logbook-deploy">
                <button type="button" className="logbook-link" onClick={() => onOpen("unit", dep.unitId)}>
                  <strong>{dep.label}</strong> · {dep.unitAbbreviation}
                </button>
                <span className="quiet">{[dep.theater, dep.span].filter(Boolean).join(" · ")}</span>
                <dl className="logbook-facts">
                  <dt>Body armor</dt>
                  <dd>{dep.bodyArmor ? <><b>{dep.bodyArmor.short}</b> <span className="quiet">{dep.bodyArmor.name}</span></> : <span className="quiet">Not recorded</span>}</dd>
                  <dt>Helmet</dt>
                  <dd>
                    {dep.helmet ? (
                      <><b>{dep.helmet.short}</b> <span className="quiet">{dep.helmet.name}</span></>
                    ) : (
                      <>
                        <b>{dep.helmetsKnown.map((h) => h.short).join(" / ")}</b>{" "}
                        <span className="quiet">{dep.helmetsKnown.map((h) => h.name).join(" or ")}; which one on this deployment is not recorded</span>
                      </>
                    )}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {groups.length ? <GearPanel groups={groups} what="duty gear" onOpen={onOpen} /> : null}
    </div>
  );
}

/** Crests of the active and already-visited commands' units; the active command's units are highlighted. */
function CrestStrip({ beats, active, onOpen }: { beats: LogbookBeat[]; active: number; onOpen: Open }) {
  const current = new Set(beats[active]?.units.map((unit) => unit.id) ?? []);
  const seen = new Set<string>();
  const list: { unit: LogbookBeat["units"][number]; beatN: number }[] = [];
  beats.slice(0, active + 1).forEach((beat) => {
    beat.units.forEach((unit) => {
      if (seen.has(unit.id) || isMapExcludedUnit(unit.id)) return;
      seen.add(unit.id);
      list.push({ unit, beatN: beat.stop.n });
    });
  });
  if (!list.length) return <ComingSoon what="unit crests" />;
  return (
    <ul className="logbook-crests">
      {list.map(({ unit, beatN }) => (
        <li key={unit.id}>
          <button
            type="button"
            className={current.has(unit.id) ? "logbook-crest on" : "logbook-crest"}
            aria-current={current.has(unit.id) ? "true" : undefined}
            onClick={() => onOpen("unit", unit.id)}
            aria-label={`${unit.name}${current.has(unit.id) ? " (this command)" : ""}`}
            title={unit.name}
          >
            {unit.image ? <img src={publicUrl(unit.image)} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} /> : null}
            <b>{unit.abbreviation}</b>
            <em>#{beatN}{unit.designator ? ` · ${unit.designator}` : ""}</em>
          </button>
        </li>
      ))}
    </ul>
  );
}

type TabDef<T extends string> = { id: T; label: string; badge?: number };

/** A real tab bar attached to its content panel (role=tablist / tab / tabpanel). */
function Tabbed<T extends string>({
  idBase,
  label,
  tabs,
  value,
  onChange,
  className,
  panelClassName,
  panelFocusable = true,
  children,
}: {
  idBase: string;
  label: string;
  tabs: TabDef<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  panelClassName?: string;
  panelFocusable?: boolean;
  children: React.ReactNode;
}) {
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const at = tabs.findIndex((tab) => tab.id === value);
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (at + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    window.requestAnimationFrame(() => document.getElementById(`${idBase}-tab-${tabs[next].id}`)?.focus());
  };
  return (
    <div className={`lb-tabbed${className ? ` ${className}` : ""}`}>
      <div className="lb-tablist" role="tablist" aria-label={label} onKeyDown={onKey}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`${idBase}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={value === tab.id}
            aria-controls={`${idBase}-panel`}
            tabIndex={value === tab.id ? 0 : -1}
            className={value === tab.id ? "lb-tab on" : "lb-tab"}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {tab.badge ? <span className="lb-tab-count">{tab.badge}</span> : null}
          </button>
        ))}
      </div>
      <div className={`lb-tabpanel${panelClassName ? ` ${panelClassName}` : ""}`} role="tabpanel" id={`${idBase}-panel`} aria-labelledby={`${idBase}-tab-${value}`} tabIndex={panelFocusable ? 0 : undefined}>
        {children}
      </div>
    </div>
  );
}

function useNarrow(query = "(max-width: 900px)") {
  const [narrow, setNarrow] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return narrow;
}

/** Card titles: command abbreviation, except NAVHOSP reads as its pin label (NH Jacksonville, from places.json). */
function beatTitle(row: LogbookBeat): string {
  if (row.stop.commandId === "navhosp") return row.stop.place.name.split(",")[0];
  return row.lines[0];
}

type AsideTab = "uniforms" | "onduty" | "offduty";
type PhoneTab = AsideTab | "crests" | "map";

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
  const narrow = useNarrow();
  const [active, setActive] = useState(0);
  const [mainTab, setMainTab] = useState<MainTab>("rank");
  const [asideTab, setAsideTab] = useState<AsideTab>("uniforms");
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("uniforms");
  /** Uniform chosen in the Uniforms tab; kept as the beat changes. */
  const [look, setLook] = useState<Look>("blue");
  const rootRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  /** While a programmatic scroll settles, scroll sync must not override the chosen beat. */
  const lockUntil = useRef(0);
  const beat = beats[Math.min(active, Math.max(0, beats.length - 1))] ?? beats[0];
  activeRef.current = active;


  // Hold the map's beat while its phone tab is hidden; Leaflet must not animate a 0×0 map.
  const mapVisible = !narrow || phoneTab === "map";
  const mapBeatRef = useRef<LogbookBeat | undefined>(undefined);
  if (mapVisible || !mapBeatRef.current) mapBeatRef.current = beat;
  const mapBeat = mapBeatRef.current ?? beat;

  // Fit the whole Logbook in one viewport: measure the chrome around it (top bar, page padding,
  // pager, footer) and let CSS size the page to calc(100dvh - chrome).
  useEffect(() => {
    const main = rootRef.current;
    if (!main) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const box = main.getBoundingClientRect();
      if (!box.height) return;
      const footer = document.querySelector<HTMLElement>(".site-footer");
      const shell = footer?.parentElement;
      const tail = footer
        ? parseFloat(getComputedStyle(footer).marginBottom) +
          (shell ? parseFloat(getComputedStyle(shell).paddingBottom) + parseFloat(getComputedStyle(shell).borderBottomWidth) : 0)
        : 0;
      const below = footer ? footer.getBoundingClientRect().bottom + (tail || 0) - box.bottom : 0;
      const chrome = Math.max(0, Math.round(box.top + window.scrollY + below));
      main.style.setProperty("--lb-chrome", `${chrome}px`);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(queue);
    ro.observe(main);
    [".app-bar", ".site-footer", ".page-pager"].forEach((sel) => {
      const node = document.querySelector(sel);
      if (node) ro.observe(node);
    });
    window.addEventListener("resize", queue);
    queue();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", queue);
    };
  }, []);

  const scrollToBeat = useCallback((index: number, smooth = true) => {
    const root = scrollerRef.current;
    const node = root?.querySelector<HTMLElement>(`[data-beat="${index}"]`);
    if (!root || !node) return;
    const behavior: ScrollBehavior = smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto";
    lockUntil.current = performance.now() + (behavior === "smooth" ? 900 : 150);
    setActive(index);
    const top = node.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 6;
    root.scrollTo({ top: Math.max(0, top), behavior });
  }, []);

  // Scroll sync: IntersectionObserver rooted on the commands track's own scroller.
  // A card is "in the band" while it overlaps the top 30% of the track; the highest-numbered card in
  // the band is active. The spacer after the last card lets NH Jacksonville reach the band, and an
  // end sentinel activates it whenever the track is scrolled to the end.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !beats.length) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-beat]"));
    const sentinel = root.querySelector<HTMLElement>(".logbook-beats-sentinel");
    const inBand = new Set<number>();
    let atEnd = false;
    let frame = 0;
    const commit = () => {
      frame = 0;
      if (performance.now() < lockUntil.current) return;
      let next: number;
      if (atEnd) next = nodes.length - 1;
      else if (inBand.size) next = Math.max(...inBand);
      else return;
      if (next !== activeRef.current) setActive(next);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(commit);
    };
    const band = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.beat);
          if (!Number.isFinite(index)) continue;
          if (entry.isIntersecting) inBand.add(index);
          else inBand.delete(index);
        }
        queue();
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((node) => band.observe(node));
    const end = new IntersectionObserver(
      (entries) => {
        atEnd = entries.some((entry) => entry.isIntersecting);
        queue();
      },
      { root, threshold: 0 },
    );
    if (sentinel) end.observe(sentinel);
    const onScrollEnd = () => window.setTimeout(queue, 0);
    root.addEventListener("scrollend", onScrollEnd);
    // Spacer after the last card: just enough room for NH Jacksonville to sit at the top of the track.
    const spacer = root.querySelector<HTMLElement>(".logbook-beats-end");
    const last = nodes[nodes.length - 1];
    const size = new ResizeObserver(() => {
      if (!spacer || !last) return;
      spacer.style.height = `${Math.max(16, root.clientHeight - last.offsetHeight - 24)}px`;
    });
    size.observe(root);
    if (last) size.observe(last);
    return () => {
      size.disconnect();
      if (frame) cancelAnimationFrame(frame);
      band.disconnect();
      end.disconnect();
      root.removeEventListener("scrollend", onScrollEnd);
    };
  }, [beats.length, narrow]);

  const onTrackKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const keys: Record<string, number> = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
    let next: number | null = null;
    if (event.key in keys) next = activeRef.current + keys[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = beats.length - 1;
    if (next == null) return;
    event.preventDefault();
    scrollToBeat(Math.max(0, Math.min(beats.length - 1, next)));
  };

  const chooseMainTab = (name: MainTab) => {
    setMainTab(name);
    // Card heights change with the tab; keep the active command at the top of the track.
    window.requestAnimationFrame(() => scrollToBeat(activeRef.current, false));
  };

  if (!beat) {
    return (
      <main className="sheet logbook">
        <h2>{title}</h2>
        <p>No command plates to drive the logbook.</p>
      </main>
    );
  }

  const asideTabs: TabDef<AsideTab>[] = [
    { id: "uniforms", label: "Uniforms" },
    { id: "onduty", label: "On Duty" },
    { id: "offduty", label: "Off Duty" },
  ];
  const asideContent = (name: AsideTab) =>
    name === "uniforms" ? (
      <UniformsPanel beat={beat} look={look} onLook={setLook} onOpen={onOpen} />
    ) : name === "onduty" ? (
      <OnDutyPanel beat={beat} onOpen={onOpen} />
    ) : (
      <GearPanel groups={offDutyForCommand(beat.stop.commandId)} what="off-duty life" onOpen={onOpen} />
    );
  const mapRegion = (hidden: boolean) => (
    <div className="logbook-map-tab" hidden={hidden}>
      <p className="logbook-inset-label">
        <span className={`pin-num ${mapBeat.stop.kind}`}>{mapBeat.stop.n}</span>
        {mapBeat.stop.labels[0]}
      </p>
      <MapInset stops={stops} beat={mapBeat} onOpen={onOpen} />
    </div>
  );

  const main = (
    <section className="logbook-main" aria-label="Commands">
      <Tabbed
        idBase="logbook-main"
        label="Rank and awards, or admin, for each command"
        tabs={[
          { id: "rank", label: "Rank & Awards" },
          { id: "admin", label: "Admin" },
        ]}
        value={mainTab}
        onChange={chooseMainTab}
        className="logbook-main-tabs"
        panelFocusable={false}
      >
        <div className="logbook-beats" ref={scrollerRef} tabIndex={0} aria-label="Commands track. Arrow keys move between commands." onKeyDown={onTrackKey}>
          {beats.map((row) => {
            const unit = row.stop.commandId ? unitById(row.stop.commandId) : undefined;
            return (
              <article
                key={row.stop.n}
                id={`logbook-beat-${row.stop.n}`}
                data-beat={row.index}
                className={row.index === active ? "logbook-beat is-active" : "logbook-beat"}
                aria-current={row.index === active ? "step" : undefined}
              >
                <header className="logbook-beat-head">
                  <span className={`pin-num ${row.stop.kind} ${row.stop.place.accuracy}`} aria-hidden="true">
                    {row.stop.n}
                  </span>
                  <div>
                    <h3 title={unit?.name}>{beatTitle(row)}</h3>
                    <p className="quiet">{row.lines[1] ?? "Command"}</p>
                  </div>
                </header>
                <div className="logbook-beat-body">
                  {mainTab === "rank" ? <RankAwards beat={row} onOpen={onOpen} /> : <AdminAsOf beat={row} onOpen={onOpen} />}
                </div>
              </article>
            );
          })}
          <div className="logbook-beats-end" aria-hidden="true">
            <span className="logbook-beats-sentinel" />
          </div>
        </div>
      </Tabbed>
    </section>
  );

  return (
    <main className={`sheet logbook${narrow ? " is-narrow" : ""}`} ref={rootRef}>
      <header className="logbook-head">
        <h2>{title}</h2>
        <p className="logbook-lead">{lead}</p>
        <p className="logbook-count quiet" aria-live="polite">
          Command {beat.stop.n} of {beats.length}
          {beat.when ? ` · ${beat.when.length === 4 ? beat.when : formatWhen(beat.when)}` : ""}
        </p>
      </header>

      {narrow ? (
        <div className="logbook-phone">
          {main}
          <Tabbed
            idBase="logbook-phone"
            label="Uniforms, duty, crests and map"
            tabs={[...asideTabs, { id: "crests", label: "Crests" }, { id: "map", label: "Map" }]}
            value={phoneTab}
            onChange={setPhoneTab}
            className="logbook-phone-tabs"
          >
            {phoneTab === "uniforms" || phoneTab === "onduty" || phoneTab === "offduty" ? asideContent(phoneTab) : null}
            {phoneTab === "crests" ? <CrestStrip beats={beats} active={active} onOpen={onOpen} /> : null}
            {mapRegion(phoneTab !== "map")}
          </Tabbed>
        </div>
      ) : (
        <div className="logbook-grid">
          {main}
          <aside className="logbook-aside" aria-label="Uniforms, on duty, off duty for this command">
            <Tabbed idBase="logbook-aside" label="Uniforms, On Duty, Off Duty" tabs={asideTabs} value={asideTab} onChange={setAsideTab} className="logbook-aside-tabs">
              <p className="logbook-for quiet">{beatTitle(beat)}</p>
              {asideContent(asideTab)}
            </Tabbed>
          </aside>
          <footer className="logbook-foot">
            <section className="logbook-foot-half logbook-foot-crests" aria-label="Unit crests">
              <Kicker>Unit crests</Kicker>
              <div className="logbook-foot-scroll">
                <CrestStrip beats={beats} active={active} onOpen={onOpen} />
              </div>
            </section>
            <section className="logbook-foot-half logbook-foot-map" aria-label="Map">
              {mapRegion(false)}
            </section>
          </footer>
        </div>
      )}
    </main>
  );
}
