import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Anchor, BookOpen, Car, ChartGantt, ClipboardList, Flag, Library, Map, MessageCircle, Radio, Shirt } from "lucide-react";
import { careerStops, profile, timeline, type Kind, type Selection } from "@/lib/shadowbox/model";
import { searchRecord, type Hit } from "@/lib/shadowbox/search";
import { chrome } from "@/lib/shadowbox/copy";
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
const NAV_ICON = { commands: Anchor, uniforms: Shirt, onduty: Radio, offduty: Car, ops: Flag, map: Map, timeline: ChartGantt, admin: ClipboardList };
const FOOTER = ["guestbook", "contact", "sources"] as const;
const FOOTER_ICON = { sources: Library, contact: MessageCircle, guestbook: BookOpen };
const ALIAS: Record<string, View> = { case: "home", schools: "admin", equipment: "onduty" };

function asView(value: string): View {
  if (value in ALIAS) return ALIAS[value];
  const known: View[] = [...NAV, "sources", "contact", "guestbook", "memories"];
  return known.includes(value as View) ? (value as View) : "home";
}

const SWIPE_PX = 72;
const SWIPE_MS = 800;
const SWIPE_EDGE = 24;

function swipeBlocked(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;
  if (target.closest("input, textarea, select, .leaflet-container, .map-frame, .command-scroller, .chart-scroll, .detail-overlay, .detail-panel, .app-menu, .uprog-slider")) return true;
  let node: Element | null = target;
  while (node) {
    const style = getComputedStyle(node);
    if ((style.overflowX === "auto" || style.overflowX === "scroll") && node.scrollWidth > node.clientWidth + 8) return true;
    node = node.parentElement;
  }
  return false;
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
  const swipeRef = useRef<{ id: number; x: number; y: number; t: number; skip: boolean } | null>(null);
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
    setMenu(false);
    setQuery("");
    setSearchOpen(false);
  };
  const onSwipeDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "mouse") return;
    if (selection || menu || searchOpen) {
      swipeRef.current = null;
      return;
    }
    const edge = event.clientX < SWIPE_EDGE || event.clientX > window.innerWidth - SWIPE_EDGE;
    swipeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, t: Date.now(), skip: edge || swipeBlocked(event.target) };
  };
  const onSwipeUp = (event: ReactPointerEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.skip || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Date.now() - start.t > SWIPE_MS) return;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.35) return;
    const at = NAV.indexOf(view as (typeof NAV)[number]);
    if (at < 0) return;
    if (dx > 0 && at > 0) go(NAV[at - 1]);
    else if (dx < 0 && at < NAV.length - 1) go(NAV[at + 1]);
  };

  useEffect(() => {
    const saved = loadPrefs();
    setLocale(saved.locale);
    setPrefsReady(true);
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

  return (
    <div className="app-shell">
      <header className="app-bar">
        <button type="button" className="app-home" onClick={() => go("home")} aria-label={t.home}>
          <Mark />
          <span className="app-title">{t.title}</span>
        </button>
        <div className="app-end">
        <button type="button" className="app-icon app-flag" aria-label={locale === "pt" ? t.english : t.portuguese} onClick={() => setLocale(locale === "pt" ? "en" : "pt")}>
          {locale === "pt" ? "🇧🇷" : "🇺🇸"}
        </button>
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
      <div className="app-main" onPointerDown={onSwipeDown} onPointerUp={onSwipeUp} onPointerCancel={() => { swipeRef.current = null; }}>
        <div className={pane("home")}><Home onOpen={open} bio={t.bio} /></div>
        <div className={pane("uniforms")}><Uniforms onOpen={open} /></div>
        <div className={pane("onduty")}><OnDuty onOpen={open} title={t.onduty} /></div>
        <div className={pane("offduty")}><OffDuty onOpen={open} title={t.offduty} /></div>
        <div className={pane("ops")}><Ops onOpen={open} /></div>
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
