/**
 * Routes (Oct 21 2026): after `vite build --config vite.pages.config.ts`, write one static HTML file per page so a deep
 * link or a reload on GitHub Pages returns 200 with that page's own head (title, description, canonical, og:*, hreflang),
 * in English and in Portuguese (/pt/...). Each file is the built app shell with only the head changed; the app reads the
 * address and shows the page. Also writes 404.html (the same shell, noindex, boots the app for unknown addresses) and
 * sitemap.xml with every page and its en / pt-BR / x-default alternates.
 *
 * Pages are written as <path>/index.html and linked with a trailing slash: GitHub Pages answers /logbook with a redirect
 * to /logbook/ whenever logbook/ is a folder, so the slash form is the one that is always a straight 200.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { runnerImport } from "vite";

const root = process.cwd();
const out = resolve(root, "dist/pages");
const load = async (file) =>
  (await runnerImport(file, { configFile: false, root, logLevel: "error", resolve: { tsconfigPaths: true }, define: { __CASE_V__: "{}" } })).module;

const R = await load("/src/lib/shadowbox/routes.ts");
const { galleryPhotos } = await load("/src/lib/shadowbox/gallery.ts");
const { logbookBeats } = await load("/src/lib/shadowbox/model.ts");

const SITE = R.SITE;
const shell = readFileSync(resolve(out, "index.html"), "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const abs = (src) => (/^https?:/.test(src) ? src : `${SITE}${src.startsWith("/") ? "" : "/"}${src}`);

/** Every page, language-neutral: { view, command?, photo?, award? } */
const pages = [];
for (const view of R.ROUTE_VIEWS) pages.push({ view });
const commands = logbookBeats().map((b) => b.stop.commandId).filter(Boolean);
for (const command of commands) pages.push({ view: "logbook", command });
for (const award of R.AWARD_IDS) pages.push({ view: "decorations", award });
const photoById = new Map(galleryPhotos.map((p) => [p.id, p]));
for (const p of galleryPhotos) pages.push({ view: "gallery", photo: p.id });

function headFor(page, locale) {
  const path = R.pathFor({ ...page, locale });
  const en = `${SITE}${R.pathFor({ ...page, locale: "en" })}`;
  const pt = `${SITE}${R.pathFor({ ...page, locale: "pt" })}`;
  const photo = page.photo ? photoById.get(page.photo) : undefined;
  const meta = R.metaFor({ ...page, locale }, photo);
  const url = `${SITE}${path}`;
  let html = shell;
  const sub = (re, value) => {
    if (!re.test(html)) throw new Error(`write-route-pages: head tag not found: ${re}`);
    html = html.replace(re, value);
  };
  sub(/<html lang="[^"]*"/, `<html lang="${locale === "pt" ? "pt-BR" : "en"}"`);
  sub(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  sub(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(meta.description)}$2`);
  sub(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  sub(/(<link rel="alternate" hreflang="en" href=")[^"]*(")/, `$1${en}$2`);
  sub(/(<link rel="alternate" hreflang="pt-BR" href=")[^"]*(")/, `$1${pt}$2`);
  sub(/(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/, `$1${en}$2`);
  sub(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(meta.title)}$2`);
  sub(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(meta.description)}$2`);
  sub(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  sub(/(<meta property="og:locale" content=")[^"]*(")/, `$1${locale === "pt" ? "pt_BR" : "en_US"}$2`);
  sub(/(<meta property="og:locale:alternate" content=")[^"]*(")/, `$1${locale === "pt" ? "en_US" : "pt_BR"}$2`);
  sub(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(meta.title)}$2`);
  sub(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(meta.description)}$2`);
  if (meta.image) {
    const img = abs(meta.image);
    sub(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(img)}$2`);
    sub(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${esc(img)}$2`);
    // The photo's own size is unknown here; drop the 1200x630 card size and alt that describe og.jpg.
    html = html.replace(/\s*<meta property="og:image:width"[^>]*>/, "").replace(/\s*<meta property="og:image:height"[^>]*>/, "");
    html = html.replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(meta.description)}$2`).replace(/(<meta name="twitter:image:alt" content=")[^"]*(")/, `$1${esc(meta.description)}$2`);
  }
  return { path, html, en, pt };
}

let written = 0;
const urls = [];
for (const page of pages) {
  for (const locale of ["en", "pt"]) {
    const { path, html, en, pt } = headFor(page, locale);
    urls.push({ loc: `${SITE}${path}`, en, pt });
    if (path === "/") continue; // the built root index.html already is the English Home
    const file = resolve(out, `.${path}index.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    written++;
  }
}

// 404.html: the shell for unknown addresses. Same boot, no canonical / og:url, not indexed; the app shows Home.
let nf = shell
  .replace(/<title>[^<]*<\/title>/, "<title>Shadowbox</title>")
  .replace(/\s*<link rel="canonical"[^>]*>/, "")
  .replace(/\s*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, "")
  .replace(/\s*<meta property="og:url"[^>]*>/, "")
  .replace(/<meta charset="UTF-8" \/>/, '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex" />');
writeFileSync(resolve(out, "404.html"), nf);

// sitemap.xml with hreflang alternates.
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...urls.map((u) =>
    [
      "  <url>",
      `    <loc>${esc(u.loc)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${esc(u.en)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${esc(u.pt)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(u.en)}"/>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
  "",
].join("\n");
writeFileSync(resolve(out, "sitemap.xml"), xml);
writeFileSync(resolve(out, "../routes.json"), JSON.stringify(urls.map((u) => u.loc.replace(SITE, "")), null, 0));
console.log(`write-route-pages: ${written} page files + index.html, 404.html, sitemap.xml (${urls.length} URLs: ${pages.length} pages × 2 languages)`);
