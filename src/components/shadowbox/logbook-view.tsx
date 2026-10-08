import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  careerStops,
  deploymentsForCommand,
  gearCard,
  formatSpan,
  formatWhen,
  isMapExcludedUnit,
  logbookAdminAsOf,
  commandDutiesFor,
  commandProfileFor,
  displayEquipmentName,
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
  plateGroup,
  logbookPlateSets,
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
import { EnlargeButton, EnlargeDialog, PlateViewer } from "@/components/shadowbox/enlarge";
import type { Chrome } from "@/lib/shadowbox/copy";

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

/** Metal collar device beside the rating badge on rank cards: off (Sergio, Oct 2026), rating badge only. Flip to bring it back. */
const RANK_COLLAR_ON_CARDS = false;

/** Rank & Awards as of the end of this command: rank insignia, warfare pins, ribbons (command-plates.json). Medals: later. */
function RankChip({ rank, tag, onOpen }: { rank: NonNullable<LogbookBeat["rank"]>; tag?: string; onOpen: Open }) {
  return (
    <button type="button" className="logbook-rank" onClick={() => onOpen("rank", rank.id)} aria-label={`${tag ? `${tag}: ` : ""}${rank.abbreviation}, ${rank.name}`}>
      {rank.image ? <img className="logbook-rank-patch" src={publicUrl(rank.image)} alt="" /> : null}
      {RANK_COLLAR_ON_CARDS && rank.collar ? <img className="logbook-rank-collar" src={publicUrl(rank.collar)} alt="" /> : null}
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

function RankAwards({ beat, beats, onOpen, t }: { beat: LogbookBeat; beats: LogbookBeat[]; onOpen: Open; t: Chrome }) {
  const ribbons = unmountedRibbons(beat.rack);
  const pins = [...beat.pinsAbove, ...beat.pinsBelow];
  return (
    <div className="logbook-ra">
      <section className="logbook-ra-rank" aria-label="Rank insignia">
        <Kicker>Rank</Kicker>
        <RankPath beat={beat} beats={beats} onOpen={onOpen} />
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
          <p className="quiet">{t.noRibbons}</p>
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
function AdminAsOf({ beat, onOpen, t }: { beat: LogbookBeat; onOpen: Open; t: Chrome }) {
  const { necsHeld, schoolsThisTour } = logbookAdminAsOf(beat);
  const duties = commandDutiesFor(beat.stop.commandId);
  const dutyRows = [
    { id: "title", label: "Title", items: duties.titles },
    { id: "department", label: "Dept", items: duties.departments },
    { id: "division", label: "Division", items: duties.divisions },
    { id: "collateral", label: "Collateral Duty", items: duties.collateralDuties },
    { id: "watch", label: "Watch", items: duties.watches },
  ].filter((row) => row.items.length);
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
      <section aria-label={`NECs ${t.thisTour}`}>
        <Kicker>NECs</Kicker>
        {necsHeld.length ? (
          <ul className="logbook-admin-list logbook-nec-grid">
            {necsHeld.map(({ nec, isNew, gained }) => (
              <li key={nec.id} className={isNew ? "is-billet" : undefined}>
                <button
                  type="button"
                  onClick={() => onOpen("nec", nec.id)}
                  title={[
                    `NEC ${necCode(nec)}`,
                    isNew && nec.billetLabel ? nec.billetLabel : nec.name,
                    !(isNew && nec.billetLabel) && nec.awarded ? formatWhen(nec.awarded) : "",
                    !(isNew && nec.billetLabel) ? necSchoolLine(nec) ?? "" : "",
                  ].filter(Boolean).join("\n")}
                  aria-label={`NEC ${necCode(nec)}, ${isNew && nec.billetLabel ? nec.billetLabel : nec.name}${isNew ? ", this tour's billet NEC" : ""}${gained ? ", gained this tour" : ""}`}
                >
                  <strong>
                    NEC {necCode(nec)}
                    {isNew ? <em className="logbook-new">{t.thisTour}</em> : null}
                    {gained ? <em className="logbook-gained">{t.gained}</em> : null}
                  </strong>
                  <span className="logbook-nec-name">{isNew && nec.billetLabel ? (nec.billetLabel === "No NEC billet" ? t.noNecBillet : nec.billetLabel) : nec.name}</span>
                  {!(isNew && nec.billetLabel) && nec.awarded ? <span className="logbook-nec-date">{formatWhen(nec.awarded)}</span> : null}
                  {!(isNew && nec.billetLabel) && necSchoolLine(nec) ? <small className="logbook-nec-place">{necSchoolLine(nec)}</small> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="quiet">{t.noNec}</p>
        )}
      </section>
      <section aria-label={t.schoolsThisTour}>
        <Kicker>{t.schoolsThisTour}</Kicker>
        {schoolsThisTour.length ? <ul className="logbook-admin-list">{schoolsThisTour.map(schoolBtn)}</ul> : <p className="quiet">{t.noSchools}</p>}
      </section>
      {dutyRows.length ? (
        <section aria-label="Duties this tour">
          <Kicker>Duties</Kicker>
          <dl className="logbook-duties">
            {dutyRows.map((row) => (
              <div key={row.id} className="logbook-duty-row">
                <dt>{row.label}</dt>
                <dd>
                  {row.items.map((item) => (
                    <span key={item.label} className="logbook-duty">
                      {item.label}
                      {item.abbreviation ? <span className="quiet"> ({item.abbreviation})</span> : null}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

/** Full place sequence (sequence.json), the same pins and numbers as the main Map with every category on. */
const CAREER_STOPS: Stop[] = careerStops();

/**
 * Which Logbook command each sequence row belongs to (Oct 2026, from Sergio's marked RTC / NTC / NCTS screenshots).
 * The first version sliced the sequence between command rows, which pulled each command's lead-in rows (the city, port or
 * base listed just before the command row: NAB Little Creek before USS Tortuga, San Diego before NCTS, Hagåtña and
 * Polaris Point before USS Frank Cable) into the previous command, and the early duplicate NTC row into RTC.
 * Now:
 *  1. a row naming a Logbook command belongs to it;
 *  2. rows just before a command row, at (or within ~80 km of) that command's pin, are its lead-in;
 *  3. anything else belongs to the latest command before it (the first command also takes rows before it: Miami);
 *  4. Keesler AFB / Biloxi (the 1999 Instruction stop between NTC and NCTS) shows on the NCTS map: NCTS paid for that
 *     training (Sergio, Oct 2026). Category stays Instruction; dates unchanged;
 *  5. NTC also shows the USS Tortuga TAD pins (Little Creek, VA), as Sergio marked on the NTC map.
 */
/** Rows owned by a command regardless of position (place id → Logbook command id). */
const PLACE_OWNER: Record<string, string> = { keesler: "ncts", "city-biloxi": "ncts" };
const ALSO_SHOW: Record<string, string[]> = { "ntc-great-lakes": ["tortuga"] };

function km(a: Stop, b: Stop): number {
  const { lat: la1, lng: lo1 } = a.place;
  const { lat: la2, lng: lo2 } = b.place;
  if (la1 == null || lo1 == null || la2 == null || lo2 == null) return Infinity;
  const rad = Math.PI / 180;
  const dLat = (la2 - la1) * rad;
  const dLng = (lo2 - lo1) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function stopBeatOwners(beats: LogbookBeat[]): (string | null)[] {
  const ids = new Set(beats.map((beat) => beat.stop.commandId).filter((id): id is string => !!id));
  const owner: (string | null)[] = CAREER_STOPS.map((stop) => (stop.commandId && ids.has(stop.commandId) ? stop.commandId : null));
  // Lead-ins: walk back from each command row while the rows have no command of their own and sit at that command's pin.
  CAREER_STOPS.forEach((stop, i) => {
    if (!stop.commandId || !ids.has(stop.commandId)) return;
    for (let j = i - 1; j >= 0; j--) {
      if (owner[j] || PLACE_OWNER[CAREER_STOPS[j].place.id]) break;
      if (km(CAREER_STOPS[j], stop) > 80) break;
      owner[j] = stop.commandId;
    }
  });
  let last: string | null = null;
  const first = CAREER_STOPS.find((stop) => stop.commandId && ids.has(stop.commandId))?.commandId ?? null;
  CAREER_STOPS.forEach((stop, i) => {
    const fixed = PLACE_OWNER[stop.place.id];
    if (fixed) {
      owner[i] = ids.has(fixed) ? fixed : null;
      return;
    }
    if (owner[i]) {
      // A row that only repeats an earlier command (the early NTC row) does not move "latest command" backwards in time.
      last = owner[i];
      return;
    }
    owner[i] = last ?? first;
  });
  return owner;
}

function MapInset({
  beats,
  beat,
  onOpen,
}: {
  beats: LogbookBeat[];
  beat: LogbookBeat;
  onOpen: (k: Kind, id: string) => void;
}) {
  // Excluded customer units never become map pins here (their places are not added as extras).
  void isMapExcludedUnit;
  // Each command's mini map shows the sequence rows that belong to it (see stopBeatOwners) and fits to them.
  // Markers stay built for the whole sequence; only `hidden` changes per beat.
  const owners = useMemo(() => stopBeatOwners(beats), [beats]);
  const id = beat.stop.commandId;
  const hiddenStops = useMemo(() => {
    if (!id) return [];
    const show = new Set([id, ...(ALSO_SHOW[id] ?? [])]);
    return CAREER_STOPS.flatMap((stop, i) => (owners[i] && show.has(owners[i] as string) && !(id === "ncts" && stop.n === 2) ? [] : [i]));
  }, [owners, id]);
  const [big, setBig] = useState(false);
  const bigButton = useRef<HTMLButtonElement>(null);
  return (
    <div className="logbook-map-frame">
      <Boundary label="logbook map" fallback={<p className="quiet">Map unavailable right now.</p>}>
      <MapView
        stops={CAREER_STOPS}
        extra={[]}
        tall={false}
        fitMaxZoom={9}
        hidden={hiddenStops}
        onSelect={(id) => onOpen("place", id)}
      />
      </Boundary>
      <EnlargeButton ref={bigButton} open={big} label={`Enlarge map: ${beat.stop.labels[0]}`} onClick={() => setBig(true)} />
      <EnlargeDialog open={big} onOpenChange={setBig} title={beat.stop.labels[0]} subtitle="Map" className="enlarge-map" returnFocus={bigButton}>
        {big ? (
          <Boundary label="logbook map (large)" fallback={<p className="quiet">Map unavailable right now.</p>}>
            {/* Same stops and hidden set as the inset, so the command's pins stay fitted at the larger size. */}
            <MapView
              stops={CAREER_STOPS}
              extra={[]}
              tall={false}
              fitMaxZoom={9}
              hidden={hiddenStops}
              onSelect={(id) => {
                setBig(false);
                onOpen("place", id);
              }}
            />
          </Boundary>
        ) : null}
      </EnlargeDialog>
    </div>
  );
}

function ComingSoon({ what, message }: { what: string; message?: string }) {
  return (
    <div className="logbook-soon">
      <strong>Coming soon</strong>
      <span className="quiet">{message ?? `No ${what} recorded for this command yet.`}</span>
    </div>
  );
}


/** Off Duty vehicles show Make + Model + color; year stays in equipment.json ("Nissan Sentra, red, 1991" → "Nissan Sentra, red"). */
const gearLabel = displayEquipmentName;

function GearPanel({ groups, what, onOpen, empty }: { groups: LogbookGearGroup[]; what: string; onOpen: Open; empty?: string }) {
  if (!groups.length) return <ComingSoon what={what} message={empty} />;
  return (
    <div className="logbook-gear">
      {groups.map((group) => (
        <section key={group.id} aria-label={group.label}>
          <p className="logbook-kicker">{group.label}</p>
          <ul className="logbook-gear-list">
            {group.items.map((item) => (
              <li key={item.id}>
                <button type="button" className="logbook-gear-item" onClick={() => onOpen("equipment", item.id)} aria-label={gearLabel(item)} title={gearLabel(item)}>
                  {item.image ? <img src={publicUrl(item.image)} alt="" loading="lazy" decoding="async" /> : <span className="logbook-gear-blank" aria-hidden="true" />}
                  <span>{gearLabel(item)}</span>
                </button>
              </li>
            )); })()}
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
  const own = plateGroup(beat.uniform?.file);
  return plates.find((slide) => plateGroup(slide.file) === own) ?? plates[0];
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
            title={[uniform.name, via.length ? via.join(" · ") : uniform.context].filter(Boolean).join(" — ")}
          >
            {uniform.image ? (
              <img src={publicUrl(uniform.image)} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />
            ) : (
              <span className="logbook-gear-blank" aria-hidden="true" />
            )}
            <strong>{uniform.name}</strong>
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
  const radioName = `logbook-look-${useId()}`;
  const chief = isChiefBeat(beat);
  const look: Look = chosen === "khaki" && !chief ? fallback : chosen;
  const commandId = beat.stop.commandId;
  // Every plate the command has, set by set (oldest first), whites → blues → khakis within a set (Sergio, Oct 2026:
  // JCSE lists ET1 whites, blues, then CPO whites, blues, khakis). The radios and the enlarge viewer share this order.
  const options = useMemo(() => {
    const plates = uniformPlatesForCommand(commandId);
    return logbookPlateSets(commandId).flatMap((group) =>
      LOOKS.flatMap((row) => {
        const slide = plates.find((item) => plateGroup(item.file) === group && item.look === row.id);
        return slide ? [{ group, look: row.id, label: row.label, plate: slide }] : [];
      }),
    );
  }, [commandId]);
  const groups = useMemo(() => [...new Set(options.map((option) => option.group))], [options]);
  const multi = groups.length > 1;
  const [pickedGroup, setPickedGroup] = useState<string | null>(null);
  useEffect(() => setPickedGroup(null), [commandId]);
  const group = pickedGroup ?? plateGroup(beat.uniform?.file);
  const plate = multi
    ? (options.find((option) => option.group === group && option.look === look)?.plate ?? plateFor(beat, look))
    : plateFor(beat, look);
  const shownGroup = plate ? plateGroup(plate.file) : null;
  const allPlates = useMemo(
    () => options.filter((option) => option.look !== "khaki" || chief).map((option) => option.plate),
    [options, chief],
  );
  const [bigIndex, setBigIndex] = useState<number | null>(null);
  const bigButton = useRef<HTMLButtonElement>(null);
  const openBig = () => {
    const at = plate ? allPlates.findIndex((slide) => slide.file === plate.file) : 0;
    setBigIndex(Math.max(0, at));
  };
  const lookRadio = (row: { id: Look; label: string }, setId: string | null, head?: string) => {
    const off = row.id === "khaki" && !chief;
    const checked = setId == null ? look === row.id : plate?.file != null && shownGroup === setId && plate.look === row.id;
    return (
      <label key={`${setId ?? ""}-${row.id}`} className={off ? "logbook-look is-off" : "logbook-look"} title={off ? `${KHAKI_NOTE} (${beatTitle(beat)}: ${beat.rank?.abbreviation ?? "before Chief"})` : undefined}>
        <input
          type="radio"
          name={radioName}
          value={setId ? `${setId}-${row.id}` : row.id}
          checked={checked}
          disabled={off}
          onChange={() => { if (setId) setPickedGroup(setId); onLook(row.id); }}
        />
        <span>{head ? <span className="sr-only">{head} </span> : null}{row.label}</span>
      </label>
    );
  };
  return (
    <div className="logbook-gear logbook-plates">
      {/* Native radios stacked beside the plate (Sergio, Oct 2026), so the plate gets the full panel height. */}
      <fieldset className="logbook-looks">
        <legend className="sr-only">Uniform</legend>
        {multi
          ? groups.map((setId) => {
              const rows = options.filter((option) => option.group === setId);
              const head = rows[0]?.plate.caption.split(" · ")[0] ?? setId;
              return (
                <div key={setId} className="logbook-look-set" role="group" aria-label={head}>
                  <span className="logbook-look-head" aria-hidden="true">{head}</span>
                  {rows.map((option) => lookRadio({ id: option.look, label: option.label }, setId, head))}
                </div>
              );
            })
          : LOOKS.map((row) => lookRadio(row, null))}
      </fieldset>
      {plate ? (
        <figure className="logbook-mannequin">
          {/* Tapping the plate enlarges it (Sergio, Oct 2026); the rank cards still open the rank. */}
          <button type="button" className="logbook-plate-art" onClick={openBig} aria-label={`Enlarge plate: ${plate.caption}`} aria-haspopup="dialog">
            <img key={plate.file} src={publicUrl(plate.src)} alt="" />
          </button>
          <EnlargeButton ref={bigButton} open={bigIndex != null} label={`Enlarge plate: ${plate.caption}`} onClick={openBig} />
          <EnlargeDialog
            open={bigIndex != null}
            onOpenChange={(next) => { if (!next) setBigIndex(null); }}
            title={beatTitle(beat)}
            subtitle="Uniform plates"
            className="enlarge-plate"
            returnFocus={bigButton}
          >
            {bigIndex != null ? (
              <PlateViewer
                plates={allPlates.map((slide) => ({ src: publicUrl(slide.src), caption: slide.caption, file: slide.file }))}
                index={bigIndex}
                onIndex={setBigIndex}
              />
            ) : null}
          </EnlargeDialog>
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
function OnDutyPanel({ beat, onOpen, empty }: { beat: LogbookBeat; onOpen: Open; empty?: string }) {
  const deployments = deploymentsForCommand(beat.stop.commandId);
  const groups = onDutyForCommand(beat.stop.commandId).filter((group) => group.id !== "armor" && group.id !== "helmets");
  if (!deployments.length && !groups.length) return <ComingSoon what="duty gear" message={empty} />;
  return (
    <div className="logbook-gear">
      {deployments.length ? (
        <section aria-label="Deployments">
          <Kicker>Deployments</Kicker>
          <ul className="logbook-deploys">
            {(() => { const seen = new Set<string>(); return deployments.map((dep) => (
              <li key={dep.unitId} className="logbook-deploy">
                <button type="button" className="logbook-link" onClick={() => onOpen("unit", dep.unitId)}>
                  <strong>{dep.label}</strong> · {dep.unitAbbreviation}
                </button>
                <span className="quiet">{[dep.theater, dep.span].filter(Boolean).join(" · ")}</span>
                {dep.pattern || dep.attachedTo.length || dep.note ? (
                  <span className="quiet logbook-deploy-meta">
                    {[dep.note, dep.attachedTo.length ? `attached to ${dep.attachedTo.join(" and ")}` : null].filter(Boolean).join(", ")}
                    {dep.pattern ? <>{dep.note || dep.attachedTo.length ? " · " : null}Pattern: <b>{dep.pattern}</b></> : null}
                  </span>
                ) : null}
                {(() => {
                  // Same vest or helmet on a later tour of this command is not shown again.
                  const cards = [gearCard(dep.bodyArmor), gearCard(dep.helmet)].filter((card): card is NonNullable<typeof card> => Boolean(card) && !seen.has(card.id));
                  cards.forEach((card) => seen.add(card.id));
                  return cards.length ? (
                    <ul className="logbook-gear-list logbook-deploy-gear" aria-label={`Gear recorded for ${dep.label}`}>
                      {cards.map((card) => (
                        <li key={card.id}>
                          <button type="button" className="logbook-gear-item" onClick={() => onOpen("equipment", card.id)} aria-label={`${card.name}${dep.pattern ? `, ${dep.pattern}` : ""}`} title={`${card.name}${dep.pattern ? ` (${dep.pattern})` : ""}`}>
                            {card.image ? <img src={publicUrl(card.image)} alt="" loading="lazy" decoding="async" /> : <span className="logbook-gear-blank" aria-hidden="true" />}
                            <span>{card.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="quiet">Body armor and helmet not recorded</span>;
                })()}
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
function CrestStrip({ beat, onOpen, t }: { beat: LogbookBeat | undefined; onOpen: Open; t: Chrome }) {
  // Map-excluded partners reach this list only when the plate gives them a role (crests only, never the Map).
  // The command's own crest sits in the command card; the footer lists only the other units (TAD, deployed, host, partner, customer).
  const list = (beat?.units ?? []).filter((unit) => unit.id !== beat?.stop.commandId);
  if (!beat) return <ComingSoon what="unit crests" />;
  if (!list.length) return <p className="logbook-crests-none quiet">{t.noOtherUnits}</p>;
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
  // Ships read by name; the hull number stays on the card title ("USS Frank Cable (AS-40)").
  const ship = /^(USS .+?)\s*\(/.exec(row.lines[0] ?? "");
  if (ship) return ship[1];
  if (row.stop.commandId === "navhosp") return row.stop.place.name.split(",")[0];
  return row.lines[0];
}

type AsideTab = "uniforms" | "wardrobe" | "onduty" | "offduty";
type PhoneTab = AsideTab | "crests" | "map";

export function Logbook({
  onOpen,
  title,
  platesLabel = "Decorations",
  wardrobeLabel = "Uniforms",
  t,
}: {
  onOpen: (k: Kind, id: string) => void;
  title: string;
  /** Intro copy; not shown on the Logbook for now (Sergio). */
  lead?: string;
  /** Tab label for the plate panel (Whites / Blues / Khakis plates). Renamed "Uniforms" → "Decorations" (Sergio, Oct 2026). */
  platesLabel?: string;
  /** Tab label for the mannequin panel. Renamed "Wardrobe" → "Uniforms" (Sergio, Oct 2026). Internal ids stay uniforms / wardrobe. */
  wardrobeLabel?: string;
  t: Chrome;
}) {
  const beats = useMemo(() => logbookBeats(), []);
  const narrow = useNarrow();
  const [active, setActive] = useState(0);
  const [mainTab, setMainTab] = useState<MainTab>("rank");
  const [asideTab, setAsideTab] = useState<AsideTab>("uniforms");
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("crests");
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
  const stepperRef = useRef<HTMLElement>(null);
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
    { id: "uniforms", label: platesLabel },
    { id: "wardrobe", label: wardrobeLabel },
    { id: "onduty", label: t.onduty },
    { id: "offduty", label: t.offduty },
  ];
  const asideContent = (name: AsideTab) =>
    name === "uniforms" ? (
      <UniformsPanel beat={beat} look={look} fallback={lookFallback} onLook={setLook} onOpen={onOpen} />
    ) : name === "wardrobe" ? (
      <WardrobePanel beat={beat} onOpen={onOpen} />
    ) : name === "onduty" ? (
      <OnDutyPanel beat={beat} onOpen={onOpen} empty={t.noDutyGear} />
    ) : (
      <GearPanel groups={offDutyForCommand(beat.stop.commandId)} what="off-duty life" onOpen={onOpen} empty={t.noDutyGear} />
    );
  const mapRegion = (hidden: boolean) => (
    <div className="logbook-map-tab" hidden={hidden} role="group" aria-label={`Map: ${mapBeat.stop.labels[0]}`}>
      <MapInset beats={beats} beat={mapBeat} onOpen={onOpen} />
    </div>
  );

  const unit = beat.stop.commandId ? unitById(beat.stop.commandId) : undefined;
  const profile = commandProfileFor(beat.stop.commandId);
  const atStart = beat.index <= 0;
  const atEnd = beat.index >= beats.length - 1;
  const main = (
    <section className="logbook-main" aria-label="Commands" onKeyDown={onMainKey}>
      <Tabbed
        idBase="logbook-main"
        label="Rank and awards, or admin, for this command"
        tabs={[
          { id: "rank", label: t.rankAwards },
          { id: "admin", label: t.admin },
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
            {/* One bordered header block (Sergio, Oct 2026): ‹ crest, name, place/dates › and the About row; grows with About. */}
            <div className="logbook-head-box">
            {/* Prev / next live in the card's title row: "‹ NH Jacksonville ›". */}
            <header className="logbook-beat-head logbook-stepper" ref={stepperRef} role="group" aria-label="Step through the commands">
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
              {unit?.image ? (
                <button type="button" className="logbook-own-crest" onClick={() => onOpen("unit", unit.id)} aria-label={`${unit.name} (unit details)`} title={unit.name}>
                  <img src={publicUrl(unit.image)} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
                </button>
              ) : null}
              <div className="logbook-beat-title">
                <h3 title={profile?.officialName ?? unit?.name}>{profile?.officialName ?? (unit?.name.startsWith("USS ") ? unit.name : beatTitle(beat))}</h3>
                <p className="quiet">{beat.lines[1] ?? "Command"}</p>
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                  {t.commandOf} {beat.index + 1} {t.ofWord} {beats.length}: {beatTitle(beat)}
                </p>
              </div>
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
            </header>
            {profile ? (
              <details className="logbook-about" key={beat.index}>
                <summary>About</summary>
                <p>{profile.purpose}</p>
                {profile.history ? <p>{profile.history}</p> : null}
                <p className="logbook-about-src quiet">
                  {profile.sources.length > 1 ? "Sources: " : "Source: "}
                  {profile.sources.map((src, i) => (
                    <span key={src.url}>
                      {i ? "; " : ""}
                      <a href={src.url} target="_blank" rel="noreferrer">{src.label}</a>
                    </span>
                  ))}
                </p>
              </details>
            ) : null}
            </div>
            <div className="logbook-beat-body">
              {mainTab === "rank" ? <RankAwards beat={beat} beats={beats} onOpen={onOpen} t={t} /> : <AdminAsOf beat={beat} onOpen={onOpen} t={t} />}
            </div>
          </article>
        </div>
      </Tabbed>
    </section>
  );

  return (
    <main className={`sheet logbook${narrow ? " is-narrow" : ""}`} ref={rootRef}>
      {/* Sergio: no visible page title or intro on the Logbook; the heading stays for screen readers. The lead copy stays in copy.ts. */}
      <h1 className="sr-only">{title}</h1>

      {narrow ? (
        <div className="logbook-phone">
          {main}
          <Tabbed
            idBase="logbook-phone"
            label={`${t.crests}, ${platesLabel}, ${wardrobeLabel}, ${t.onduty}, ${t.offduty}, ${t.mapShort}`}
            tabs={[{ id: "crests", label: t.crests }, ...asideTabs, { id: "map", label: t.mapShort }]}
            value={phoneTab}
            onChange={setPhoneTab}
            className="logbook-phone-tabs"
          >
            {phoneTab === "uniforms" || phoneTab === "wardrobe" || phoneTab === "onduty" || phoneTab === "offduty" ? asideContent(phoneTab) : null}
            {phoneTab === "crests" ? <CrestStrip beat={beats[active]} onOpen={onOpen} t={t} /> : null}
            {mapRegion(phoneTab !== "map")}
          </Tabbed>
        </div>
      ) : (
        <div className="logbook-grid">
          {main}
          <aside className="logbook-aside" aria-label={`${platesLabel}, ${wardrobeLabel}, ${t.onduty}, ${t.offduty}`}>
            <Tabbed idBase="logbook-aside" label={`${platesLabel}, ${wardrobeLabel}, ${t.onduty}, ${t.offduty}`} tabs={asideTabs} value={asideTab} onChange={setAsideTab} className="logbook-aside-tabs">
              {asideContent(asideTab)}
            </Tabbed>
          </aside>
          <footer className="logbook-foot">
            <section className="logbook-foot-half logbook-foot-crests" aria-label={t.unitCrests}>
              <Kicker>{t.unitCrests}</Kicker>
              <div className="logbook-foot-scroll">
                <CrestStrip beat={beats[active]} onOpen={onOpen} t={t} />
              </div>
            </section>
            <section className="logbook-foot-half logbook-foot-map" aria-label={t.mapShort}>
              {mapRegion(false)}
            </section>
          </footer>
        </div>
      )}
    </main>
  );
}
