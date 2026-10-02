import { useEffect, useRef, useState, type ReactNode } from "react";
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
  type Kind,
} from "@/lib/shadowbox/model";

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
  const dated = [
    ...schools.map((school) => ({ key: `school-${school.id}`, when: school.start ?? "", kind: "school" as Kind, id: school.id, title: school.name, note: school.length ?? "length not entered" })),
    ...milestones.map((mark) => ({ key: `milestone-${mark.id}`, when: mark.date ?? "", kind: "milestone" as Kind, id: mark.id, title: mark.title, note: "Career" })),
  ].sort((a, b) => (a.when || "9999").localeCompare(b.when || "9999"));
  return (
    <main className="sheet">
      <header className="person">
        <img src={publicUrl("/photos/recruit-1997.webp")} alt="Recruit Sergio Schickler in dress blue jumper and white hat, 1997" />
        <div className="person-copy">
          <p className="kicker">{profile.branchName}</p>
          <h2>{profile.headerLines[0]}</h2>
          <p>{profile.headerLines[1]}</p>
          <p>{profile.headerLines[2]}</p>
          <p className="quiet">{profile.serviceLength}. Sea service {profile.seaService}. Overseas sea service {profile.foreignService}.</p>
        </div>
        <img src={publicUrl(profile.portrait)} alt="Chief Petty Officer Sergio Schickler in service dress blue, 2018" />
      </header>
      <h3>{profile.serviceLength}, one line</h3>
      <p>{caseCopy.timelineLead}</p>
      <ChartScroll>
        <div className="chart-stack">
        <Track label="Rank" items={bars.rank} onOpen={onOpen} />
        <Track label="Assignments" items={bars.duty} onOpen={onOpen} />
        <Track label="Deployments" items={bars.ops} onOpen={onOpen} />
        <Track label="Schools" items={bars.study} onOpen={onOpen} />
        <Track label="Events" items={bars.world} />
        </div>
      </ChartScroll>
      <p className="quiet">Events are public history during this enlistment — presidents, attacks, and the wars. They are not part of the service record. A rank, assignment, or deployment opens its sidebar and stays on this page.</p>
      <h3>Rank progression</h3>
      <ol className="rank-steps">
        {ranks.map((rank) => (
          <li key={rank.id}>
            <button type="button" className="rank-step" onClick={() => onOpen("rank", rank.id)}>
              {rank.image ? <img src={publicUrl(rank.image)} alt="" loading="lazy" /> : <span className="mark-word">{rank.abbreviation}</span>}
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

function ChartScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdge({
        left: el.scrollLeft > 6,
        right: max > 6 && el.scrollLeft < max - 6,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div className={`chart-scroll-wrap${edge.left ? " has-left" : ""}${edge.right ? " has-right" : ""}`}>
      {edge.right ? <span className="chart-scroll-hint">Scroll →</span> : null}
      <div className="chart-scroll" ref={ref}>
        {children}
      </div>
    </div>
  );
}

function Track({
  label,
  items,
  onOpen,
}: {
  label: string;
  items: ReturnType<typeof timeline>["duty"];
  onOpen?: (k: Kind, id: string) => void;
}) {
  return (
    <section className="track" aria-label={label}>
      <h3>{label}</h3>
      <div className="track-lanes">
        {items.map((item) => {
          const body = (
            <>
              <span className="bar-title">{item.title}</span>
              <span className="bar-days">{item.group === "world" ? String(new Date(item.start).getUTCFullYear()) : barLength(item.days)}</span>
              <span className="sr-only">{item.detail}</span>
            </>
          );
          if (!onOpen) {
            return (
              <div key={item.key} className={`bar bar--${item.group}`} style={{ flexGrow: item.days && item.days > 0 ? item.days : 1 }} title={item.detail}>
                {body}
              </div>
            );
          }
          return (
            <button
              key={item.key}
              type="button"
              className={`bar bar--${item.group}${item.kind === "school" ? " bar--school" : ""}`}
              style={{ flexGrow: item.days && item.days > 0 ? item.days : 1 }}
              title={item.detail}
              onClick={() => onOpen(item.kind, item.id)}
            >
              {body}
            </button>
          );
        })}
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
