import { useState } from "react";
import type { Chrome } from "@/lib/shadowbox/copy";
import { awards, medalFor, medalRows, ribbonPhotoFor, ribbonRows, type Award, type Kind } from "@/lib/shadowbox/model";
import { publicUrl } from "@/lib/shadowbox/model";
import { MedalArt, MedalBlock, RibbonArt, RibbonButton } from "@/components/shadowbox/marks";

/**
 * Decorations (restored Oct 14 2026). Two segmented controls: Display (Ribbons only / Medals and ribbons) and
 * Mounting (Mounted rack / Unmounted, one by one in precedence order). Medals and ribbons uses the medal rasters
 * already in the repo (Sergio, for now); awards with no medal image stay ribbon-only in that view.
 */
export function Decorations({ onOpen, title, t }: { onOpen: (k: Kind, id: string) => void; title: string; t: Chrome }) {
  const c = t.decor;
  const [show, setShow] = useState<"ribbons" | "medals">("ribbons");
  const [mount, setMount] = useState<"mounted" | "unmounted">("mounted");
  const ordered = [...awards].sort((a, b) => a.precedence - b.precedence);
  const rows = ribbonRows(awards, 3);
  return (
    <main className="sheet decor-page">
      <h2>{title}</h2>
      <p>{c.lead}</p>
      <div className="decor-controls">
        <div className="decor-seg" role="group" aria-label={c.display}>
          <span className="decor-seg-label">{c.display}</span>
          <button type="button" className={show === "ribbons" ? "nav-btn on" : "nav-btn"} aria-pressed={show === "ribbons"} onClick={() => setShow("ribbons")}>{c.ribbonsOnly}</button>
          <button type="button" className={show === "medals" ? "nav-btn on" : "nav-btn"} aria-pressed={show === "medals"} onClick={() => setShow("medals")}>{c.medalsRibbons}</button>
        </div>
        <div className="decor-seg" role="group" aria-label={c.mounting}>
          <span className="decor-seg-label">{c.mounting}</span>
          <button type="button" className={mount === "mounted" ? "nav-btn on" : "nav-btn"} aria-pressed={mount === "mounted"} onClick={() => setMount("mounted")}>{c.mounted}</button>
          <button type="button" className={mount === "unmounted" ? "nav-btn on" : "nav-btn"} aria-pressed={mount === "unmounted"} onClick={() => setMount("unmounted")}>{c.unmounted}</button>
        </div>
      </div>
      {show === "medals" ? <MedalsView mount={mount} onOpen={onOpen} t={t} /> : mount === "mounted" ? (
        <div className="decor-worn">
          <BreastLeft>
            <Rack rows={rows} onOpen={(a) => onOpen("award", a.id)} label={c.mounted} />
          </BreastLeft>
        </div>
      ) : (
        <ol className="decor-loose" aria-label={c.unmounted}>
          {ordered.map((award) => (
            <li key={award.id}>
              <button type="button" className="decor-loose-btn" onClick={() => onOpen("award", award.id)}>
                <RibbonArt award={award} />
                <span>{award.name}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

/** Mounted photo fronts (Oct 17 2026), matched to Sergio's own mount (album PXL_20231111_234949714). Every row hangs
 *  from its own ring line, 0.85 of a pendant height below the row above; all suspension ribbons are cropped at the top
 *  to the shortest drape, so the upper medals hide most of each lower drape and only slivers show in the gaps (v2,
 *  after Sergio's feedback: lower drapes are no longer cut away). Per photo: [y of the suspension ring, image height],
 *  in px of the 360 px wide -front.webp (medals/sergio/overlap/front-metrics.json). */
const HANG: Record<string, [number, number]> = {
  aam: [347, 771], acm: [351, 748], arcom: [312, 769], gwotsm: [361, 759], hsm: [352, 757], icm: [352, 745],
  jsam: [358, 758], jscm: [364, 764], nam: [341, 751], nato: [379, 753], ncm: [358, 744], ndsm: [371, 761],
  ngcm: [343, 762], pistol: [355, 753], rifle: [326, 755],
};
/** Medals whose drape devices sit on the visible part of the ribbon when overlapped (art. 5316.2.e): <id>-mount.webp. */
const MOUNT_VARIANT = new Set(["arcom", "nam", "ngcm", "acm", "icm"]);
const PHOTO_W = 360;
/** Reference: rows hang 0.85 of a pendant height apart (mean pendant body 351 px). */
const ROW_STEP = 299;
const BTN_MI = 1.375; // button width in --mi (1 3/8 in ribbon)
function mountLayout(rows: Award[][]) {
  const px = (v: number) => (v / PHOTO_W) * BTN_MI; // image px -> --mi
  const drape = Math.min(...rows.flat().map((a) => HANG[a.id]?.[0] ?? PHOTO_W));
  return rows.map((row, r) => {
    const items = row.map((award, i) => {
      const [ring, h] = HANG[award.id] ?? [drape, PHOTO_W * 2];
      // Lower rows: ribbon cropped to start at the ring line of the row above (as if tucked under its holding bar).
      const from = r === 0 ? ring - drape : ring - ROW_STEP;
      const src = i > 0 && MOUNT_VARIANT.has(award.id) ? `/medals/photo/${award.id}-mount.webp` : medalFor(award.id)!.front!;
      // marginTop is a % of the button width; clip-path inset is a % of the image height.
      return { award, src, top: (from / PHOTO_W) * 100, clip: (from / h) * 100, rest: h - from };
    });
    // Row boxes: the top row's starts at the top of its cropped drapes, each lower row's at the ring line above, so a
    // row's box height is the distance from its top to its own ring line (the next row starts there).
    const height = r === rows.length - 1 ? px(Math.max(...items.map((i) => i.rest)) + 4) : px(r === 0 ? drape : ROW_STEP);
    return { row, height, items };
  });
}

function MedalsView({ mount, onOpen, t }: { mount: "mounted" | "unmounted"; onOpen: (k: Kind, id: string) => void; t: Chrome }) {
  const ordered = [...awards].sort((a, b) => a.precedence - b.precedence);
  const withMedal = ordered.filter((a) => medalFor(a.id));
  const ribbonOnly = ordered.filter((a) => !medalFor(a.id));
  const open = (a: Award) => onOpen("award", a.id);
  if (mount === "mounted") {
    // Mounted medals and ribbons (Sergio, Oct 14 2026, v4), per NAVPERS 15665J art. 5313: large medals on the left
    // breast, five per row, overlapping half a width with the senior (inboard, viewer's left) medal on top. Ribbons with
    // no large medal go on the right breast, centred at the height of the lowest medal holding bar, in rows of three
    // (art. 5312: top row holds the lesser number), precedence top down and inboard to outboard. On the right breast
    // inboard is the viewer's right, so each row reads mirrored from the left-breast rack.
    // Photos (Oct 17 2026): 3 rows of 5, senior at the wearer's right (viewer's left) of the top row, each upper row
    // overlapping the row below. Ribbon-only awards (no medal photo) sit in their own section below, not beside photos.
    const five: Award[][] = [];
    for (let i = 0; i < withMedal.length; i += 5) five.push(withMedal.slice(i, i + 5));
    return (
      <div className="decor-photo-wrap">
        <div className="decor-full-dress">
          <BreastLeft>
            <div className="decor-medal-grid decor-medal-grid--photo">
              {mountLayout(five).map(({ row, height, items }, r) => (
                <div key={row.map((a) => a.id).join("-")} className="decor-medal-row" style={{ zIndex: five.length - r, height: `calc(var(--mi) * ${height})` }}>
                  {items.map(({ award, src, top, clip }, i) => (
                    <button key={award.id} type="button" className="decor-medal-btn" style={{ zIndex: row.length - i }} aria-label={award.name} onClick={() => open(award)}>
                      <span className="medal-art medal-art-raster">
                        <img className="medal-raster" src={publicUrl(src)} alt="" style={{ marginTop: `${-top}%`, clipPath: `inset(${clip}% 0 0 0)` }} />
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </BreastLeft>
        </div>
        <RibbonOnly list={ribbonOnly} open={open} t={t} />
      </div>
    );
  }
  return (
    <>
    <ol className="decor-loose decor-loose-medals" aria-label={t.decor.unmounted}>
      {withMedal.map((award) => {
        const medal = medalFor(award.id);
        return (
          <li key={award.id}>
            <button type="button" className="decor-loose-btn" onClick={() => open(award)}>
              <span className="decor-one-medal"><MedalArt award={award} medal={medal!} /></span>
              <span>{award.name}</span>
            </button>
          </li>
        );
      })}
    </ol>
    <RibbonOnly list={ribbonOnly} open={open} t={t} />
    </>
  );
}

/** Awards with no medal photo yet (unit awards, Navy E, service ribbons): their own section, apart from the photos. */
function RibbonOnly({ list, open, t }: { list: Award[]; open: (a: Award) => void; t: Chrome }) {
  if (!list.length) return null;
  return (
    <section className="decor-ribbon-only" aria-labelledby="decor-ribbon-only-h">
      <h3 id="decor-ribbon-only-h">{t.decor.ribbonOnlyHead}</h3>
      <p className="quiet">{t.decor.ribbonOnlyNote}</p>
      {list.every((a) => ribbonPhotoFor(a.id)) ? (
        // Photos (Oct 17 2026): same 2-over-3 rack layout as the vector rack, precedence top down.
        <div className="decor-rack decor-rack--photo" aria-label={t.decor.ribbonOnlyHead}>
          {ribbonRows(list, 3).map((row) => (
            <div key={row.map((a) => a.id).join("-")} className="decor-rack-row">
              {row.map((award) => (
                <button key={award.id} type="button" className="ribbon ribbon-photo-btn" aria-label={`${award.name}. Open the explanation.`} title={award.name} onClick={() => open(award)}>
                  <img src={publicUrl(ribbonPhotoFor(award.id)!.small)} alt="" width={300} height={82} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Rack rows={ribbonRows(list, 3)} onOpen={open} label={t.decor.ribbonOnlyHead} />
      )}
    </section>
  );
}

function Rack({ rows, onOpen, label, mirror = false }: { rows: Award[][]; onOpen: (a: Award) => void; label: string; mirror?: boolean }) {
  return (
    <div className="decor-rack" aria-label={label}>
      {rows.map((row) => (
        <div key={row.map((a) => a.id).join("-")} className="decor-rack-row">
          {(mirror ? [...row].reverse() : row).map((award) => <RibbonButton key={award.id} award={award} onOpen={() => onOpen(award)} />)}
        </div>
      ))}
    </div>
  );
}

/**
 * Left breast as worn (Navy Uniform Regulations 5301/5302): primary warfare pin (ESWS) centred 1/4 in above the ribbons
 * or medals; secondary warfare pin (EXW) centred 1/4 in below them. JCSE device centred below the EXW pin (Sergio,
 * Oct 14 2026, v4).
 */
function BreastLeft({ children }: { children: React.ReactNode }) {
  return (
    <div className="decor-left-breast">
      <img className="decor-pin" src={publicUrl("/case/esws-pin.svg")} alt="Enlisted Surface Warfare Specialist pin" />
      {children}
      <img className="decor-pin" src={publicUrl("/case/exw-pin.svg")} alt="Expeditionary Warfare Specialist pin" />
      <img className="decor-jcse" src={publicUrl("/insignia/jcse-device.svg")} alt="JCSE device" />
    </div>
  );
}
