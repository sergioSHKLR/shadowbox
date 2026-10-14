import { useState } from "react";
import type { Chrome } from "@/lib/shadowbox/copy";
import { awards, medalFor, medalRows, ribbonRows, type Award, type Kind } from "@/lib/shadowbox/model";
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
        <div className="decor-rack" aria-label={c.mounted}>
          {rows.map((row) => (
            <div key={row.map((a) => a.id).join("-")} className="decor-rack-row">
              {row.map((award) => <RibbonButton key={award.id} award={award} onOpen={() => onOpen("award", award.id)} />)}
            </div>
          ))}
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
    return (
      <div className="decor-medals">
        <MedalBlock rows={medalRows(withMedal)} onOpen={open} />
        {ribbonOnly.length ? (
          <div className="decor-rack" aria-label={t.decor.ribbonOnlyNote}>
            {ribbonRows(ribbonOnly, 3).map((row) => (
              <div key={row.map((a) => a.id).join("-")} className="decor-rack-row">
                {row.map((award) => <RibbonButton key={award.id} award={award} onOpen={() => open(award)} />)}
              </div>
            ))}
            <p className="decor-soon">{t.decor.ribbonOnlyNote}</p>
          </div>
        ) : null}
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
