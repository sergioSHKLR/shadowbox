import { useEffect, useMemo, useRef, useState } from "react";
import { Anchor, BookOpen, Car, ChartGantt, ChevronLeft, ChevronRight, ClipboardList, Flag, House, Library, Map, MessageCircle, Monitor, Moon, NotebookText, Radio, Shirt, Sun } from "lucide-react";
import { careerStops, profile, timeline, type Kind, type Selection } from "@/lib/shadowbox/model";
import { searchRecord, type Hit } from "@/lib/shadowbox/search";
import { chrome } from "@/lib/shadowbox/copy";
import { loadRemoteFonts } from "@/lib/shadowbox/fonts";
import { loadPrefs, resolveTheme, savePrefs, type Locale, type ThemeName } from "@/lib/shadowbox/prefs";

/** Site search is off for now (Sergio). Flip to true to bring back the top-bar search box; the code stays wired. */
const SEARCH_ENABLED = false;
/** Theme switch hidden (Sergio): everyone follows the device (prefers-color-scheme); a saved light/dark choice is ignored and
 *  overwritten with "system". Flip to true to bring the Sun / Monitor / Moon switch back (pages/index.html has a matching flag). */
const THEME_SWITCH_ENABLED = false;
/** Footer Previous / Next pager and its arrow-key shortcut are off; page stepping lives in the top bar (chevrons). */
const FOOTER_PAGER_ENABLED = false;
const THEMES: { id: ThemeName; Icon: typeof Sun }[] = [
  { id: "light", Icon: Sun },
  { id: "system", Icon: Monitor },
  { id: "dark", Icon: Moon },
];
import { DetailPanel } from "@/components/shadowbox/detail";
import { Home, Timeline } from "@/components/shadowbox/timeline-view";
import { Uniforms } from "@/components/shadowbox/uniforms-view";
import { OnDuty } from "@/components/shadowbox/equipment-view";
import { OffDuty, Ops } from "@/components/shadowbox/ops-view";
import { Stations } from "@/components/shadowbox/stations";
import { Sources } from "@/components/shadowbox/sources-view";
import { Contact, Guestbook } from "@/components/shadowbox/footer-pages";
import { Memories } from "@/components/shadowbox/memories-view";
import { Schools } from "@/components/shadowbox/schools-view";
import { Commands } from "@/components/shadowbox/commands-view";
import { Logbook } from "@/components/shadowbox/logbook-view";
import { Boundary } from "@/components/shadowbox/boundary";

type View = "home" | "uniforms" | "decorations" | "onduty" | "offduty" | "ops" | "map" | "timeline" | "logbook" | "admin" | "commands" | "sources" | "contact" | "guestbook" | "memories";

const ALL_NAV = ["commands", "timeline", "logbook", "ops", "map", "uniforms", "onduty", "admin", "offduty"] as const;
// Sergio: only Home and Logbook are public for now. The other pages keep their code and data but are unlinked
// (menu, pager, footer, search) and unreachable: any other view resolves to Home. Add ids back here to re-publish.
const NAV = ["logbook"] as const satisfies readonly (typeof ALL_NAV)[number][];
type PageId = "home" | (typeof ALL_NAV)[number];
const NAV_ICON = { commands: Anchor, uniforms: Shirt, onduty: Radio, offduty: Car, ops: Flag, map: Map, timeline: ChartGantt, logbook: NotebookText, admin: ClipboardList };
const PAGE_ICON: Record<PageId, typeof House> = { home: House, ...NAV_ICON };
const ALL_FOOTER = ["guestbook", "contact", "sources"] as const;
const FOOTER: readonly (typeof ALL_FOOTER)[number][] = []; // hidden with the other pages (Sergio); re-add ids to show them
void ALL_FOOTER;
const FOOTER_ICON = { sources: Library, contact: MessageCircle, guestbook: BookOpen };
const ALIAS: Record<string, View> = { case: "home", schools: "admin", equipment: "onduty" };

function asView(value: string): View {
  if (value in ALIAS) return ALIAS[value];
  const known: View[] = [...NAV, ...FOOTER];
  return known.includes(value as View) ? (value as View) : "home";
}

function Mark() {
  return (
    <svg className="app-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6.376 18.91a6 6 0 0 1 11.249.003" />
      <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="11" r="4" />
    </svg>
  );
}

export function ShadowboxApp() {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [trail, setTrail] = useState<Selection[]>([]);
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<ThemeName>("system");
  const [prefsReady, setPrefsReady] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const t = chrome(locale);
  const bars = useMemo(() => timeline(), []);
  const stops = useMemo(() => careerStops(), []);
  // Page hits for hidden pages are dropped so search can't reach them either.
  const hits = useMemo(() => searchRecord(query).filter((hit) => !("view" in hit.open) || asView(hit.open.view) !== "home" || hit.open.view === "home"), [query]);
  const pane = (id: View) => (view === id ? "view-pane" : "view-pane screen-off");
  const go = (next: View) => {
    setView(asView(next));
    setMenu(false);
    setSearchOpen(false);
    setQuery("");
    window.scrollTo(0, 0);
  };
  const navAt = NAV.indexOf(view as (typeof NAV)[number]);
  const prevView: PageId | null = navAt > 0 ? NAV[navAt - 1] : navAt === 0 ? "home" : null;
  const nextView: PageId | null = navAt >= 0 && navAt < NAV.length - 1 ? NAV[navAt + 1] : view === "home" ? NAV[0] : null;
  const showPager = navAt >= 0 || view === "home";
  const PrevIcon = prevView ? PAGE_ICON[prevView] : null;
  const NextIcon = nextView ? PAGE_ICON[nextView] : null;
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
    setMenu(false);
    setQuery("");
    setSearchOpen(false);
  };

  useEffect(() => {
    const saved = loadPrefs();
    setLocale(saved.locale);
    setTheme(saved.theme);
    setPrefsReady(true);
    loadRemoteFonts();
  }, []);
  useEffect(() => {
    document.title = profile.pageTitle;
  }, []);
  useEffect(() => {
    if (!prefsReady) return;
    const apply = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = resolveTheme(THEME_SWITCH_ENABLED ? theme : "system", prefersDark);
      document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
      document.documentElement.dataset.theme = resolved;
      const base = import.meta.env.BASE_URL || "/";
      const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (icon) icon.href = `${base}icons/icon-${resolved}.svg`;
      const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (apple) apple.href = `${base}icons/apple-touch-icon${resolved === "dark" ? "-dark" : ""}.png`;
      const tint = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (tint) tint.content = resolved === "dark" ? "#14181f" : "#f6f1e7";
    };
    apply();
    savePrefs({ locale, theme: THEME_SWITCH_ENABLED ? theme : "system" });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefsReady, locale, theme]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMenu(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const close = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchRef.current?.contains(target)) return;
      setQuery("");
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [query]);
  useEffect(() => {
    if (!showPager || !FOOTER_PAGER_ENABLED) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      // A view that handled the arrow itself (e.g. the Logbook command stepper) keeps it.
      if (event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (menu || searchOpen || selection) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
        if (target.closest(".map-frame, .map-stage, .leaflet-container, .uprog-slider, .map-play-scrub, .command-scroller, .chart-scroll, [role='slider']")) return;
        let node: HTMLElement | null = target;
        while (node && node !== document.body) {
          const style = window.getComputedStyle(node);
          const overflowX = style.overflowX;
          if ((overflowX === "auto" || overflowX === "scroll") && node.scrollWidth > node.clientWidth + 1) return;
          node = node.parentElement;
        }
      }
      if (event.key === "ArrowLeft" && prevView) {
        event.preventDefault();
        go(prevView);
      } else if (event.key === "ArrowRight" && nextView) {
        event.preventDefault();
        go(nextView);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPager, menu, searchOpen, selection, prevView, nextView]);

  return (
    <div className="app-shell">
      <header className="app-bar">
        <button type="button" className="app-home" onClick={() => go("home")} aria-label={t.home}>
          <Mark />
          <span className="app-title">{t.title}</span>
        </button>
        <div className="app-end">
        <div className="app-flags">
          <button type="button" className={locale === "en" ? "app-flag is-on" : "app-flag"} aria-label={t.english} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>
            <span aria-hidden="true">🇺🇸</span>
          </button>
          <button type="button" className={locale === "pt" ? "app-flag is-on" : "app-flag"} aria-label={t.portuguese} aria-pressed={locale === "pt"} onClick={() => setLocale("pt")}>
            <span aria-hidden="true">🇧🇷</span>
          </button>
        </div>
        {THEME_SWITCH_ENABLED ? (
        <div className="app-themes" role="group" aria-label={t.theme}>
          {THEMES.map(({ id, Icon }) => (
            <button key={id} type="button" className={theme === id ? "app-theme is-on" : "app-theme"} aria-label={t[id]} title={t[id]} aria-pressed={theme === id} onClick={() => setTheme(id)}>
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          ))}
        </div>
        ) : null}
        {SEARCH_ENABLED ? (
        <div className={searchOpen ? "app-search is-open" : "app-search"} ref={searchRef}>
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
        ) : null}
        {showPager ? (
          <nav className="app-pagenav" aria-label={t.pageNav}>
            <button type="button" className="app-pagebtn" disabled={!prevView} aria-label={prevView ? `${t.prevPage}: ${t[prevView]}` : t.prevPage} title={prevView ? `${t.prevPage}: ${t[prevView]}` : undefined} onClick={() => prevView && go(prevView)}>
              <ChevronLeft size={18} strokeWidth={2.25} aria-hidden="true" />
            </button>
            <button type="button" className="app-pagebtn" disabled={!nextView} aria-label={nextView ? `${t.nextPage}: ${t[nextView]}` : t.nextPage} title={nextView ? `${t.nextPage}: ${t[nextView]}` : undefined} onClick={() => nextView && go(nextView)}>
              <ChevronRight size={18} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </nav>
        ) : null}
        <button ref={menuButtonRef} type="button" className="app-icon" aria-label={t.menu} aria-expanded={menu} onClick={() => { setMenu((open) => !open); setSearchOpen(false); }}>
          &#9776;
        </button>
        </div>
        {menu ? (
          <ul className="app-menu" ref={menuRef}>
            {(["home", ...NAV] as const).map((id) => {
              const Icon = PAGE_ICON[id];
              return (
                <li key={id}>
                  <button type="button" className={view === id ? "on" : undefined} onClick={() => go(id)}>
                    <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                    {t[id]}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </header>
      <div className="app-main">
        <div className={pane("home")}><Home onOpen={open} bio={t.bio} /></div>
        <div className={pane("uniforms")}><Uniforms onOpen={open} /></div>
        <div className={pane("onduty")}><OnDuty onOpen={open} title={t.onduty} /></div>
        <div className={pane("offduty")}><OffDuty onOpen={open} title={t.offduty} /></div>
        <div className={pane("ops")}><Ops onOpen={open} title={t.ops} /></div>
        <div className={pane("map")}><Boundary label="map" resetKey={view}><Stations stops={stops} onOpen={open} aboutLabel={t.mapAbout} /></Boundary></div>
        <div className={pane("timeline")}>
          <Timeline bars={bars} stops={stops} onOpen={open} title={t.pathTitle} lead={t.pathLead} eventsNote={t.eventsNote} />
        </div>
        <div className={pane("logbook")}>
          <Boundary label="logbook" resetKey={view}>
            <Logbook onOpen={open} title={t.logbook} lead={t.logbookLead} wardrobeLabel={t.wardrobe} />
          </Boundary>
        </div>
        <div className={pane("admin")}>
          <Schools onOpen={open} title={t.schools} lead={t.schoolsLead} necTitle={t.necs} necLead={t.necsLead} dateNeeded={t.dateNeeded} />
        </div>
        <div className={pane("commands")}>
          <Commands onOpen={open} title={t.commands} lead={t.commandsLead} />
        </div>
        <div className={`${pane("sources")} no-book`}><Sources /></div>
        <div className={`${pane("contact")} no-book`}><Contact /></div>
        <div className={`${pane("guestbook")} no-book`}><Guestbook /></div>
        <div className={`${pane("memories")} no-book`}><Memories /></div>
        {showPager && FOOTER_PAGER_ENABLED ? (
          <nav className="page-pager" aria-label={t.pageNav}>
            {prevView && PrevIcon ? (
              <button type="button" className="page-pager-link is-prev" aria-label={`${t.prevPage}: ${t[prevView]}`} onClick={() => go(prevView)}>
                <PrevIcon size={18} strokeWidth={1.85} aria-hidden="true" />
                <span className="page-pager-stack">
                  <span className="page-pager-dir">{t.prevPage}</span>
                  <span className="page-pager-label">{t[prevView]}</span>
                </span>
              </button>
            ) : <span className="page-pager-spacer" aria-hidden="true" />}
            {nextView && NextIcon ? (
              <button type="button" className="page-pager-link is-next" aria-label={`${t.nextPage}: ${t[nextView]}`} onClick={() => go(nextView)}>
                <span className="page-pager-stack">
                  <span className="page-pager-dir">{t.nextPage}</span>
                  <span className="page-pager-label">{t[nextView]}</span>
                </span>
                <NextIcon size={18} strokeWidth={1.85} aria-hidden="true" />
              </button>
            ) : <span className="page-pager-spacer" aria-hidden="true" />}
          </nav>
        ) : null}
      </div>
      <footer className="site-footer">
        <span className="footer-credit">{t.made}</span>
        {FOOTER.length ? <nav className="footer-nav" aria-label={t.footerNav}>
          {FOOTER.map((id) => {
            const Icon = FOOTER_ICON[id];
            return (
              <button key={id} type="button" className="footer-link" onClick={() => go(id)}>
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {t[id]}
              </button>
            );
          })}
        </nav> : null}
      </footer>
      <DetailPanel selection={selection} trail={trail} onSelect={follow} onClose={() => { setSelection(null); setTrail([]); }} />
    </div>
  );
}
