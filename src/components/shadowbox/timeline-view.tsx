import { profile, timeline, type Kind } from "@/lib/shadowbox/model";
import { chrome } from "@/lib/shadowbox/copy";
import type { Locale } from "@/lib/shadowbox/prefs";
import { CaseHome } from "@/components/shadowbox/case-home";
import { RedactionSample } from "@/components/shadowbox/redaction-sample";


function pageLabel(t: ReturnType<typeof chrome>, view: string) {
  if (view === "bio") return t.bioTitle;
  if (view === "map") return t.map;
  if (view === "admin") return t.admin;
  if (view === "decorations") return t.decorations;
  return (t as unknown as Record<string, string>)[view] ?? view;
}

export function Home({ locale = "en", onOpen, onGo }: { onOpen?: (k: Kind, id: string) => void; onGo?: (view: string) => void; bio: string; locale?: Locale }) {
  const t = chrome(locale);
  return (
    <main className="sheet case-home">
      <h1 className="sr-only">{locale === "pt" ? "Shadowbox: a carreira na Marinha do Chief Petty Officer Sergio Schickler" : "Shadowbox: the Navy career of Chief Petty Officer Sergio Schickler"}</h1>
      <section className="case-frame" aria-label="Shadowbox">
        <div className="case-mat case-mat-comp">
          <CaseHome onOpen={onOpen} onGo={onGo} label={(view) => pageLabel(t, view)} copy={t.intro} locale={locale} />
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
    if (name) return <em key={index} className="bio-em">{name[1]}</em>;
    return bit;
  });
}

export function Timeline({
  bars,
  onOpen,
}: {
  bars: ReturnType<typeof timeline>;
  onOpen: (k: Kind, id: string) => void;
  title: string;
  lead: string;
}) {
  const tracks = [
    ["Rank", bars.rank, "#7d1c20"],
    ["Assignments", bars.duty, "#14233a"],
    ["Deployments", bars.ops, "#1e6b3c"],
    ["Events", bars.world, "#c6a15b"],
  ] as const;
  return (
    <main className="sheet">
      <div className="page-tracks">
        {tracks.map(([label, items, color], i) => (
          <section key={label} className="page-track" data-track={i} style={{ color }} aria-label={label}>
            <h3>{label}</h3>
            <div className="page-line">
              {items.map((item, index) => {
                const place = index === 0 ? " is-start" : index === items.length - 1 ? " is-end" : "";
                const body = (<><i /><em>{item.title}</em></>);
                if (item.href) {
                  return <a key={item.key} className={`page-stop${place}`} href={item.href} target="_blank" rel="noreferrer" title={item.detail}>{body}</a>;
                }
                return (
                  <button key={item.key} type="button" className={`page-stop${place}`} title={item.detail} onClick={() => onOpen(item.kind, item.id)}>
                    {body}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
