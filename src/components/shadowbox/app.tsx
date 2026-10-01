import { useEffect, useMemo, useState } from "react";
import {
  awards,
  careerStops,
  openRecord,
  profile,
  publicUrl,
  ribbonRows,
  timeline,
  units,
  warfare,
  type Kind,
  type Selection,
  type TourFocus,
} from "@/lib/shadowbox/model";
import { DetailPanel } from "@/components/shadowbox/detail";
import { Case } from "@/components/shadowbox/case-view";
import { Timeline } from "@/components/shadowbox/timeline-view";
import { Uniforms } from "@/components/shadowbox/uniforms-view";
import { Decorations } from "@/components/shadowbox/decorations-view";
import { EquipmentView } from "@/components/shadowbox/equipment-view";
import { Stations } from "@/components/shadowbox/stations";
import { Sources } from "@/components/shadowbox/sources-view";
import { Contact, Guestbook, VisitorCount } from "@/components/shadowbox/footer-pages";

type View = "case" | "uniforms" | "decorations" | "timeline" | "equipment" | "map" | "sources" | "contact" | "guestbook";

const NAV: { id: View; label: string }[] = [
  { id: "case", label: "Case" },
  { id: "uniforms", label: "Uniforms" },
  { id: "decorations", label: "Decorations" },
  { id: "timeline", label: "Timeline" },
  { id: "equipment", label: "Gear & Vehicles" },
  { id: "map", label: "Map" },
];

export function ShadowboxApp() {
  const [view, setView] = useState<View>("case");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [tour, setTour] = useState<TourFocus | null>(null);
  const open = (kind: Kind, id: string) => setSelection({ kind, id });
  const focusTour = (next: TourFocus) => {
    setTour(next);
    setView("decorations");
  };
  const rows = useMemo(() => ribbonRows(awards), []);
  const bars = useMemo(() => timeline(), []);
  const stops = useMemo(() => careerStops(), []);
  const blanks = useMemo(() => openRecord(), []);
  const pane = (id: View) => (view === id ? "view-pane" : "view-pane screen-off");

  useEffect(() => {
    document.title = profile.pageTitle;
  }, []);

  return (
    <div className="archive">
      <header className="mast">
        <div className="mast-brand">
          <img className="mast-icon" src={publicUrl("/favicon.svg")} alt="" />
          <div>
            <h1 className="wordmark">SHADOWBOX</h1>
            <p className="mast-tagline">Not for gawking but for learning!</p>
          </div>
        </div>
        <nav className="mast-nav" aria-label="Shadowbox sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "nav-btn on" : "nav-btn"}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <div className={pane("case")}><Case rows={rows} onOpen={open} /></div>
      <div className={pane("uniforms")}><Uniforms onOpen={open} /></div>
      <div className={pane("decorations")}><Decorations onOpen={open} tour={tour} /></div>
      <div className={pane("timeline")}><Timeline bars={bars} rows={rows} blanks={blanks} onOpen={open} onFocus={focusTour} /></div>
      <div className={pane("equipment")}><EquipmentView onOpen={open} /></div>
      <div className={pane("map")}><Stations stops={stops} onOpen={open} /></div>
      <div className={pane("sources")}><Sources /></div>
      <div className={pane("contact")}><Contact onOpenBook={() => setView("guestbook")} /></div>
      <div className={pane("guestbook")}><Guestbook /></div>

      <DetailPanel selection={selection} onSelect={setSelection} onClose={() => setSelection(null)} />
      <section className="book-appendix" aria-label="Sidebar chapters">
        <h2>Sidebars</h2>
        {units.map((unit) => (
          <article key={unit.id} className="book-chapter">
            <h2>{unit.name}</h2>
            <p>{unit.explanation}</p>
          </article>
        ))}
        {warfare.map((pin) => (
          <article key={pin.id} className="book-chapter">
            <h2>{pin.name}</h2>
            <p>{pin.explanation}</p>
          </article>
        ))}
        {awards.map((award) => (
          <article key={award.id} className="book-chapter">
            <h2>{award.name}</h2>
            <p>{award.explanation}</p>
          </article>
        ))}
      </section>
      <footer className="site-footer">
        <span>Personal record. Graphics keep the license named on Sources.</span>
        <span>Itajaí, Santa Catarina, Brazil</span>
        <button type="button" className="footer-link" onClick={() => setView("sources")}>Sources</button>
        <button type="button" className="footer-link" onClick={() => setView("contact")}>Contact</button>
        <button type="button" className="footer-link" onClick={() => setView("guestbook")}>Guestbook</button>
        <button type="button" className="footer-link" onClick={() => window.print()}>Print the book</button>
        <VisitorCount />
      </footer>
    </div>
  );
}
