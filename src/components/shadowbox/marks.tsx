import { useId } from "react";
import type { Award, Device } from "@/lib/shadowbox/model";
import { countPhrase, deviceSummary } from "@/lib/shadowbox/model";

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="glyph" aria-hidden="true">
      <path d="M12 1.6 14.9 8.4 22.2 9.1 16.7 14l1.7 7.2L12 17.6 5.6 21.2 7.3 14 1.8 9.1 9.1 8.4Z" />
    </svg>
  );
}

function Oak() {
  return (
    <svg viewBox="0 0 24 32" className="glyph" aria-hidden="true">
      <path d="M12 1c2.4 3.2 6.2 4.4 7.2 8.2 1 3.6-1.2 6.2-3.2 7.6 2.2.6 4.6 2.4 3.6 5.6-1.6 4.6-6 3.2-7.6 6.6-1.6-3.4-6-2-7.6-6.6-1-3.2 1.4-5 3.6-5.6C6 15.4 3.8 12.8 4.8 9.2 5.8 5.4 9.6 4.2 12 1Z" />
    </svg>
  );
}

function Letter({ value }: { value: string }) {
  return (
    <svg viewBox="0 0 32 32" className="glyph letter" aria-hidden="true">
      <text x="16" y="25" textAnchor="middle">
        {value}
      </text>
    </svg>
  );
}

export function Devices({ devices }: { devices: Device[] }) {
  const glyphs = devices.flatMap((device, di) =>
    Array.from({ length: device.count }, (_, i) => ({ device, key: `${di}-${i}` })),
  );
  if (!glyphs.length) return null;
  return (
    <span className={glyphs.length >= 4 ? "devices dense" : "devices"}>
      {glyphs.map(({ device, key }) => (
        <span key={key} className={`metal-${device.metal}`}>
          {device.kind === "oak" ? <Oak /> : device.kind === "letter" ? <Letter value={device.letter ?? "E"} /> : <Star />}
        </span>
      ))}
    </span>
  );
}

export function RibbonButton({
  award,
  onOpen,
}: {
  award: Award;
  onOpen: () => void;
}) {
  const label = `${award.name}. ${countPhrase(award)}. ${deviceSummary(award)}. Open the explanation.`;
  return (
    <button type="button" className={award.framed ? "ribbon framed" : "ribbon"} onClick={onOpen} aria-label={label}>
      <img src={award.ribbon} alt="" />
      <Devices devices={award.devices} />
    </button>
  );
}

export function Anchor() {
  return (
    <svg viewBox="0 0 64 80" className="insignia-svg" aria-hidden="true">
      <path
        fill="currentColor"
        d="M32 6a8 8 0 0 1 8 8c0 3.6-2.4 6.6-5.6 7.6V28h8.2a2 2 0 0 1 0 4H34.4v6.2c7.8 1.4 14.4 6.6 17.2 14.2H44.2A16.2 16.2 0 0 0 32 40.2 16.2 16.2 0 0 0 19.8 52.4h-7.4C15.2 44.8 21.8 39.6 29.6 38.2V32H18.4a2 2 0 0 1 0-4H29.6v-6.4A8 8 0 0 1 32 6Zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM14 56h36v4.2c-4.6 8.2-12.4 12.8-18 14.2-5.6-1.4-13.4-6-18-14.2V56Z"
      />
    </svg>
  );
}

export function RatingBadge() {
  return (
    <svg viewBox="0 0 80 96" className="insignia-svg" aria-hidden="true">
      <path fill="currentColor" d="M40 4c2 6 8 8 8 8s-2 6-8 8c-6-2-8-8-8-8s6-2 8-8Z" />
      <path fill="currentColor" d="M18 22h44l-6 10H24L18 22Zm8 2 3 6h22l3-6H26Z" />
      <ellipse cx="40" cy="40" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="40" cy="40" rx="4" ry="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="40" cy="40" r="2" fill="currentColor" />
      <path fill="currentColor" d="M16 58h48l-6 7H22l-6-7Zm4 10h40l-6 7H26l-6-7Zm4 10h32l-6 7H30l-6-7Z" />
      <path fill="currentColor" d="M22 86c6 6 30 6 36 0v5c-8 4-28 4-36 0v-5Z" />
    </svg>
  );
}

export function ServiceStripes({ count }: { count: number }) {
  return (
    <svg viewBox="0 0 72 64" className="insignia-svg" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <rect key={i} x="8" y={6 + i * 11} width="56" height="6" transform={`rotate(-18 36 ${9 + i * 11})`} fill="currentColor" />
      ))}
    </svg>
  );
}

export function EswsPin() {
  return (
    <svg viewBox="0 0 120 48" className="pin-svg" aria-hidden="true">
      <path fill="currentColor" d="M8 30c10-2 18-10 28-12 8 8 16 12 24 12s16-4 24-12c10 2 18 10 28 12-8 8-20 12-52 12S16 38 8 30Z" />
      <path fill="currentColor" d="M58 8h4l6 16h-16L58 8Z" />
      <path fill="none" stroke="currentColor" strokeWidth="2" d="M20 18c14-10 22-8 30-2" />
    </svg>
  );
}

export function ExwPin() {
  return (
    <svg viewBox="0 0 120 48" className="pin-svg" aria-hidden="true">
      <path fill="currentColor" d="M10 34c16-6 28-8 50-8s34 2 50 8c-12 6-28 8-50 8S22 40 10 34Z" />
      <path fill="currentColor" d="M58 6h4v22h-4V6Zm-10 14h24v3H48v-3Z" />
      <text x="60" y="30" textAnchor="middle" fontSize="7" fill="var(--color-ink)">
        EXW
      </text>
    </svg>
  );
}

export function UniformPlate({ variant }: { variant: string }) {
  const raw = useId().replace(/:/g, "");
  const skin = "var(--color-ivory-dim)";
  const nwu = `${raw}-nwu`;
  const wood = `${raw}-wood`;
  const desert = `${raw}-desert`;
  const acu = `${raw}-acu`;
  const multi = `${raw}-multi`;
  return (
    <svg viewBox="0 0 120 168" className="uniform-svg" aria-hidden="true">
      <defs>
        <pattern id={nwu} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#1a3e78" />
          <rect width="4" height="3" fill="#8ea4bc" />
          <rect x="4" y="4" width="3" height="4" fill="#0d1c33" />
        </pattern>
        <pattern id={wood} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#3d4c2e" />
          <rect width="6" height="5" fill="#6d7a45" />
          <rect x="7" y="6" width="6" height="6" fill="#24301c" />
          <rect x="2" y="8" width="4" height="3" fill="#8a7848" />
        </pattern>
        <pattern id={desert} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#c2a36a" />
          <rect width="7" height="6" fill="#8b7044" />
          <rect x="8" y="7" width="7" height="7" fill="#d9c59a" />
          <rect x="3" y="9" width="4" height="4" fill="#6d5838" />
        </pattern>
        <pattern id={acu} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#8d8f86" />
          <rect width="4" height="3" fill="#5e615a" />
          <rect x="4" y="4" width="4" height="4" fill="#b7b8b0" />
        </pattern>
        <pattern id={multi} width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#b69762" />
          <path d="M0 8c4-6 8 2 12-2 2 6-2 8-6 10S2 14 0 8Z" fill="#6a5a38" />
          <path d="M8 0c6 4 2 8 6 12-6 2-10-2-12-6 2-4 4-4 6-6Z" fill="#7d8458" />
          <circle cx="14" cy="14" r="3" fill="#3e4634" />
        </pattern>
      </defs>
      <Man
        variant={variant}
        skin={skin}
        fills={{
          nwu: `url(#${nwu})`,
          wood: `url(#${wood})`,
          desert: `url(#${desert})`,
          acu: `url(#${acu})`,
          multi: `url(#${multi})`,
        }}
      />
    </svg>
  );
}

function Man({
  variant,
  skin,
  fills: camo,
}: {
  variant: string;
  skin: string;
  fills: { nwu: string; wood: string; desert: string; acu: string; multi: string };
}) {
  const fills: Record<string, { shirt: string; pant: string; hat: string; trim?: string }> = {
    smurf: { shirt: "#3d6ea5", pant: "#315988", hat: "#f4f0e6" },
    dungaree: { shirt: "#8eafd0", pant: "#2c4f86", hat: "#f4f0e6" },
    johnny: { shirt: "#16181c", pant: "#101114", hat: "#111" },
    "crackerjack-blue": { shirt: "#0e2244", pant: "#0e2244", hat: "#f7f4ec", trim: "#f4f0e6" },
    "crackerjack-white": { shirt: "#f7f4ec", pant: "#f7f4ec", hat: "#f7f4ec", trim: "#0e2244" },
    "working-white": { shirt: "#f4f1e8", pant: "#f4f1e8", hat: "#f7f4ec" },
    utility: { shirt: "#6d764e", pant: "#5c6542", hat: "#4e5538" },
    coverall: { shirt: "#1c3358", pant: "#1c3358", hat: "#14243f" },
    nwu: { shirt: camo.nwu, pant: camo.nwu, hat: "#1a3e78" },
    woodland: { shirt: camo.wood, pant: camo.wood, hat: "#3d4c2e" },
    desert: { shirt: camo.desert, pant: camo.desert, hat: "#c2a36a" },
    acu: { shirt: camo.acu, pant: camo.acu, hat: "#8d8f86" },
    multicam: { shirt: camo.multi, pant: camo.multi, hat: "#6a5a38" },
    khaki: { shirt: "#c6b48a", pant: "#b7a47a", hat: "#f4f0e6", trim: "#1a1a1a" },
  };
  const c = fills[variant] ?? fills.utility;
  const dark = variant === "crackerjack-white" || variant === "working-white" ? "#c4a35a" : "#0c1420";
  return (
    <g>
      <circle cx="60" cy="28" r="12" fill={skin} />
      <path d={hatPath(variant)} fill={c.hat} stroke={dark} strokeWidth="0.6" />
      <path d="M38 48h44l8 18v62H30V66l8-18Z" fill={c.shirt} stroke={dark} strokeWidth="0.8" />
      <path d="M30 112h60v28c-8 10-52 10-60 0v-28Z" fill={c.pant} />
      {c.trim && variant.startsWith("crackerjack") ? (
        <path d="M42 50h36l-6 16H48L42 50Z" fill="none" stroke={c.trim} strokeWidth="2" />
      ) : null}
      {variant === "khaki" ? <path d="M58 50h4v28h-4Z" fill="#16181c" /> : null}
      {variant === "johnny" ? (
        <g fill="#c9ccd1">
          <circle cx="52" cy="62" r="1.2" />
          <circle cx="52" cy="72" r="1.2" />
          <circle cx="52" cy="82" r="1.2" />
        </g>
      ) : null}
    </g>
  );
}

function hatPath(variant: string): string {
  if (variant === "khaki") return "M40 24h40v6H40z M44 16h32v8H44z";
  if (variant === "johnny") return "M42 22h36v4H42z";
  return "M42 20h36l-4 8H46l-4-8Z";
}
