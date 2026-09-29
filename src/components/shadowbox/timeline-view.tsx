import { useState } from "react";
import {
  awards,
  caseCopy,
  formatSpan,
  formatWhen,
  milestones,
  necs,
  operations,
  profile,
  publicUrl,
  ranks,
  ribbonRows,
  schools,
  timeline,
  tourFocus,
  type Kind,
  type TourFocus,
} from "@/lib/shadowbox/model";
import { UniformProgression } from "@/components/shadowbox/uniform-progression";

export function Timeline({
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
  const [tour, setTour] = useState<TourFocus | null>(null);
  const pick = (kind: Kind, id: string) => {
    const next = tourFocus(kind, id);
    if (next) setTour(next);
    else onOpen(kind, id);
  };
  const dated = [
    ...schools.map((school) => ({ key: `school-${school.id}`, when: school.start ?? "", kind: "school" as Kind, id: school.id, title: school.name, note: school.length ?? "length not entered" })),
    ...milestones.map((mark) => ({ key: `milestone-${mark.id}`, when: mark.date ?? "", kind: "milestone" as Kind, id: mark.id, title: mark.title, note: "Career" })),
  ].sort((a, b) => (a.when || "9999").localeCompare(b.when || "9999"));
  return (
    <main className="sheet">
      <h2>{profile.serviceLength}, one line</h2>
      <p>{caseCopy.timelineLead}</p>
      <div className="chart-scroll">
        <div className="chart-stack">
        <Track label="Rank" items={bars.rank} onOpen={pick} />
        <Track label="Assignments" items={bars.duty} onOpen={pick} />
        <Track label="Deployments" items={bars.ops} onOpen={pick} />
        <Track label="Schools" items={bars.study} onOpen={onOpen} />
        </div>
      </div>
      <h3>Rank progression</h3>
      <ol className="rank-steps">
        {ranks.map((rank) => (
          <li key={rank.id}>
            <button type="button" className="rank-step" onClick={() => pick("rank", rank.id)}>
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
      <UniformProgression onOpen={onOpen} tour={tour} />
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
              <span className="bar-days">{barLength(item.days)}</span>
              <span className="sr-only">{item.detail}</span>
            </button>
          ))}
      </div>
    </section>
  );
}

function barLength(days: number | null): string {
  if (days == null) return "not entered";
  const months = days / 30.44;
  if (months >= 1 && months <= 18 && Math.abs(months - Math.round(months)) < 0.12) {
    const n = Math.round(months);
    return n === 1 ? "1 month" : `${n} months`;
  }
  return `${days.toLocaleString("en-US")} days`;
}
