# ETC (EXW/SW) Sergio Schickler

United States Navy, Retired  
30 June 1997 – 28 February 2018

A reading copy of the Navy career of Chief Electronics Technician Sergio Schickler. Live at [shadowbox.shklr.org](https://shadowbox.shklr.org/).

The home page is the portrait, the end-state rack, and a short biography. Commands, Timeline, Operations, Map, Uniforms, On Duty, Admin, and Off Duty are in the menu. A crest, ribbon, uniform, or pin opens its explanation beside the page. Language and theme are in Settings.

## What is not here

No Social Security number, date of birth, DoD identification number, or home address.

## Pages

| Page | What it is |
| --- | --- |
| Home | Portrait, ribbon rack, biography |
| Commands | Six assigned commands, rating badges in and out, loose ribbons, in-theater extras |
| Timeline | Uniform plates on top; rank, assignment, deployment, and events tracks below |
| Operations | Four deployments (task force plus campaign) and exercises |
| Map | Commands, deployments, and visits |
| Uniforms | Issued uniforms in wear order |
| On Duty | Gear used on the job |
| Admin | Schools and courses |
| Off Duty | Cars, motorcycles, and places lived |

Decorations is not in the menu. Ready slides, if added later, go in `incoming/decorations`.

## Run

`startup.sh` starts the dev server on port 8080.

## Published site

Pushes to `main` publish the built site from the repository root. GitHub Pages deploys that branch. `public/CNAME` keeps [shadowbox.shklr.org](https://shadowbox.shklr.org/) set on every publish. The old address, mil.shklr.org, is served by the [mil-redirect](https://github.com/sergioSHKLR/mil-redirect) repository, which forwards every path to the same path on shadowbox.shklr.org.

## Edit the record

Facts live in `src/data`. Shapes are in `SCHEMAS.md`. Dates are year-only when the source does not give a day. Blank beats a guess. DD-214 wins on dates and award counts.

Drop new art in `incoming/`:

- Command and unit crests as `{name}.png` or `.svg`
- Uniform plates as `incoming/plates/{stage}{look}.svg` (1a–6b jumpers, 7b CPO blues, 7c CPO whites, 7k khaki)
- Medal illustrations as `incoming/medals/{ID}.png`
- Rating badges as `incoming/patch-e4-red.svg` through `patch-e7-gold.svg`

Ribbon SVGs are in `public/ribbons`, ribbon devices in `public/devices`, pins in `public/insignia`, uniform photos in `public/uniforms/v12`, gear photos in `public/equipment`, portraits in `public/photos`. Collar devices for Commands are `public/incoming/collar-po3.jpg` through `collar-cpo.jpg`.
