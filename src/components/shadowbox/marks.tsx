import type { Award, Device } from "@/lib/shadowbox/model";
import { countPhrase, deviceSummary, publicUrl } from "@/lib/shadowbox/model";

const DEVICE_ART: Record<string, string> = {
  "star-gold": "/devices/star-gold-b.svg",
  "star-silver": "/devices/star-silver.svg",
  "star-bronze": "/devices/star-bronze.svg",
  "oak-bronze": "/devices/oak-bronze-b.svg",
  "letter-silver": "/devices/e-silver-b.svg",
};

/** Devices are drawn from the case-item art in public/devices. */
function deviceArt(device: Device): string {
  const key = `${device.kind}-${device.metal}`;
  return DEVICE_ART[key] ?? DEVICE_ART[device.kind === "oak" ? "oak-bronze" : device.kind === "letter" ? "letter-silver" : "star-bronze"];
}

export function Devices({ devices }: { devices: Device[] }) {
  const glyphs = devices.flatMap((device, di) =>
    Array.from({ length: device.count }, (_, i) => ({ device, key: `${di}-${i}` })),
  );
  if (!glyphs.length) return null;
  return (
    <span className={glyphs.length >= 4 ? "devices dense" : "devices"}>
      {glyphs.map(({ device, key }) => (
        <img key={key} className={`glyph glyph-${device.kind} metal-${device.metal}`} src={publicUrl(deviceArt(device))} alt="" />
      ))}
    </span>
  );
}

/** A ribbon with its devices, drawn at any width. Devices scale with the ribbon. */
export function RibbonArt({ award, className }: { award: Award; className?: string }) {
  return (
    <span className={[award.framed ? "ribbon framed" : "ribbon", className].filter(Boolean).join(" ")}>
      <img src={publicUrl(award.ribbon)} alt="" />
      <Devices devices={award.devices} />
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
      <img src={publicUrl(award.ribbon)} alt="" />
      <Devices devices={award.devices} />
    </button>
  );
}

export function CareerGlyph({ image, glyph }: { image?: string; glyph?: string }) {
  if (!image) return null;
  const pin = glyph === "esws" || glyph === "exw";
  return <img className={pin ? "pin-img" : "insignia-img"} src={publicUrl(image)} alt="" />;
}
