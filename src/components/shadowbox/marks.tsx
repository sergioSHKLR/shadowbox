import type { Award, Device, Medal } from "@/lib/shadowbox/model";
import { countPhrase, deviceSummary, medalFor, publicUrl, ribbonDevicePlate, ribbonPlate } from "@/lib/shadowbox/model";

export function Devices({ devices }: { devices: Device[] }) {
  void devices;
  return null;
}

/** A ribbon plate with devices already drawn. No overlay. */
export function RibbonArt({ award, className }: { award: Award; className?: string }) {
  const src = ribbonPlate(award);
  const devices = ribbonDevicePlate(award);
  const cls = ["ribbon", award.framed ? "framed" : "", className].filter(Boolean).join(" ");
  if (!src) return <span className={[cls, "ribbon-text"].join(" ")}>{award.abbreviation}</span>;
  return (
    <span className={cls}>
      <img src={publicUrl(src)} alt="" />
      {devices ? <img className="ribbon-device" src={publicUrl(devices)} alt="" /> : null}
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
  const src = ribbonPlate(award);
  const devices = ribbonDevicePlate(award);
  const cls = ["ribbon", award.framed ? "framed" : "", src ? "" : "ribbon-text"].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} onClick={onOpen} aria-label={label}>
      {src ? <img src={publicUrl(src)} alt="" /> : award.abbreviation}
      {src && devices ? <img className="ribbon-device" src={publicUrl(devices)} alt="" /> : null}
    </button>
  );
}

export function CareerGlyph({ image, glyph }: { image?: string; glyph?: string }) {
  if (!image) return null;
  const pin = glyph === "esws" || glyph === "exw";
  return <img className={pin ? "pin-img" : "insignia-img"} src={publicUrl(image)} alt="" />;
}

/* ---------- Full-size (large) medals ----------
   Measurements are in inches through --mi (one inch in CSS px), which the case sets to its --in.
   The suspension ribbon is 1 3/8 in wide; every medal is 3 1/4 in from the top of the ribbon to the bottom of the
   medallion so the bottoms dress in a line (NAVPERS 15665J art. 5314.1). */
const RIBBON_IN = 1.375;
const ROW_IN = 3.25;
/** Large-medal attachment widths in inches: 3/16 in bronze/silver stars, 5/16 in gold stars (art. 5316.3.b),
 *  7/16 in oak leaf clusters (art. 5316.3.a; drawn 1.4x the ribbon-bar cluster art). */
function deviceWidthIn(device: Device): number {
  if (device.kind === "star") return device.metal === "gold" ? 5 / 16 : 3 / 16;
  if (device.kind === "oak") return 0.58;
  return 0.25;
}

export function MedalArt({
  award,
  medal,
  visibleIn = RIBBON_IN,
}: {
  award: Award;
  medal: Medal;
  /** Width of the suspension ribbon left uncovered by the medal inboard of it (the wearer's-left part). */
  visibleIn?: number;
}) {
  if (!medal.front) return null;
  const glyphs = award.devices.reduce((n, d) => n + d.count, 0);
  const rowWidth = award.devices.reduce((w, d) => w + d.count * deviceWidthIn(d), 0) + Math.max(0, glyphs - 1) / 32;
  // Art. 5316.2.e: when medals overlap, attachments move to the wearer's left, centred on the visible part of the
  // ribbon; if they still do not fit, they may be worn vertically.
  const vertical = rowWidth > visibleIn - 0.06;
  const drapeIn = ROW_IN - medal.h + 0.06;
  return (
    <span className="medal-art">
      <span className={`medal-drape drape-${medal.drape}`} style={{ height: `calc(var(--mi) * ${drapeIn})` }}>
        <img src={publicUrl(award.ribbon)} alt="" />
        <span className="medal-shade" />
        {glyphs ? (
          <span
            className={vertical ? "medal-devices vertical" : "medal-devices"}
            style={{ left: `calc(var(--mi) * ${RIBBON_IN - visibleIn})`, width: `calc(var(--mi) * ${visibleIn})` }}
          >
            <Devices devices={award.devices} />
          </span>
        ) : null}
        {medal.clasp ? <span className="medal-clasp">{medal.clasp}</span> : null}
      </span>
      <img className="medal-pendant" src={publicUrl(medal.front)} alt="" style={{ width: `calc(var(--mi) * ${medal.w})` }} />
    </span>
  );
}

/** The large medals as worn: rows per Table 5-3-1, senior medal top row inboard (the viewer's left), up to three side by
 *  side, four or five overlapped proportionally with the inboard medal in full, each row covering the ribbons below. */
export function MedalBlock({ rows, onOpen }: { rows: Award[][]; onOpen: (award: Award) => void }) {
  const PITCH = 1.6;
  const BAR = RIBBON_IN * 3; // 4 1/8 in holding bar
  const height = (rows.length - 1) * PITCH + ROW_IN;
  return (
    <div className="medal-block" style={{ width: `calc(var(--mi) * ${BAR})`, height: `calc(var(--mi) * ${height})` }}>
      {rows.map((row, r) => {
        const n = row.length;
        const step = n <= 3 ? RIBBON_IN : (BAR - RIBBON_IN) / (n - 1);
        const start = n <= 3 ? (BAR - n * RIBBON_IN) / 2 : 0;
        return row.map((award, i) => {
          const medal = medalFor(award.id);
          if (!medal) return null;
          const label = `${award.name}, full-size medal. ${countPhrase(award)}. ${deviceSummary(award)}. Open the medal.`;
          return (
            <button
              key={award.id}
              type="button"
              className="medal"
              aria-label={label}
              onClick={() => onOpen(award)}
              style={{
                left: `calc(var(--mi) * ${start + i * step})`,
                top: `calc(var(--mi) * ${r * PITCH})`,
                zIndex: (rows.length - r) * 10 + (n - i),
              }}
            >
              <MedalArt award={award} medal={medal} visibleIn={n > 3 && i > 0 ? step : RIBBON_IN} />
            </button>
          );
        });
      })}
    </div>
  );
}
