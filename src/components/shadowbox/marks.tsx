import type { Award, Device } from "@/lib/shadowbox/model";
import { countPhrase, deviceSummary, publicUrl } from "@/lib/shadowbox/model";

const DEVICE_ART: Record<string, string> = {
  "star-gold": "/devices/star-gold-b.svg",
  "star-silver": "/devices/star-silver.svg",
  "star-bronze": "/devices/star-bronze.svg",
  "oak-bronze": "/devices/oak-bronze-b.svg",
  "letter-silver-battle": "/devices/e-battle-silver.svg",
  "letter-silver-expert": "/devices/e-expert-silver.svg",
};

/** The JMUA gold frame with its laurel band (the same art as the printable case item). It is drawn inside the ribbon's footprint. */
const JMUA_FRAME = "/devices/jmua-frame.svg";

/** Devices are drawn from the case-item art in public/devices. */
function deviceArt(device: Device): string {
  const key = device.kind === "letter" ? `letter-silver-${device.style ?? "expert"}` : `${device.kind}-${device.metal}`;
  return DEVICE_ART[key] ?? DEVICE_ART[device.kind === "oak" ? "oak-bronze" : device.kind === "letter" ? "letter-silver-expert" : "star-bronze"];
}

export function Devices({ devices }: { devices: Device[] }) {
  const glyphs = devices.flatMap((device, di) =>
    Array.from({ length: device.count }, (_, i) => ({ device, key: `${di}-${i}` })),
  );
  if (!glyphs.length) return null;
  return (
    <span className={glyphs.length >= 4 ? "devices dense" : "devices"}>
      {glyphs.map(({ device, key }) => (
        <img key={key} className={`glyph glyph-${device.kind}${device.style ? ` glyph-e-${device.style}` : ""} metal-${device.metal}`} src={publicUrl(deviceArt(device))} alt="" />
      ))}
    </span>
  );
}

/** A ribbon with its devices, drawn at any width. Devices scale with the ribbon. */
export function RibbonArt({ award, className }: { award: Award; className?: string }) {
  return (
    <span className={[award.framed ? "ribbon framed" : "ribbon", className].filter(Boolean).join(" ")}>
      <img src={publicUrl(award.ribbon)} alt="" />
      {award.framed ? <img className="ribbon-frame" src={publicUrl(JMUA_FRAME)} alt="" /> : null}
      <Devices devices={award.devices} />
    </span>
  );
}

export function RibbonButton({
  award,
  onOpen,
  wiki = false,
}: {
  award: Award;
  onOpen: () => void;
  /** Use the Wikimedia Commons ribbon art (its JMUA file already carries the gold frame). */
  wiki?: boolean;
}) {
  const label = `${award.name}. ${countPhrase(award)}. ${deviceSummary(award)}. Open the explanation.`;
  const useWiki = wiki && Boolean(award.ribbonWiki);
  const framed = award.framed && !useWiki;
  return (
    <button type="button" className={framed ? "ribbon framed" : useWiki ? "ribbon wiki" : "ribbon"} onClick={onOpen} aria-label={label}>
      <img src={publicUrl(useWiki ? award.ribbonWiki! : award.ribbon)} alt="" />
      {framed ? <img className="ribbon-frame" src={publicUrl(JMUA_FRAME)} alt="" /> : null}
      <Devices devices={award.devices} />
    </button>
  );
}

export function CareerGlyph({ image, glyph }: { image?: string; glyph?: string }) {
  if (!image) return null;
  const pin = glyph === "esws" || glyph === "exw";
  return <img className={pin ? "pin-img" : "insignia-img"} src={publicUrl(image)} alt="" />;
}
