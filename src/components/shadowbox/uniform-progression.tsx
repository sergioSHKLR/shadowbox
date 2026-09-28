import { useEffect, useMemo, useRef, useState } from "react";
import progressionJson from "@/data/uniform-progression.json";
import { awards, formatWhen, profile, publicUrl, ranks, warfare, type Award, type Device, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

/*
 * Uniform progression: a vector left breast and left sleeve that change with a month slider from enlistment to retirement.
 * Data: src/data/uniform-progression.json (awards table, breast insignia, uniforms, gold date) and src/data/ranks.json (rank dates).
 * The scene is drawn in 1/100 inch units (12.5 x 17 in); --in scales ribbons and insignia to the same inches.
 */

type Look = "blue" | "white" | "khaki";
type UniformDef = { id: string; look: Look; kind: "jumper" | "coat" | "choker" | "khaki"; name: string; short: string; grades: string; from: string; until: string | null };
type Progression = {
  goldFrom: string;
  goldNote: string;
  breastInsignia: { id: string; date: string | null; approximate: boolean; position: "primary" | "secondary"; note: string }[];
  shoulderPatch: { image: string; from: string; until?: string | null } | null;
  awards: { awardId: string; date: string | null; recordYears: number[] }[];
  deviceUpdates: { awardId: string; date: string; devices: Device[] }[];
  uniforms: UniformDef[];
};
const P = progressionJson as unknown as Progression;

/** One drawing per uniform. Rank, stripe, and device changes that these drawings do not cover stay on the vector until a drawing exists. */
const PLATE: Record<string, string> = {
  "sdb-jumper": "/uniforms/timeline/dress-blue-jumper.png",
  "sdw-jumper": "/uniforms/timeline/dress-white-jumper.png",
  "cpo-sdb": "/uniforms/timeline/cpo-dress-blue.png",
  "cpo-sdw": "/uniforms/timeline/cpo-dress-white.png",
  "cpo-khaki": "/uniforms/timeline/service-khaki.png",
};

const START = profile.serviceStart; // 1997-06-30
const END = profile.serviceEnd; // 2018-02-28
const ym = (v: string) => {
  const [y, m] = v.split("-");
  return Number(y) * 12 + (m ? Number(m) - 1 : 0);
};
const M0 = ym(START);
const M1 = ym(END);
/** Comparable day key; a partial date counts from its first day. */
const key = (v: string) => {
  const [y, m, d] = v.split("-");
  return `${y}-${(m ?? "01").padStart(2, "0")}-${(d ?? "01").padStart(2, "0")}`;
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** The last day shown for a slider month: the month end, clamped to the service dates. */
function dayOf(month: number): string {
  if (month <= M0) return key(START);
  if (month >= M1) return key(END);
  const y = Math.floor(month / 12);
  const m = (month % 12) + 1;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}
function addYears(v: string, n: number): string {
  const [y, m, d] = key(v).split("-");
  return `${Number(y) + n}-${m}-${d}`;
}
const STRIPE_DATES = [1, 2, 3, 4, 5, 6, 7].map((i) => addYears(START, 4 * i)).filter((d) => d <= key(END));

function monthFor(v: string) {
  return Math.min(M1, Math.max(M0, ym(key(v))));
}

type State = ReturnType<typeof stateAt>;
function stateAt(day: string) {
  const rank = [...ranks].reverse().find((r) => r.date && key(r.date) <= day) ?? ranks[0];
  const chief = rank.id === "etc";
  const gold = key(P.goldFrom) <= day;
  const stripes = STRIPE_DATES.filter((d) => d <= day).length;
  const pins = P.breastInsignia.filter((b) => b.date && key(b.date) <= day);
  const earned = P.awards.filter((a) => a.date && key(a.date) <= day);
  const list: Award[] = [];
  for (const row of earned) {
    const base = awards.find((a) => a.id === row.awardId);
    if (!base) continue;
    const updates = P.deviceUpdates.filter((u) => u.awardId === row.awardId).sort((a, b) => key(a.date).localeCompare(key(b.date)));
    let devices = base.devices;
    if (updates.length) devices = [...updates].reverse().find((u) => key(u.date) <= day)?.devices ?? [];
    list.push({ ...base, devices });
  }
  const uniforms = P.uniforms.filter((u) => key(u.from) <= day && (!u.until || day <= key(u.until)));
  const patch = P.shoulderPatch && key(P.shoulderPatch.from) <= day && (!P.shoulderPatch.until || day <= key(P.shoulderPatch.until)) ? P.shoulderPatch : null;
  return { day, rank, chief, gold, stripes, pins, ribbons: list, uniforms, patch };
}

/** What changed in this slider month, for the caption. */
function eventsIn(month: number): string[] {
  const out: string[] = [];
  const inMonth = (v: string | null) => !!v && monthFor(v) === month;
  if (month === M0) out.push("Enlisted as a Seaman (E-3)");
  for (const r of ranks) if (r.id !== "sn" && inMonth(r.date)) out.push(`Advanced to ${r.abbreviation} (${r.grade})`);
  STRIPE_DATES.forEach((d, i) => inMonth(d) && out.push(`Service stripe ${i + 1} (${4 * (i + 1)} years)`));
  if (inMonth(P.goldFrom)) out.push("12 years of good conduct: gold on dress blues");
  for (const b of P.breastInsignia) if (inMonth(b.date)) out.push(`${b.id.toUpperCase()} pin${b.approximate ? " (approximate date)" : ""}`);
  for (const a of P.awards) if (inMonth(a.date)) out.push(`${awards.find((x) => x.id === a.awardId)?.abbreviation ?? a.awardId} ribbon`);
  if (month === M1) out.push("Retired");
  return out;
}

function badgeFor(s: State, u: UniformDef): { src: string; w: number; alt: string } | null {
  if (u.kind === "choker" || u.kind === "khaki") return null; // CPOs wear collar devices on these
  if (s.chief) return { src: "/insignia/cpo-et-rating-badge-vector.svg", w: 350, alt: "Chief Electronics Technician rating badge, gold" };
  const white = u.look === "white";
  if (s.rank.id === "sn") return { src: white ? "/insignia/rate-sn-e3-white.svg" : "/insignia/rate-sn-e3.svg", w: 230, alt: `Seaman group rate mark, ${white ? "navy on white" : "white on navy"}` };
  const gold = s.gold && !white && s.rank.id === "et1";
  const src = white ? `/insignia/rating-${s.rank.id}-white.svg` : gold ? "/insignia/rating-et1-gold.svg" : `/insignia/rating-${s.rank.id}.svg`;
  return { src, w: 325, alt: `${s.rank.name} rating badge, ${white ? "blue on white" : gold ? "gold chevrons" : "red chevrons"}` };
}

const FABRIC: Record<Look, { base: string; hi: string; lo: string; line: string }> = {
  blue: { base: "#1a2031", hi: "#242c42", lo: "#10141f", line: "#0a0d15" },
  white: { base: "#efede6", hi: "#f8f7f2", lo: "#dcd9cf", line: "#c9c5b8" },
  khaki: { base: "#b9a57b", hi: "#c8b58c", lo: "#a08c63", line: "#86744f" },
};
const STRIPE_COLORS = {
  red: ["#a3232a", "#c4443e", "#6a1519"],
  blue: ["#1f2d5a", "#3b4a7c", "#0f1836"],
  gold: ["#c9a23a", "#dcbb55", "#94731f"],
};

function Scene({ s, u }: { s: State; u: UniformDef }) {
  const f = FABRIC[u.look];
  const badge = badgeFor(s, u);
  const shortSleeve = u.kind === "khaki";
  const sleeveEnd = shortSleeve ? 760 : 1700;
  const cuffTop = u.kind === "jumper" ? 1620 : 1700;
  // Service stripes: left sleeve, lower ends to the front, 1-1/2 in above a buttoned jumper cuff or 2 in from the sleeve end,
  // trailing edge in line with the badge's; 5-1/4 in (E-6 and below) or 7 in (CPO) by 3/8 in, 1/4 in apart, at the approved 33 deg.
  const showStripes = badge && s.stripes > 0;
  const color = u.look === "white" ? STRIPE_COLORS.blue : s.gold ? STRIPE_COLORS.gold : STRIPE_COLORS.red;
  const L = s.chief ? 700 : 525;
  const A = (33 * Math.PI) / 180;
  const dx = L * Math.cos(A);
  const dy = L * Math.sin(A);
  const h = 37.5 / Math.cos(A);
  const pitch = (37.5 + 25) / Math.cos(A);
  const xr = Math.min(1235, 950 + (badge?.w ?? 325) / 2);
  const y0 = u.kind === "jumper" ? cuffTop - 150 : 1700 - 200;
  const stripes = showStripes
    ? Array.from({ length: s.stripes }, (_, i) => {
        const yl = y0 - i * pitch; // bottom of the stripe's lower (front) end
        const x1 = xr - dx;
        return (
          <g key={i} className="uprog-fade">
            <polygon points={`${x1},${yl - h} ${xr},${yl - h - dy} ${xr},${yl - dy} ${x1},${yl}`} fill={color[0]} />
            <polyline points={`${x1},${yl - h + 5} ${xr},${yl - h - dy + 5}`} fill="none" stroke={color[1]} strokeWidth="4" />
            <polyline points={`${x1},${yl - 4} ${xr},${yl - dy - 4}`} fill="none" stroke={color[2]} strokeWidth="4" />
          </g>
        );
      })
    : null;
  return (
    <svg className="uprog-svg" viewBox="0 0 1250 1700" aria-hidden="true" focusable="false">
      <defs>
        <filter id="uprog-weave" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.07 0" result="grain" />
          <feComposite in="grain" in2="SourceGraphic" operator="in" result="g2" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="g2" />
          </feMerge>
        </filter>
        <clipPath id="uprog-sleeve-clip">
          <path d={`M660,110 Q950,-10 1240,110 L1246,${sleeveEnd} L654,${sleeveEnd} Z`} />
        </clipPath>
        <linearGradient id={`uprog-shade-${u.look}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={f.hi} />
          <stop offset="0.55" stopColor={f.base} />
          <stop offset="1" stopColor={f.lo} />
        </linearGradient>
      </defs>
      <g filter="url(#uprog-weave)">
        {/* Left breast (the viewer's left edge is the wearer's centre line). */}
        <path d="M0,130 L430,40 Q560,20 620,95 L620,1700 L0,1700 Z" fill={`url(#uprog-shade-${u.look})`} stroke={f.line} strokeWidth="4" />
        {/* Left sleeve, flattened, seen from the wearer's left: the front of the arm is at the viewer's left. */}
        <path d={`M660,110 Q950,-10 1240,110 L1246,${sleeveEnd} L654,${sleeveEnd} Z`} fill={`url(#uprog-shade-${u.look})`} stroke={f.line} strokeWidth="4" />
      </g>
      <path d="M672,112 Q950,0 1228,112" fill="none" stroke={f.line} strokeWidth="3" strokeDasharray="10 8" opacity="0.8" />
      {u.kind === "jumper" ? (
        <g>
          {/* Neckerchief knot and the V of the jumper with its navy collar and three white stripes. */}
          <path d="M0,130 L0,600 L330,40 L260,52 Z" fill={u.look === "blue" ? "#f1efe8" : "#f6f5f0"} />
          <path d="M0,600 L330,40 L420,40 L0,700 Z" fill="#161c2c" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M0,${682 - i * 16} L${410 - i * 9},${40}`} stroke="#eceae3" strokeWidth="4" fill="none" />
          ))}
          <path d="M0,560 L70,575 L82,640 L0,655 Z" fill="#0b0b0d" />
          <path d="M0,650 L60,640 L48,1000 L0,1010 Z" fill="#0b0b0d" />
          <rect x="654" y={cuffTop} width="592" height="80" fill={f.lo} stroke={f.line} strokeWidth="4" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={760 + i * 60} cy={cuffTop + 40} r="12" fill={u.look === "blue" ? "#0c0f18" : "#e2dfd6"} stroke={f.line} strokeWidth="3" />
          ))}
        </g>
      ) : null}
      {u.kind === "coat" ? (
        <g>
          <path d="M0,130 L0,640 L300,40 L230,55 Z" fill="#f4f3ee" />
          <path d="M0,150 L50,140 L42,640 L0,650 Z" fill="#0b0b0d" />
          <path d="M0,640 L300,40 L420,40 L330,300 L360,330 L40,900 L0,905 Z" fill={f.hi} stroke={f.line} strokeWidth="4" />
          <line x1="180" y1="636" x2="596" y2="636" stroke={f.line} strokeWidth="8" />
          {[780, 1080, 1380].map((y) => (
            <g key={y}>
              <circle cx="150" cy={y} r="26" fill="#b99532" stroke="#7d6220" strokeWidth="4" />
              <circle cx="146" cy={y - 4} r="12" fill="#d3b153" opacity="0.6" />
            </g>
          ))}
        </g>
      ) : null}
      {u.kind === "choker" ? (
        <g>
          <path d="M0,40 L330,40 Q360,45 360,80 L360,150 L0,160 Z" fill={f.hi} stroke={f.line} strokeWidth="4" />
          {[300, 560, 820, 1080, 1340].map((y) => (
            <circle key={y} cx="36" cy={y} r="20" fill="#b99532" stroke="#7d6220" strokeWidth="4" />
          ))}
          <path d="M190,625 L590,625 L590,710 L390,730 L190,710 Z" fill={f.hi} stroke={f.line} strokeWidth="4" />
          <path d="M190,710 L190,1010 L590,1010 L590,710" fill="none" stroke={f.line} strokeWidth="3" />
        </g>
      ) : null}
      {u.kind === "khaki" ? (
        <g>
          <path d="M0,130 L0,470 L320,40 L240,52 Z" fill={f.lo} />
          <path d="M0,470 L320,40 L400,40 L260,400 Z" fill={f.hi} stroke={f.line} strokeWidth="4" />
          {[560, 860, 1160, 1460].map((y) => (
            <circle key={y} cx="30" cy={y} r="13" fill="#9b8a64" stroke={f.line} strokeWidth="3" />
          ))}
          <path d="M190,625 L590,625 L590,700 L390,740 L190,700 Z" fill={f.hi} stroke={f.line} strokeWidth="4" />
          <path d="M190,700 L190,1030 L590,1030 L590,700" fill="none" stroke={f.line} strokeWidth="3" />
          <circle cx="390" cy="705" r="12" fill="#9b8a64" stroke={f.line} strokeWidth="3" />
          <path d={`M654,${sleeveEnd - 60} L1246,${sleeveEnd - 60}`} stroke={f.line} strokeWidth="4" />
        </g>
      ) : null}
      {/* On a real sleeve the front ends wrap round the arm; here they are clipped at the flattened sleeve's front edge. */}
      <g clipPath="url(#uprog-sleeve-clip)">{stripes}</g>
    </svg>
  );
}

export function UniformProgression({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const [month, setMonth] = useState(M0);
  const [look, setLook] = useState<Look>("blue");
  const [playing, setPlaying] = useState(false);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);
  useEffect(() => {
    if (!playing) return;
    // Reduced motion: whole-year steps, no fades (CSS turns transitions off).
    const step = reduced.current ? 12 : 1;
    const t = window.setInterval(() => {
      setMonth((m) => {
        const next = Math.min(M1, m + step);
        if (next >= M1) setPlaying(false);
        return next;
      });
    }, reduced.current ? 900 : 110);
    return () => window.clearInterval(t);
  }, [playing]);

  const day = dayOf(month);
  const s = useMemo(() => stateAt(day), [day]);
  const uniform = s.uniforms.find((x) => x.look === look) ?? s.uniforms.find((x) => x.look === "blue") ?? s.uniforms[0];
  const badge = badgeFor(s, uniform);
  const top = [...s.ribbons].sort((a, b) => a.precedence - b.precedence).slice(0, 3);
  const plate = PLATE[uniform.id];
  const primary = s.pins.find((p) => p.position === "primary");
  const secondary = s.pins.find((p) => p.position === "secondary");
  const pinImg = (id: string) => warfare.find((w) => w.id === id)?.image;
  const needed = P.awards.filter((a) => !a.date);
  const events = eventsIn(month);
  const label = `${MONTHS[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
  const u = (v: number) => `calc(var(--in) * ${v / 100})`;

  return (
    <section className="uprog" aria-label="Uniform through the years">
      <h3>Uniform through the years</h3>
      <p className="quiet">
        Drag the slider or press play to watch the left sleeve and chest change from enlistment ({formatWhen(START)}) to retirement ({formatWhen(END)}): rate and rating badge,
        service stripes, breast insignia and the top three ribbons. Only dated items appear; the rest are listed as date needed.
      </p>
      <div className="uprog-controls">
        <button type="button" className="nav-btn uprog-play" aria-pressed={playing} onClick={() => {
          if (!playing && month >= M1) setMonth(M0);
          setPlaying(!playing);
        }}>
          {playing ? "Pause" : "Play"}
        </button>
        <label className="uprog-slider">
          <span className="sr-only">Date</span>
          <input type="range" min={M0} max={M1} step={1} value={month} aria-valuetext={label} onChange={(e) => { setPlaying(false); setMonth(Number(e.target.value)); }} />
        </label>
        <output className="uprog-date" aria-live="polite">{label}</output>
      </div>
      <div className="uprog-layout">
        <div className="uprog-main">
          <div className="uprog-stage">
            <div className={`uprog-scene look-${uniform.look}${plate ? " has-plate" : ""}`} role="img" aria-label={`${uniform.name}, ${label}: ${s.rank.abbreviation} (${s.rank.grade}), ${s.stripes} service stripe${s.stripes === 1 ? "" : "s"}${s.gold && uniform.look === "blue" && badge ? ", gold" : ""}${s.pins.length ? `, ${s.pins.map((p) => p.id.toUpperCase()).join(" and ")}` : ""}, top ${top.length} ribbon${top.length === 1 ? "" : "s"}`}>
              {plate ? <img className="uprog-plate" src={publicUrl(plate)} alt="" /> : <Scene s={s} u={uniform} />}
              {!plate && badge ? (
                <img key={badge.src} className="uprog-badge uprog-fade" src={publicUrl(badge.src)} alt="" style={{ width: u(badge.w), left: u(950 - badge.w / 2), top: u(badge.w > 300 ? 200 : 260) }} />
              ) : null}
              {!plate && (uniform.kind === "choker" || uniform.kind === "khaki") ? (
                <img className="uprog-collar uprog-fade" src={publicUrl("/insignia/cpo-anchor-cap.webp")} alt="" style={uniform.kind === "choker" ? { height: u(90), left: u(150), top: u(52) } : { height: u(110), left: u(170), top: u(170) }} />
              ) : null}
              {top.length ? (
                <div className={`uprog-rack rack${plate ? " uprog-rack--top" : ""}`} style={plate ? undefined : { left: u(390 - 206.25), top: u(562.5), width: u(412.5) }}>
                  <div className="rack-row">
                    {top.map((a) => <RibbonArt key={a.id} award={a} className="uprog-fade" />)}
                  </div>
                </div>
              ) : null}
              {!plate && primary && pinImg(primary.id) ? (
                <img className="uprog-pin uprog-fade" src={publicUrl(pinImg(primary.id)!)} alt="" style={{ width: u(275), left: u(390 - 137.5), bottom: `calc(100% - ${u(537.5)})` }} />
              ) : null}
              {!plate && secondary && pinImg(secondary.id) ? (
                <img className="uprog-pin uprog-fade" src={publicUrl(pinImg(secondary.id)!)} alt="" style={{ width: u(275), left: u(390 - 137.5), top: u(650) }} />
              ) : null}
              {!plate && s.patch ? <img className="uprog-patch uprog-fade" src={publicUrl(s.patch.image)} alt="" style={{ width: u(300), left: u(800), top: u(150) }} /> : null}
              {!plate && !badge ? <span className="uprog-note" style={{ left: u(680), top: u(uniform.kind === "khaki" ? 800 : 400), width: u(540) }}>CPOs wear collar anchors, not a sleeve badge, on this uniform.</span> : null}
            </div>
          </div>
          <div className="uprog-chips" role="group" aria-label="Uniform">
            {s.uniforms.map((x) => (
              <button key={x.id} type="button" className={`nav-btn${x.id === uniform.id ? " on" : ""}`} aria-pressed={x.id === uniform.id} onClick={() => setLook(x.look)}>
                {x.short}
              </button>
            ))}
          </div>
          <p className="uprog-caption">
            <strong>{uniform.name}</strong> · {s.rank.abbreviation} ({s.rank.grade}) · {s.stripes} service stripe{s.stripes === 1 ? "" : "s"}{!badge && s.stripes ? " (not worn on this uniform)" : ""}
            {badge && uniform.look === "blue" && s.gold ? " · gold (12 years)" : ""}
            {s.pins.length ? ` · ${s.pins.map((p) => `${p.id.toUpperCase()}${p.approximate ? " (approx.)" : ""}`).join(", ")}` : ""}
            {events.length ? <span className="uprog-events"> {events.join(" · ")}</span> : null}
          </p>
        </div>
        <aside className="uprog-side" aria-label="Awards without a date">
          <h4>Ribbons: date needed ({needed.length})</h4>
          <p className="quiet">These are not animated until a date is entered in src/data/uniform-progression.json.</p>
          <ul>
            {needed.map((a) => {
              const award = awards.find((x) => x.id === a.awardId);
              if (!award) return null;
              return (
                <li key={a.awardId}>
                  <button type="button" onClick={() => onOpen("award", award.id)}>
                    <RibbonArt award={award} />
                    <span>{award.abbreviation}</span>
                    <em>date needed{a.recordYears.length ? ` · record years ${a.recordYears.join(", ")}` : ""}</em>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}
