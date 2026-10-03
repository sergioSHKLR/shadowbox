import { useEffect, useRef, useState, type ReactNode } from "react";
import { awards, insignia, photos, profile, publicUrl, ribbonRows, timeline, warfare, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";
import { UniformProgression } from "@/components/shadowbox/uniform-progression";

const CHIEF = insignia.find((pin) => pin.id === "collar");
const EXW = warfare.find((pin) => pin.id === "exw");
const SW = warfare.find((pin) => pin.id === "esws");
const CHIEF_PORTRAIT = photos.find((photo) => photo.src === profile.portrait);
const SN_PORTRAIT = photos.find((photo) => photo.id === "recruit-portrait-1997");

export function Home({ onOpen, bio, moreLabel, lessLabel }: { onOpen: (k: Kind, id: string) => void; bio: string; moreLabel: string; lessLabel: string }) {
  const rows = ribbonRows(awards);
  const [bioOpen, setBioOpen] = useState(false);
  const [snPortrait, setSnPortrait] = useState(false);
  const portrait = snPortrait && SN_PORTRAIT ? SN_PORTRAIT : CHIEF_PORTRAIT;
  const paragraphs = bio.split("\n\n");
  const lead = paragraphs.slice(0, 2);
  const rest = paragraphs.slice(2);
  return (
    <main className="sheet">
      <header className="intro">
        <div className="intro-pair">
          <figure className="wood-frame">
            <div className="wood-mat">
              <div className="mat-opening">
                <button type="button" className="intro-portrait" onClick={() => { if (SN_PORTRAIT) setSnPortrait((on) => !on); }} aria-label={portrait?.alt ?? "Chief Petty Officer Sergio Schickler in service dress blue, 2018"}>
                  <img src={publicUrl(portrait?.src ?? profile.portrait)} alt="" />
                </button>
              </div>
            </div>
          </figure>
          <div className="wood-frame">
            <div className="wood-mat">
              <div className="mat-opening">
                {snPortrait ? null : (
                <div className="intro-marks">
                  {CHIEF?.image ? (
                    <button type="button" className="intro-device intro-anchor" onClick={() => onOpen("insignia", CHIEF.id)} aria-label={CHIEF.name}>
                      <img src={publicUrl(CHIEF.image)} alt="" />
                    </button>
                  ) : null}
                  {SW?.image ? (
                    <button type="button" className="intro-device" onClick={() => onOpen("warfare", SW.id)} aria-label={SW.name}>
                      <img src={publicUrl(SW.image)} alt="" />
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
                  {EXW?.image ? (
                    <button type="button" className="intro-device" onClick={() => onOpen("warfare", EXW.id)} aria-label={EXW.name}>
                      <img src={publicUrl(EXW.image)} alt="" />
                    </button>
                  ) : null}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="intro-copy">
          <p className="kicker">{profile.headerLines[1]}</p>
          <h2>{profile.headerLines[0]}</h2>
          <p className="quiet">{profile.headerLines[2]} · {profile.serviceLength}</p>
        </div>
        <div className="bio-wrap">
          {lead.map((paragraph) => (
            <p className="bio" key={paragraph.slice(0, 24)}>{bioParagraph(paragraph)}</p>
          ))}
          {rest.length > 0 ? (
            <>
              <button
                type="button"
                className={bioOpen ? "bio-fold is-open" : "bio-fold"}
                aria-expanded={bioOpen}
                aria-label={bioOpen ? lessLabel : moreLabel}
                onClick={() => setBioOpen((open) => !open)}
              >
                {bioOpen ? null : (
                  <span className="bio-fold-lines" aria-hidden="true">
                    <span /><span /><span />
                  </span>
                )}
                <span className="bio-fold-chevron" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
                    <path d="M5 9.5 12 16.5 19 9.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {bioOpen ? (
                <div className="bio-rest">
                  {rest.map((paragraph) => (
                    <p className="bio" key={paragraph.slice(0, 24)}>{bioParagraph(paragraph)}</p>
                  ))}
                  <img className="bio-pao" src={publicUrl("/incoming/pao.png")} alt="Approved for release. Unclassified. Unit PAO." />
                </div>
              ) : null}
            </>
          ) : (
            <img className="bio-pao" src={publicUrl("/incoming/pao.png")} alt="Approved for release. Unclassified. Unit PAO." />
          )}
        </div>
      </header>
    </main>
  );
}

/** ViewBox height of a marker body. Ink stays inside it; nibs match the end thickness. */
const MARKER_BOX = 56;

function markerWeight(seed: number) {
  return 15.4 + ((seed * 2.7) % 2.4);
}

/** One felt-marker pass the height of a typed line. Nibs stay round in CSS. */
function markerBody(seed: number) {
  const steps = 48;
  const weight = markerWeight(seed);
  const bow = (seed < 5 ? 1 : -1) * 3.1;
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const env = Math.sin(Math.PI * t);
    const wander = env * (Math.sin(t * 6.2 + seed) * 1.55 + Math.sin(t * 14.5 + seed * 1.4) * 0.7);
    const y = MARKER_BOX / 2 + Math.sin(Math.PI * t) * bow + wander + env * (t - 0.5) * 1.4;
    const half = weight * (1 + env * 0.16 * Math.sin(t * 2.15 + seed * 0.8));
    const x = (t * 100).toFixed(2);
    top.push(`${x} ${(y - half).toFixed(2)}`);
    bot.push(`${x} ${(y + half).toFixed(2)}`);
  }
  return `M ${top.join(" L ")} L ${bot.reverse().join(" L ")} Z`;
}

function MarkerLine({ seed, tilt, grow = 1 }: { seed: number; tilt: number; grow?: number }) {
  const weight = markerWeight(seed);
  const nib = `${((weight * 2) / MARKER_BOX) * 1.55}em`;
  return (
    <span className="marker-line" style={{ transform: `rotate(${tilt}deg)`, flexGrow: grow }} aria-label="Redacted">
      <span className="marker-nib" style={{ width: nib, height: nib, marginRight: `calc(${nib} / -2)` }} aria-hidden="true" />
      <svg viewBox={`0 0 100 ${MARKER_BOX}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={markerBody(seed)} fill="currentColor" />
      </svg>
      <span className="marker-nib" style={{ width: nib, height: nib, marginLeft: `calc(${nib} / -2)` }} aria-hidden="true" />
    </span>
  );
}

function bioParagraph(text: string) {
  const marker = "{{redacted-2011}}";
  if (!text.includes(marker)) return text;
  const [before, after] = text.split(marker);
  return (
    <>
      {before.trimEnd()}
      <span className="redacted-sentence">
        <span className="redacted-row">
          <MarkerLine seed={2.2} tilt={-1.05} grow={0.88} />
          <span className="redacted-year">2011</span>
          <MarkerLine seed={5.4} tilt={0.55} grow={1.62} />
        </span>
        <span className="redacted-row redacted-row-tail">
          <MarkerLine seed={8.6} tilt={0.85} />
        </span>
      </span>
      {after.trimStart()}
    </>
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
      <UniformProgression />
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
