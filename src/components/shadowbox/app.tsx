import { useEffect, useMemo, useState } from "react";
import {
  awards,
  careerStops,
  openRecord,
  profile,
  publicUrl,
  ribbonRows,
  timeline,
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

      {view === "case" ? <Case rows={rows} onOpen={open} /> : null}
      {view === "uniforms" ? <Uniforms onOpen={open} /> : null}
      {view === "decorations" ? <Decorations onOpen={open} tour={tour} /> : null}
      {view === "timeline" ? <Timeline bars={bars} rows={rows} blanks={blanks} onOpen={open} onFocus={focusTour} /> : null}
      {view === "equipment" ? <EquipmentView onOpen={open} /> : null}
      {view === "map" ? <Stations stops={stops} onOpen={open} /> : null}
      {view === "sources" ? <Sources /> : null}
      {view === "contact" ? <Contact onOpenBook={() => setView("guestbook")} /> : null}
      {view === "guestbook" ? <Guestbook /> : null}

      <DetailPanel selection={selection} onSelect={setSelection} onClose={() => setSelection(null)} />
      <footer className="site-footer">
        <span>Personal record. Graphics keep the license named on Sources.</span>
        <span>Itajaí, Santa Catarina, Brazil</span>
        <button type="button" className="footer-link" onClick={() => setView("sources")}>Sources</button>
        <button type="button" className="footer-link" onClick={() => setView("contact")}>Contact</button>
        <button type="button" className="footer-link" onClick={() => setView("guestbook")}>Guestbook</button>
        <VisitorCount />
      </footer>
    </div>
  );
}
