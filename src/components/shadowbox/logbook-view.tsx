import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  deploymentsForCommand,
  formatSpan,
  formatWhen,
  isMapExcludedUnit,
  logbookAdminAsOf,
  logbookBeats,
  logbookRankPath,
  mapPlaceLabel,
  offDutyForCommand,
  onDutyForCommand,
  deviceSummary,
  publicUrl,
  schools,
  ranks,
  uniformPlatesForCommand,
  wardrobeForBeat,
  unitById,
  warfare,
  type Kind,
  type LogbookBeat,
  type LogbookGearGroup,
  type Stop,
  type UniformSlide,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";
import { RibbonArt } from "@/components/shadowbox/marks";
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

/**
 * Ribbons unmounted: one wrapping row, highest precedence first (awards.json `precedence`, lower = senior, Navy order).
 * Any ribbon without a precedence value goes last, in plate order — never guessed.
 */
function unmountedRibbons(list: LogbookBeat["rack"]): LogbookBeat["rack"] {
  const ranked = list.filter((award) => Number.isFinite(award.precedence));
  const unranked = list.filter((award) => !Number.isFinite(award.precedence));
  return [...ranked.sort((a, b) => a.precedence - b.precedence), ...unranked];
}

/** Name, plus count and devices only when the plate data carries them. */
function ribbonLabel(award: LogbookBeat["rack"][number]): string {
  const bits = [award.name];
  if (award.count > 1) bits.push(`${award.count} awards`);
  if (award.devices?.length) bits.push(deviceSummary(award));
  return bits.join(" · ");
}

/** Rank & Awards as of the end of this command: rank insignia, warfare pins, ribbons (command-plates.json). Medals: later. */
function RankChip({ rank, tag, onOpen }: { rank: NonNullable<LogbookBeat["rank"]>; tag?: string; onOpen: Open }) {
  return (
    <button type="button" className="logbook-rank" onClick={() => onOpen("rank", rank.id)} aria-label={`${tag ? `${tag}: ` : ""}${rank.abbreviation}, ${rank.name}`}>
      {rank.image ? <img className="logbook-rank-patch" src={publicUrl(rank.image)} alt="" /> : null}
      {rank.collar ? <img className="logbook-rank-collar" src={publicUrl(rank.collar)} alt="" /> : null}
      <span>
        {tag ? <em className="logbook-rank-tag">{tag}</em> : null}
        <strong>{rank.abbreviation}</strong>
        <small>{[rank.grade, rank.name].filter(Boolean).join(" · ")}</small>
      </span>
    </button>
  );
}

/** Arrived → (promotion date) → … → Transferred, when the command saw a promotion; else the single rank. */
function RankPath({ beat, beats, onOpen }: { beat: LogbookBeat; beats: LogbookBeat[]; onOpen: Open }) {
  const { arrival, promotions } = logbookRankPath(beats, beat.index);
  const rank = beat.rank;
  if (!promotions.length || !arrival) {
    return rank ? <RankChip rank={rank} onOpen={onOpen} /> : <p className="quiet">No rank recorded for this command.</p>;
  }
  return (
    <ol className="logbook-rank-path" aria-label="Rank on arrival, promotions, and rank at transfer">
      <li>
        <RankChip rank={arrival} tag="Arrived" onOpen={onOpen} />
      </li>
      {promotions.map((step, i) => (
        <li key={step.id} className="logbook-rank-step">
          <span className="logbook-rank-arrow" aria-hidden="true">→</span>
          <span className="logbook-rank-when">{step.date ? formatWhen(step.date) : "Date not entered"}</span>
          <RankChip rank={step} tag={i === promotions.length - 1 ? "Transferred" : "Promoted"} onOpen={onOpen} />
        </li>
      ))}
    </ol>
  );
}

function RankAwards({ beat, beats, onOpen }: { beat: LogbookBeat; beats: LogbookBeat[]; onOpen: Open }) {
  const ribbons = unmountedRibbons(beat.rack);
  const pins = [...beat.pinsAbove, ...beat.pinsBelow];
  return (
    <div className="logbook-ra">
      <section className="logbook-ra-rank" aria-label="Rank insignia">
        <Kicker>Rank</Kicker>
        <RankPath beat={beat} beats={beats} onOpen={onOpen} />
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
      <section aria-label="Ribbons" className="logbook-ribbons-sec">
        <Kicker>Ribbons</Kicker>
        {ribbons.length ? (
          <ol className="logbook-ribbons-flat" aria-label="Ribbons, unmounted, in order of precedence">
            {ribbons.map((award) => {
              const label = ribbonLabel(award);
              return (
                <li key={award.id}>
                  <button type="button" className="logbook-ribbon-btn" onClick={() => onOpen("award", award.id)} aria-label={label} title={label}>
                    <RibbonArt award={award} />
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="quiet">No ribbons on this command plate.</p>
        )}
      </section>
    </div>
  );
}

/** "ET-0000" reads as "0000". */
function necCode(nec: { code: string }): string {
  return nec.code.replace(/^[A-Z]+-(?=\d{4}$)/, "");
}

/** "School: COMSEC · NS San Diego, San Diego, CA" from the NEC's linked school(s) and its place, when the data has them. */
function necSchoolLine(nec: { schoolIds?: string[]; placeId?: string }): string {
  const names = (nec.schoolIds ?? []).map((id) => schools.find((school) => school.id === id)?.abbreviation).filter(Boolean);
  const place = nec.placeId ? mapPlaceLabel(nec.placeId) || undefined : undefined;
  if (!names.length && !place) return "";
  return `School: ${[names.join(", "), place].filter(Boolean).join(" · ")}`;
}

/** Admin as of the end of this command: NECs held and schools (necs.json / schools.json). */
function AdminAsOf({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  const { necsHeld, schoolsThisTour } = logbookAdminAsOf(beat);
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
              <li key={nec.id} className={isNew ? "is-billet" : undefined}>
                <button
                  type="button"
                  onClick={() => onOpen("nec", nec.id)}
                  aria-label={`NEC ${necCode(nec)}, ${isNew && nec.billetLabel ? nec.billetLabel : nec.name}${isNew ? ", this tour's billet NEC" : ""}`}
                >
                  <strong>
                    NEC {necCode(nec)}
                    {isNew ? <em className="logbook-new">this tour</em> : null}
                  </strong>
                  <span>
                    {isNew && nec.billetLabel
                      ? nec.billetLabel
                      : [nec.name, nec.awarded ? formatWhen(nec.awarded) : ""].filter(Boolean).join(" · ")}
                  </span>
                  {!(isNew && nec.billetLabel) && necSchoolLine(nec) ? <small className="logbook-nec-place">{necSchoolLine(nec)}</small> : null}
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

/** equipment.json notes that say the card photo is a stock/model photo, not the owner's own vehicle. */
const SAME_MODEL = /model card|stock photograph|photograph is of the model|shows another|of another/i;

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
                  {item.image ? <img src={publicUrl(item.image)} alt="" loading="lazy" decoding="async" /> : <span className="logbook-gear-blank" aria-hidden="true" />}
                  <span>{item.name}</span>
                  {item.image && SAME_MODEL.test(item.note ?? "") ? <small className="logbook-same-model">Same model</small> : null}
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

/** Khakis are a chief's uniform: the first E-7+ rank in ranks.json (ETC, date of rank) gates them. */
const gradeNumber = (grade?: string | null) => Number((grade ?? "").replace(/\D/g, "")) || 0;
const CHIEF_RANK = ranks.find((rank) => gradeNumber(rank.grade) >= 7) ?? null;
function isChiefBeat(beat: LogbookBeat): boolean {
  return gradeNumber(beat.rank?.grade) >= 7;
}
const KHAKI_NOTE = CHIEF_RANK
  ? `Khakis from ${CHIEF_RANK.abbreviation}${CHIEF_RANK.date ? `, ${formatWhen(CHIEF_RANK.date.slice(0, 7))}` : ""}`
  : "Khakis are a chief's uniform";

/** The active command's own plate for a uniform (command-plates.json + its ready plates). Never another command's. */
function plateFor(beat: LogbookBeat, look: Look): UniformSlide | null {
  const plates = uniformPlatesForCommand(beat.stop.commandId).filter((slide) => slide.look === look);
  if (!plates.length) return null;
  const code = (file?: string) => (file ?? "").replace(/\.[^.]+$/, "").replace(/[a-z]+$/i, "");
  const own = code(beat.uniform?.file);
  return plates.find((slide) => code(slide.file) === own) ?? plates[0];
}

/** Wardrobe: every uniform used-here.json lists for this command (and its deployments), as mannequin plates. */
function WardrobePanel({ beat, onOpen }: { beat: LogbookBeat; onOpen: Open }) {
  const { items } = wardrobeForBeat(beat);
  if (!items.length) return <ComingSoon what="wardrobe" />;
  return (
    <ul className="logbook-wardrobe" aria-label={`Uniforms at ${beatTitle(beat)}`}>
      {items.map(({ uniform, via }) => (
        <li key={uniform.id}>
          <button
            type="button"
            className="logbook-wardrobe-item"
            onClick={() => onOpen("uniform", uniform.id)}
            aria-label={`${uniform.name}, ${uniform.context}${via.length ? ` (${via.join(", ")})` : ""}`}
            title={uniform.context}
          >
            {uniform.image ? (
              <img src={publicUrl(uniform.image)} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />
            ) : (
              <span className="logbook-gear-blank" aria-hidden="true" />
            )}
            <strong>{uniform.name}</strong>
            <small>{via.length ? via.join(" · ") : uniform.context}</small>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Uniforms: Whites / Blues / Khakis segmented control + the mannequin plate for the active command. */
function UniformsPanel({
  beat,
  look: chosen,
  fallback,
  onLook,
  onOpen,
}: {
  beat: LogbookBeat;
  /** The user's pick (may be Khakis even on a pre-Chief beat). */
  look: Look;
  /** Last non-Khaki pick, shown while Khakis are disabled. */
  fallback: Exclude<Look, "khaki">;
  onLook: (look: Look) => void;
  onOpen: Open;
}) {
  const chief = isChiefBeat(beat);
  const look: Look = chosen === "khaki" && !chief ? fallback : chosen;
  const plate = plateFor(beat, look);
  return (
    <div className="logbook-gear">
      <div className="logbook-seg" role="radiogroup" aria-label="Uniform">
        {LOOKS.map((row) => {
          const off = row.id === "khaki" && !chief;
          return (
            <button
              key={row.id}
              type="button"
              role="radio"
              aria-checked={look === row.id}
              aria-disabled={off || undefined}
              disabled={off}
              title={off ? `${KHAKI_NOTE} (${beatTitle(beat)}: ${beat.rank?.abbreviation ?? "before Chief"})` : undefined}
              className={["logbook-seg-btn", look === row.id ? "on" : "", off ? "is-off" : ""].filter(Boolean).join(" ")}
              onClick={off ? undefined : () => onLook(row.id)}
            >
              {row.label}
            </button>
          );
        })}
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
/** Crests for the active command only (its assigned unit plus its own deployed / assisting / parent units). Swaps fully per beat; not cumulative. */
function CrestStrip({ beat, onOpen }: { beat: LogbookBeat | undefined; onOpen: Open }) {
  // Map-excluded partners reach this list only when the plate gives them a role (crests only, never the Map).
  const list = beat?.units ?? [];
  if (!beat || !list.length) return <ComingSoon what="unit crests" />;
  return (
    <ul className="logbook-crests" key={beat.index} aria-label={`Unit crests: ${beatTitle(beat)}`}>
      {list.map((unit, i) => {
        const lead = i === 0;
        return (
          <li key={unit.id}>
            <button
              type="button"
              className={lead ? "logbook-crest on" : "logbook-crest"}
              aria-current={lead ? "true" : undefined}
              onClick={unit.plateOnly ? undefined : () => onOpen("unit", unit.id)}
              data-static={unit.plateOnly ? "" : undefined}
              aria-label={`${unit.name}${unit.designator ? ` (${unit.designator})` : ""}`}
              title={unit.name}
            >
              {unit.image ? <img src={publicUrl(unit.image)} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} /> : null}
              <b>{unit.abbreviation}</b>
              {unit.designator ? <em>{unit.designator}</em> : null}
            </button>
          </li>
        );
      })}
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

type AsideTab = "uniforms" | "wardrobe" | "onduty" | "offduty";
type PhoneTab = AsideTab | "crests" | "map";

export function Logbook({
  onOpen,
  title,
  lead,
  wardrobeLabel = "Wardrobe",
}: {
  onOpen: (k: Kind, id: string) => void;
  title: string;
  lead: string;
  wardrobeLabel?: string;
}) {
  const beats = useMemo(() => logbookBeats(), []);
  const stops = useMemo(() => beats.map((row) => row.stop), [beats]);
  const narrow = useNarrow();
  const [active, setActive] = useState(0);
  const [mainTab, setMainTab] = useState<MainTab>("rank");
  const [asideTab, setAsideTab] = useState<AsideTab>("uniforms");
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("uniforms");
  /** Uniform chosen in the Uniforms tab; kept as the beat changes. */
  const [look, setLookState] = useState<Look>("blue");
  /** Last non-Khaki pick: what a pre-Chief beat shows while Khakis stay chosen. */
  const [lookFallback, setLookFallback] = useState<Exclude<Look, "khaki">>("blue");
  const setLook = useCallback((next: Look) => {
    setLookState(next);
    if (next !== "khaki") setLookFallback(next);
  }, []);
  const rootRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
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

  /** Prev / next (and arrow keys) step the active command; it drives every panel. No scroll sync. */
  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(beats.length - 1, index));
      if (next === activeRef.current) return;
      activeRef.current = next;
      setActive(next);
    },
    [beats.length],
  );
  const stepperRef = useRef<HTMLDivElement>(null);
  const step = useCallback(
    (delta: number) => {
      goTo(activeRef.current + delta);
      // At an end the pressed button disables; hand focus to the other one so keys keep working.
      const edge = activeRef.current === 0 || activeRef.current === beats.length - 1;
      if (edge) window.requestAnimationFrame(() => stepperRef.current?.querySelector<HTMLButtonElement>(".logbook-step-btn:not(:disabled)")?.focus());
    },
    [goTo, beats.length],
  );

  // A new command starts at the top of its card.
  useEffect(() => {
    cardRef.current?.scrollTo({ top: 0 });
  }, [active, mainTab]);

  const onMainKey = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('[role="tablist"], input, textarea, select')) return;
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };
    let next: number | null = null;
    if (event.key in keys) next = activeRef.current + keys[event.key];
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = beats.length - 1;
    if (next == null) return;
    event.preventDefault();
    goTo(next);
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
    { id: "wardrobe", label: wardrobeLabel },
    { id: "onduty", label: "On Duty" },
    { id: "offduty", label: "Off Duty" },
  ];
  const asideContent = (name: AsideTab) =>
    name === "uniforms" ? (
      <UniformsPanel beat={beat} look={look} fallback={lookFallback} onLook={setLook} onOpen={onOpen} />
    ) : name === "wardrobe" ? (
      <WardrobePanel beat={beat} onOpen={onOpen} />
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

  const unit = beat.stop.commandId ? unitById(beat.stop.commandId) : undefined;
  const atStart = beat.index <= 0;
  const atEnd = beat.index >= beats.length - 1;
  const main = (
    <section className="logbook-main" aria-label="Commands" onKeyDown={onMainKey}>
      <div className="logbook-stepper" ref={stepperRef} role="group" aria-label="Step through the commands">
        <button
          type="button"
          className="logbook-step-btn"
          aria-label="Previous command"
          title={atStart ? "First command" : `Previous: ${beatTitle(beats[beat.index - 1])}`}
          onClick={() => step(-1)}
          disabled={atStart}
        >
          <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className="logbook-step-label" aria-live="polite" aria-atomic="true">
          <strong>
            Command {beat.index + 1} of {beats.length}
          </strong>
          <span className="quiet">
            {beatTitle(beat)}
            {beat.when ? ` · ${beat.when.length === 4 ? beat.when : formatWhen(beat.when)}` : ""}
          </span>
        </p>
        <button
          type="button"
          className="logbook-step-btn"
          aria-label="Next command"
          title={atEnd ? "Last command" : `Next: ${beatTitle(beats[beat.index + 1])}`}
          onClick={() => step(1)}
          disabled={atEnd}
        >
          <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      <Tabbed
        idBase="logbook-main"
        label="Rank and awards, or admin, for this command"
        tabs={[
          { id: "rank", label: "Rank & Awards" },
          { id: "admin", label: "Admin" },
        ]}
        value={mainTab}
        onChange={setMainTab}
        className="logbook-main-tabs"
        panelFocusable={false}
      >
        <div className="logbook-beats">
          <article
            ref={cardRef}
            tabIndex={0}
            aria-label={`${beatTitle(beat)}. Arrow keys step between commands.`}
            id={`logbook-beat-${beat.stop.n}`}
            data-beat={beat.index}
            className="logbook-beat is-active"
            aria-current="step"
          >
            <header className="logbook-beat-head">
              <span className={`pin-num ${beat.stop.kind} ${beat.stop.place.accuracy}`} aria-hidden="true">
                {beat.stop.n}
              </span>
              <div>
                <h3 title={unit?.name}>{beatTitle(beat)}</h3>
                <p className="quiet">{beat.lines[1] ?? "Command"}</p>
              </div>
            </header>
            <div className="logbook-beat-body">
              {mainTab === "rank" ? <RankAwards beat={beat} beats={beats} onOpen={onOpen} /> : <AdminAsOf beat={beat} onOpen={onOpen} />}
            </div>
          </article>
        </div>
      </Tabbed>
    </section>
  );

  return (
    <main className={`sheet logbook${narrow ? " is-narrow" : ""}`} ref={rootRef}>
      <header className="logbook-head">
        <h2>{title}</h2>
        <p className="logbook-lead">{lead}</p>
      </header>

      {narrow ? (
        <div className="logbook-phone">
          {main}
          <Tabbed
            idBase="logbook-phone"
            label="Uniforms, wardrobe, duty, crests and map"
            tabs={[...asideTabs, { id: "crests", label: "Crests" }, { id: "map", label: "Map" }]}
            value={phoneTab}
            onChange={setPhoneTab}
            className="logbook-phone-tabs"
          >
            {phoneTab === "uniforms" || phoneTab === "wardrobe" || phoneTab === "onduty" || phoneTab === "offduty" ? asideContent(phoneTab) : null}
            {phoneTab === "crests" ? <CrestStrip beat={beats[active]} onOpen={onOpen} /> : null}
            {mapRegion(phoneTab !== "map")}
          </Tabbed>
        </div>
      ) : (
        <div className="logbook-grid">
          {main}
          <aside className="logbook-aside" aria-label="Uniforms, wardrobe, on duty, off duty for this command">
            <Tabbed idBase="logbook-aside" label="Uniforms, Wardrobe, On Duty, Off Duty" tabs={asideTabs} value={asideTab} onChange={setAsideTab} className="logbook-aside-tabs">
              <p className="logbook-for quiet">{beatTitle(beat)}</p>
              {asideContent(asideTab)}
            </Tabbed>
          </aside>
          <footer className="logbook-foot">
            <section className="logbook-foot-half logbook-foot-crests" aria-label="Unit crests">
              <Kicker>Unit crests</Kicker>
              <div className="logbook-foot-scroll">
                <CrestStrip beat={beats[active]} onOpen={onOpen} />
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
