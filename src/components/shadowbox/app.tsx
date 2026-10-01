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
import { searchRecord, type Hit } from "@/lib/shadowbox/search";
import { DetailPanel } from "@/components/shadowbox/detail";
import { Case } from "@/components/shadowbox/case-view";
import { Timeline } from "@/components/shadowbox/timeline-view";
import { Uniforms } from "@/components/shadowbox/uniforms-view";
import { Decorations } from "@/components/shadowbox/decorations-view";
import { EquipmentView } from "@/components/shadowbox/equipment-view";
import { OffDuty, Ops } from "@/components/shadowbox/ops-view";
import { Stations } from "@/components/shadowbox/stations";
import { Sources } from "@/components/shadowbox/sources-view";
import { Contact, Guestbook, VisitorCount } from "@/components/shadowbox/footer-pages";
import { Memories } from "@/components/shadowbox/memories-view";

type View = "case" | "uniforms" | "decorations" | "timeline" | "ops" | "onduty" | "offduty" | "map" | "sources" | "contact" | "guestbook" | "memories";

const NAV: { id: View; label: string }[] = [
  { id: "case", label: "Case" },
  { id: "uniforms", label: "Uniforms" },
  { id: "decorations", label: "Decorations" },
  { id: "timeline", label: "Timeline" },
  { id: "ops", label: "Ops" },
  { id: "onduty", label: "On Duty" },
  { id: "offduty", label: "Off Duty" },
  { id: "map", label: "Map" },
];

function printAs(mode: "book" | "case-a4" | "case-a3") {
  document.body.classList.remove("print-case-a4", "print-case-a3");
  if (mode === "case-a4") document.body.classList.add("print-case-a4");
  if (mode === "case-a3") document.body.classList.add("print-case-a3");
  window.print();
}

export function ShadowboxApp() {
  const [view, setView] = useState<View>("case");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [trail, setTrail] = useState<Selection[]>([]);
  const [tour] = useState<TourFocus | null>(null);
  const open = (kind: Kind, id: string) => {
    const next = { kind, id };
    setSelection(next);
    setTrail([next]);
  };
  const follow = (next: Selection) => {
    setSelection(next);
    setTrail((current) => {
      const at = current.findIndex((item) => item.kind === next.kind && item.id === next.id);
      return at >= 0 ? current.slice(0, at + 1) : [...current, next];
    });
  };
  const rows = useMemo(() => ribbonRows(awards), []);
  const bars = useMemo(() => timeline(), []);
  const stops = useMemo(() => careerStops(), []);
  const blanks = useMemo(() => openRecord(), []);
  const hits = useMemo(() => searchRecord(query), [query]);
  const pane = (id: View) => (view === id ? "view-pane" : "view-pane screen-off");
  const take = (hit: Hit) => {
    if ("view" in hit.open) setView(hit.open.view as View);
    else open(hit.open.kind, hit.open.id);
    setQuery("");
    setMenu(false);
  };

  useEffect(() => {
    document.title = profile.pageTitle;
  }, []);
  useEffect(() => {
    const clear = () => document.body.classList.remove("print-case-a4", "print-case-a3");
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, []);

  return (
    <div className="archive case-wide">
      <div className="case-frame">
        <div className="felt-bar">
          <img src={publicUrl("/favicon.svg")} alt="" />
          <div><strong>SHADOWBOX</strong><span>U.S. Navy</span></div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search the record" />
          <button type="button" className="felt-menu" aria-label="Menu" onClick={() => setMenu((open) => !open)}>&#9776;</button>
          {menu ? (
            <ul className="felt-menu-list">
              {NAV.map((item) => (
                <li key={item.id}><button type="button" onClick={() => { setView(item.id); setMenu(false); }}>{item.label}</button></li>
              ))}
            </ul>
          ) : null}
          {query.trim().length >= 2 ? (
            <ul className="search-hits">
              {hits.length ? hits.map((hit) => (
                <li key={`${hit.kindLabel}-${hit.title}`}>
                  <button type="button" onClick={() => take(hit)}>
                    <small>{hit.kindLabel}</small>
                    <strong>{hit.title}</strong>
                    <span>{hit.snippet}</span>
                  </button>
                </li>
              )) : <li className="search-empty">No match in the record.</li>}
            </ul>
          ) : null}
        </div>
        <div className="felt-surface">
      <div className={`${pane("case")} view-case`}><Case rows={rows} onOpen={open} query={query} /></div>
      <div className={pane("uniforms")}><Uniforms onOpen={open} /></div>
      <div className={pane("decorations")}><Decorations onOpen={open} tour={tour} /></div>
      <div className={pane("timeline")}><Timeline bars={bars} rows={rows} blanks={blanks} onOpen={open} /></div>
      <div className={pane("ops")}><Ops onOpen={open} /></div>
      <div className={pane("onduty")}><EquipmentView onOpen={open} /></div>
      <div className={pane("offduty")}><OffDuty onOpen={open} /></div>
      <div className={pane("map")}><Stations stops={stops} onOpen={open} /></div>
      <div className={`${pane("sources")} no-book`}><Sources /></div>
      <div className={`${pane("contact")} no-book`}><Contact onOpenBook={() => setView("guestbook")} /></div>
      <div className={`${pane("guestbook")} no-book`}><Guestbook /></div>
      <div className={`${pane("memories")} no-book`}><Memories /></div>

        </div>
      </div>
      <DetailPanel selection={selection} trail={trail} onSelect={follow} onClose={() => { setSelection(null); setTrail([]); }} />
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
        <button type="button" className="footer-link" onClick={() => setView("memories")}>Memories</button>
        <button type="button" className="footer-link" onClick={() => printAs("book")}>Print the book</button>
        <button type="button" className="footer-link" onClick={() => printAs("case-a4")}>Case A4</button>
        <button type="button" className="footer-link" onClick={() => printAs("case-a3")}>Case A3</button>
        <VisitorCount />
      </footer>
    </div>
  );
}
