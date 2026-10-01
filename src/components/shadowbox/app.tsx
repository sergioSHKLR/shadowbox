import { useEffect, useMemo, useState } from "react";
import { awards, careerStops, openRecord, profile, publicUrl, ribbonRows, timeline, units, warfare, type Kind, type Selection, type TourFocus } from "@/lib/shadowbox/model";
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
const NAV: { id: View; label: string }[] = [{ id: "case", label: "Case" }, { id: "uniforms", label: "Uniforms" }, { id: "decorations", label: "Decorations" }, { id: "timeline", label: "Timeline" }, { id: "ops", label: "Ops" }, { id: "onduty", label: "On Duty" }, { id: "offduty", label: "Off Duty" }, { id: "map", label: "Map" }];
function printAs(mode: "book" | "case-a4" | "case-a3") { document.body.classList.remove("print-case-a4", "print-case-a3"); if (mode === "case-a4") document.body.classList.add("print-case-a4"); if (mode === "case-a3") document.body.classList.add("print-case-a3"); window.print(); }
function focusRows(el: HTMLElement) { const max = el.scrollHeight - el.clientHeight; el.style.setProperty("--shrunk", String(Math.min(1, el.scrollTop / 140))); el.style.setProperty("--grown", String(max <= 0 ? 0 : Math.min(1, Math.max(0, (el.scrollTop - (max - 140)) / 140)))); }
export function ShadowboxApp() {
  const [view, setView] = useState<View>("case");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [trail, setTrail] = useState<Selection[]>([]);
  const [tour] = useState<TourFocus | null>(null);
  const open = (kind: Kind, id: string) => { const next = { kind, id }; setSelection(next); setTrail([next]); };
  const follow = (next: Selection) => { setSelection(next); setTrail((current) => { const at = current.findIndex((item) => item.kind === next.kind && item.id === next.id); return at >= 0 ? current.slice(0, at + 1) : [...current, next]; }); };
  const rows = useMemo(() => ribbonRows(awards), []);
  const bars = useMemo(() => timeline(), []);
  const stops = useMemo(() => careerStops(), []);
  const blanks = useMemo(() => openRecord(), []);
  const hits = useMemo(() => searchRecord(query), [query]);
  const pane = (id: View) => (view === id ? "view-pane" : "view-pane screen-off");
  const take = (hit: Hit) => { if ("view" in hit.open) setView(hit.open.view as View); else open(hit.open.kind, hit.open.id); setQuery(""); setMenu(false); };
  useEffect(() => { document.title = profile.pageTitle; }, []);
  useEffect(() => { const clear = () => document.body.classList.remove("print-case-a4", "print-case-a3"); window.addEventListener("afterprint", clear); return () => window.removeEventListener("afterprint", clear); }, []);
  useEffect(() => { const el = document.querySelector(".felt-surface"); if (el instanceof HTMLElement) focusRows(el); }, [view]);
  return (
    <div className="archive case-wide">
      <div className="case-frame">
        <div className="felt-bar">
          <svg className="felt-mark" viewBox="0 0 24 24" aria-label="Shadowbox" role="img"><path fill="none" stroke="#f6f1e7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" d="M6.376 18.91a6 6 0 0 1 11.249.003" /><circle fill="none" stroke="#DAA520" strokeWidth="2" cx="12" cy="11" r="4" /></svg>
          <strong className="felt-title">Shadowbox</strong>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search the record" />
          <button type="button" className="felt-menu" aria-label="Menu" onClick={() => setMenu((open) => !open)}>&#9776;</button>
          {menu ? <ul className="felt-menu-list">{NAV.map((item) => <li key={item.id}><button type="button" onClick={() => { setView(item.id); setMenu(false); }}>{item.label}</button></li>)}</ul> : null}
          {query.trim().length >= 2 ? <ul className="search-hits">{hits.length ? hits.map((hit) => <li key={`${hit.kindLabel}-${hit.title}`}><button type="button" onClick={() => take(hit)}><small>{hit.kindLabel}</small><strong>{hit.title}</strong><span>{hit.snippet}</span></button></li>) : <li className="search-empty">No match in the record.</li>}</ul> : null}
        </div>
        <div className="felt-surface" onScroll={(event) => focusRows(event.currentTarget)}>
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
        <DetailPanel selection={selection} trail={trail} onSelect={follow} onClose={() => { setSelection(null); setTrail([]); }} />
        <footer className="site-footer">
          <span>Made by an expat while at Itajaí, SC, Brazil.</span>
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
      <section className="book-appendix" aria-label="Sidebar chapters">
        <h2>Sidebars</h2>
        {units.map((unit) => <article key={unit.id} className="book-chapter"><h2>{unit.name}</h2><p>{unit.explanation}</p></article>)}
        {warfare.map((pin) => <article key={pin.id} className="book-chapter"><h2>{pin.name}</h2><p>{pin.explanation}</p></article>)}
        {awards.map((award) => <article key={award.id} className="book-chapter"><h2>{award.name}</h2><p>{award.explanation}</p></article>)}
      </section>
    </div>
  );
}
