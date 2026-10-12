import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { awards, photos, profile, publicUrl, ribbonRows, timeline, units, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";
import { chrome } from "@/lib/shadowbox/copy";
import type { Locale } from "@/lib/shadowbox/prefs";
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
  return (
    <span className="case-ribbons">
      <img className="case-pin" src={publicUrl("/insignia/esws.svg")} alt="Enlisted Surface Warfare Specialist" />
      {ribbonRows(awards, 3).map((row) => (
        <span key={row[0].id} className={row.length < 3 ? "case-ribbon-row is-short" : "case-ribbon-row"}>
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
          {items.map((item, index) => (
            <span key={item.key} className={`case-stop${id === "ops" && index === 0 ? " is-start" : ""}${id === "ops" && index === items.length - 1 ? " is-end" : ""}`}>
              <i />
              <em>{id === "ops" ? item.title.replace(/ \(.*\)$/, "") : item.title}</em>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/**
 * Home case, from Sergio's local-case work (Oct 12, 2026): incoming/case/shadowbox-case-clean.svg / "shadowbox case.png".
 * Each named plate-*.svg holds one object of that case on the same 960×600 felt, so box = [x0, y0, x1, y1] is the
 * object's true size and place. The ID card uses plate-id-placed.svg (Sergio's placed ID from new-plates; the
 * local-case plate-id.svg is the unplaced full-size card). The stack matches "shadowbox case.png".
 * One scale for the whole set; landscape = the case's own coordinates, portrait (590×1235) only moves objects.
 * The rank devices are one plate of his art over the crest row; portrait keeps that pair together, same offsets.
 */
type Box = [number, number, number, number];
type Tilt = { deg: number; cx: number; cy: number };
type Piece = { id: string; plates: string[]; box: Box; land: [number, number]; port: [number, number]; view?: string; unit?: string; z: number; label?: string; tilt?: Tilt };
// Square variant, upright: every object level on a clean 16-unit grid, no overlaps, same one scale.
// Built-in tilt of the drawn objects, measured from each plate's alpha (minimum-area bounding rectangle, deg in screen
// coordinates). The art is untouched; PieceArt counter-rotates it about the rectangle centre and crops to the upright box.
const TILT = {
  nec: { deg: -15.0, cx: 348.25, cy: 78.72, w: 136.15, h: 88.73 },
  liberty: { deg: 15.0, cx: 640.8, cy: 322.43, w: 135.81, h: 88.49 },
  calling: { deg: 15.0, cx: 181.76, cy: 494.99, w: 135.99, h: 88.38 },
  passport: { deg: -15.0, cx: 526.61, cy: 137.32, w: 134.63, h: 191.1 },
  id: { deg: 14.99, cx: 623.97, cy: 155.44, w: 86.73, h: 134.29 },
  memoranda: { deg: -30.0, cx: 386.44, cy: 256.47, w: 136.41, h: 213.1 },
  pen: { deg: -14.04, cx: 897.7, cy: 433.29, w: 18.61, h: 208.1 },
};
const G = 16;
const PAD = 0.5;
const upright = (t: (typeof TILT)[keyof typeof TILT]): { box: Box; tilt: Tilt } => {
  const w = t.w / 2 + PAD, h = t.h / 2 + PAD;
  return { box: [t.cx - w, t.cy - h, t.cx + w, t.cy + h], tilt: { deg: t.deg, cx: t.cx, cy: t.cy } };
};
const W = (b: Box) => b[2] - b[0];
const H = (b: Box) => b[3] - b[1];
const SHIRT: Box = [0, 0, 528, 600];
const PORTRAIT: Box = [728, 18.5, 941, 259.5];
const PLAQUE: Box = [767.5, 269, 901.5, 314];
const AWARDS: Box = [100, 141, 262.5, 353.5];
const RANK: Box = [319.5, 391.5, 862.5, 478];
const CALL = upright(TILT.calling), NEC = upright(TILT.nec), LIB = upright(TILT.liberty), ID = upright(TILT.id);
const MEMO = upright(TILT.memoranda), PASS = upright(TILT.passport), PEN = upright(TILT.pen);
// Rank devices + crest row move as one block, keeping Sergio's offsets (devices over the crests).
const BLOCK_X0 = 301;
const BLOCK_Y0 = 391.5;
const BLOCK_W = 883 - 301;
const BLOCK_H = 584 - BLOCK_Y0;
// Three columns: A = portrait / plaque / ID, B = memoranda / awards, C = passport / pen; items centred in their column.
const COLS = [[PORTRAIT, PLAQUE, ID.box], [MEMO.box, AWARDS], [PASS.box, PEN.box]] as const;
const COL_W = COLS.map((c) => Math.max(...c.map(W)));
const COL_H = COLS.map((c) => c.reduce((s, b) => s + H(b), 0) + (c.length - 1) * G);
const colPos = (x0: number, y0: number) => {
  const out: [number, number][][] = [];
  let x = x0;
  COLS.forEach((col, i) => {
    let y = y0;
    out.push(col.map((b) => { const p: [number, number] = [x + (COL_W[i] - W(b)) / 2, y]; y += H(b) + G; return p; }));
    x += COL_W[i] + G;
  });
  return out;
};
const CARD_Y = H(SHIRT) + G;
const CARD_H = Math.max(H(CALL.box), H(NEC.box), H(LIB.box));
const C1 = W(SHIRT) + G;
const LC = colPos(C1, G);
const LB: [number, number] = [C1, Math.max(...COL_H) + 2 * G];
const PC = colPos(0, CARD_Y + CARD_H + G);
const PB: [number, number] = [0, CARD_Y + CARD_H + G + Math.max(...COL_H) + G];
const LAND = { w: Math.ceil(C1 + Math.max(BLOCK_W, COL_W.reduce((s, w) => s + w, 0) + 2 * G) + G), h: Math.ceil(Math.max(CARD_Y + CARD_H, LB[1] + BLOCK_H) + G) };
const PORT = { w: 584, h: Math.ceil(PB[1] + BLOCK_H + G) };
const at = (box: Box, land: [number, number], port: [number, number]): Pick<Piece, "box" | "land" | "port"> => ({ box, land, port });
const blk = (box: Box): Pick<Piece, "box" | "land" | "port"> => {
  const dx = box[0] - BLOCK_X0, dy = box[1] - BLOCK_Y0;
  return { box, land: [LB[0] + dx, LB[1] + dy], port: [PB[0] + dx, PB[1] + dy] };
};
const CREST_SRC: { id: string; file: string; box: Box }[] = [
  { id: "ncts", file: "plate-ncts.svg", box: [301, 485.5, 395.5, 581] },
  { id: "frank-cable", file: "plate-as-40.svg", box: [398, 485.5, 497, 584] },
  { id: "eodmu5", file: "plate-eodmu5.svg", box: [492.5, 485.5, 603, 580.5] },
  { id: "sercc", file: "plate-sercc.svg", box: [602.5, 485, 711.5, 580] },
  { id: "jcse", file: "plate-jcse.svg", box: [714, 486, 781.5, 580] },
  { id: "navhosp", file: "plate-nhjax.svg", box: [787.5, 486, 883, 580] },
];
const CREST_GAP = (BLOCK_W - CREST_SRC.reduce((sum, c) => sum + W(c.box), 0)) / (CREST_SRC.length - 1);
const CRESTS = (() => {
  let x = 301;
  return CREST_SRC.map((c) => { const dx = x - c.box[0]; x += W(c.box) + CREST_GAP; return { ...c, dx }; });
})();
const CARDS = [CALL.box, NEC.box, LIB.box];
const card = (i: number, b: Box): [number, number] => [CARDS.slice(0, i).reduce((s, c) => s + W(c) + G, 0), CARD_Y + (CARD_H - H(b)) / 2];
const PIECES: Piece[] = [
  { id: "uniforms", plates: ["plate-shirt.svg", "plate-lapel.svg"], ...at(SHIRT, [0, 0], [0, 0]), view: "uniforms", z: 1 },
  { id: "contact", plates: ["plate-calling-card.svg"], ...at(CALL.box, card(0, CALL.box), card(0, CALL.box)), tilt: CALL.tilt, view: "contact", z: 3 },
  { id: "admin", plates: ["plate-nec-card.svg"], ...at(NEC.box, card(1, NEC.box), card(1, NEC.box)), tilt: NEC.tilt, view: "admin", z: 3 },
  { id: "offduty", plates: ["plate-liberty-card.svg"], ...at(LIB.box, card(2, LIB.box), card(2, LIB.box)), tilt: LIB.tilt, view: "offduty", z: 3 },
  { id: "bio", plates: ["plate-portrait.svg"], ...at(PORTRAIT, LC[0][0], PC[0][0]), view: "bio", z: 2 },
  { id: "plaque", plates: ["plate-brass-plaque.svg"], ...at(PLAQUE, LC[0][1], PC[0][1]), z: 2 },
  { id: "onduty", plates: ["plate-id-placed.svg"], ...at(ID.box, LC[0][2], PC[0][2]), tilt: ID.tilt, view: "onduty", z: 4, label: "Identification card" },
  { id: "logbook", plates: ["plate-memoranda.svg"], ...at(MEMO.box, LC[1][0], PC[1][0]), tilt: MEMO.tilt, view: "logbook", z: 4 },
  { id: "decorations", plates: ["plate-awards.svg"], ...at(AWARDS, LC[1][1], PC[1][1]), view: "decorations", z: 3 },
  { id: "map", plates: ["plate-maroon-passport.svg"], ...at(PASS.box, LC[2][0], PC[2][0]), tilt: PASS.tilt, view: "map", z: 3 },
  { id: "guestbook", plates: ["plate-pen.svg"], ...at(PEN.box, LC[2][1], PC[2][1]), tilt: PEN.tilt, view: "guestbook", z: 4 },
  { id: "timeline", plates: ["plate-rank-devices.svg"], ...blk(RANK), view: "timeline", z: 4, label: "Rank devices" },
  // Crests: same span as the case file, gutters evened out so no two crests touch.
  ...CRESTS.map(({ id, file, box, dx }): Piece => {
    const b = blk(box);
    return { id, plates: [file], box, land: [b.land[0] + dx, b.land[1]], port: [b.port[0] + dx, b.port[1]], view: "onduty", unit: id, z: 5 };
  }),
];
export const CASE_SIZE = { LAND, PORT };

function pageLabel(t: ReturnType<typeof chrome>, view: string) {
  if (view === "bio") return t.bioTitle;
  if (view === "map") return t.map;
  if (view === "admin") return t.admin;
  if (view === "decorations") return t.decorations;
  return (t as Record<string, string>)[view] ?? view;
}

function PieceArt({ piece }: { piece: Piece }) {
  const [x0, y0, x1, y1] = piece.box;
  return (
    <svg className="loose-art" viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} preserveAspectRatio="none" aria-hidden="true">
      <g transform={piece.tilt ? `rotate(${-piece.tilt.deg} ${piece.tilt.cx} ${piece.tilt.cy})` : undefined}>
        {piece.plates.map((file) => (
          <image key={file} href={publicUrl(`/incoming/case/${file}`)} x={0} y={0} width={960} height={600} />
        ))}
      </g>
      <rect className="loose-hit" x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
    </svg>
  );
}

/** One scale factor for the whole set: the canvas fits the stage, centred; portrait swaps to the tall arrangement. */
function useCaseScale(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const fit = () => {
      const tall = stage.clientHeight > stage.clientWidth;
      const c = tall ? PORT : LAND;
      const k = Math.min(stage.clientWidth / c.w, stage.clientHeight / c.h);
      stage.dataset.layout = tall ? "port" : "land";
      stage.style.setProperty("--k", String(k));
      stage.style.setProperty("--cw", `${c.w}px`);
      stage.style.setProperty("--ch", `${c.h}px`);
      stage.style.setProperty("--ox", `${(stage.clientWidth - c.w * k) / 2}px`);
      stage.style.setProperty("--oy", `${(stage.clientHeight - c.h * k) / 2}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [ref]);
}

export function Home({ locale = "en", onOpen, onGo }: { onOpen?: (k: Kind, id: string) => void; onGo?: (view: string) => void; bio: string; locale?: Locale }) {
  const t = chrome(locale);
  const stageRef = useRef<HTMLDivElement | null>(null);
  useCaseScale(stageRef);
  return (
    <main className="sheet case-home">
      <section className="case-frame" aria-label="Shadowbox">
        <div className="case-board case-board-light">
        <div className="case-board case-board-white">
        <div className="case-mat case-mat-comp">
          <div ref={stageRef} className="case-stage case-loose" data-layout="land" style={{ backgroundImage: `url("${publicUrl("/incoming/case/plate-felt.svg")}")` }}>
            <div className="loose-canvas">
              {PIECES.map((piece) => {
                const [x0, y0, x1, y1] = piece.box;
                const style = {
                  ["--lx" as string]: `${piece.land[0]}px`, ["--ly" as string]: `${piece.land[1]}px`,
                  ["--px" as string]: `${piece.port[0]}px`, ["--py" as string]: `${piece.port[1]}px`,
                  width: `${x1 - x0}px`, height: `${y1 - y0}px`, zIndex: piece.z,
                };
                const label = piece.label ?? (piece.unit ? units.find((u) => u.id === piece.unit)?.name ?? piece.unit : piece.view ? pageLabel(t, piece.view) : "");
                if (!piece.view) return <span key={piece.id} className="loose-item is-static" data-id={piece.id} style={style}><PieceArt piece={piece} /></span>;
                return (
                  <button key={piece.id} type="button" className="loose-item" data-id={piece.id} style={style} aria-label={label} title={label}
                    onClick={() => (piece.unit ? onOpen?.("unit", piece.unit) : onGo?.(piece.view!))}>
                    <PieceArt piece={piece} />
                  </button>
                );
              })}
            </div>
          </div>
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
function FadePortrait({ first, last }: { first: Shot; last: Shot; onOpen?: (k: Kind, id: string) => void }) {
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
        {tracks.map(([label, items, color]) => (
          <section key={label} className="page-track" style={{ color }} aria-label={label}>
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
