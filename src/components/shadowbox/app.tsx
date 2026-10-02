import { useEffect, useMemo, useState } from "react";
import { careerStops, openRecord, profile, ribbonRows, timeline, awards, type Kind, type Selection } from "@/lib/shadowbox/model";
import { searchRecord, type Hit } from "@/lib/shadowbox/search";
import { chrome } from "@/lib/shadowbox/copy";
import { loadPrefs, savePrefs, type Locale, type ThemeName } from "@/lib/shadowbox/prefs";
import { DetailPanel } from "@/components/shadowbox/detail";
import { Timeline } from "@/components/shadowbox/timeline-view";
import { Uniforms } from "@/components/shadowbox/uniforms-view";
import { Decorations } from "@/components/shadowbox/decorations-view";
import { EquipmentView } from "@/components/shadowbox/equipment-view";
import { OffDuty, Ops } from "@/components/shadowbox/ops-view";
import { Stations } from "@/components/shadowbox/stations";
import { Sources } from "@/components/shadowbox/sources-view";
import { Contact, Guestbook } from "@/components/shadowbox/footer-pages";
import { Memories } from "@/components/shadowbox/memories-view";
import { Schools } from "@/components/shadowbox/schools-view";

type View = "timeline" | "uniforms" | "decorations" | "equipment" | "ops" | "map" | "schools" | "sources" | "contact" | "guestbook" | "memories" | "settings";

const NAV: View[] = ["timeline", "uniforms", "decorations", "equipment", "ops", "map", "schools"];
const FOOTER: View[] = ["sources", "contact", "guestbook", "memories", "settings"];
const ALIAS: Record<string, View> = { case: "timeline", onduty: "equipment", offduty: "equipment" };

function asView(value: string): View {
  if (value in ALIAS) return ALIAS[value];
  const known: View[] = [...NAV, ...FOOTER];
  return known.includes(value as View) ? (value as View) : "timeline";
}

function Mark() {
  return (
    <svg className="app-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" d="M6.376 18.91a6 6 0 0 1 11.249.003" />
      <circle fill="none" stroke="#DAA520" strokeWidth="2" cx="12" cy="11" r="4" />
    </svg>
  );
}

export function ShadowboxApp() {
  const [view, setView] = useState<View>("timeline");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [trail, setTrail] = useState<Selection[]>([]);
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<ThemeName>("light");
  const [prefsReady, setPrefsReady] = useState(false);
  const t = chrome(locale);
  const bars = useMemo(() => timeline(), []);
  const rows = useMemo(() => ribbonRows(awards), []);
  const stops = useMemo(() => careerStops(), []);
  const blanks = useMemo(() => openRecord(), []);
  const hits = useMemo(() => searchRecord(query), [query]);
  const pane = (id: View) => (view === id ? "view-pane" : "view-pane screen-off");
  const go = (next: View) => {
    setView(next);
    setMenu(false);
    setSearchOpen(false);
    setQuery("");
  };
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
  const take = (hit: Hit) => {
    if ("view" in hit.open) go(asView(hit.open.view));
    else open(hit.open.kind, hit.open.id);
    setQuery("");
    setSearchOpen(false);
  };

  useEffect(() => {
    const saved = loadPrefs();
    setLocale(saved.locale);
    setTheme(saved.theme);
    setPrefsReady(true);
  }, []);
  useEffect(() => {
    document.title = profile.pageTitle;
  }, []);
  useEffect(() => {
    if (!prefsReady) return;
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
    document.documentElement.dataset.theme = theme;
    savePrefs({ locale, theme });
  }, [prefsReady, locale, theme]);

  return (
    <div className="app-shell">
      <header className="app-bar">
        <button type="button" className="app-home" onClick={() => go("timeline")} aria-label={t.home}>
          <Mark />
          <span className="app-title">{t.title}</span>
        </button>
        <div className={searchOpen ? "app-search is-open" : "app-search"}>
          <button type="button" className="app-icon" aria-label={t.search} aria-expanded={searchOpen} onClick={() => { setSearchOpen((open) => !open); setMenu(false); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} aria-label={t.search} />
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
              )) : <li className="search-empty">{t.noMatch}</li>}
            </ul>
          ) : null}
        </div>
        <button type="button" className="app-icon" aria-label={t.menu} aria-expanded={menu} onClick={() => { setMenu((open) => !open); setSearchOpen(false); }}>
          &#9776;
        </button>
        {menu ? (
          <ul className="app-menu">
            {NAV.map((id) => (
              <li key={id}>
                <button type="button" className={view === id ? "on" : undefined} onClick={() => go(id)}>{t[id]}</button>
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      <div className="app-main">
        <div className={pane("timeline")}><Timeline bars={bars} rows={rows} blanks={blanks} onOpen={open} /></div>
        <div className={pane("uniforms")}><Uniforms onOpen={open} /></div>
        <div className={pane("decorations")}><Decorations onOpen={open} tour={null} /></div>
        <div className={pane("equipment")}>
          <EquipmentView onOpen={open} />
          <OffDuty onOpen={open} />
        </div>
        <div className={pane("ops")}><Ops onOpen={open} /></div>
        <div className={pane("map")}><Stations stops={stops} onOpen={open} /></div>
        <div className={pane("schools")}><Schools onOpen={open} title={t.schools} lead={t.schoolsLead} /></div>
        <div className={`${pane("sources")} no-book`}><Sources /></div>
        <div className={`${pane("contact")} no-book`}><Contact onOpenBook={() => go("guestbook")} /></div>
        <div className={`${pane("guestbook")} no-book`}><Guestbook /></div>
        <div className={`${pane("memories")} no-book`}><Memories /></div>
        <div className={pane("settings")}>
          <main className="sheet">
            <h2>{t.settingsTitle}</h2>
            <p>{t.settingsLead}</p>
            <h3>{t.language}</h3>
            <div className="choice-row" role="group" aria-label={t.language}>
              <button type="button" className={locale === "en" ? "nav-btn on" : "nav-btn"} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>{t.english}</button>
              <button type="button" className={locale === "pt" ? "nav-btn on" : "nav-btn"} aria-pressed={locale === "pt"} onClick={() => setLocale("pt")}>{t.portuguese}</button>
            </div>
            <h3>{t.theme}</h3>
            <div className="choice-row" role="group" aria-label={t.theme}>
              <button type="button" className={theme === "light" ? "nav-btn on" : "nav-btn"} aria-pressed={theme === "light"} onClick={() => setTheme("light")}>{t.light}</button>
              <button type="button" className={theme === "dark" ? "nav-btn on" : "nav-btn"} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>{t.dark}</button>
            </div>
          </main>
        </div>
      </div>
      <footer className="site-footer">
        <span>{t.made}</span>
        {FOOTER.map((id) => (
          <button key={id} type="button" className="footer-link" onClick={() => go(id)}>{t[id]}</button>
        ))}
        <button type="button" className="footer-link" onClick={() => window.print()}>{t.print}</button>
      </footer>
      <DetailPanel selection={selection} trail={trail} onSelect={follow} onClose={() => { setSelection(null); setTrail([]); }} />
    </div>
  );
}
