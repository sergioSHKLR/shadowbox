import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Anchor, BookOpen, Car, ChartGantt, ChevronLeft, ChevronRight, ClipboardList, Flag, House, Library, Map, MessageCircle, Monitor, Moon, NotebookText, Radio, Settings, Shirt, Sun, X } from "lucide-react";
import { careerStops, profile, timeline, type Kind, type Selection } from "@/lib/shadowbox/model";
import { searchRecord, type Hit } from "@/lib/shadowbox/search";
import { BIO_PLACEHOLDER, chrome, type Chrome } from "@/lib/shadowbox/copy";
import { loadRemoteFonts } from "@/lib/shadowbox/fonts";
import { applyFontSize, FONT_SIZES, loadPrefs, resolveTheme, savePrefs, type FontSize, type Locale, type ThemeName } from "@/lib/shadowbox/prefs";

/** Site search is off for now (Sergio). Flip to true to bring back the top-bar search box; the code stays wired. */
const SEARCH_ENABLED = false;
/** Theme switch hidden (Sergio): everyone follows the device (prefers-color-scheme); a saved light/dark choice is ignored and
 *  overwritten with "system". Flip to true to bring the Sun / Monitor / Moon switch back (pages/index.html has a matching flag). */
const THEME_SWITCH_ENABLED = false;
/** The Settings page (footer link) carries the System / Light / Dark choice while the top-bar switch is hidden, so a saved
 *  light / dark choice is honored again. Set false (and the matching flag in pages/index.html) to force "system" for everyone. */
const THEME_SETTING_ENABLED = true;
const THEME_HONORED = THEME_SWITCH_ENABLED || THEME_SETTING_ENABLED;
/** Top-bar Previous / Next page chevrons hidden (Sergio, Oct 2026). Flip to true to bring them back. */
const TOPBAR_PAGER_ENABLED = false;
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
/** Top-bar menu (Sergio, Oct 2026): Home, Logbook, then Guestbook, Contact and Map. The pager (NAV) still steps Home ⇄ Logbook only. */
const MENU = ["home", ...NAV, "map", "guestbook", "contact"] as const; // Sergio, Oct 2026: Home, Logbook, Map, Guestbook, Contact
const MENU_ICON: Record<(typeof MENU)[number], typeof House> = { home: House, logbook: NotebookText, guestbook: BookOpen, contact: MessageCircle, map: Map };
const ALL_FOOTER = ["guestbook", "contact", "sources"] as const;
const FOOTER: readonly (typeof ALL_FOOTER)[number][] = []; // guestbook / contact live in the top-bar menu now (Sergio)
void ALL_FOOTER;
const FOOTER_ICON = { sources: Library, contact: MessageCircle, guestbook: BookOpen };
/** Footer "Settings" link opens the Settings modal (restored from before c7c06fc): language + theme. Not a page or route. */
const SETTINGS_LINK_ENABLED = true;
const ALIAS: Record<string, View> = { case: "home", schools: "admin", equipment: "onduty" };

function asView(value: string): View {
  if (value in ALIAS) return ALIAS[value];
  const known: View[] = [...MENU, ...FOOTER];
  return known.includes(value as View) ? (value as View) : "home";
}

function RadioGroup<V extends string>({ name, legend, value, onChange, options }: { name: string; legend: string; value: V; onChange: (value: V) => void; options: { value: V; label: string }[] }) {
  return (
    <fieldset className="settings-radios">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="settings-radio">
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function SettingsDialog({
  open,
  onClose,
  locale,
  theme,
  setLocale,
  setTheme,
  showTheme,
  fontSize,
  setFontSize,
  t,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  theme: ThemeName;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeName) => void;
  showTheme: boolean;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: Chrome;
}) {
  const frame = typeof document === "undefined" ? null : document.querySelector(".app-shell");
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal container={typeof HTMLElement !== "undefined" && frame instanceof HTMLElement ? frame : undefined}>
        <Dialog.Overlay className="settings-overlay" />
        <Dialog.Content className="settings-modal" aria-describedby="settings-lead">
          <header>
            <Dialog.Title>{t.settingsTitle}</Dialog.Title>
            <Dialog.Close className="icon-btn" aria-label={t.close}>
              <X />
            </Dialog.Close>
          </header>
          <p id="settings-lead">{t.settingsLead}</p>
          {/* Plain radio groups (Sergio, Oct 2026), the same look as the Logbook Decorations radios. */}
          <RadioGroup name="settings-language" legend={t.language} value={locale} onChange={setLocale} options={[{ value: "en", label: t.english }, { value: "pt", label: t.portuguese }]} />
          {showTheme ? (
            <RadioGroup name="settings-theme" legend={t.theme} value={theme} onChange={setTheme} options={[{ value: "system", label: t.system }, { value: "light", label: t.light }, { value: "dark", label: t.dark }]} />
          ) : null}
          <RadioGroup
            name="settings-font-size"
            legend={t.fontSize}
            value={fontSize}
            onChange={setFontSize}
            options={FONT_SIZES.map((size) => ({ value: size, label: size === "small" ? t.fontSmall : size === "large" ? t.fontLarge : size === "xlarge" ? t.fontXLarge : t.fontDefault }))}
          />
          <p className="settings-credit quiet">{t.made}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
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
  const [fontSize, setFontSize] = useState<FontSize>("default");
  const [prefsReady, setPrefsReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
  // Footer prev / next steps through the top-bar menu in menu order (Sergio, Oct 2026).
  const menuAt = MENU.indexOf(view as (typeof MENU)[number]);
  const menuPrev = menuAt > 0 ? MENU[menuAt - 1] : null;
  const menuNext = menuAt >= 0 && menuAt < MENU.length - 1 ? MENU[menuAt + 1] : null;
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
    setFontSize(saved.fontSize);
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
      const resolved = resolveTheme(THEME_HONORED ? theme : "system", prefersDark);
      document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
      document.documentElement.dataset.theme = resolved;
      applyFontSize(fontSize);
      const base = import.meta.env.BASE_URL || "/";
      const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (icon) icon.href = `${base}icons/icon-${resolved}.svg`;
      const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (apple) apple.href = `${base}icons/apple-touch-icon${resolved === "dark" ? "-dark" : ""}.png`;
      const tint = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (tint) tint.content = resolved === "dark" ? "#14181f" : "#f6f1e7";
    };
    apply();
    savePrefs({ locale, theme: THEME_HONORED ? theme : "system", fontSize });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefsReady, locale, theme, fontSize]);
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
        {/* Top-bar US/BR flags removed (Sergio, Oct 2026): language is chosen only in the Settings modal. */}
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
        {showPager && TOPBAR_PAGER_ENABLED ? (
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
            {MENU.map((id) => {
              const Icon = MENU_ICON[id];
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
        <div className={pane("home")}><Home onOpen={open} bio={BIO_PLACEHOLDER ? t.bioPlaceholder : t.bio} /></div>
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
            <Logbook onOpen={open} title={t.logbook} lead={t.logbookLead} platesLabel={t.decorations} wardrobeLabel={t.uniforms} />
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
        {FOOTER.length || SETTINGS_LINK_ENABLED ? <nav className="footer-nav" aria-label={t.footerNav}>
          {FOOTER.map((id) => {
            const Icon = FOOTER_ICON[id];
            return (
              <button key={id} type="button" className="footer-link" onClick={() => go(id)}>
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {t[id]}
              </button>
            );
          })}
          {SETTINGS_LINK_ENABLED ? (
            <button type="button" className="footer-link" aria-haspopup="dialog" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(true)}>
              <Settings size={16} strokeWidth={1.75} aria-hidden="true" />
              {t.settings}
            </button>
          ) : null}
        </nav> : null}
        {menuAt >= 0 ? (
          <nav className="footer-pager" aria-label={t.pageNav}>
            <button type="button" className="nav-btn icon-btn" disabled={!menuPrev} aria-label={menuPrev ? `${t.prevPage}: ${t[menuPrev]}` : t.prevPage} title={menuPrev ? `${t.prevPage}: ${t[menuPrev]}` : undefined} onClick={() => menuPrev && go(menuPrev)}>
              <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" className="nav-btn icon-btn" disabled={!menuNext} aria-label={menuNext ? `${t.nextPage}: ${t[menuNext]}` : t.nextPage} title={menuNext ? `${t.nextPage}: ${t[menuNext]}` : undefined} onClick={() => menuNext && go(menuNext)}>
              <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>
        ) : null}
      </footer>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} locale={locale} theme={theme} setLocale={setLocale} setTheme={setTheme} showTheme={THEME_HONORED} fontSize={fontSize} setFontSize={setFontSize} t={t} />
      <DetailPanel selection={selection} trail={trail} onSelect={follow} onClose={() => { setSelection(null); setTrail([]); }} />
    </div>
  );
}
