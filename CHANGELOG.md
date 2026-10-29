# Changelog

All notable changes to the Shadowbox site (https://shadowbox.shklr.org/) are listed here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dates are Brasília time (BRT).

## [1.10.0] - 2026-10-28

### Changed
- Home case: new default layout from Sergio's sketch, in landscape and portrait (no query parameter needed). Docs column on the left, top to bottom with even gaps: ID card, Liberty card, 2M card, USO card, passport, memorandum. Portraits and plaques on the right, crests on the top line and flags along the bottom.
- Pen moved beside the shirt pocket, to the right of it.
- Flags: 18 national flags with no state flags, United States first, then A–Z, including Guam and Kurdistan.
- Help ("?") button moved inside the case at the bottom left (on the shirt above the hem in portrait).
- Smaller shirt pocket: flap point 55.3 mm, EXW badge 70 mm wide and 1/4 in below the flap, pocket button lowered to clear it.

### Added
- Each flag except Brazil links to its Travel Book entry (e.g. "Japan — Travel Book"). Canada and Ireland have no entry yet and are not linked.

### Fixed
- Case flag images now carry a content-hash version, so updated flags show up without a hard refresh.

## [1.9.1] - 2026-10-22

### Changed
- Portuguese Biography replaced with Sergio's new text: title "Suboficial (Chief) Sergio Schickler", "Marinha dos Estados Unidos, Reformado"; places and English terms in italics (new {{i}} marker); the 2011 redaction kept as in English.
- Biography header dates written out: "30 June 1997 – 28 February 2018" (PT "30 de junho de 1997 – 28 de fevereiro de 2018"). Short dates elsewhere unchanged.

## [1.9.0] - 2026-10-21

### Added
- Settings: Beard On/Off (PT "Barba: Ligada/Desligada"), default Off, saved with the other settings. On swaps the Chief Petty Officer portrait for the bearded photo sitewide: Home case, the portrait pop-up and the Gallery. Centered crop and resize only; captions and credits unchanged.

## [1.8.2] - 2026-10-21

### Changed
- Chief Petty Officer portrait on Home and in the Gallery replaced with a sharper photo from Sergio; centered crop and resize only. Captions and credits unchanged.

## [1.8.1] - 2026-10-21

### Changed
- New Chief Petty Officer portrait (Service Dress Blue) on Home, the Biography and the Gallery, from Sergio's photo; center-cropped and resized only. Captions and credits unchanged.

## [1.8.0] - 2026-10-21

### Changed
- Logbook: each pane opens on the first tab with content at that command, instead of fixed defaults. Upper/left: Rank & Awards, Admin, Photos. Phone lower pane: Crests, On Duty, Map, Decorations, Uniforms, Off Duty. Wide right pane: On Duty, Decorations, Uniforms, Off Duty. Empty tabs are still clickable; a tab picked by hand is kept across commands while it has content. Layout unchanged.

## [1.7.1] - 2026-10-21

### Changed
- Short dates everywhere except the Biography: DD-Mmm-YY / Mmm-YY with PT months (Decorations, Gallery dates and captions, Timeline, Admin, Uniforms, On Duty, Operations, command plates, Travel Book place details, pop-ups). Text dates such as "5 September 1997 to 21 January 1998" read "05-Sep-97 to 21-Jan-98" (PT "05-Set-97 a 21-Jan-98"). Notes in parentheses and history prose stay as written.
- Timeline header service span: 30-Jun-97 – 28-Feb-18.

## [1.7.0] - 2026-10-21

### Changed
- Travel Book and Logbook dates are short: DD-Mmm-YY for a full day (30-Jun-97, 05-Sep-97) and Mmm-YY for a month (Oct-08); a year alone stays as entered, ranges convert each side. PT months: Jan Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez.
- Logbook: command header spans, rank-step dates, school spans, NEC dates and the khakis note use the short form.

### Fixed
- PT site: text dates in the On Duty visits, Travel Book place details and Logbook command extras show Portuguese month names.

## [1.6.0] - 2026-10-21

### Added
- Real page addresses: `/`, `/bio/`, `/logbook/` and `/logbook/<command>/`, `/decorations/` and `/decorations/<award>/`, `/gallery/` and `/gallery/<photo>/` (`/gallery/<n>/` also works), `/timeline/`, `/uniforms/`, `/travel-book/`, `/on-duty/`, `/off-duty/`, `/admin/`, `/guestbook/`, `/contact/`; Portuguese under `/pt/...`. Any other open card rides in `?item=<kind>:<id>`; a Home case item in `?item=case:<id>`.
- Back / Forward step through pages, commands and opened items; a reload or a shared link restores the page, language and open item.
- One static HTML file per page and language (own title, description, canonical, og:* and hreflang), a 404.html that boots the app, and a sitemap with every page and its en / pt-BR / x-default alternates.
- Share sends the current page's address, including the open item.

### Changed
- Service worker: page loads go to the network first (each page's own HTML) and fall back to the cached app offline.
- The first-visit intro shows when Home is on screen, not over a deep link to another page.

## [1.5.0] - 2026-10-20

### Changed
- One UI system: selected is always a gold fill (chips, pills, icon toggles, sidebar tabs); folder tabs stay on the Logbook only.
- Filter chips: 36px pills inside a 44px tap area, one font size; every filter row starts with an All / Todos chip (new on the Gallery).
- Map zoom buttons are brass circles matching the close button.
- Clear selected state for the language flags (gold underline) and the current menu item (gold bar).
- Decorations: controls stack in a left column; Ribbons only shows one rack, Medals and ribbons shows the ribbon rack (with the ribbon-only block) beside the medal rack; stacked on narrow screens.
- Timeline overview: four evenly spaced columns.

### Fixed
- PT site: "Todos" on the On Duty and Off Duty filters, and Logbook dates in Portuguese (e.g. "5 de setembro de 1997").

### Removed
- Old overridden CSS layers for buttons and tabs, so styles stop drifting.

## [1.4.5] - 2026-10-20

### Fixed
- Home case: the v1.4.4 CPO portrait showed a corner of the flag instead of the full portrait; it now shows the full image.

## [1.4.4] - 2026-10-20

### Changed
- Home case: sharper, higher-detail CPO portrait (ribbons, pins and service stripes now legible).

## [1.4.3] - 2026-10-20

### Changed
- Home case ribbon rack: the ribbon weave shading shows in the pop-ups and on sharp (2x) desktop screens, and stays off on small racks.

## [1.4.2] - 2026-10-20

### Fixed
- Consistent fonts: no Georgia or Helvetica fallbacks, and no faux bold (weights capped at the loaded 600).
- Serif for names (command, rank, uniform and item names); sans for UI labels and map controls.

## [1.4.1] - 2026-10-20

### Fixed
- Dark theme: Logbook tiles and mannequin panels use dark card surfaces, with white photos inset and dimmed.

## [1.4.0] - 2026-10-20

### Changed
- Logbook: file-folder tabs replace the pill buttons; on phones the tabs sit in one sideways-scrolling row with soft edge fades.
- Logbook: in portrait the card/tabs split sits 5% higher, giving the lower panel more room.
- Logbook: cards fill each row.
- Logbook: Off Duty order is Motorcycles, Cars, Aircraft.
- Logbook: New PTU removed from JCSE.
- Logbook: section labels translated on the Portuguese site.

## [1.3.1] - 2026-10-20

### Changed
- Close buttons unified: every close is the same brass circle with one X icon (solid navy over photos).
- Close and fullscreen labels are translated on the Portuguese site.

### Fixed
- Dark mode: the intro card close button is now visible.

## [1.3.0] - 2026-10-20

### Changed
- Logbook: each command shows only the ribbons earned there, one ribbon per award. Awards without a recorded command are assigned by date, with one Good Conduct per 3 years.
- Logbook: warfare pins show only where earned (ESWS at Frank Cable, EXW at JCSE).

## [1.2.2] - 2026-10-19

### Fixed
- Removed the unused shirt preload that caused a "preloaded but not used" console warning.
- Light theme: award pop-up and photo panels now use light card backgrounds.
- Light theme opts out of browser forced auto-darkening (color-scheme: only light).

## [1.2.1] - 2026-10-19

### Changed
- Portuguese biography: first 8 paragraphs reworked, title Chefe / reformado; remaining paragraphs shown muted until reworked.

## [1.2.0] - 2026-10-19

### Added
- Uniforms sidebar now shows a photo grid of every Gallery photo of that uniform, opening in the lightbox; empty-state note in EN/PT.

## [1.1.1] - 2026-10-19

### Changed
- Home case felt gradient reversed: darker top-left, navy lower-right.

## [1.1.0] - 2026-10-19

### Added
- **BETA tag:** a small BETA tag next to the Shadowbox title replaces the Work in Progress ribbon.
- **Portuguese Timeline:** the Timeline is translated on the Portuguese site.
- **M1126 Stryker card:** a new tan M1126 Stryker equipment card on EODMU 5's On Duty tab.

### Changed
- **M113 and M60 cards:** color photos on both cards.
- **M113 photo caption:** now reads "M113, Tal Afar, Iraq".

### Fixed
- **Phones held sideways, full case:** taps on items work again in fullscreen (only Close responded before).
- **Phones held sideways, Home intro:** the intro sits below the header instead of being cut off.
- **Phone Timeline:** no more mid-word breaks or headings running off the edges.

## [1.0.2] - 2026-10-19

### Changed
- **Home case pen:** a new vector drawing of the pen in every layout.
- **Home case (upright screens):** the pen is turned to point the other way.

## [1.0.1] - 2026-10-19

### Changed
- **Home case (wide):** the ID, pink 2M, Liberty and passport column moved right to sit midway between the shirt and the portraits.

## [1.0.0] - 2026-10-19

The live site as of October 19, 2026.

### Added
- **Logbook Photos tab:** a new Photos tab next to Admin shows every Gallery photo tied to that command.
- **Work in Progress ribbon:** a black-and-yellow caution-tape ribbon in the top-left corner of every page.
- **New equipment card art:** new pictures for the AN/CYZ-10, TACLANE KG-175, KL-43, KOI-18, KY-99A, KYK-13, AN/PRC-148 and STE cards.

### Changed
- **New uniform plates:** Sergio's updated uniform plate art.
- **Ribbon racks:** a 1-pixel gap between ribbons on the racks the site builds itself (command rows and the drawn Decorations rack). The Logbook's loose ribbons are unchanged.
- **Home case:** the pen sits left of the pocket, the collar point lies over the awards, several cards were lowered and the crests were made smaller.
- **Home layouts from Sergio's sketches:** new arrangements for wide screens, phones and upright tablets. On upright screens the shirt is about two buttons shorter, and the rank devices line up on even guides beside the crests.
- **Gallery tags:** several photos were reassigned to the right command (including EODMU 5, JCSE, NH Jacksonville and SERCC). The chief portrait is labeled as an AI-generated composite.
- **Photo #66 (dress blues at a memorial wall):** now SERCC, located in Jacksonville, FL, and undated because the camera date was probably wrong.
- **Coveralls photo:** now SERCC instead of USS Frank Cable.
- **Off Duty:** the Yamaha XT225 also shows under Talofofo, and the Outlander's hood was restored in its cut-out.
- **Timeline (portrait):** Events moved toward the right edge, with labels to the right of the bullets and the four lanes evenly spaced.
- **Decorations:** the medals are mounted at true scale with the regulation 50% overlap, and devices are centered on the visible ribbon.
- **Logbook tab buttons:** their outlines and highlight rings are no longer cut off at the edges.

### Removed
- **Stock aircraft pictures:** the C-5, C-9, C-130 and C-17 pictures are out of the Gallery and the Logbook Photos tabs. They still appear on their equipment cards.
- **Old photo credits:** the new equipment card art and the four aircraft pictures are uncredited, so their old museum and photo credits were removed.

## Earlier

Changes before October 19, 2026 are recorded in the project's git history on GitHub:
https://github.com/sergioSHKLR/shadowbox/commits/main
