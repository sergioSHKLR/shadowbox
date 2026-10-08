import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { awards, photos, profile, publicUrl, ribbonRows, timeline, units, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";
import { chrome } from "@/lib/shadowbox/copy";
import type { Locale } from "@/lib/shadowbox/prefs";
import { UniformProgression } from "@/components/shadowbox/uniform-progression";
import { RedactionSample } from "@/components/shadowbox/redaction-sample";

const ASSIGNED = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
const PARTNERS = units.filter((unit) => unit.image && !ASSIGNED.includes(unit.id) && !["rtc", "tortuga", "ntc-great-lakes", "local-hires"].includes(unit.id));
const CHIEF_PORTRAIT = photos.find((photo) => photo.src === profile.portrait);
const SN_PORTRAIT = photos.find((photo) => photo.id === "recruit-portrait-1997");

/**
 * Home portrait crossfade (Sergio, Oct 2026): one frame holds both portraits stacked (same size, opaque). As the reader
 * scrolls through the bio, the End of Career portrait fades in over Boot Camp; the fade follows scroll progress and is
 * complete at the bottom of the page (the end of the bio and stamps). A page too short to scroll shows End of Career.
 * prefers-reduced-motion: no gradual fade, an instant swap at the halfway point.
 */
function useHomeFade(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    const narrow = typeof matchMedia === "function" ? matchMedia("(max-width: 959.98px)") : null;
    const sheet = root.querySelector<HTMLElement>(".home-sheet");
    const frameEl = root.querySelector<HTMLElement>(".home-fade");
    const pins = root.querySelector<HTMLElement>(".home-pins");
    // Zero movement while pinned: the sticky offset must equal the frame's own resting position (top bar + page
    // padding, a fractional height), so the frame never travels before it pins. Measured on load and resize only.
    let pinPx = "";
    const measurePin = () => {
      if (!pins) return;
      const next = `${pins.getBoundingClientRect().top + scrollY}px`;
      if (next !== pinPx) { pinPx = next; root.style.setProperty("--pin-top", next); }
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      let p = max <= 1 ? 1 : Math.min(1, Math.max(0, scrollY / max));
      if (reduce?.matches) p = p >= 0.5 ? 1 : 0;
      root.style.setProperty("--fade", p.toFixed(4));
      root.classList.toggle("is-late", p >= 0.5);
      if (p >= 0.92) root.classList.add("is-end");
      else if (p < 0.8) root.classList.remove("is-end");
      // Phone: the frame starts pinned under the bar. Once the bio card has slid fully over it, the frame moves (unseen)
      // to its spot after the stamps, so it scrolls in there, all End of Career, with no empty band below it.
      // A bio card shorter than the frame can't hide it, so a short page falls back to plain flow (frame, then bio).
      let glued = false;
      let short = false;
      if (narrow?.matches && sheet && frameEl) {
        short = sheet.offsetHeight < frameEl.offsetHeight;
        if (!short) {
          const pinTop = parseFloat(getComputedStyle(frameEl).top) || 0;
          // Relocate only once the opaque sheet has fully covered the pinned frame (it should move unseen).
          // Using sheet.top <= pinTop alone fired as soon as covering began, so the portrait jumped to the
          // bottom mid-fade on phone and left a blank band while the user was still reading.
          const frameH = frameEl.getBoundingClientRect().height;
          glued = sheet.getBoundingClientRect().top <= pinTop - frameH + 1;
        }
      }
      root.classList.toggle("is-short", short);
      root.classList.toggle("is-glued", glued);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const relayout = () => { measurePin(); schedule(); };
    measurePin();
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", relayout);
    reduce?.addEventListener?.("change", schedule);
    narrow?.addEventListener?.("change", relayout);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(relayout) : null;
    ro?.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", relayout);
      reduce?.removeEventListener?.("change", schedule);
      narrow?.removeEventListener?.("change", relayout);
      ro?.disconnect();
    };
  }, [ref]);
}

function CaseRack() {
  const ref = useRef<HTMLSpanElement>(null);
  const [columns, setColumns] = useState(5);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const apply = (width: number) => setColumns(width < 16 * 16 ? 3 : width < 24 * 16 ? 4 : 5);
    apply(node.clientWidth);
    const observer = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <span className="case-ribbons" ref={ref}>
      <img className="case-pin" src={publicUrl("/insignia/esws.svg")} alt="Enlisted Surface Warfare Specialist" />
      {ribbonRows(awards, columns).map((row) => (
        <span key={row[0].id} className={row.length < columns ? "case-ribbon-row is-short" : "case-ribbon-row"}>
          {row.map((award) => <RibbonArt key={award.id} award={award} className="case-ribbon" />)}
        </span>
      ))}
      <img className="case-pin" src={publicUrl("/insignia/exw.svg")} alt="Enlisted Expeditionary Warfare Specialist" />
    </span>
  );
}

function CaseTracks() {
  const bars = timeline();
  const tracks = [
    ["rank", bars.rank, "#7d1c20"],
    ["duty", bars.duty, "#14233a"],
    ["ops", bars.ops, "#1e6b3c"],
    ["world", bars.world, "#c6a15b"],
  ] as const;
  return (
    <span className="case-tracks" aria-hidden="true">
      {tracks.map(([id, items, color]) => (
        <span key={id} className="case-track" style={{ color }}>
          {items.map((item) => (
            <span key={item.key} className="case-stop">
              <i />
              <em>{item.title}</em>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function Home({ bio, locale = "en", onOpen, onGo }: { onOpen?: (k: Kind, id: string) => void; onGo?: (view: string) => void; bio: string; locale?: Locale }) {
  const t = chrome(locale);
  const paragraphs = bio.split("\n\n");
  const portrait = CHIEF_PORTRAIT?.src ?? profile.portrait;
  const tray = (view: string, label: string, body: ReactNode) => (
    <button type="button" className={`case-tray case-tray-${view} case-slot-${label === t.decorations ? "decorations" : view}`} onClick={() => onGo?.(view)}>
      <span className="case-kicker">{label}</span>
      {body}
    </button>
  );
  return (
    <main className="sheet case-home">
      <section className="case-frame" aria-label="Shadowbox">
        <div className="case-board case-board-light">
        <div className="case-board case-board-white">
        <div className="case-mat">
          {tray("logbook", t.logbook, (
              <>
                <span className="case-crests case-crests-assigned">
                  {ASSIGNED.map((id) => {
                    const unit = units.find((row) => row.id === id);
                    return unit?.image ? <img key={id} src={publicUrl(unit.image)} alt="" /> : null;
                  })}
                </span>
                <span className="case-crests case-crests-partner">
                  {PARTNERS.map((unit) => unit.image ? <img key={unit.id} src={publicUrl(unit.image)} alt="" /> : null)}
                </span>
              </>
            ))}
            {tray("logbook", t.decorations, <CaseRack />)}
            <span className="case-flag-cut"><img className="case-flag" src={publicUrl("/incoming/folded%20flag%20stripes.svg")} alt="Folded flag" /></span>
            <button type="button" className="case-portrait" onClick={() => onGo?.("bio")} aria-label={t.bioTitle}>
              <img src={publicUrl(portrait)} alt={CHIEF_PORTRAIT?.alt ?? "Chief Petty Officer Sergio Schickler in service dress blue, 2018"} />
            </button>
            <span className="case-plaque">ETC (SW/EXW) Sergio Schickler<br />30 Jun 1997 – 28 Feb 2018</span>
            {tray("timeline", t.timeline, <CaseTracks />)}
            {tray("map", t.map, (
              <span className="case-map-wrap">
                <img className="case-map" src={publicUrl("/incoming/world-map.png")} alt="" />
                <img className="case-pass case-pass-br" src={publicUrl("/incoming/passport-br.png")} alt="Brazilian passport" />
                <img className="case-pass case-pass-us" src={publicUrl("/incoming/passport-us.png")} alt="United States passport" />
                <img className="case-pass case-pass-official" src={publicUrl("/incoming/passport-us-official.png")} alt="United States official passport" />
              </span>
            ))}
        </div>
        </div>
        </div>
      </section>
    </main>
  );
}

export function BioPage({ bio, locale = "en" }: { bio: string; locale?: Locale }) {
  const t = chrome(locale);
  const paragraphs = bio.split("\n\n");
  return (
    <main className="sheet">
      <div className="home-sheet case-bio">
        <div className="intro-copy">
          <p className="kicker">{t.navyRetired}</p>
          <h2>{profile.headerLines[0]}</h2>
        </div>
        <div className="bio-wrap">
          {paragraphs.map((paragraph) => (
            <BioBlock key={paragraph.slice(0, 24)} text={paragraph} />
          ))}
        </div>
      </div>
    </main>
  );
}

type Shot = { src: string; alt: string; caption: string };

/** One frame, two stacked portraits; the second fades in with --fade (0..1) set on .home-scroll. */
function FadePortrait({ first, last, onOpen }: { first: Shot; last: Shot; onOpen?: (k: Kind, id: string) => void }) {
  return (
    <figure className="intro-solo home-pin home-fade">
      <div className="wood-frame">
        <div className="wood-mat">
          <div className="mat-opening home-fade-stack">
            <img className="intro-portrait-img home-fade-first" src={publicUrl(first.src)} alt={first.alt} />
            <img className="intro-portrait-img home-fade-last" src={publicUrl(last.src)} alt={last.alt} />
          </div>
        </div>
      </div>
      <figcaption className="quiet home-fade-caps">
        <span className="home-fade-cap-first">{first.caption}</span>
        <span className="home-fade-cap-last">{last.caption}</span>
      </figcaption>
      <div className="home-branch-seals">
        {([
          ["army", "/incoming/Emblem_of_the_United_States_Department_of_the_Army.svg", "United States Army"],
          ["marines", "/incoming/Emblem_of_the_United_States_Marine_Corps.svg", "United States Marine Corps"],
          ["navy", "/incoming/Seal_of_the_United_States_Department_of_the_Navy.svg", "United States Navy"],
          ["air-force", "/incoming/U.S._Air_Force_service_mark.svg", "United States Air Force"],
        ] as const).map(([id, src, label]) => (
          <button key={id} type="button" className="home-branch-seal" onClick={() => onOpen?.("branch", id)} aria-label={label}>
            <img src={publicUrl(src)} alt="" />
          </button>
        ))}
      </div>
    </figure>
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

function BioBlock({ text }: { text: string }) {
  if (text.trim() === "{{redaction-sample}}") return <RedactionSample />;
  if (text.startsWith("{{quote}}")) {
    const [quote, cite] = text.slice("{{quote}}".length).split("{{cite}}");
    return (
      <blockquote className="bio-quote">
        <p>{quote}</p>
        {cite ? <footer className="bio-cite">— {cite}</footer> : null}
      </blockquote>
    );
  }
  // Placeholder bio sections: {{h}}Heading{{/h}}body
  const head = /^\{\{h\}\}([\s\S]*?)\{\{\/h\}\}([\s\S]*)$/.exec(text);
  if (head) {
    return (
      <section className="bio-section">
        <h3 className="bio-head">{head[1]}</h3>
        <p className="bio">{bioInline(head[2])}</p>
      </section>
    );
  }
  return <p className="bio">{bioInline(text)}</p>;
}

function bioInline(text: string) {
  const bits = text.split(/(\{\{b\}\}[\s\S]*?\{\{\/b\}\}|\{\{r\}\}[\s\S]*?\{\{\/r\}\}|\{\{redacted-2011\}\})/);
  if (bits.length === 1) return text;
  return bits.map((bit, index) => {
    if (!bit) return null;
    if (bit === "{{redacted-2011}}") {
      return (
        <span className="redacted-sentence" key={index}>
          <span className="redacted-row">
            <MarkerLine seed={2.2} tilt={-1.05} grow={0.88} />
            <span className="redacted-year">2011</span>
            <MarkerLine seed={5.4} tilt={0.55} grow={1.62} />
          </span>
          <span className="redacted-row redacted-row-tail">
            <MarkerLine seed={8.6} tilt={0.85} />
          </span>
        </span>
      );
    }
    const hidden = /^\{\{r\}\}([\s\S]*)\{\{\/r\}\}$/.exec(bit);
    if (hidden) return <span className={`redact-run redact-v${index % 4}`} key={index}><span className="sr-only">[redacted]</span><span className="redact-mark" aria-hidden="true">{hidden[1]}</span></span>;
    const name = /^\{\{b\}\}([\s\S]*)\{\{\/b\}\}$/.exec(bit);
    if (name) return <strong key={index}>{name[1]}</strong>;
    return bit;
  });
}

export function Timeline({
  bars,
  stops,
  onOpen,
  title,
  lead,
  eventsNote,
}: {
  bars: ReturnType<typeof timeline>;
  stops: { n: number; labels: string[]; when: string; place: { id: string; name: string; accuracy: string }; layers: string[]; kind: string; cityId: string | null; baseId: string | null; commandId: string | null }[];
  onOpen: (k: Kind, id: string) => void;
  title: string;
  lead: string;
  eventsNote: string;
}) {
  return (
    <main className="sheet">
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
      <section className="places-track" aria-label="Places">
        <h3>Places</h3>
        <p className="quiet">The same order as the Map. Numbers do not change.</p>
        <ol className="stop-list">
          {stops.map((stop) => {
            const layer = "kind" in stop && stop.kind ? String(stop.kind) : "base";
            return (
              <li key={stop.n}>
                <button type="button" onClick={() => onOpen("place", stop.place.id)}>
                  <span className={`pin-num ${layer} ${stop.place.accuracy}`} aria-label={`Stop ${stop.n}`}>{stop.n}</span>
                  <strong>{stop.labels[0]}</strong>
                  <span>{stop.place.name}{stop.when ? ` · ${stop.when}` : ""}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

function ChartScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const [max, setMax] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setMax(Math.max(0, el.scrollWidth - el.clientWidth));
      setPos(el.scrollLeft);
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
    <div className="chart-scroll-wrap">
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
          if (item.href) {
            return (
              <a key={item.key} className={`bar bar--${item.group}`} style={{ flexGrow: item.days && item.days > 0 ? item.days : 1 }} title={item.detail} href={item.href} target="_blank" rel="noreferrer">
                {body}
              </a>
            );
          }
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
  let left = Math.max(0, Math.round(days));
  const years = Math.floor(left / 365);
  left -= years * 365;
  const months = Math.floor(left / 30);
  left -= months * 30;
  const weeks = Math.round(left / 7);
  const part = (n: number, one: string, many: string) => (n ? (n === 1 ? `1 ${one}` : `${n} ${many}`) : "");
  const parts = [part(years, "year", "years"), part(months, "month", "months"), part(weeks, "week", "weeks")].filter(Boolean);
  return parts.join(", ") || "under a week";
}
