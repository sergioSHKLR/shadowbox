# Changelog

All notable changes to the Shadowbox site (https://shadowbox.shklr.org/) are listed here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dates are Brasília time (BRT).

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
