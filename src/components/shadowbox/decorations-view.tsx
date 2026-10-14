import { useState } from "react";
import type { Chrome } from "@/lib/shadowbox/copy";
import { awards, medalFor, medalRows, ribbonRows, type Award, type Kind } from "@/lib/shadowbox/model";
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
    const five: Award[][] = [];
    for (let i = 0; i < withMedal.length; i += 5) five.push(withMedal.slice(i, i + 5));
    const right = ribbonOnly.length ? <Rack rows={ribbonRows(ribbonOnly, 3)} mirror onOpen={open} label={t.decor.ribbonOnlyNote} /> : null;
    return (
      <div className="decor-two-col">
        <div className="decor-full-dress">
          <BreastLeft>
            <div className="decor-medal-grid">
              {five.map((row, r) => (
                <div key={row.map((a) => a.id).join("-")} className="decor-medal-row">
                  {r === five.length - 1 && right ? <div className="decor-right-ribbons decor-right-ribbons--wide">{right}</div> : null}
                  {row.map((award, i) => (
                    <button key={award.id} type="button" className="decor-medal-btn" style={{ zIndex: row.length - i }} aria-label={award.name} onClick={() => open(award)}>
                      <MedalArt award={award} medal={medalFor(award.id)!} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </BreastLeft>
          {right ? <div className="decor-right-ribbons decor-right-ribbons--narrow">{right}</div> : null}
        </div>

      </div>
    );
  }
  return (
    <ol className="decor-loose decor-loose-medals" aria-label={t.decor.unmounted}>
      {ordered.map((award) => {
        const medal = medalFor(award.id);
        return (
          <li key={award.id}>
            <button type="button" className="decor-loose-btn" onClick={() => open(award)}>
              {medal ? <span className="decor-one-medal"><MedalArt award={award} medal={medal} /></span> : <RibbonArt award={award} />}
              <span>{award.name}</span>
            </button>
          </li>
        );
      })}
    </ol>
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
