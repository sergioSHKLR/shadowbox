import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { galleryPhotos, galleryTags, TAG_GROUPS, type GalleryPhoto, type TagGroup } from "@/lib/shadowbox/gallery";
import "@/gallery.css";

/**
 * Gallery (Oct 16 2026): every real photo on the site in one grid, filtered by Command, Operation and City.
 * Chips toggle; several chips in one group widen it (OR), groups narrow each other (AND). Counts are faceted: each
 * chip shows how many photos it would leave given the other groups' picks. The lightbox steps through the filtered
 * set with the arrows, the arrow keys or a swipe. Tags come from src/lib/shadowbox/gallery.ts.
 */
export type Lang = "en" | "pt";
const COPY = {
  en: {
    title: "Gallery",
    lead: "Sergio's own photos in one place. Filter by command, operation or city.",
    groups: { command: "Command", operation: "Operation", city: "City" } as Record<TagGroup, string>,
    clear: "Clear all",
    shown: (n: number, total: number) => (n === total ? `${total} photos` : `${n} of ${total} photos`),
    none: "No photo has all of these tags. Clear a chip to see more.",
    open: (caption: string) => `Open photo: ${caption}`,
    prev: "Previous photo",
    next: "Next photo",
    close: "Close",
    of: (i: number, n: number) => `${i} of ${n}`,
    tags: "Tags",
    untagged: "No command, operation or city recorded for this photo.",
    filters: "Filters",
    all: "All",
  },
  pt: {
    title: "Galeria",
    lead: "As fotos do próprio Sergio num só lugar. Filtre por comando, operação ou cidade.",
    groups: { command: "Comando", operation: "Operação", city: "Cidade" } as Record<TagGroup, string>,
    clear: "Limpar tudo",
    shown: (n: number, total: number) => (n === total ? `${total} fotos` : `${n} de ${total} fotos`),
    none: "Nenhuma foto tem todas essas tags. Desmarque um filtro para ver mais.",
    open: (caption: string) => `Abrir foto: ${caption}`,
    prev: "Foto anterior",
    next: "Próxima foto",
    close: "Fechar",
    of: (i: number, n: number) => `${i} de ${n}`,
    tags: "Tags",
    untagged: "Nenhum comando, operação ou cidade registrado para esta foto.",
    filters: "Filtros",
    all: "Todos",
  },
};

type Picks = Record<TagGroup, string[]>;
const EMPTY: Picks = { command: [], operation: [], city: [] };
const matches = (p: GalleryPhoto, picks: Picks, skip?: TagGroup) =>
  TAG_GROUPS.every((g) => g === skip || !picks[g].length || p.tags.some((t) => t.group === g && picks[g].includes(t.id)));

function formatDate(date: string | undefined, lang: Lang) {
  if (!date) return "";
  if (/^\d{4}$/.test(date)) return date;
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, m - 1, d));
}

/** Routes (Oct 21 2026): with onPhoto the open photo lives in the address (/gallery/<photo>/); photoId null = none open. */
export function Gallery({ locale = "en", photoId, onPhoto }: { locale?: string; photoId?: string | null; onPhoto?: (id: string | null) => void }) {
  const lang: Lang = locale === "pt" ? "pt" : "en";
  const c = COPY[lang];
  const tags = useMemo(() => galleryTags(), []);
  const [picks, setPicks] = useState<Picks>(EMPTY);
  const [ownAt, setOwnAt] = useState<number | null>(null);
  const shown = useMemo(() => galleryPhotos.filter((p) => matches(p, picks)), [picks]);
  const controlled = onPhoto !== undefined;
  // A linked photo the current filters hide: clear the filters so the lightbox can step through everything.
  useEffect(() => {
    if (controlled && photoId && !shown.some((p) => p.id === photoId) && galleryPhotos.some((p) => p.id === photoId)) setPicks(EMPTY);
  }, [controlled, photoId, shown]);
  const routedAt = photoId ? shown.findIndex((p) => p.id === photoId) : -1;
  const at = controlled ? (routedAt >= 0 ? routedAt : null) : ownAt;
  const setAt = (i: number | null) => {
    if (!controlled) return setOwnAt(i);
    if (i === null) { if (photoId) onPhoto!(null); return; }
    const id = shown[i]?.id;
    if (id && id !== photoId) onPhoto!(id);
  };
  const any = TAG_GROUPS.some((g) => picks[g].length);
  const toggle = (g: TagGroup, id: string) => {
    setPicks((prev) => ({ ...prev, [g]: prev[g].includes(id) ? prev[g].filter((x) => x !== id) : [...prev[g], id] }));
    setAt(null);
  };
  return (
    <main className="sheet gallery">
      <h2>{c.title}</h2>
      <p>{c.lead}</p>
      <section className="gallery-filters" aria-label={c.filters}>
        {TAG_GROUPS.filter((g) => tags[g].length).map((g) => (
          <div key={g} className="gallery-group" role="group" aria-labelledby={`gallery-g-${g}`}>
            <h3 id={`gallery-g-${g}`}>{c.groups[g]}</h3>
            <div className="gallery-chips">
              <button type="button" className={`nav-btn gallery-chip gallery-chip-all${picks[g].length ? "" : " on"}`} aria-pressed={!picks[g].length} onClick={() => { setPicks((prev) => ({ ...prev, [g]: [] })); setAt(null); }}>
                <span>{c.all}</span>
              </button>
              {tags[g].map((t) => {
                const on = picks[g].includes(t.id);
                const n = galleryPhotos.filter((p) => matches(p, picks, g) && p.tags.some((x) => x.group === g && x.id === t.id)).length;
                return (
                  <button key={t.id} type="button" className={`nav-btn gallery-chip${on ? " on" : ""}`} aria-pressed={on} disabled={!on && n === 0} title={t.title} onClick={() => toggle(g, t.id)}>
                    <span>{t.label}</span>
                    <span className="gallery-count" aria-label={`, ${n}`}>{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="gallery-status">
          <p aria-live="polite">{c.shown(shown.length, galleryPhotos.length)}</p>
          <button type="button" className="nav-btn gallery-clear" disabled={!any} onClick={() => { setPicks(EMPTY); setAt(null); }}>{c.clear}</button>
        </div>
      </section>
      {shown.length ? (
        <ul className="gallery-grid">
          {shown.map((p, i) => (
            <li key={p.id}>
              <button type="button" className="gallery-tile" aria-label={c.open(p.caption)} onClick={() => setAt(i)}>
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="gallery-none">{c.none}</p>
      )}
      <Lightbox photos={shown} at={at} setAt={setAt} lang={lang} />
    </main>
  );
}

/** Shared with the Logbook Photos tab (Oct 19 2026). */
export function Lightbox({ photos, at, setAt, lang }: { photos: GalleryPhoto[]; at: number | null; setAt: (i: number | null) => void; lang: Lang }) {
  const c = COPY[lang];
  const n = photos.length;
  const p = at === null ? null : photos[at];
  const go = (d: number) => at !== null && n > 1 && setAt((at + d + n) % n);
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    if (at === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goRef.current(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goRef.current(1); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [at]);
  // Preload the neighbours so stepping is instant.
  useEffect(() => {
    if (at === null || n < 2) return;
    for (const d of [-1, 1]) { const img = new Image(); img.src = photos[(at + d + n) % n].src; }
  }, [at, n, photos]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const frame = typeof document === "undefined" ? null : document.querySelector(".app-shell");
  const returnTo = useRef<HTMLElement | null>(null);
  if (p && !returnTo.current && typeof document !== "undefined") returnTo.current = document.activeElement as HTMLElement | null;
  const date = formatDate(p?.date, lang);
  return (
    <Dialog.Root open={p !== null} onOpenChange={(open) => { if (!open) setAt(null); }}>
      <Dialog.Portal container={frame instanceof HTMLElement ? frame : undefined}>
        <Dialog.Overlay className="enlarge-overlay gallery-overlay" />
        {p ? (
          <Dialog.Content
            className="gallery-lightbox"
            aria-describedby="gallery-lb-meta"
            onCloseAutoFocus={(e) => {
              // Back to the tile that opened it (the grid may have re-rendered).
              const el = returnTo.current;
              returnTo.current = null;
              if (el && el.isConnected) { e.preventDefault(); el.focus(); }
            }}
            onTouchStart={(e) => { const t = e.touches[0]; touch.current = t && e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null; }}
            onTouchEnd={(e) => {
              const s = touch.current, t = e.changedTouches[0];
              touch.current = null;
              if (!s || !t) return;
              const dx = t.clientX - s.x;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(t.clientY - s.y) * 1.2) go(dx < 0 ? 1 : -1);
            }}
          >
            <figure className="gallery-lb-figure">
              <img key={p.id} src={p.src} alt={p.alt} />
            </figure>
            <div className="gallery-lb-text">
              <Dialog.Title className="gallery-lb-title">{p.caption}</Dialog.Title>
              <div id="gallery-lb-meta">
                {p.sub && p.sub !== p.caption ? <p className="gallery-lb-sub">{p.sub}</p> : null}
                {date ? <p className="gallery-lb-date"><time dateTime={p.date}>{date}</time></p> : null}
                {p.tags.length ? (
                  <ul className="gallery-lb-tags" aria-label={c.tags}>
                    {p.tags.map((t) => <li key={`${t.group}-${t.id}`} title={t.title}><span>{c.groups[t.group]}</span> {t.label}</li>)}
                  </ul>
                ) : <p className="gallery-lb-sub">{c.untagged}</p>}
                {p.credit ? (
                  <p className="gallery-lb-credit">{p.credit.href ? <a href={p.credit.href} target="_blank" rel="noreferrer">{p.credit.text}</a> : p.credit.text}</p>
                ) : null}
              </div>
            </div>
            <div className="gallery-lb-nav">
              <button type="button" className="nav-btn icon-btn" aria-label={c.prev} title={c.prev} disabled={n < 2} onClick={() => go(-1)}>
                <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
              </button>
              <p aria-live="polite">{c.of((at ?? 0) + 1, n)}</p>
              <button type="button" className="nav-btn icon-btn" aria-label={c.next} title={c.next} disabled={n < 2} onClick={() => go(1)}>
                <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <Dialog.Close className="nav-btn icon-btn gallery-lb-close close-btn close-btn--over" aria-label={c.close} title={c.close}>
              <X size={18} strokeWidth={2.25} aria-hidden="true" />
            </Dialog.Close>
          </Dialog.Content>
        ) : null}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
