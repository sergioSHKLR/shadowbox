# incoming/ INDEX (art-upload, Oct 18 2026)

## Rule (Sergio, Oct 18 2026)

- **Photos only:** the Decorations page and every sidebar / pop-up panel anywhere on the site (e.g. the panel that opens when a small ribbon is tapped on the Logbook).
- **SVG / illustrations only:** everything else (Home case, Logbook racks, Uniform plates, etc.).
- Photo-realistic raster art lives under `photos/` (`photos/medals`, `photos/sidebar`, `photos/rack`, plus `photos/insignia`, `photos/uniforms` and the personal/source photos); vectors and illustrations are in the other folders. Each row below is marked **photo** or **illustration**.

## Reference for ribbon order and device placement

`photos/rack/ribbon-rack-final.png` (final E7-2 rack from a professional rack builder; Sergio chat attachment Oct 18 17:15) is the authoritative reference for ribbon order and device placement, e.g. on the SSDR the bronze star is on the viewer's left and the silver star on the viewer's right. Order, top row first, viewer's left to right:

1. JSCM (oak leaf), NCM
2. ARCOM (oak leaf), JSAM, NAM (4 gold stars)
3. AAM, JMUA (2 oak leaves), NMUC (4 bronze stars)
4. Navy E (EEE), NGCM (1 silver star), NDSM
5. ACM (2 bronze stars), ICM (2 bronze stars), GWOTSM
6. HSM, SSDR (bronze left, silver right), OSR (1 silver star)
7. NATO, Expert Rifleman (E), Expert Pistol (E)

Plate check against it (Oct 18): every plate keeps this relative order and device placement; earlier plates simply have fewer ribbons/devices for their date (e1/e3/e4 have no ribbons). Award counts were not judged.

## Sources

- **Sergio upload**: `upload/` in ab2036a "Raw art upload" (403 files), moved here with `git mv` and renamed to site slot names.
- **live site**: byte-identical copy from main 2ce3fa6, to fill slots the upload has no file for.
- **Sergio chat attachment Oct 18 17:15**: the final ribbon rack (photos/rack/).
- **superseded**: duplicates, smaller near-duplicates and older versions (kept, not deleted), incl. the previous home-art 077b1f8 set under `_superseded/home-art-077b1f8/`.
- `CATALOG.csv` has the same rows with byte size and SHA-256.

Counts: _superseded 84, case-items 18, crests 31, devices 15, medals 15, misc 9, photos 246, plates 22, ribbons 21, uniform-items 18 (total 479).

## Files

| Path | Slot | Source | Group | Dimensions | Notes |
|---|---|---|---|---|---|
| case-items/9527-card.svg | public/case/9527-card.svg (Admin card) | Sergio upload | illustration | vb 401x254 | identical to home-art 077b1f8 incoming/case-items/9527-card.svg; upload path case-items/9527-card.svg |
| case-items/black-pen.svg | public/case/black-pen.svg (Guestbook pen) | Sergio upload | illustration | vb 38x518 | identical to home-art 077b1f8 incoming/case-items/skilcraft-pen.svg; upload path case-items/skilcraft-pen.svg |
| case-items/calling-card.svg | public/case/calling-card.svg (Contact card) | Sergio upload | illustration | vb 401x254 | identical to home-art 077b1f8 incoming/case-items/calling-card.svg; upload path case-items/calling-card.svg |
| case-items/felt.svg | public/case/felt.svg (case background) | live site (main 2ce3fa6) | illustration | vb 1920x1200 | byte-identical copy of public/case/felt.svg |
| case-items/green-notebook.svg | public/case/green-notebook.svg (Logbook) | Sergio upload | illustration | vb 321x472 | identical to home-art 077b1f8 incoming/case-items/green-notebook.svg; upload path case-items/green-notebook.svg |
| case-items/id-barcode.svg | public/case/id-barcode.svg (ID card overlay) | Sergio upload | illustration | vb 857x254 | identical to live public/case/id-barcode.svg; upload path case-items/id-barcode.svg |
| case-items/id-card.svg | public/case/id-card.svg (ID card) | Sergio upload | illustration | vb 439x680 | identical to home-art 077b1f8 incoming/case-items/mil-id-card.svg; upload path case-items/mil-id-card.svg |
| case-items/id-flag.svg | public/case/id-flag.svg (ID card overlay) | Sergio upload | illustration | vb 450x554 | identical to live public/case/id-flag.svg; upload path case-items/id-flag.svg |
| case-items/id-photo.webp | public/case/id-photo.webp (ID card overlay photo) | Sergio upload | photo | 820x1074 | newer version of the live file (near-identical image, larger); upload path case-items/id-photo.webp |
| case-items/liberty-card.svg | public/case/liberty-card.svg (Off Duty card) | Sergio upload | illustration | vb 401x254 | identical to home-art 077b1f8 incoming/case-items/liberty-card.svg; upload path case-items/liberty-card.svg |
| case-items/navy-dept-seal.svg | public/case/navy-dept-seal.svg (case pop-ups / ID card) | live site (main 2ce3fa6) | illustration | vb 889x889 | byte-identical copy of public/case/navy-dept-seal.svg |
| case-items/passport-maroon.svg | public/case/passport-maroon.svg (Travel book) | Sergio upload | illustration | vb 333x472 | identical to home-art 077b1f8 incoming/case-items/maroon-passport.svg; upload path case-items/maroon-passport.svg |
| case-items/plaque-cpo.svg | public/case/plaque-cpo.svg (CPO plaque) | live site (main 2ce3fa6) | illustration | vb 265x89 | byte-identical copy of public/case/plaque-cpo.svg |
| case-items/plaque-sr.svg | public/case/plaque-sr.svg (SR plaque) | live site (main 2ce3fa6) | illustration | vb 265x89 | byte-identical copy of public/case/plaque-sr.svg |
| case-items/ribbon-rack.svg | public/case/ribbon-rack.svg (Home case rack) | live site (main 2ce3fa6) | illustration | vb 156x98 | byte-identical copy of public/case/ribbon-rack.svg |
| case-items/shirt-lapel.svg | public/case/shirt-lapel.svg (Home shirt lapel overlay; not needed if case-items/shirt-long.svg from the upload is wired) | live site (main 2ce3fa6) | illustration | vb 1455x2438 | byte-identical copy of public/case/shirt-lapel.svg |
| case-items/shirt-long.svg | public/case/shirt-long.svg (Home case shirt) | Sergio upload | illustration | vb 1455x2438 | identical to home-art 077b1f8 incoming/plates/khakis/khakis-case.svg; attached-sleeve khaki shirt with collar; replaces the lapel overlay if wired; upload path plates/khakis/khakis-case.svg |
| case-items/white-cap.svg | none (new item, no live slot) | Sergio upload | illustration | vb 908x409 | identical to home-art 077b1f8 incoming/case-items/white-cap.svg; upload path case-items/white-cap.svg |
| crests/11th-ada.png | public/incoming/11th-ada.webp (unit logo) | Sergio upload | illustration | 904x1354 | newer, higher-resolution version of the live webp; upload path crests/11th-ada.png |
| crests/16th-en.png | public/incoming/16th-en.webp (unit logo) | Sergio upload | illustration | 887x886 | newer, higher-resolution version of the live webp; upload path crests/16th-en.png |
| crests/290jcss.svg | public/incoming/290jcss.webp (unit logo) | Sergio upload | illustration | vb 450x467 | vector version; chosen over the PNG upload; upload path crests/290th-jcss.svg |
| crests/332nd-aew.png | public/incoming/332nd-aew.webp (unit logo) | Sergio upload | illustration | 1594x1573 | newer, higher-resolution version of the live webp; upload path crests/332nd-aew.png |
| crests/3rd-sfg.png | public/incoming/3rd-sfg.webp (unit logo) | Sergio upload | illustration | 853x1018 | newer, higher-resolution version of the live webp; upload path crests/3rd-sfg.png |
| crests/52nd-eod.png | public/incoming/52nd-eod.webp (unit logo) | Sergio upload | illustration | 584x874 | newer, higher-resolution version of the live webp; upload path crests/52nd-eod.png |
| crests/75th-rgr.svg | public/incoming/75th-rgr.svg (unit logo) | Sergio upload | illustration | 134.1x161.847 | identical to live public/incoming/75th-rgr.svg; upload path crests/75th-rgr.svg |
| crests/acu-4.png | public/incoming/acu-4.webp (unit logo) | Sergio upload | illustration | 1024x1024 | newer, higher-resolution version of the live webp; upload path crests/acu-4.png |
| crests/ana.png | public/incoming/ana.svg (unit logo, ANA) | Sergio upload | illustration | 600x600 | raster version; live is SVG; upload path case-items/ana.png |
| crests/as40-crest.svg | public/case/as40-crest.svg (Home case crest) | Sergio upload | illustration | vb 710x711 | identical to home-art 077b1f8 incoming/case-items/as40-crest.svg; upload path case-items/crests/as40-crest.svg |
| crests/auscdt-1.png | public/incoming/auscdt-1.webp (unit logo) | Sergio upload | illustration | 753x1125 | newer, higher-resolution version of the live webp; upload path crests/auscdt-1.png |
| crests/cjsotf-a.png | public/incoming/cjsotf-a.webp (unit logo) | Sergio upload | illustration | 1024x1034 | newer, higher-resolution version of the live webp; upload path crests/cjsotf-a.png |
| crests/cobra-gold.png | public/incoming/cobra-gold.webp (unit logo) | Sergio upload | illustration | 874x933 | newer, higher-resolution version of the live webp; upload path crests/cobra-gold.png |
| crests/cram.png | public/incoming/cram.webp (unit logo) | Sergio upload | illustration | 1024x1042 | newer, higher-resolution version of the live webp; upload path crests/cram.png |
| crests/eodmu11.png | public/incoming/eodmu11.webp (unit logo) | Sergio upload | illustration | 990x999 | newer, higher-resolution version of the live webp; upload path crests/eodmu11.png |
| crests/eodmu5-crest-master-eod.svg | public/case/eodmu5-crest-master-eod.svg (Home case crest: EODMU 5 with Master EOD badge) | live site (main 2ce3fa6) | illustration | vb 719x718 | byte-identical copy of public/case/eodmu5-crest-master-eod.svg |
| crests/eodmu5-crest.svg | public/case/eodmu5-crest.svg (Home case crest) | Sergio upload | illustration | vb 719x718 | identical to home-art 077b1f8 incoming/case-items/eodmu5-crest.svg; upload path case-items/crests/eodmu5-crest.svg |
| crests/jcse-3rd-sqd.png | public/incoming/jcse-3rd-sqd.webp (unit logo) | Sergio upload | illustration | 709x865 | newer, higher-resolution version of the live webp; upload path crests/jcse-3rd-sqd.png |
| crests/jcse-crest.svg | public/case/jcse-crest.svg (Home case crest) | Sergio upload | illustration | vb 1208x1694 | identical to home-art 077b1f8 incoming/case-items/jcse-crest.svg; upload path case-items/crests/jcse-crest.svg |
| crests/lhd-2.png | public/incoming/lhd-2.webp (unit logo) | Sergio upload | illustration | 848x1237 | newer, higher-resolution version of the live webp; upload path crests/lhd-2.png |
| crests/lsd-46.png | public/incoming/lsd-46.webp (unit logo) | Sergio upload | illustration | 912x1160 | newer, higher-resolution version of the live webp; upload path crests/lsd-46.png |
| crests/mnf-i.svg | none (new; no live unit-logo slot) | Sergio upload | illustration | vb 237x285 | upload path crests/mnf-i.svg |
| crests/mwtc.png | none (new; MWTC is a place on the site but has no logo slot) | Sergio upload | illustration | 1024x1024 | upload path crests/mwtc.png |
| crests/ncts-crest.svg | public/case/ncts-crest.svg (Home case crest) | Sergio upload | illustration | vb 631x631 | identical to home-art 077b1f8 incoming/case-items/ncts-crest.svg; upload path case-items/crests/ncts-crest.svg |
| crests/nhjax-crest.svg | public/case/nhjax-crest.svg (Home case crest) | Sergio upload | illustration | vb 299x295 | identical to home-art 077b1f8 incoming/case-items/nhjax-crest.svg; upload path case-items/crests/nhjax-crest.svg |
| crests/rtc.png | public/incoming/rtc.webp (unit logo) | Sergio upload | illustration | 864x1230 | newer, higher-resolution version of the live webp; upload path crests/rtc.png |
| crests/rtn.png | public/incoming/rtn.webp (unit logo) | Sergio upload | illustration | 1023x798 | newer, higher-resolution version of the live webp; upload path crests/rtn.png |
| crests/sercc-crest.svg | public/case/sercc-crest.svg (Home case crest) | Sergio upload | illustration | vb 342x298 | identical to home-art 077b1f8 incoming/case-items/sercc-crest.svg; upload path case-items/crests/sercc-crest.svg |
| crests/sojtf-a.png | public/incoming/sojtf-a.webp (unit logo) | Sergio upload | illustration | 780x936 | newer, higher-resolution version of the live webp; upload path crests/SOJTF-A.png |
| crests/talisman-saber.png | public/incoming/talisman-saber.webp (unit logo) | Sergio upload | illustration | 1035x1022 | newer, higher-resolution version of the live webp; upload path crests/talisman-saber.png |
| crests/troy.png | public/incoming/troy.webp (unit logo) | Sergio upload | illustration | 929x906 | newer, higher-resolution version of the live webp; upload path crests/troy.png |
| devices/battle-1.svg | public/devices/battle-1.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/battle-1.svg |
| devices/battle-2.svg | public/devices/battle-2.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/battle-2.svg |
| devices/battle-3.svg | public/devices/battle-3.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/battle-3.svg |
| devices/bronze-1.svg | public/devices/bronze-1.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/bronze-1.svg |
| devices/bronze-2.svg | public/devices/bronze-2.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/bronze-2.svg |
| devices/bronze-3.svg | public/devices/bronze-3.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/bronze-3.svg |
| devices/bronze-4.svg | public/devices/bronze-4.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/bronze-4.svg |
| devices/gold-1.svg | public/devices/gold-1.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/gold-1.svg |
| devices/gold-2.svg | public/devices/gold-2.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/gold-2.svg |
| devices/gold-3.svg | public/devices/gold-3.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/gold-3.svg |
| devices/gold-4.svg | public/devices/gold-4.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/gold-4.svg |
| devices/oak-1.svg | public/devices/oak-1.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/oak-1.svg |
| devices/oak-2.svg | public/devices/oak-2.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/oak-2.svg |
| devices/silver-1.svg | public/devices/silver-1.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/silver-1.svg |
| devices/silver-bronze.svg | public/devices/silver-bronze.svg | live site (main 2ce3fa6) | illustration | vb 132x36 | byte-identical copy of public/devices/silver-bronze.svg |
| medals/suspension/aam.svg | medal aam: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/AAM-suspension.svg |
| medals/suspension/acm.svg | medal acm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/ACM-suspension.svg |
| medals/suspension/arcom.svg | medal arcom: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/AC-suspension.svg |
| medals/suspension/gwotsm.svg | medal gwotsm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/GWOT-suspension.svg |
| medals/suspension/hsm.svg | medal hsm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/HSM-suspension.svg |
| medals/suspension/icm.svg | medal icm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/ICM-suspension.svg |
| medals/suspension/jsam.svg | medal jsam: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/JSAM-suspension.svg |
| medals/suspension/jscm.svg | medal jscm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/JSCM-suspension.svg |
| medals/suspension/nam.svg | medal nam: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/NAM-suspension.svg |
| medals/suspension/nato.svg | medal nato: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/NATO-suspension.svg |
| medals/suspension/ncm.svg | medal ncm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/NC-suspension.svg |
| medals/suspension/ndsm.svg | medal ndsm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/NDSM-suspension.svg |
| medals/suspension/ngcm.svg | medal ngcm: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/GCM-suspension.svg |
| medals/suspension/pistol.svg | medal pistol: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/PISTOL-suspension.svg |
| medals/suspension/rifle.svg | medal rifle: suspension ribbon drawing (new; no live slot) | Sergio upload | illustration | vb 280x273 | upload path medals/suspension/RIFLE-suspension.svg |
| misc/at-the-helm.jpg | none | Sergio upload | illustration | 736x1128 | sailor-at-the-helm artwork; upload path at-the-helm.jpg |
| misc/black-pen-raster.png | none | Sergio upload | photo | 506x557 | Skilcraft pen raster (was imageedit_66_9716458064.png); upload path case-items/imageedit_66_9716458064.png |
| misc/eod-master-badge-source.jpg | none | Sergio upload | illustration | 1144x928 | Master EOD badge raster, JPEG data (was master-eod.png); source of the live eod-master-badge.svg?; upload path case-items/master-eod.png |
| misc/great-seal-gold.png | none | Sergio upload | illustration | 942x950 | gold Great Seal eagle (was imageedit_2_9122643493.png); upload path case-items/imageedit_2_9122643493.png |
| misc/jcse-teamchief.jpg | none | Sergio upload | illustration | 1277x1003 | JCSE team chief poster; upload path jcse-teamchief.jpg |
| misc/mockup-1.jpg | none | Sergio upload | illustration | 1168x784 | site/shadowbox mockup; upload path mockup-1.jpg |
| misc/mockup-2.jpg | none | Sergio upload | illustration | 1168x784 | site/shadowbox mockup; upload path mockup-2.jpg |
| misc/navy-emblem.svg | none | Sergio upload | illustration | vb 660x520 | Navy emblem (ship/eagle/anchor) in a large viewBox (was esa.svg); not the navy-dept-seal; upload path case-items/esa.svg |
| misc/sand-sailor.jpg | none | Sergio upload | photo | 4657x3435 | sand sailor certificate; JPEG data (was .png); upload path sand-sailor.png |
| photos/album/acu-room-2008-11-14.jpg | public/photos/album/acu-room-2008-11-14.webp (source photo; never-in-set category) | Sergio upload | photo | 1224x1632 | upload path photos/ img-06062.jpg; original of the live image |
| photos/album/arifjan-starbucks-2009-03-20.jpg | public/photos/album/arifjan-starbucks-2009-03-20.webp (source photo; never-in-set category) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04973.jpg; original of the live image; Sergio caption (Oct 18 2026): Camp Arifjan, en route to OIF II |
| photos/album/bunk-room-2006-03-03.jpg | public/photos/album/bunk-room-2006-03-03.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03205.jpg; original of the live image |
| photos/album/dark-uniform-portrait-2006-12-06.jpg | public/photos/album/dark-uniform-portrait-2006-12-06.webp (source photo; never-in-set category) | Sergio upload | photo | 1224x1632 | upload path photos/ img-05447.jpg; original of the live image |
| photos/album/dcu-selfie-2006-06-18.jpg | public/photos/album/dcu-selfie-2006-06-18.webp (source photo; never-in-set category) | Sergio upload | photo | 1728x2304 | upload path photos/ img-03048.jpg; original of the live image |
| photos/album/eodmu5-cap-2006-08-21.jpg | public/photos/album/eodmu5-cap-2006-08-21.webp (source photo; never-in-set category) | Sergio upload | photo | 1224x1632 | upload path photos/ img-05506.jpg; original of the live image |
| photos/album/memorial-day-2025-05-26.png | public/photos/album/memorial-day-2025-05-26.webp (source photo; never-in-set category) | Sergio upload | photo | 1220x2712 | original of the live image (live is a crop of this phone screenshot); upload path photos/Screenshot_20260612-093204_Photos.png |
| photos/album/plate-carrier-2011-12-01.jpg | public/photos/album/plate-carrier-2011-12-01.webp (source photo; never-in-set category) | Sergio upload | photo | 480x640 | upload path photos/ img-04492.jpg; original of the live image |
| photos/album/rooftop-2006-05-07.jpg | public/photos/album/rooftop-2006-05-07.webp (source photo; never-in-set category) | Sergio upload | photo | 1876x1253 | upload path photos/ img-02341.jpg; original of the live image |
| photos/album/tracked-snow-building-2010-03-26.jpg | public/photos/album/tracked-snow-building-2010-03-26.webp (source photo; never-in-set category) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04867.jpg; original of the live image |
| photos/album/tracked-snow-forest-2010-03-30.jpg | public/photos/album/tracked-snow-forest-2010-03-30.webp (source photo; never-in-set category) | Sergio upload | photo | 2160x1440 | upload path photos/ img-02922.jpg; original of the live image |
| photos/album/weapons-rack-2006-03-29.jpg | public/photos/album/weapons-rack-2006-03-29.webp (source photo; never-in-set category) | Sergio upload | photo | 1068x1600 | upload path photos/ img-01034.jpg; original of the live image |
| photos/equipment/ach-helmet-acu-cover.jpg | public/equipment/ach-helmet-acu-cover.webp (source photo; never-in-set category) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04721 (1).jpg; original of the live image |
| photos/equipment/ach-helmet-tan.jpg | public/equipment/ach-helmet-tan.webp (source photo; never-in-set category) | Sergio upload | photo | 1632x1224 | upload path photos/ img-04933.jpg; original of the live image |
| photos/equipment/ach-tan-2.jpg | public/equipment/ach-tan-2.webp (source photo; never-in-set category) | Sergio upload | photo | 1840x1228 | upload path photos/ img-06603.jpg; original of the live image |
| photos/equipment/ach-tan-3.jpg | public/equipment/ach-tan-3.webp (source photo; never-in-set category) | Sergio upload | photo | 1990x1325 | upload path photos/ img-06645.jpg; original of the live image |
| photos/equipment/apc-photo.jpg | public/equipment/apc-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 1728x2304 | upload path photos/ img-03037.jpg; original of the live image |
| photos/equipment/bobcat-skid-steer-photo.jpg | public/equipment/bobcat-skid-steer-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 1445x1079 | upload path photos/ img-00152 (1).jpg; original of the live image |
| photos/equipment/buell-500-photo.jpg | public/equipment/buell-500-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x958 | upload path photos/ img-02376.JPG; original of the live image |
| photos/equipment/c-17-2.jpg | public/equipment/c-17-2.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x958 | upload path photos/ img-00065.jpg; original of the live image |
| photos/equipment/c-17-4.jpg | public/equipment/c-17-4.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x958 | upload path photos/ img-05987.jpg; original of the live image |
| photos/equipment/c-17-7.jpg | public/equipment/c-17-7.webp (source photo; never-in-set category) | Sergio upload | photo | 1066x1600 | upload path photos/ img-01030.jpg; original of the live image |
| photos/equipment/c-17-photo.jpg | public/equipment/c-17-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x958 | upload path photos/ img-05137.jpg; original of the live image |
| photos/equipment/centurion-c-ram-2.jpg | public/equipment/centurion-c-ram-2.webp (source photo; never-in-set category) | Sergio upload | photo | 1600x1071 | upload path photos/ img-00091.jpg; original of the live image |
| photos/equipment/centurion-c-ram-3.jpg | public/equipment/centurion-c-ram-3.webp (source photo; never-in-set category) | Sergio upload | photo | 1600x1200 | upload path photos/ img-01075.jpg; original of the live image |
| photos/equipment/centurion-c-ram-4.jpg | public/equipment/centurion-c-ram-4.webp (source photo; never-in-set category) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04405.jpg; original of the live image |
| photos/equipment/centurion-c-ram.jpg | public/equipment/centurion-c-ram.webp (source photo; never-in-set category) | Sergio upload | photo | 2896x1944 | upload path photos/ img-00973.jpg; original of the live image |
| photos/equipment/chevy-spark-yellow-photo.jpg | public/equipment/chevy-spark-yellow-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 478x640 | upload path photos/ img-04465.jpg; original of the live image |
| photos/equipment/helmet-jerrv.jpg | public/equipment/helmet-jerrv.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03293.jpg; original of the live image |
| photos/equipment/hmmwv-up-armored-photo.jpg | public/equipment/hmmwv-up-armored-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-02258.jpg; original of the live image |
| photos/equipment/iotv-ucp-2.jpg | public/equipment/iotv-ucp-2.webp (source photo; never-in-set category) | Sergio upload | photo | 799x1065 | upload path photos/ img-05593.jpg; original of the live image |
| photos/equipment/jblox.webp | public/equipment/jblox.webp (source photo; never-in-set category) | Sergio upload | photo | 1000x858 | upload path photos/ 1000w_q95.webp; original of the live image |
| photos/equipment/jerrv-6x6-2.jpg | public/equipment/jerrv-6x6-2.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03095.jpg; original of the live image |
| photos/equipment/jerrv-6x6-3.jpg | public/equipment/jerrv-6x6-3.webp (source photo; never-in-set category) | Sergio upload | photo | 799x1065 | upload path photos/ img-03059.jpg; original of the live image |
| photos/equipment/jerrv-6x6-4.jpg | public/equipment/jerrv-6x6-4.webp (source photo; never-in-set category) | Sergio upload | photo | 1439x1079 | upload path photos/ img-04045 (1).jpg; original of the live image |
| photos/equipment/jerrv-6x6-5.jpg | public/equipment/jerrv-6x6-5.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03199.jpg; original of the live image |
| photos/equipment/jerrv-6x6-6.jpg | public/equipment/jerrv-6x6-6.webp (source photo; never-in-set category) | Sergio upload | photo | 1728x2304 | upload path photos/ img-02742.jpg; original of the live image |
| photos/equipment/jerrv-6x6-7.jpg | public/equipment/jerrv-6x6-7.webp (source photo; never-in-set category) | Sergio upload | photo | 1600x1200 | upload path photos/ img-05169.jpg; original of the live image |
| photos/equipment/jerrv-cougar-6x6-photo.jpg | public/equipment/jerrv-cougar-6x6-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03209.jpg; original of the live image |
| photos/equipment/m16a1-2.jpg | public/equipment/m16a1-2.webp (source photo; never-in-set category) | Sergio upload | photo | 799x1065 | upload path photos/ img-05077.jpg; original of the live image; Sergio caption (Oct 18 2026): Fort Bliss |
| photos/equipment/m16a1-3.jpg | public/equipment/m16a1-3.webp (source photo; never-in-set category) | Sergio upload | photo | 926x1237 | upload path photos/ img-05020.jpg; original of the live image |
| photos/equipment/m16a1-4.jpg | public/equipment/m16a1-4.webp (source photo; never-in-set category) | Sergio upload | photo | 799x1065 | upload path photos/ img-02784.jpg; original of the live image |
| photos/equipment/m4-carbine-3.jpg | public/equipment/m4-carbine-3.webp (source photo; never-in-set category) | Sergio upload | photo | 1200x1600 | upload path photos/ img-01032.jpg; original of the live image |
| photos/equipment/m4-carbine-4.jpg | public/equipment/m4-carbine-4.webp (source photo; never-in-set category) | Sergio upload | photo | 1024x768 | upload path photos/ img-04864.jpg; original of the live image; Sergio caption (Oct 18 2026): FOB Delaram |
| photos/equipment/m4-carbine-5.jpg | public/equipment/m4-carbine-5.webp (source photo; never-in-set category) | Sergio upload | photo | 795x1065 | upload path photos/ img-02939.jpg; original of the live image |
| photos/equipment/m4-carbine-photo.jpg | public/equipment/m4-carbine-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 1200x1600 | upload path photos/ img-00053.jpg; original of the live image |
| photos/equipment/mk14-2.jpg | public/equipment/mk14-2.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03253.jpg; original of the live image |
| photos/equipment/mk14-photo.jpg | public/equipment/mk14-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03145.jpg; original of the live image |
| photos/equipment/nissan-sentra-silver-2.jpg | public/equipment/nissan-sentra-silver-2.webp (source photo; never-in-set category) | Sergio upload | photo | 2592x1944 | upload path photos/ img-03568.jpg; original of the live image |
| photos/equipment/nissan-sentra-silver-photo.jpg | public/equipment/nissan-sentra-silver-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 2048x1536 | upload path photos/ img-02710.jpg; original of the live image |
| photos/equipment/plate-carrier-multicam-photo.jpg | public/equipment/plate-carrier-multicam-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 806x1079 | upload path photos/ img-03851 (1).jpg; original of the live image |
| photos/equipment/polaris-ranger-utv-photo.jpg | public/equipment/polaris-ranger-utv-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 2592x1936 | upload path photos/ img-03185.jpg; original of the live image |
| photos/equipment/sportster-1200-2.jpg | public/equipment/sportster-1200-2.webp (source photo; never-in-set category) | Sergio upload | photo | 640x478 | upload path photos/ img-00212.jpg; original of the live image; Sergio caption (Oct 18 2026): South Tampa, JCSE |
| photos/equipment/sportster-1200-3.jpg | public/equipment/sportster-1200-3.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x408 | upload path photos/ img-06544.jpg; original of the live image |
| photos/equipment/sportster-1200-photo.jpg | public/equipment/sportster-1200-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x718 | upload path photos/ img-00202.jpg; original of the live image |
| photos/equipment/swe-dish-flyaway-photo.jpg | public/equipment/swe-dish-flyaway-photo.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x954 | upload path photos/ img-03157.jpg; original of the live image |
| photos/equipment/taclane-kg-175.jpg | public/equipment/taclane-kg-175.webp (source photo; never-in-set category) | Sergio upload | photo | 3840x1880 | original of the live image (live is a crop); upload path photos/KG-175A_&_KG-175_TACLANE_In-Line_Network_Encryptors_-_National_Cryptologic_Museum_-_DSC07957.JPG |
| photos/equipment/toyota-hilux.jpg | public/equipment/toyota-hilux.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x954 | upload path photos/ img-00151.jpg; original of the live image |
| photos/insignia/collar-cpo.webp | public/incoming/collar-cpo.webp (rank collar; currently not displayed, RANK_COLLAR_ON_CARDS=false) | live site (main 2ce3fa6) | photo | 1568x1264 | byte-identical copy of public/incoming/collar-cpo.webp |
| photos/insignia/collar-po1.webp | public/incoming/collar-po1.webp (rank collar; currently not displayed, RANK_COLLAR_ON_CARDS=false) | live site (main 2ce3fa6) | photo | 1192x1600 | byte-identical copy of public/incoming/collar-po1.webp |
| photos/insignia/collar-po2.webp | public/incoming/collar-po2.webp (rank collar; currently not displayed, RANK_COLLAR_ON_CARDS=false) | live site (main 2ce3fa6) | photo | 1192x1600 | byte-identical copy of public/incoming/collar-po2.webp |
| photos/insignia/collar-po3.webp | public/incoming/collar-po3.webp (rank collar; currently not displayed, RANK_COLLAR_ON_CARDS=false) | live site (main 2ce3fa6) | photo | 1192x1600 | byte-identical copy of public/incoming/collar-po3.webp |
| photos/insignia/esws-pin-photo.png | none (photo alternative to esws-pin) | Sergio upload | photo | 868x303 | upload path uniform-items/photos/esws.png |
| photos/insignia/exw-pin-photo.png | none (photo alternative to exw-pin) | Sergio upload | photo | 744x240 | upload path uniform-items/photos/exw.png |
| photos/insignia/jcse-badge.png | public/decorations/photo/jcse-badge.avif + .webp on deco-photos (local; Decorations left breast JCSE badge) | Sergio upload | photo | 573x660 | Sergio chat attachment Oct 18 2026 19:21 BRT; transparent PNG; metal JCSE identification badge photo; site copies are 350x404 with the soft white edge fringe tightened |
| photos/medals/aam.png | medal aam: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/AAM.png; upload path medals/rack/AAM.png |
| photos/medals/acm.png | medal acm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/ACM.png; upload path medals/rack/ACM.png |
| photos/medals/arcom.png | medal arcom: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/AC.png; upload path medals/rack/AC.png |
| photos/medals/gwotsm.png | medal gwotsm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/GWOT-SM.png; upload path medals/rack/GWOT-SM.png |
| photos/medals/hsm.png | medal hsm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/HSM.png; upload path medals/rack/HSM.png |
| photos/medals/icm.png | medal icm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/ICM.png; upload path medals/rack/ICM.png |
| photos/medals/jsam.png | medal jsam: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/JSAM.png; upload path medals/rack/JSAM.png |
| photos/medals/jscm.png | medal jscm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/JCOM.png; upload path medals/rack/JCOM.png |
| photos/medals/nam.png | medal nam: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/NAM.png; upload path medals/rack/NAM.png |
| photos/medals/nato.png | medal nato: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/NATO.png; upload path medals/rack/NATO.png |
| photos/medals/ncm.png | medal ncm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/NC.png; upload path medals/rack/NC.png |
| photos/medals/ndsm.png | medal ndsm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/NDM.png; upload path medals/rack/NDM.png |
| photos/medals/ngcm.png | medal ngcm: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/GCM.png; upload path medals/rack/GCM.png |
| photos/medals/pistol.png | medal pistol: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/PISTOL.png; upload path medals/rack/PISTOL.png |
| photos/medals/rifle.png | medal rifle: single medal (no live slot shown; candidate for the unused src/art/medals illustration slots) | Sergio upload | photo | 604x1321 | identical to home-art 077b1f8 incoming/medals/rack/RIFLE.png; upload path medals/rack/RIFLE.png |
| photos/rack/ribbon-rack-final.avif | Decorations rack (final E7-2 woven ribbon rack; not wired) | Sergio chat attachment Oct 18 17:15 | photo | 672x427 | web size, realistic woven ribbons; original name 01M58AEXF54N0FXXQWJ6A2MB4E.avif |
| photos/rack/ribbon-rack-final.png | Decorations rack (final E7-2 woven ribbon rack; not wired) | Sergio chat attachment Oct 18 17:15 | photo | 2229x1421 | full size, realistic woven ribbons; original name 01M58AEY3QQH2Y9CF6ZTWQCN2A.png |
| photos/sidebar/aam.png | medal aam: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-aam.png; upload path medals/sidebar/all-aam.png |
| photos/sidebar/acm.png | medal acm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-acm.png; upload path medals/sidebar/all-acm.png |
| photos/sidebar/arcom.png | medal arcom: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-ac.png; upload path medals/sidebar/all-ac.png |
| photos/sidebar/gwotsm.png | medal gwotsm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-gwot-sm.png; upload path medals/sidebar/all-gwot-sm.png |
| photos/sidebar/hsm.png | medal hsm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-hsm.png; upload path medals/sidebar/all-hsm.png |
| photos/sidebar/icm.png | medal icm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-icm.png; upload path medals/sidebar/all-icm.png |
| photos/sidebar/jsam.png | medal jsam: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-jsam.png; upload path medals/sidebar/all-jsam.png |
| photos/sidebar/jscm.png | medal jscm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-jcom.png; upload path medals/sidebar/all-jcom.png |
| photos/sidebar/nam.png | medal nam: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-nam.png; upload path medals/sidebar/all-nam.png |
| photos/sidebar/nato.png | medal nato: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-nato.png; upload path medals/sidebar/all-nato.png |
| photos/sidebar/ncm.png | medal ncm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-nc.png; upload path medals/sidebar/all-nc.png |
| photos/sidebar/ndsm.png | medal ndsm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-ndm.png; upload path medals/sidebar/all-ndm.png |
| photos/sidebar/ngcm.png | medal ngcm: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-gcm.png; upload path medals/sidebar/all-gcm.png |
| photos/sidebar/pistol.png | medal pistol: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/pistol-all.png; upload path medals/sidebar/pistol-all.png |
| photos/sidebar/rifle.png | medal rifle: ribbon bar + front + reverse sheet (format of live photo/<id>-set.webp; not wired) | Sergio upload | photo | 1322x1510 | identical to home-art 077b1f8 incoming/medals/sidebar/all-rifle.png; upload path medals/sidebar/all-rifle.png |
| photos/site/eodmu5-flag.jpg | public/photos/eodmu5-flag.webp (source photo; never-in-set category) | Sergio upload | photo | 1600x1200 | upload path photos/ img-00052.jpg; original of the live image |
| photos/uniforms-wear/afg-civilian-wear.jpg | public/uniforms/v12/afg-civilian-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 1277x954 | upload path photos/ img-01077.jpg; original of the live image |
| photos/uniforms-wear/cpo-sdw-wear.jpg | public/uniforms/v12/cpo-sdw-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 645x1280 | upload path photos/ img-08083.jpg; original of the live image |
| photos/uniforms-wear/cpo-working-khaki-wear.jpg | public/uniforms/v12/cpo-working-khaki-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 1944x2592 | upload path photos/ img-00898.jpg; original of the live image |
| photos/uniforms-wear/desert-dcu-wear.jpg | public/uniforms/v12/desert-dcu-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 2016x1341 | upload path photos/ img-02266.JPG; original of the live image |
| photos/uniforms-wear/nsu-peanut-butter-wear.jpg | public/uniforms/v12/nsu-peanut-butter-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 795x1065 | upload path photos/ img-00308.jpg; original of the live image |
| photos/uniforms-wear/nwu-type-i-wear.jpg | public/uniforms/v12/nwu-type-i-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 704x960 | upload path photos/ img-08009.jpg; original of the live image |
| photos/uniforms-wear/sdb-crackerjack-wear.jpg | public/uniforms/v12/sdb-crackerjack-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 4000x2250 | original of the live image (live is rotated/cropped); upload path photos/img-02369.jpg |
| photos/uniforms-wear/sdw-crackerjack-wear.jpg | public/uniforms/v12/sdw-crackerjack-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 1198x1600 | upload path photos/ img-05191.jpg; original of the live image |
| photos/uniforms-wear/summer-white-wear.jpg | public/uniforms/v12/summer-white-wear.webp (source photo; never-in-set category) | Sergio upload | photo | 1944x2592 | upload path photos/ img-03483.jpg; original of the live image |
| photos/uniforms/01-smurfs-boot-camp.png | public/uniforms/v12/01-smurfs-boot-camp.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ pt-1.png; newer version of the live image |
| photos/uniforms/02-navy-ptu.png | public/uniforms/v12/02-navy-ptu.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ pt-2.png; newer version of the live image |
| photos/uniforms/03-eodmu-5-pt-2-b.png | public/uniforms/v12/03-eodmu-5-pt-2-b.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ pt-3.png; newer version of the live image |
| photos/uniforms/04-jcse-pt.png | public/uniforms/v12/04-jcse-pt.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ pt-4.png; newer version of the live image |
| photos/uniforms/05-eodmu-5-pt-1.webp | public/uniforms/v12/05-eodmu-5-pt-1.webp (uniform card; never-in-set category) | Sergio upload | photo | 720x1280 | identical to live public/uniforms/v12/cut/05-eodmu-5-pt-1.webp; upload name organizational-diver.webp; upload path mannequins/organizational-diver.webp |
| photos/uniforms/06-dungarees.png | public/uniforms/v12/06-dungarees.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ daily-dungarees.png; newer version of the live image |
| photos/uniforms/07-utilities.png | public/uniforms/v12/07-utilities.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ daily-utilities.png; newer version of the live image |
| photos/uniforms/08-coveralls.png | public/uniforms/v12/08-coveralls.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ organizational-coveralls.png; newer version of the live image |
| photos/uniforms/09-nwu-type-i.png | public/uniforms/v12/09-nwu-type-i.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ battle-blue-camo.png; newer version of the live image |
| photos/uniforms/10-nsu-peanut-butter.png | public/uniforms/v12/10-nsu-peanut-butter.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ working-khaki-po.png; newer version of the live image |
| photos/uniforms/11-cpo-working-khaki.png | public/uniforms/v12/11-cpo-working-khaki.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ cpo-khakis.png; newer version of the live image |
| photos/uniforms/12-winter-blue.png | public/uniforms/v12/12-winter-blue.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ working-blue-po.png; newer version of the live image |
| photos/uniforms/13-summer-white.png | public/uniforms/v12/13-summer-white.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ working-whites-po.png; newer version of the live image |
| photos/uniforms/14-cpo-summer-white.png | public/uniforms/v12/14-cpo-summer-white.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ working-whites-cpo.png; newer version of the live image |
| photos/uniforms/15-sdb-crackerjack.png | public/uniforms/v12/15-sdb-crackerjack.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ dress-blues-po.png; newer version of the live image |
| photos/uniforms/16-sdw-crackerjack.png | public/uniforms/v12/16-sdw-crackerjack.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ dress-whites-po.png; newer version of the live image |
| photos/uniforms/17-cpo-sdb.png | public/uniforms/v12/17-cpo-sdb.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ dress-blues-cpo.png; newer version of the live image |
| photos/uniforms/18-cpo-sdw.png | public/uniforms/v12/18-cpo-sdw.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ dress-whites-cpo.png; newer version of the live image |
| photos/uniforms/19-woodland-bdu.png | public/uniforms/v12/19-woodland-bdu.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ battle-woodland.png; newer version of the live image |
| photos/uniforms/20-desert-dcu.png | public/uniforms/v12/20-desert-dcu.webp (uniform card; never-in-set category) | Sergio upload | photo | 554x992 | upload path mannequins/ battle-desert.png; newer version of the live image |
| photos/uniforms/21-army-acu.png | public/uniforms/v12/21-army-acu.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ battle-acu.png; newer version of the live image |
| photos/uniforms/22-army-ocp.png | public/uniforms/v12/22-army-ocp.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ battle-multicam.png; newer version of the live image |
| photos/uniforms/23-nwu-type-iii.png | public/uniforms/v12/23-nwu-type-iii.webp (uniform card; never-in-set category) | Sergio upload | photo | 1080x1920 | upload path mannequins/ battle-green-camo.png; newer version of the live image |
| photos/uniforms/24-afg-civilian-attire-c.webp | public/uniforms/v12/24-afg-civilian-attire-c.webp (uniform card; never-in-set category) | Sergio upload | photo | 720x1280 | identical to live public/uniforms/v12/cut/24-afg-civilian-attire-c.webp; upload name organizational-contractor.webp; upload path mannequins/organizational-contractor.webp |
| photos/unmatched/full.jpg | none (not on the live site) | Sergio upload | photo | 1280x853 | upload path photos/ full.jpg |
| photos/unmatched/images-6.jpg | none (not on the live site) | Sergio upload | photo | 343x583 | upload path photos/ images (6).jpeg |
| photos/unmatched/images-7.jpg | none (not on the live site) | Sergio upload | photo | 547x365 | upload path photos/ images (7).jpeg |
| photos/unmatched/images-8.jpg | none (not on the live site) | Sergio upload | photo | 455x439 | upload path photos/ images (8).jpeg |
| photos/unmatched/img-00045.jpg | none (not on the live site) | Sergio upload | photo | 1200x1600 | upload path photos/ img-00045.jpg |
| photos/unmatched/img-00064.jpg | none (not on the live site) | Sergio upload | photo | 1200x1600 | upload path photos/ img-00064.jpg; Sergio caption (Oct 18 2026): outside the chow hall blown up in a green-on-blue attack, Mosul, OIF I (note: the Marez memorial) |
| photos/unmatched/img-00117.jpg | none (not on the live site) | Sergio upload | photo | 1280x1024 | upload path photos/ img-00117.jpg; Sergio caption (Oct 18 2026): CHU (containerized housing unit) at JB Balad, under TF Iron Shield (OIF II, 2009) |
| photos/unmatched/img-00127.jpg | none (not on the live site) | Sergio upload | photo | 1036x1382 | upload path photos/ img-00127.jpg |
| photos/unmatched/img-00700.jpg | none (not on the live site) | Sergio upload | photo | 1277x639 | upload path photos/ img-00700.jpg |
| photos/unmatched/img-00766.jpg | none (not on the live site) | Sergio upload | photo | 4160x3120 | upload path photos/ img-00766.jpg |
| photos/unmatched/img-01037.jpg | none (not on the live site) | Sergio upload | photo | 1536x2048 | upload path photos/ img-01037.jpg |
| photos/unmatched/img-01045.jpg | none (not on the live site) | Sergio upload | photo | 1536x2048 | upload path photos/ img-01045.jpg |
| photos/unmatched/img-01048.jpg | none (not on the live site) | Sergio upload | photo | 360x480 | upload path photos/ img-01048.jpg |
| photos/unmatched/img-01053.jpg | none (not on the live site) | Sergio upload | photo | 1303x1304 | upload path photos/ img-01053.jpg |
| photos/unmatched/img-01059.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-01059.jpg |
| photos/unmatched/img-01061.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-01061.jpg; Sergio caption (Oct 18 2026): FOB Sykes (OIF I 2006) |
| photos/unmatched/img-01067.jpg | none (not on the live site) | Sergio upload | photo | 1600x1200 | upload path photos/ img-01067.jpg |
| photos/unmatched/img-01069-1.jpg | none (not on the live site) | Sergio upload | photo | 1600x1200 | upload path photos/ img-01069 (1).jpg |
| photos/unmatched/img-01078.jpg | none (not on the live site) | Sergio upload | photo | 1536x2048 | upload path photos/ img-01078.jpg |
| photos/unmatched/img-02168.jpg | none (not on the live site) | Sergio upload | photo | 1544x1024 | upload path photos/ img-02168.jpg |
| photos/unmatched/img-02222.jpg | none (not on the live site) | Sergio upload | photo | 1544x1024 | upload path photos/ img-02222.jpg; Sergio caption (Oct 18 2026): San Diego, downtown carrier museum (USS Midway) |
| photos/unmatched/img-02257.jpg | none (not on the live site) | Sergio upload | photo | 2128x2832 | upload path photos/ img-02257.JPG |
| photos/unmatched/img-02335.jpg | none (not on the live site) | Sergio upload | photo | 2048x1536 | upload path photos/ img-02335.JPG |
| photos/unmatched/img-02540.jpg | none (not on the live site) | Sergio upload | photo | 2304x1728 | upload path photos/ img-02540.JPG |
| photos/unmatched/img-02615.jpg | none (not on the live site) | Sergio upload | photo | 2113x1413 | upload path photos/ img-02615.JPG; Sergio caption (Oct 18 2026): OIF I, Duhok, Kurdistan, by giant flag at the dam |
| photos/unmatched/img-02625.jpg | none (not on the live site) | Sergio upload | photo | 1536x2048 | upload path photos/ img-02625.JPG |
| photos/unmatched/img-02636.jpg | none (not on the live site) | Sergio upload | photo | 1536x2048 | upload path photos/ img-02636.JPG |
| photos/unmatched/img-02684.jpg | none (not on the live site) | Sergio upload | photo | 1536x2048 | upload path photos/ img-02684.JPG |
| photos/unmatched/img-02731.jpg | none (not on the live site) | Sergio upload | photo | 2048x1536 | upload path photos/ img-02731.jpg |
| photos/unmatched/img-02804.jpg | none (not on the live site) | Sergio upload | photo | 2048x1536 | upload path photos/ img-02804.jpg |
| photos/unmatched/img-02931.jpg | none (not on the live site) | Sergio upload | photo | 2304x1728 | upload path photos/ img-02931.jpg |
| photos/unmatched/img-02954.jpg | none (not on the live site) | Sergio upload | photo | 2304x1728 | upload path photos/ img-02954.jpg |
| photos/unmatched/img-02976.png | none (not on the live site) | Sergio upload | photo | 892x1586 | upload path photos/ img-02976.jpg; extension fixed |
| photos/unmatched/img-02979.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-02979.jpg |
| photos/unmatched/img-03010.jpg | none (not on the live site) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03010.jpg |
| photos/unmatched/img-03088.jpg | none (not on the live site) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03088.jpg |
| photos/unmatched/img-03140.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-03140.jpg |
| photos/unmatched/img-03210.jpg | none (not on the live site) | Sergio upload | photo | 1936x2592 | upload path photos/ img-03210.jpg |
| photos/unmatched/img-03228.jpg | none (not on the live site) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03228.jpg |
| photos/unmatched/img-03302.jpg | none (not on the live site) | Sergio upload | photo | 2304x1728 | upload path photos/ img-03302.jpg |
| photos/unmatched/img-03325.jpg | none (not on the live site) | Sergio upload | photo | 1728x2304 | upload path photos/ img-03325.jpg |
| photos/unmatched/img-03367.jpg | none (not on the live site) | Sergio upload | photo | 1277x954 | upload path photos/ img-03367.jpg |
| photos/unmatched/img-03377.jpg | none (not on the live site) | Sergio upload | photo | 2592x1936 | upload path photos/ img-03377.jpg; Sergio caption (Oct 18 2026): FOB Orgun-E |
| photos/unmatched/img-03442.jpg | none (not on the live site) | Sergio upload | photo | 2592x1944 | upload path photos/ img-03442.jpg |
| photos/unmatched/img-03771.jpg | none (not on the live site) | Sergio upload | photo | 2592x1944 | upload path photos/ img-03771.jpg |
| photos/unmatched/img-03793.jpg | none (not on the live site) | Sergio upload | photo | 1277x954 | upload path photos/ img-03793.jpg |
| photos/unmatched/img-03867.jpg | none (not on the live site) | Sergio upload | photo | 1277x954 | upload path photos/ img-03867.jpg |
| photos/unmatched/img-03883-1.jpg | none (not on the live site) | Sergio upload | photo | 1445x1079 | upload path photos/ img-03883 (1).jpg |
| photos/unmatched/img-03911.jpg | none (not on the live site) | Sergio upload | photo | 1277x851 | upload path photos/ img-03911.jpg; Sergio caption (Oct 18 2026): needs a larger photo (Sergio to supply) |
| photos/unmatched/img-03936.jpg | none (not on the live site) | Sergio upload | photo | 2160x1440 | upload path photos/ img-03936.jpg; Sergio caption (Oct 18 2026): JCSE, MacDill AFB |
| photos/unmatched/img-03981.jpg | none (not on the live site) | Sergio upload | photo | 2160x1440 | upload path photos/ img-03981.jpg; Sergio caption (Oct 18 2026): JCSE, MacDill AFB |
| photos/unmatched/img-04342.jpg | none (not on the live site) | Sergio upload | photo | 1134x907 | upload path photos/ img-04342.jpg |
| photos/unmatched/img-04372.jpg | none (not on the live site) | Sergio upload | photo | 480x640 | upload path photos/ img-04372.jpg |
| photos/unmatched/img-04378.jpg | none (not on the live site) | Sergio upload | photo | 480x640 | upload path photos/ img-04378.jpg |
| photos/unmatched/img-04406.jpg | none (not on the live site) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04406.jpg |
| photos/unmatched/img-04426.jpg | none (not on the live site) | Sergio upload | photo | 1088x870 | upload path photos/ img-04426.jpg |
| photos/unmatched/img-04470.jpg | none (not on the live site) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04470.jpg |
| photos/unmatched/img-04510.jpg | none (not on the live site) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04510.jpg |
| photos/unmatched/img-04539.jpg | none (not on the live site) | Sergio upload | photo | 480x640 | upload path photos/ img-04539.jpg |
| photos/unmatched/img-04694.jpg | none (not on the live site) | Sergio upload | photo | 984x1311 | upload path photos/ img-04694.jpg; Sergio caption (Oct 18 2026): unknown |
| photos/unmatched/img-04716.jpg | none (not on the live site) | Sergio upload | photo | 768x1024 | upload path photos/ img-04716.jpg |
| photos/unmatched/img-04722.jpg | none (not on the live site) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04722.jpg |
| photos/unmatched/img-04790.jpg | none (not on the live site) | Sergio upload | photo | 1280x1024 | upload path photos/ img-04790.jpg |
| photos/unmatched/img-04922.jpg | none (not on the live site) | Sergio upload | photo | 1205x1600 | upload path photos/ img-04922.jpg |
| photos/unmatched/img-05011.png | none (not on the live site) | Sergio upload | photo | 1057x599 | upload path photos/ img-05011.jpg; extension fixed |
| photos/unmatched/img-05055.jpg | none (not on the live site) | Sergio upload | photo | 902x1354 | upload path photos/ img-05055.jpg; Sergio caption (Oct 18 2026): EODMU 11, prior to OIF I |
| photos/unmatched/img-05080.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-05080.jpg |
| photos/unmatched/img-05262.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-05262.jpg; Sergio caption (Oct 18 2026): receiving AAM for OIF I at EODMU 5 |
| photos/unmatched/img-05296.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-05296.jpg; Sergio caption (Oct 18 2026): same AAM ceremony at EODMU 5; Sergio is last on the right |
| photos/unmatched/img-05300.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-05300.jpg; Sergio caption (Oct 18 2026): same AAM ceremony, EODMU 5 |
| photos/unmatched/img-05314.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05314.jpg |
| photos/unmatched/img-05398.jpg | none (not on the live site) | Sergio upload | photo | 1224x1632 | upload path photos/ img-05398.jpg |
| photos/unmatched/img-05401.jpg | none (not on the live site) | Sergio upload | photo | 1224x1632 | upload path photos/ img-05401.jpg |
| photos/unmatched/img-05420.jpg | none (not on the live site) | Sergio upload | photo | 1085x725 | upload path photos/ img-05420.jpg |
| photos/unmatched/img-05459.jpg | none (not on the live site) | Sergio upload | photo | 1277x964 | upload path photos/ img-05459.jpg; Sergio caption (Oct 18 2026): U-Tapao base, Cobra Gold 06 |
| photos/unmatched/img-05468.jpg | none (not on the live site) | Sergio upload | photo | 1277x964 | upload path photos/ img-05468.jpg |
| photos/unmatched/img-05543.jpg | none (not on the live site) | Sergio upload | photo | 1024x768 | upload path photos/ img-05543.jpg; Sergio caption (Oct 18 2026): NEC 9613 school, San Diego |
| photos/unmatched/img-05575.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05575.jpg |
| photos/unmatched/img-05576.jpg | none (not on the live site) | Sergio upload | photo | 799x1065 | upload path photos/ img-05576.jpg; Sergio caption (Oct 18 2026): Fort Bliss |
| photos/unmatched/img-05579.jpg | none (not on the live site) | Sergio upload | photo | 1200x1600 | upload path photos/ img-05579.jpg |
| photos/unmatched/img-05597.jpg | none (not on the live site) | Sergio upload | photo | 799x1065 | upload path photos/ img-05597.jpg |
| photos/unmatched/img-05629.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05629.jpg; Sergio caption (Oct 18 2026): sometime during OIF I |
| photos/unmatched/img-05659.jpg | none (not on the live site) | Sergio upload | photo | 1277x964 | upload path photos/ img-05659.jpg |
| photos/unmatched/img-05705.jpg | none (not on the live site) | Sergio upload | photo | 799x1065 | upload path photos/ img-05705.jpg; Sergio caption (Oct 18 2026): inside a C-17, en route to OIF I at Mosul |
| photos/unmatched/img-05759.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-05759.jpg |
| photos/unmatched/img-05767.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05767.jpg |
| photos/unmatched/img-05783.jpg | none (not on the live site) | Sergio upload | photo | 1283x1008 | upload path photos/ img-05783.jpg |
| photos/unmatched/img-05802.jpg | none (not on the live site) | Sergio upload | photo | 799x1065 | upload path photos/ img-05802.jpg |
| photos/unmatched/img-05816.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-05816.jpg |
| photos/unmatched/img-05822.jpg | none (not on the live site) | Sergio upload | photo | 960x1280 | upload path photos/ img-05822.jpg |
| photos/unmatched/img-05868.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05868.jpg; Sergio caption (Oct 18 2026): Yokosuka CFA, visiting a JSDF ship to survey SATCOM capabilities, while at EODMU 5 |
| photos/unmatched/img-05880.jpg | none (not on the live site) | Sergio upload | photo | 1224x1632 | upload path photos/ img-05880.jpg |
| photos/unmatched/img-05895.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05895.jpg |
| photos/unmatched/img-05897.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-05897.jpg |
| photos/unmatched/img-05905.jpg | none (not on the live site) | Sergio upload | photo | 1224x1632 | upload path photos/ img-05905.jpg |
| photos/unmatched/img-05922.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05922.jpg |
| photos/unmatched/img-05925.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05925.jpg |
| photos/unmatched/img-05932.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05932.jpg |
| photos/unmatched/img-05965.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-05965.jpg; Sergio caption (Oct 18 2026): en route to OIF I, C-17 |
| photos/unmatched/img-05980.jpg | none (not on the live site) | Sergio upload | photo | 1632x1224 | upload path photos/ img-05980.jpg; Sergio caption (Oct 18 2026): hiking at Fort Bliss |
| photos/unmatched/img-06017.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-06017.jpg |
| photos/unmatched/img-06046.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-06046.jpg |
| photos/unmatched/img-06068.jpg | none (not on the live site) | Sergio upload | photo | 809x1079 | upload path photos/ img-06068.jpg |
| photos/unmatched/img-06096.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-06096.jpg |
| photos/unmatched/img-06140.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-06140.jpg |
| photos/unmatched/img-06294.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-06294.jpg |
| photos/unmatched/img-06373.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-06373.jpg |
| photos/unmatched/img-06385.jpg | none (not on the live site) | Sergio upload | photo | 799x1065 | upload path photos/ img-06385.jpg; Sergio caption (Oct 18 2026): Pattaya, during the second Cobra Gold |
| photos/unmatched/img-06456.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-06456.jpg |
| photos/unmatched/img-06473.jpg | none (not on the live site) | Sergio upload | photo | 1280x960 | upload path photos/ img-06473.jpg |
| photos/unmatched/img-06523.jpg | none (not on the live site) | Sergio upload | photo | 1105x1918 | upload path photos/ img-06523.jpg |
| photos/unmatched/img-06818.jpg | none (not on the live site) | Sergio upload | photo | 1277x958 | upload path photos/ img-06818.jpg |
| photos/unmatched/img-06894.jpg | none (not on the live site) | Sergio upload | photo | 799x1065 | upload path photos/ img-06894.jpg; Sergio caption (Oct 18 2026): OEF I or II, C-17 |
| photos/unmatched/img-07870.jpg | none (not on the live site) | Sergio upload | photo | 720x1280 | upload path photos/ img-07870.jpg |
| photos/unmatched/img_20250709_184532_792.jpg | none (not on the live site) | Sergio upload | photo | 812x1079 | upload path photos/ IMG_20250709_184532_792.jpg |
| plates/blues/e7/e7-blues-jcse.svg | src/art/plates/e7-blues-jcse.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/blues/e7/e7-1.svg; upload path plates/blues/e7/e7-1.svg |
| plates/blues/e7/e7-blues-nh.svg | src/art/plates/e7-blues-nh.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/blues/e7/e7-2.svg; upload path plates/blues/e7/e7-2.svg |
| plates/blues/up-to-e6/e1-blues.svg | src/art/plates/e1-blues.svg | Sergio upload | illustration | vb 1261x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/sr.svg; upload path plates/blues/up-to-e6/sr.svg |
| plates/blues/up-to-e6/e3-blues.svg | src/art/plates/e3-blues.svg | Sergio upload | illustration | vb 1261x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/sn.svg; upload path plates/blues/up-to-e6/sn.svg |
| plates/blues/up-to-e6/e4-blues.svg | src/art/plates/e4-blues.svg | Sergio upload | illustration | vb 1261x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/po3.svg; upload path plates/blues/up-to-e6/po3.svg |
| plates/blues/up-to-e6/e5-blues.svg | src/art/plates/e5-blues.svg | Sergio upload | illustration | vb 1261x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/po2.svg; upload path plates/blues/up-to-e6/po2.svg |
| plates/blues/up-to-e6/e6-1-blues.svg | src/art/plates/e6-1-blues.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/po1-1.svg; upload path plates/blues/up-to-e6/po1-1.svg |
| plates/blues/up-to-e6/e6-2-blues.svg | src/art/plates/e6-2-blues.svg | Sergio upload | illustration | vb 1261x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/po1-2.svg; upload path plates/blues/up-to-e6/po1-2.svg |
| plates/blues/up-to-e6/e6-3-blues.svg | src/art/plates/e6-3-blues.svg | Sergio upload | illustration | vb 1261x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/po1-3.svg; upload path plates/blues/up-to-e6/po1-3.svg |
| plates/blues/up-to-e6/e6-4-blues.svg | src/art/plates/e6-4-blues.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/blues/up-to-e6/po1-4.svg; upload path plates/blues/up-to-e6/po1-4.svg |
| plates/khakis/e7/e7-jcse-khakis.svg | src/art/plates/e7-jcse-khakis.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/khakis/e7-1.svg; upload path plates/khakis/e7-1.svg |
| plates/khakis/e7/e7-nh-khakis.svg | src/art/plates/e7-nh-khakis.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/khakis/e7-2.svg; upload path plates/khakis/e7-2.svg |
| plates/whites/e7/e7-jcse-whites.svg | src/art/plates/e7-jcse-whites.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/whites/e7/e7-1.svg; upload path plates/whites/e7/e7-1.svg |
| plates/whites/e7/e7-nh-whites.svg | src/art/plates/e7-nh-whites.svg | Sergio upload | illustration | vb 1285x2268 | CHANGED vs home-art 077b1f8 (plate fix); upload path plates/whites/e7/e7-2.svg |
| plates/whites/up-to-e6/e1-whites.svg | src/art/plates/e1-whites.svg | Sergio upload | illustration | vb 1259x2263 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/sr.svg; upload path plates/whites/up-to-e6/sr.svg |
| plates/whites/up-to-e6/e3-whites.svg | src/art/plates/e3-whites.svg | Sergio upload | illustration | vb 1259x2263 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/sn.svg; upload path plates/whites/up-to-e6/sn.svg |
| plates/whites/up-to-e6/e4-whites.svg | src/art/plates/e4-whites.svg | Sergio upload | illustration | vb 1259x2263 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/po3.svg; upload path plates/whites/up-to-e6/po3.svg |
| plates/whites/up-to-e6/e5-whites.svg | src/art/plates/e5-whites.svg | Sergio upload | illustration | vb 1259x2263 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/po2.svg; upload path plates/whites/up-to-e6/po2.svg |
| plates/whites/up-to-e6/e6-1-whites.svg | src/art/plates/e6-1-whites.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/po1-1.svg; upload path plates/whites/up-to-e6/po1-1.svg |
| plates/whites/up-to-e6/e6-2-whites.svg | src/art/plates/e6-2-whites.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/po1-2.svg; upload path plates/whites/up-to-e6/po1-2.svg |
| plates/whites/up-to-e6/e6-3-whites.svg | src/art/plates/e6-3-whites.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/po1-3.svg; upload path plates/whites/up-to-e6/po1-3.svg |
| plates/whites/up-to-e6/e6-4-whites.svg | src/art/plates/e6-4-whites.svg | Sergio upload | illustration | vb 1285x2268 | identical to home-art 077b1f8 incoming/plates/whites/up-to-e6/po1-4.svg; upload path plates/whites/up-to-e6/po1-4.svg |
| ribbons/aam.svg | public/ribbons/aam.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/aam.svg; upload path ribbons/AAM.svg |
| ribbons/acm.svg | public/ribbons/acm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/acm.svg; upload path ribbons/ACM.svg |
| ribbons/arcom.svg | public/ribbons/arcom.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/arcom.svg; upload path ribbons/ARCOM.svg |
| ribbons/gwotsm.svg | public/ribbons/gwotsm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/gwotsm.svg; upload path ribbons/GWOTSM.svg |
| ribbons/hsm.svg | public/ribbons/hsm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/hsm.svg; upload path ribbons/HSM.svg |
| ribbons/icm.svg | public/ribbons/icm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/icm.svg; upload path ribbons/ICM.svg |
| ribbons/jmua.svg | public/ribbons/jmua.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/jmua.svg; upload path ribbons/JMUA.svg |
| ribbons/jsam.svg | public/ribbons/jsam.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/jsam.svg; upload path ribbons/JSAM.svg |
| ribbons/jscm.svg | public/ribbons/jscm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/jscm.svg; upload path ribbons/JSCM.svg |
| ribbons/nam.svg | public/ribbons/nam.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/nam.svg; upload path ribbons/NAM.svg |
| ribbons/nato.svg | public/ribbons/nato.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/nato.svg; upload path ribbons/NATO.svg |
| ribbons/navy-e.svg | public/ribbons/navy-e.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/navy-e.svg; upload path ribbons/E.svg |
| ribbons/ncm.svg | public/ribbons/ncm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/ncm.svg; upload path ribbons/NC.svg |
| ribbons/ndsm.svg | public/ribbons/ndsm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/ndsm.svg; upload path ribbons/ NDSM.svg |
| ribbons/ngcm.svg | public/ribbons/ngcm.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/ngcm.svg; upload path ribbons/GCM.svg |
| ribbons/nmuc.svg | public/ribbons/nmuc.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/nmuc.svg; upload path ribbons/ MUC.svg |
| ribbons/osr.svg | public/ribbons/osr.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/osr.svg; upload path ribbons/OSR.svg |
| ribbons/pistol.svg | public/ribbons/pistol.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/pistol.svg; upload path ribbons/PISTOL.svg |
| ribbons/rifle.svg | public/ribbons/rifle.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/rifle.svg; upload path ribbons/RIFLE.svg |
| ribbons/ssdr.svg | public/ribbons/ssdr.svg | Sergio upload | illustration | vb 132x36 | identical to live public/ribbons/ssdr.svg; upload path ribbons/SSDR.svg |
| ribbons/ribbon-weave-mask.svg | none yet (shared overlay for drawn ribbons; not wired on main) | Sergio upload | illustration | vb 51.78x13.98 | weave texture overlay at ribbon proportions (transparent; 15 horizontal 15%-black stripes, edge stripes offset half a pitch); for the drawn ribbons only (Logbook, Uniforms, Home), never the photo Decorations/sidebars; Sergio Oct 18 2026; upload name ribbon-mask.svg |
| uniform-items/collar-chief.svg | public/insignia/collar-chief.svg (insignia pages) | live site (main 2ce3fa6) | illustration | vb 96x96 | byte-identical copy of public/insignia/collar-chief.svg |
| uniform-items/cpo-collar.svg | public/case/cpo-collar.svg (CPO collar anchor) | Sergio upload | illustration | vb 378x378 | identical to home-art 077b1f8 incoming/uniform-items/cpo-anchor.svg; upload path uniform-items/drawings/cpo-anchor.svg |
| uniform-items/e3-stripes.svg | public/incoming/e3-stripes.svg (Ranks: rank image on Logbook rank cards / Commands) | live site (main 2ce3fa6) | illustration | vb 336x349 | byte-identical copy of public/incoming/e3-stripes.svg |
| uniform-items/eod-master-badge.svg | public/case/eod-master-badge.svg (Master EOD badge, nested in the EODMU 5 crest) | live site (main 2ce3fa6) | illustration | vb 3315x2700 | byte-identical copy of public/case/eod-master-badge.svg |
| uniform-items/esws-pin.svg | public/case/esws-pin.svg (ESWS pin) | Sergio upload | illustration | vb 378x129 | identical to home-art 077b1f8 incoming/uniform-items/esws.svg; upload path uniform-items/drawings/esws.svg |
| uniform-items/et-symbol.svg | public/insignia/et-symbol.svg (ET rating mark) | Sergio upload | illustration | vb 87x90 | identical to live public/insignia/et-symbol.svg; upload path et-symbol.svg |
| uniform-items/exw-pin.svg | public/case/exw-pin.svg (EXW pin) | Sergio upload | illustration | vb 378x134 | identical to home-art 077b1f8 incoming/uniform-items/exw.svg; upload path uniform-items/drawings/exw.svg |
| uniform-items/jcse-device.svg | public/insignia/jcse-device.svg | Sergio upload | illustration | vb 1208x1359 | identical to home-art 077b1f8 incoming/uniform-items/jcse-device.svg; upload path uniform-items/drawings/jcse-device.svg |
| uniform-items/patch-e4-red.svg | public/incoming/patch-e4-red.svg (Ranks: rank image on Logbook rank cards / Commands) | live site (main 2ce3fa6) | illustration | vb 356x585 | byte-identical copy of public/incoming/patch-e4-red.svg |
| uniform-items/patch-e5-red.svg | public/incoming/patch-e5-red.svg (Ranks: rank image on Logbook rank cards / Commands) | live site (main 2ce3fa6) | illustration | vb 356x585 | byte-identical copy of public/incoming/patch-e5-red.svg |
| uniform-items/patch-e6-gold.svg | public/incoming/patch-e6-gold.svg (Ranks: rank image on Logbook rank cards / Commands) | live site (main 2ce3fa6) | illustration | vb 356x585 | byte-identical copy of public/incoming/patch-e6-gold.svg |
| uniform-items/patch-e6-red.svg | public/incoming/patch-e6-red.svg (Ranks: rank image on Logbook rank cards / Commands) | live site (main 2ce3fa6) | illustration | vb 356x585 | byte-identical copy of public/incoming/patch-e6-red.svg |
| uniform-items/patch-e7-gold.svg | public/incoming/patch-e7-gold.svg (Ranks: rank image on Logbook rank cards / Commands) | live site (main 2ce3fa6) | illustration | vb 356x585 | byte-identical copy of public/incoming/patch-e7-gold.svg |
| uniform-items/po1-gold-collar.svg | public/case/po1-gold-collar.svg | Sergio upload | illustration | vb 278x377 | identical to home-art 077b1f8 incoming/uniform-items/po1-gold.svg; upload path uniform-items/drawings/po1-gold.svg |
| uniform-items/po1-silver-collar.svg | public/case/po1-silver-collar.svg | Sergio upload | illustration | vb 278x377 | identical to home-art 077b1f8 incoming/uniform-items/po1-silver.svg; upload path uniform-items/drawings/po1-silver.svg |
| uniform-items/po2-silver-collar.svg | public/case/po2-silver-collar.svg | Sergio upload | illustration | vb 298x345 | identical to home-art 077b1f8 incoming/uniform-items/po2.svg; upload path uniform-items/drawings/po2.svg |
| uniform-items/po3-silver-collar.svg | public/case/po3-silver-collar.svg | Sergio upload | illustration | vb 299x273 | identical to home-art 077b1f8 incoming/uniform-items/po3.svg; upload path uniform-items/drawings/po3.svg |
| uniform-items/ribbon-devices.svg | none (device sheet; live devices are devices/*.svg) | Sergio upload | illustration | vb 189x38 | identical to home-art 077b1f8 incoming/uniform-items/ribbon-devices.svg; upload path uniform-items/drawings/ribbon-devices.svg |
| _superseded/crests/290jcss.png | public/incoming/290jcss.webp | superseded | illustration | 1008x1057 | raster version of crests/290jcss.svg (also newer than live); upload path crests/290jcss.png |
| _superseded/home-art-077b1f8/case-items/9527-card.svg | – | superseded (home-art 077b1f8) | illustration | vb 401x254 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/9527-card.svg |
| _superseded/home-art-077b1f8/case-items/as40-crest.svg | – | superseded (home-art 077b1f8) | illustration | vb 710x711 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/as40-crest.svg |
| _superseded/home-art-077b1f8/case-items/calling-card.svg | – | superseded (home-art 077b1f8) | illustration | vb 401x254 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/calling-card.svg |
| _superseded/home-art-077b1f8/case-items/eodmu5-crest.svg | – | superseded (home-art 077b1f8) | illustration | vb 719x718 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/eodmu5-crest.svg |
| _superseded/home-art-077b1f8/case-items/green-notebook.svg | – | superseded (home-art 077b1f8) | illustration | vb 321x472 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/green-notebook.svg |
| _superseded/home-art-077b1f8/case-items/istockphoto-116768830-612x612.jpg | – | superseded (home-art 077b1f8) | photo | 612x223 | not in the upload; no site slot; was incoming/case-items/istockphoto-116768830-612x612.jpg |
| _superseded/home-art-077b1f8/case-items/jcse-crest.svg | – | superseded (home-art 077b1f8) | illustration | vb 1208x1694 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/jcse-crest.svg |
| _superseded/home-art-077b1f8/case-items/liberty-card.svg | – | superseded (home-art 077b1f8) | illustration | vb 401x254 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/liberty-card.svg |
| _superseded/home-art-077b1f8/case-items/maroon-passport.svg | – | superseded (home-art 077b1f8) | illustration | vb 333x472 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/maroon-passport.svg |
| _superseded/home-art-077b1f8/case-items/mil-id-card.svg | – | superseded (home-art 077b1f8) | illustration | vb 439x680 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/mil-id-card.svg |
| _superseded/home-art-077b1f8/case-items/ncts-crest.svg | – | superseded (home-art 077b1f8) | illustration | vb 631x631 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/ncts-crest.svg |
| _superseded/home-art-077b1f8/case-items/nhjax-crest.svg | – | superseded (home-art 077b1f8) | illustration | vb 299x295 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/nhjax-crest.svg |
| _superseded/home-art-077b1f8/case-items/sercc-crest.svg | – | superseded (home-art 077b1f8) | illustration | vb 342x298 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/sercc-crest.svg |
| _superseded/home-art-077b1f8/case-items/skilcraft-pen.svg | – | superseded (home-art 077b1f8) | illustration | vb 38x518 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/skilcraft-pen.svg |
| _superseded/home-art-077b1f8/case-items/white-cap.svg | – | superseded (home-art 077b1f8) | illustration | vb 908x409 | byte-identical duplicate of the upload file now in incoming/; was incoming/case-items/white-cap.svg |
| _superseded/home-art-077b1f8/medals/rack/AAM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/AAM.png |
| _superseded/home-art-077b1f8/medals/rack/AC.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/AC.png |
| _superseded/home-art-077b1f8/medals/rack/ACM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/ACM.png |
| _superseded/home-art-077b1f8/medals/rack/GCM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/GCM.png |
| _superseded/home-art-077b1f8/medals/rack/GWOT-SM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/GWOT-SM.png |
| _superseded/home-art-077b1f8/medals/rack/HSM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/HSM.png |
| _superseded/home-art-077b1f8/medals/rack/ICM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/ICM.png |
| _superseded/home-art-077b1f8/medals/rack/JCOM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/JCOM.png |
| _superseded/home-art-077b1f8/medals/rack/JSAM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/JSAM.png |
| _superseded/home-art-077b1f8/medals/rack/NAM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/NAM.png |
| _superseded/home-art-077b1f8/medals/rack/NATO.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/NATO.png |
| _superseded/home-art-077b1f8/medals/rack/NC.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/NC.png |
| _superseded/home-art-077b1f8/medals/rack/NDM.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/NDM.png |
| _superseded/home-art-077b1f8/medals/rack/PISTOL.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/PISTOL.png |
| _superseded/home-art-077b1f8/medals/rack/RIFLE.png | – | superseded (home-art 077b1f8) | photo | 604x1321 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/rack/RIFLE.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-aam.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-aam.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-ac.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-ac.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-acm.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-acm.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-gcm.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-gcm.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-gwot-sm.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-gwot-sm.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-hsm.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-hsm.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-icm.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-icm.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-jcom.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-jcom.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-jsam.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-jsam.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-nam.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-nam.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-nato.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-nato.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-nc.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-nc.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-ndm.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-ndm.png |
| _superseded/home-art-077b1f8/medals/sidebar/all-rifle.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/all-rifle.png |
| _superseded/home-art-077b1f8/medals/sidebar/pistol-all.png | – | superseded (home-art 077b1f8) | photo | 1322x1510 | byte-identical duplicate of the upload file now in incoming/; was incoming/medals/sidebar/pistol-all.png |
| _superseded/home-art-077b1f8/plates/blues/e7/e7-1.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/e7/e7-1.svg |
| _superseded/home-art-077b1f8/plates/blues/e7/e7-2.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/e7/e7-2.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/po1-1.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/po1-1.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/po1-2.svg | – | superseded (home-art 077b1f8) | illustration | vb 1261x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/po1-2.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/po1-3.svg | – | superseded (home-art 077b1f8) | illustration | vb 1261x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/po1-3.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/po1-4.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/po1-4.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/po2.svg | – | superseded (home-art 077b1f8) | illustration | vb 1261x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/po2.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/po3.svg | – | superseded (home-art 077b1f8) | illustration | vb 1261x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/po3.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/sn.svg | – | superseded (home-art 077b1f8) | illustration | vb 1261x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/sn.svg |
| _superseded/home-art-077b1f8/plates/blues/up-to-e6/sr.svg | – | superseded (home-art 077b1f8) | illustration | vb 1261x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/blues/up-to-e6/sr.svg |
| _superseded/home-art-077b1f8/plates/khakis/e7-1.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/khakis/e7-1.svg |
| _superseded/home-art-077b1f8/plates/khakis/e7-2.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/khakis/e7-2.svg |
| _superseded/home-art-077b1f8/plates/khakis/khakis-case.svg | – | superseded (home-art 077b1f8) | illustration | vb 1455x2438 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/khakis/khakis-case.svg |
| _superseded/home-art-077b1f8/plates/whites/e7/e7-1.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/e7/e7-1.svg |
| _superseded/home-art-077b1f8/plates/whites/e7/e7-2.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | older version of plates/whites/e7/e7-nh-whites.svg (upload has the GCM fix); was incoming/plates/whites/e7/e7-2.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/po1-1.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/po1-1.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/po1-2.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/po1-2.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/po1-3.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/po1-3.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/po1-4.svg | – | superseded (home-art 077b1f8) | illustration | vb 1285x2268 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/po1-4.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/po2.svg | – | superseded (home-art 077b1f8) | illustration | vb 1259x2263 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/po2.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/po3.svg | – | superseded (home-art 077b1f8) | illustration | vb 1259x2263 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/po3.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/sn.svg | – | superseded (home-art 077b1f8) | illustration | vb 1259x2263 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/sn.svg |
| _superseded/home-art-077b1f8/plates/whites/up-to-e6/sr.svg | – | superseded (home-art 077b1f8) | illustration | vb 1259x2263 | byte-identical duplicate of the upload file now in incoming/; was incoming/plates/whites/up-to-e6/sr.svg |
| _superseded/home-art-077b1f8/uniform-items/cpo-anchor.svg | – | superseded (home-art 077b1f8) | illustration | vb 378x378 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/cpo-anchor.svg |
| _superseded/home-art-077b1f8/uniform-items/esws.svg | – | superseded (home-art 077b1f8) | illustration | vb 378x129 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/esws.svg |
| _superseded/home-art-077b1f8/uniform-items/exw.svg | – | superseded (home-art 077b1f8) | illustration | vb 378x134 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/exw.svg |
| _superseded/home-art-077b1f8/uniform-items/jcse-device.svg | – | superseded (home-art 077b1f8) | illustration | vb 1208x1359 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/jcse-device.svg |
| _superseded/home-art-077b1f8/uniform-items/po1-gold.svg | – | superseded (home-art 077b1f8) | illustration | vb 278x377 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/po1-gold.svg |
| _superseded/home-art-077b1f8/uniform-items/po1-silver.svg | – | superseded (home-art 077b1f8) | illustration | vb 278x377 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/po1-silver.svg |
| _superseded/home-art-077b1f8/uniform-items/po2.svg | – | superseded (home-art 077b1f8) | illustration | vb 298x345 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/po2.svg |
| _superseded/home-art-077b1f8/uniform-items/po3.svg | – | superseded (home-art 077b1f8) | illustration | vb 299x273 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/po3.svg |
| _superseded/home-art-077b1f8/uniform-items/ribbon-devices.svg | – | superseded (home-art 077b1f8) | illustration | vb 189x38 | byte-identical duplicate of the upload file now in incoming/; was incoming/uniform-items/ribbon-devices.svg |
| _superseded/photos/unmatched/1000w_q95-1.webp | – | superseded (stock, not Sergio's) | photo | 1000x666 | stock, not Sergio's (Sergio, Oct 18 2026); was photos/unmatched/1000w_q95-1.webp; upload path photos/ 1000w_q95 (1).webp |
| _superseded/ribbons/ribbon mask.svg | – | superseded (duplicate) | illustration | vb 51.78x13.98 | byte-identical duplicate of ribbons/ribbon-weave-mask.svg; Sergio upload a040f71 (Upload graphics v2) as incoming/ribbons/ribbon mask.svg |
| _superseded/ribbons/ribbon-rack.avif | – | superseded (duplicate) | photo | 672x427 | byte-identical duplicate of photos/rack/ribbon-rack-final.avif; Sergio upload a040f71 (Upload graphics v2) as incoming/ribbons/ribbon-rack.avif |
| _superseded/ribbons/ribbon-rack.png | – | superseded (duplicate) | photo | 2229x1421 | byte-identical duplicate of photos/rack/ribbon-rack-final.png; Sergio upload a040f71 (Upload graphics v2) as incoming/ribbons/ribbon-rack.png |
| _superseded/uniform-items/esws.png | – | superseded (duplicate) | photo | 868x303 | exact duplicate of uniform-items/esws-pin-photo.png; upload path uniform-items/esws.png |
| _superseded/uniform-items/exw.png | – | superseded (duplicate) | photo | 744x240 | exact duplicate of uniform-items/exw-pin-photo.png; upload path uniform-items/exw.png |

## Slots still missing

- None among the slots the live site uses outside the never-in-set categories (portraits, medal photos, unit logos, uniforms/v12, equipment, album); gaps were filled from live main 2ce3fa6.
- Not filled, by design: `src/art/medals/*.webp`, `cut/*.webp`, `sheet/*.png` and `public/medals/sheet/*.png` (built into the site but never displayed; every medal on the live site is a photo); `public/insignia/esws.svg` and `exw.svg` (in public/ but referenced nowhere); `public/incoming/placeholder-crest.svg` (unit-logo category).
- Unit logos (never-in-set) with no upload version: ntc, 2nd-marines, 3-3ada, joint-flags, the four service emblem/seal SVGs, placeholder-crest.

## Files with no site slot

- case-items/white-cap.svg; uniform-items/ribbon-devices.svg; crests/mnf-i.svg, crests/mwtc.png.
- medals/suspension/*.svg (15 suspension-ribbon drawings).
- photos/medals/*.png (15 single medals) and photos/sidebar/*.png (15 ribbon bar + front + reverse sheets): by the rule they belong to Decorations / pop-ups; their natural slots are the live photo/<id>-front.webp and photo/<id>-set.webp. Not wired.
- photos/rack/ribbon-rack-final.png/.avif: Decorations rack (new slot; Decorations currently draws its rack from ribbons/*.svg). Not wired.
- photos/insignia/esws-pin-photo.png, exw-pin-photo.png (photo alternatives to the pin drawings).
- misc/ (9 files) and photos/unmatched/ (personal photos not on the live site).
- _superseded/home-art-077b1f8/case-items/istockphoto-116768830-612x612.jpg (from the previous set; not in the upload).

## Open questions

1. Resolved (Sergio, Oct 18): `ntc.png` was his no-anchor RTC variant and was deleted; NTC and RTC have different crests, so the NTC crest is still only the live ntc.webp.
2. crests/290jcss: kept the vector `290jcss.svg` (upload `crests/290th-jcss.svg`) over the PNG (in _superseded). Confirm.
3. Rule exceptions to confirm: `case-items/id-photo.webp` is a photo used on the Home case ID card; `photos/insignia/collar-*.webp` are photo-realistic rank collars (live, currently not displayed: RANK_COLLAR_ON_CARDS = false).
4. Decorations "Ribbons only" view currently uses ribbons/*.svg + devices/*.svg; under the rule it would become the photo rack. Wiring is a later step.
5. Blur rule (Sergio): non-Sergio faces are blurred. Where the live site has a blurred version, the non-blurred original was removed from incoming/; the remaining unblurred photos with non-Sergio (or uncertain) faces are listed in `UNBLURRED.md`.
6. mannequins were placed in photos/uniforms/ under the uniforms/v12 stems they match (never-in-set category); two are byte-identical to live cut/ files.


## Removed (Sergio, Oct 18 2026, git rm)

| Path | Reason |
|---|---|
| _superseded/photos/ach-helmet-acu-cover-img-04721.jpg | duplicate of a kept photo |
| _superseded/photos/apc-photo-img-03037-1.jpg | duplicate of a kept photo |
| _superseded/photos/bobcat-skid-steer-photo-img-00152.jpg | duplicate of a kept photo |
| _superseded/photos/centurion-c-ram-img-01010.jpg | duplicate of a kept photo |
| _superseded/photos/centurion-c-ram-img-05184.jpg | duplicate of a kept photo |
| _superseded/photos/coveralls-wear-img-05066.jpg | non-blurred original of live uniforms/v12/coveralls-wear.webp (live has faces blurred) |
| _superseded/photos/img-01069.jpg | duplicate of a kept photo |
| _superseded/photos/img-03883.jpg | duplicate of a kept photo |
| _superseded/photos/jerrv-6x6-4-img-04045.jpg | duplicate of a kept photo |
| _superseded/photos/plate-carrier-multicam-photo-img-03851.jpg | duplicate of a kept photo |
| _superseded/photos/polaris-ranger-utv-photo-img-03185-1.jpg | duplicate of a kept photo |
| _unsorted/crests/ntc.png | deleted (Sergio): his no-anchor RTC variant; NTC and RTC have different crests |
| photos/album/acu-airliner.jpg | non-blurred original of live photos/album/acu-airliner.webp (live has faces blurred) |
| photos/album/acu-rifles-2009-01-16.jpg | non-blurred original of live photos/album/acu-rifles-2009-01-16.webp (live has faces blurred) |
| photos/album/barracks-hallway-2010-03-28.jpg | non-blurred original of live photos/album/barracks-hallway-2010-03-28.webp (live has faces blurred) |
| photos/album/boonie-pirate-statue-2009-04-17.jpg | non-blurred original of live photos/album/boonie-pirate-statue-2009-04-17.webp (live has faces blurred) |
| photos/album/c-ram-formation-2008-11-27.jpg | non-blurred original of live photos/album/c-ram-formation-2008-11-27.webp (live has faces blurred) |
| photos/album/desert-body-armor-2006-05-05.jpg | non-blurred original of live photos/album/desert-body-armor-2006-05-05.webp (live has faces blurred) |
| photos/album/dress-blues-memorial-2006-02-05.jpg | non-blurred original of live photos/album/dress-blues-memorial-2006-02-05.webp (live has faces blurred) |
| photos/album/eodmu5-aam-ceremony-2006-12-01.jpg | non-blurred original of live photos/album/eodmu5-aam-ceremony-2006-12-01.webp (live has faces blurred) |
| photos/album/m-gator-aircraft-2006-02-21.jpg | non-blurred original of live photos/album/m-gator-aircraft-2006-02-21.webp (live has faces blurred) |
| photos/equipment/c-17-3.jpg | non-blurred original of live equipment/c-17-3.webp (live has faces blurred) |
| photos/equipment/c-17-5.jpg | non-blurred original of live equipment/c-17-5.webp (live has faces blurred) |
| photos/equipment/c-17-6.jpg | non-blurred original of live equipment/c-17-6.webp (live has faces blurred) |
| photos/equipment/helmet-2006-03-03.jpg | non-blurred original of live equipment/helmet-2006-03-03.webp (live has faces blurred) |
| photos/equipment/iotv-ucp-photo.jpg | non-blurred original of live equipment/iotv-ucp-photo.webp (live has faces blurred) |
| photos/equipment/jerrv-6x6-8.jpg | non-blurred original of live equipment/jerrv-6x6-8.webp (live has faces blurred) |
| photos/equipment/m-gator-photo.jpg | non-blurred original of live equipment/m-gator-photo.webp (live has faces blurred) |
| photos/equipment/m16a1.jpg | non-blurred original of live equipment/m16a1.webp (live has faces blurred) |
| photos/equipment/m4-carbine-2.jpg | non-blurred original of live equipment/m4-carbine-2.webp (live has faces blurred) |
| photos/equipment/m60-photo.jpg | non-blurred original of live equipment/m60-photo.webp (live has faces blurred) |
| photos/equipment/polaris-sportsman-atv-photo.jpg | non-blurred original of live equipment/polaris-sportsman-atv-photo.webp (live has faces blurred) |
| photos/uniforms-wear/army-acu-wear.jpg | non-blurred original of live uniforms/v12/army-acu-wear.webp (live has faces blurred) |
| photos/uniforms-wear/coveralls-wear.jpg | non-blurred original of live uniforms/v12/coveralls-wear.webp (live has faces blurred) |
| photos/uniforms-wear/navy-ptu-wear.jpg | non-blurred original of live uniforms/v12/navy-ptu-wear.webp (live has faces blurred) |
| photos/uniforms-wear/winter-blue-wear.jpg | non-blurred original of live uniforms/v12/winter-blue-wear.webp (live has faces blurred) |
| photos/unmatched/img-00830.jpg | near duplicate inside photos/unmatched; kept img-04922.jpg (larger) |
| photos/unmatched/img-01035.jpg | near duplicate inside photos/unmatched; kept img-01037.jpg (larger) |
| photos/unmatched/img-05265.jpg | near duplicate inside photos/unmatched; kept img-05262.jpg (sharper, same size) |
| photos/unmatched/img-06465.jpg | near duplicate inside photos/unmatched; kept img-06473.jpg (sharper, same size) |
| photos/unmatched/img-06683.jpg | non-blurred original of live photos/album/sercc-group-lawn.webp (live has faces blurred) |
| photos/unmatched/screenshot_20260612-093130_photos.png | non-blurred original of live photos/album/gryphon-group-sign.webp (live has faces blurred) |
