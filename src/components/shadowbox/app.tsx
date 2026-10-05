import { useEffect, useMemo, useRef, useState } from "react";
import { Anchor, BookOpen, Car, ChartGantt, ClipboardList, Flag, House, Library, Map, MessageCircle, Radio, Shirt } from "lucide-react";
import { careerStops, profile, timeline, type Kind, type Selection } from "@/lib/shadowbox/model";
import { searchRecord, type Hit } from "@/lib/shadowbox/search";
import { chrome } from "@/lib/shadowbox/copy";
import { loadRemoteFonts } from "@/lib/shadowbox/fonts";
import { loadPrefs, resolveTheme, savePrefs, type Locale } from "@/lib/shadowbox/prefs";
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

type View = "home" | "uniforms" | "decorations" | "onduty" | "offduty" | "ops" | "map" | "timeline" | "admin" | "commands" | "sources" | "contact" | "guestbook" | "memories";

const NAV = ["commands", "timeline", "ops", "map", "uniforms", "onduty", "admin", "offduty"] as const;
type PageId = "home" | (typeof NAV)[number];
const NAV_ICON = { commands: Anchor, uniforms: Shirt, onduty: Radio, offduty: Car, ops: Flag, map: Map, timeline: ChartGantt, admin: ClipboardList };
const PAGE_ICON: Record<PageId, typeof House> = { home: House, ...NAV_ICON };
const FOOTER = ["guestbook", "contact", "sources"] as const;
const FOOTER_ICON = { sources: Library, contact: MessageCircle, guestbook: BookOpen };
const ALIAS: Record<string, View> = { case: "home", schools: "admin", equipment: "onduty" };

function asView(value: string): View {
  if (value in ALIAS) return ALIAS[value];
  const known: View[] = [...NAV, "sources", "contact", "guestbook", "memories"];
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
  const [prefsReady, setPrefsReady] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const t = chrome(locale);
  const bars = useMemo(() => timeline(), []);
  const stops = useMemo(() => careerStops(), []);
  const hits = useMemo(() => searchRecord(query), [query]);
  const pane = (id: View) => (view === id ? "view-pane" : "view-pane screen-off");
  const go = (next: View) => {
    setView(next);
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
      const resolved = resolveTheme("system", prefersDark);
      document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
      document.documentElement.dataset.theme = resolved;
      const base = import.meta.env.BASE_URL || "/";
      const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (icon) icon.href = `${base}icons/icon-${resolved}.svg`;
      const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (apple) apple.href = `${base}icons/apple-touch-icon${resolved === "dark" ? "-dark" : ""}.png`;
    };
    apply();
    savePrefs({ locale, theme: "system" });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefsReady, locale]);
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
    if (!showPager) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
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
        <button ref={menuButtonRef} type="button" className="app-icon" aria-label={t.menu} aria-expanded={menu} onClick={() => { setMenu((open) => !open); setSearchOpen(false); }}>
          &#9776;
        </button>
        </div>
        {menu ? (
          <ul className="app-menu" ref={menuRef}>
            {NAV.map((id) => {
              const Icon = NAV_ICON[id];
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
        <div className={pane("map")}><Stations stops={stops} onOpen={open} /></div>
        <div className={pane("timeline")}>
          <Timeline bars={bars} onOpen={open} title={t.pathTitle} lead={t.pathLead} eventsNote={t.eventsNote} />
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
        {showPager ? (
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
        <nav className="footer-nav" aria-label={t.footerNav}>
          {FOOTER.map((id) => {
            const Icon = FOOTER_ICON[id];
            return (
              <button key={id} type="button" className="footer-link" onClick={() => go(id)}>
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {t[id]}
              </button>
            );
          })}
        </nav>
      </footer>
      <DetailPanel selection={selection} trail={trail} onSelect={follow} onClose={() => { setSelection(null); setTrail([]); }} />
    </div>
  );
}
