import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { publicUrl } from "@/lib/shadowbox/model";
import "@/gallery.css";

/**
 * Credentials (Sergio, Oct 29 2026): his recreated DD-214 (Member-4 copy), personal data already obscured on the form.
 * Main content, so the two pages are SVGs (pdftocairo -svg from the approved v4 PDF, cropped to the form, SVGO): text is
 * outlined glyphs only, no text layer or metadata. The PDF itself is not published. Tapping a page opens the Gallery's
 * lightbox. The summary values are verbatim from the form; only the labels are translated.
 */
const PAGES = [
  { src: "/credentials/dd214-p1.svg", w: 499.84, h: 701.08 },
  { src: "/credentials/dd214-p2.svg", w: 502.72, h: 700.72 },
];
const COPY = {
  en: {
    lead: "A recreation of Chief Schickler's DD-214, with personal data obscured. The original is available on request.",
    page: (n: number) => `DD-214, page ${n} of 2`,
    pages: ["DD Form 214, Certificate of Release or Discharge from Active Duty", "DD Form 214C, continuation"],
    open: (n: number) => `Open DD-214 page ${n} of 2`,
    summary: "Key blocks",
    rows: ["Grade, rate or rank (4a, 4b)", "Date entered active duty (12a)", "Separation date (12b)", "Net active service (12c)", "Foreign service (12f)", "Sea service (12g)", "Type of separation (23)", "Character of service (24)", "Narrative reason for separation (28)"],
    prev: "Previous page", next: "Next page", close: "Close", of: (a: number, b: number) => `${a} of ${b}`,
  },
  pt: {
    lead: "Recriação do DD-214 do Suboficial Schickler, com os dados pessoais ocultados. O original está disponível mediante solicitação.",
    page: (n: number) => `DD-214, página ${n} de 2`,
    pages: ["Formulário DD 214, Certificado de Licenciamento ou Baixa do Serviço Ativo", "Formulário DD 214C, continuação"],
    open: (n: number) => `Abrir a página ${n} de 2 do DD-214`,
    summary: "Campos principais",
    rows: ["Graduação (4a, 4b)", "Data de ingresso no serviço ativo (12a)", "Data de desligamento (12b)", "Tempo líquido de serviço ativo (12c)", "Serviço no exterior (12f)", "Serviço no mar (12g)", "Tipo de desligamento (23)", "Natureza do serviço (24)", "Motivo do desligamento (28)"],
    prev: "Página anterior", next: "Próxima página", close: "Fechar", of: (a: number, b: number) => `${a} de ${b}`,
  },
} as const;
/** Verbatim from the DD-214 (block 12 as YEAR(S) MONTH(S) DAY(S)). */
const VALUES = ["ETC / E7", "1997 06 30", "2018 02 28", "20 08 01", "06 04 24", "03 01 18", "TRANSFERRED TO THE FLEET RESERVE", "HONORABLE", "SUFFICIENT SERVICE FOR RETIREMENT"];

export function Credentials({ locale = "en", title }: { locale?: string; title: string }) {
  const lang = locale === "pt" ? "pt" : "en";
  const c = COPY[lang];
  const [at, setAt] = useState<number | null>(null);
  const n = PAGES.length;
  const go = (d: number) => setAt((i) => (i === null ? i : (i + d + n) % n));
  useEffect(() => {
    if (at === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") go(-1); else if (e.key === "ArrowRight") go(1); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const frame = typeof document === "undefined" ? null : document.querySelector(".app-shell");
  const p = at === null ? null : PAGES[at];
  return (
    <main className="sheet cred-page">
      <h2>{title}</h2>
      <p>{c.lead}</p>
      <div className="cred-pages">
        {PAGES.map((pg, i) => (
          <button key={pg.src} type="button" className="cred-doc" aria-label={c.open(i + 1)} onClick={() => setAt(i)}>
            <img src={publicUrl(pg.src)} width={pg.w} height={pg.h} alt={c.pages[i]} loading={i ? "lazy" : undefined} decoding="async" />
          </button>
        ))}
      </div>
      <section className="cred-summary" aria-labelledby="cred-summary-h">
        <h3 id="cred-summary-h">{c.summary}</h3>
        <dl>
          {c.rows.map((label, i) => (
            <div key={label}><dt>{label}</dt><dd>{VALUES[i]}</dd></div>
          ))}
        </dl>
      </section>
      <Dialog.Root open={p !== null} onOpenChange={(open) => { if (!open) setAt(null); }}>
        <Dialog.Portal container={frame instanceof HTMLElement ? frame : undefined}>
          <Dialog.Overlay className="enlarge-overlay gallery-overlay" />
          {p && at !== null ? (
            <Dialog.Content className="gallery-lightbox cred-lightbox" aria-describedby={undefined}>
              <figure className="gallery-lb-figure cred-lb-figure">
                <img key={p.src} src={publicUrl(p.src)} width={p.w} height={p.h} alt={c.pages[at]} />
              </figure>
              <div className="gallery-lb-text">
                <Dialog.Title className="gallery-lb-title">{c.page(at + 1)}</Dialog.Title>
                <p className="gallery-lb-sub">{c.pages[at]}</p>
              </div>
              <div className="gallery-lb-nav">
                <button type="button" className="nav-btn icon-btn" aria-label={c.prev} title={c.prev} onClick={() => go(-1)}><ChevronLeft size={20} strokeWidth={2} aria-hidden="true" /></button>
                <p aria-live="polite">{c.of(at + 1, n)}</p>
                <button type="button" className="nav-btn icon-btn" aria-label={c.next} title={c.next} onClick={() => go(1)}><ChevronRight size={20} strokeWidth={2} aria-hidden="true" /></button>
              </div>
              <Dialog.Close className="nav-btn icon-btn gallery-lb-close close-btn close-btn--over" aria-label={c.close} title={c.close}>
                <X size={18} strokeWidth={2.25} aria-hidden="true" />
              </Dialog.Close>
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
