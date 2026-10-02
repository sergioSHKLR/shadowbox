import {
  commandPlates,
  formatSpan,
  plateAwards,
  publicUrl,
  ranks,
  units,
  warfare,
  type Award,
  type Kind,
} from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

function Pin({ id, onOpen }: { id: string; onOpen: (k: Kind, id: string) => void }) {
  const pin = warfare.find((row) => row.id === id);
  if (!pin?.image) return null;
  return (
    <button type="button" className="command-pin" onClick={() => onOpen("warfare", pin.id)} aria-label={pin.name}>
      <img src={publicUrl(pin.image)} alt="" />
    </button>
  );
}

function yearOf(value: string | null | undefined): number {
  return Number((value ?? "").slice(0, 4)) || 0;
}

/** Ship name on one line, hull number on the next. */
function hullLines(label: string): string[] {
  const match = label.match(/^(.*?)\s*\(([A-Z]{2,5}-\d+)\)\s*$/);
  return match ? [match[1].trim(), match[2]] : [label];
}

/** Rating badge in incoming/. Gold chevrons from 2009. */
function patchFor(rankId: string, year: number): string | undefined {
  const gold = year >= 2009;
  if (rankId === "et3") return "/incoming/patch-e4-red.svg";
  if (rankId === "et2") return "/incoming/patch-e5-red.svg";
  if (rankId === "et1") return gold ? "/incoming/patch-e6-gold.svg" : "/incoming/patch-e6-red.svg";
  if (rankId === "etc") return "/incoming/patch-e7-gold.svg";
  return undefined;
}

function RankMark({
  id,
  side,
  year,
  onOpen,
}: {
  id: string;
  side: "in" | "out";
  year: number;
  onOpen: (k: Kind, id: string) => void;
}) {
  const rank = ranks.find((row) => row.id === id);
  if (!rank) return null;
  const src = patchFor(id, year);
  return (
    <button type="button" className="command-rank" onClick={() => onOpen("rank", rank.id)} aria-label={`${rank.abbreviation}, ${side}`}>
      {src ? <img src={publicUrl(src)} alt="" /> : <strong>{rank.abbreviation}</strong>}
      <span>{rank.abbreviation}</span>
      <em>{side}</em>
    </button>
  );
}

function LooseRibbons({ list, onOpen }: { list: Award[]; onOpen: (id: string) => void }) {
  if (!list.length) return null;
  return (
    <div className="command-loose-ribbons" aria-label="Ribbons">
      {list.map((award) => (
        <button key={award.id} type="button" className="ribbon" onClick={() => onOpen(award.id)} aria-label={award.name}>
          <RibbonArt award={award} />
        </button>
      ))}
    </div>
  );
}

export function Commands({ onOpen, title, lead }: { onOpen: (k: Kind, id: string) => void; title: string; lead: string }) {
  return (
    <main className="sheet commands">
      <h2>{title}</h2>
      <p>{lead}</p>
      <ol className="command-list">
        {commandPlates.map((plate) => {
          const unit = units.find((row) => row.id === plate.unitId);
          if (!unit) return null;
          const rack = plateAwards(plate.rack);
          const extras = plate.extras ?? [];
          const titleLines = hullLines(unit.name);
          return (
            <li key={plate.unitId} className="command-item">
              <header className="command-head">
                <h3>
                  {titleLines.length > 1
                    ? titleLines.map((line) => <span key={line}>{line}</span>)
                    : unit.abbreviation}
                </h3>
                <p>
                  {unit.start ? formatSpan(unit.start, unit.end) : ""}
                  {" · "}
                  {ranks.find((row) => row.id === plate.inRank)?.abbreviation} in
                  {" · "}
                  {ranks.find((row) => row.id === plate.outRank)?.abbreviation} out
                </p>
              </header>
              <div className="command-scroller" aria-label={`${unit.abbreviation} command row`}>
                <div className="command-plate">
                  <button type="button" className="command-crest" onClick={() => onOpen("unit", unit.id)} aria-label={unit.name}>
                    {unit.image ? <img src={publicUrl(unit.image)} alt="" /> : <strong>{unit.abbreviation}</strong>}
                  </button>
                  <RankMark id={plate.inRank} side="in" year={yearOf(unit.start)} onOpen={onOpen} />
                  <div className="command-dress">
                    {plate.pinsAbove.map((id) => <Pin key={id} id={id} onOpen={onOpen} />)}
                    <div className="command-awards">
                      <LooseRibbons list={rack} onOpen={(id) => onOpen("award", id)} />
                    </div>
                    {plate.pinsBelow.map((id) => <Pin key={id} id={id} onOpen={onOpen} />)}
                  </div>
                  <RankMark id={plate.outRank} side="out" year={yearOf(unit.end ?? unit.start)} onOpen={onOpen} />
                </div>
                {extras.map((extra) => (
                  <button
                    key={`${extra.src}-${extra.title}-${extra.unit}`}
                    type="button"
                    className="command-extra"
                    onClick={() => onOpen(extra.kind, extra.id)}
                    aria-label={`${extra.title}. ${extra.unit}. ${extra.date}`}
                  >
                    <img src={publicUrl(extra.src)} alt="" />
                    <span className="command-extra-label">
                      <strong>{extra.title}</strong>
                      {hullLines(extra.unit).map((line) => <b key={line}>{line}</b>)}
                      <em>{extra.date}</em>
                    </span>
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
