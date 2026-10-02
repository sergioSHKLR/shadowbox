import { useEffect, useRef, useState, type ReactNode } from "react";
import { awards, insignia, photos, profile, publicUrl, ribbonRows, timeline, warfare, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

const CHIEF = insignia.find((pin) => pin.id === "collar");
const EXW = warfare.find((pin) => pin.id === "exw");
const SW = warfare.find((pin) => pin.id === "esws");
const PORTRAIT = photos.find((photo) => photo.src === profile.portrait);

export function Home({ onOpen, bio }: { onOpen: (k: Kind, id: string) => void; bio: string }) {
  const rows = ribbonRows(awards);
  return (
    <main className="sheet">
      <header className="intro">
        <div className="intro-pair">
          <figure className="wood-frame">
            <div className="wood-mat">
              <div className="mat-opening">
                <button type="button" className="intro-portrait" onClick={() => { if (PORTRAIT) onOpen("photo", PORTRAIT.id); }} aria-label={PORTRAIT?.alt ?? "Chief Petty Officer Sergio Schickler in service dress blue, 2018"}>
                  <img src={publicUrl(profile.portrait)} alt="" />
                </button>
              </div>
            </div>
          </figure>
          <div className="wood-frame">
            <div className="wood-mat">
              <div className="mat-opening">
                <div className="intro-marks">
                  {CHIEF?.image ? (
                    <button type="button" className="intro-device intro-anchor" onClick={() => onOpen("insignia", CHIEF.id)} aria-label={CHIEF.name}>
                      <img src={publicUrl(CHIEF.image)} alt="" />
                    </button>
                  ) : null}
                  {EXW?.image ? (
                    <button type="button" className="intro-device" onClick={() => onOpen("warfare", EXW.id)} aria-label={EXW.name}>
                      <img src={publicUrl(EXW.image)} alt="" />
                    </button>
                  ) : null}
                  <div className="rack intro-rack" aria-label="Ribbon rack">
                    {rows.map((row) => (
                      <div key={row.map((award) => award.id).join("-")} className="rack-row">
                        {row.map((award) => (
                          <button key={award.id} type="button" className="ribbon intro-ribbon" onClick={() => onOpen("award", award.id)} aria-label={award.name}>
                            <RibbonArt award={award} />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  {SW?.image ? (
                    <button type="button" className="intro-device" onClick={() => onOpen("warfare", SW.id)} aria-label={SW.name}>
                      <img src={publicUrl(SW.image)} alt="" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="intro-copy">
          <p className="kicker">{profile.headerLines[1]}</p>
          <h2>{profile.headerLines[0]}</h2>
          <p className="quiet">{profile.headerLines[2]} · {profile.serviceLength}</p>
          {bio.split("\n\n").map((paragraph) => <p className="bio" key={paragraph.slice(0, 24)}>{paragraph}</p>)}
        </div>
      </header>
    </main>
  );
}

export function Timeline({
  bars,
  onOpen,
  title,
  lead,
  eventsNote,
}: {
  bars: ReturnType<typeof timeline>;
  onOpen: (k: Kind, id: string) => void;
  title: string;
  lead: string;
  eventsNote: string;
}) {
  return (
    <main className="sheet">
      <h2>{title}</h2>
      <p>{lead}</p>
      <ChartScroll>
        <div className="chart-stack">
        <Track label="Rank" items={bars.rank} onOpen={onOpen} />
        <Track label="Assignments" items={bars.duty} onOpen={onOpen} />
        <Track label="Deployments" items={bars.ops} onOpen={onOpen} />
        <Track label="Events" items={bars.world} />
        </div>
      </ChartScroll>
      <p className="quiet">{eventsNote}</p>
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
