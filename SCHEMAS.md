# Record schemas

Every file in `src/data` is JSON. The app reads them. Nothing here holds a Social Security number, a date of birth, a DoD ID, or a home address.

Dates are `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. A missing end date means the item is a single point.

| File | What it is |
| --- | --- |
| `profile.json` | Who this case is. Name, rate, dates, stripes, portrait, and `caseMarks` (which pins sit on the cloth) |
| `case.json` | The sentences on the case: how to read the rack, timeline, map, sources. Change these for another branch |
| `branches.json` | Short name for a branch code (`USN`, `USA`, `JOINT`, `navy`, `army`, `joint`, `foreign`) |
| `awards.json` | One ribbon type: precedence, image, count, devices, explanation, criteria |
| `award-instances.json` | Each time an award was given. `year` may be null when the form lists the award and the worksheet does not date it. A decoration with more than one instance has a sidebar form for that instance's year, command, operation, and note. Local preview writes this file |
| `units.json` | Commands, with NEC, dates, a `placeId`, optional `workcenter`, and an optional crest `image` in `incoming/` |
| `command-plates.json` | One row per case command: in/out rank, ending rack with counts, warfare pins, and extra crests that slide in after the plate |
| `operations.json` | Deployments and the campaign phase name |
| `schools.json` | Courses. `placeConfidence` is `recorded`, `inferred`, or `unknown` |
| `necs.json` | Navy Enlisted Classifications and time in each |
| `uniforms.json` | The uniforms. `group` is one of `pt`, `organizational`, `work`, `dress`, `battle`; `order` is wear order within the page. `image` is the numbered v12 figurine in `public/uniforms/v12` (`01-`…`24-`). Personal `*-wear.jpg` shots belong in `photos.json`, not on the cover |
| `places.json` | Map points. `type` is `city`, `base`, or `visit`. `accuracy` is `public-site`, `approximate`, or `placeholder` |
| `sequence.json` | Ordered career places for the Map and the Timeline Places list. Each row is `{ order, label, cityId, baseId, commandId, kind, when }`. `cityId` / `baseId` are place ids (or null). `commandId` is a unit or school id (or null). `when` is blank unless already recorded. Numbers stay fixed when Map layers are filtered. No collapsing of return visits. |
| `visits.json` | Legacy visit records still used for place detail sidebars. Map order comes from `sequence.json`, not from visit sort keys |
| `warfare.json` / `insignia.json` | Pins and chief insignia |
| `milestones.json` | Enlistment, chief, retirement |
| `photos.json` | `{ id, src, alt, caption, subjects: [{ kind, id }] }`. One still can list several On Duty, Off Duty, command, operation, or uniform records. Empty subjects show the blank line |
| `photo-remarks.json` | `{ "/equipment/….jpg": "Remarks" }`. One note per still, keyed by `src`. Typed in the sidebar; local preview writes this file. Allowed prefixes: `/equipment/`, `/photos/`, and `/uniforms/v12/*-wear.`. Numbered figurines stay the cover cards and are not remarked |
| `reflections.json` | `{ id, kind, subjectId, text }`. Empty array until notes are added |
| `credits.json` | Ribbon files, licenses, and the portrait note |
| `medals.json` | Full-size medal art. `front` is `/incoming/medals/{id}.png`. Sizes are inches. |

The Decorations page is off the menu. Drop finished slides in `incoming/decorations` as `YYYY.png` or `YYYY-MM.png` if that page comes back. Timeline uniform slides are `incoming/plates/`.

A second sailor is a new set of these files, not a change to the layout. Another branch needs a line in `branches.json`, a rack width in `profile.json` (`rackColumns`), and its own sentences in `case.json`. Drawings exist for a chief’s anchor, a chief rating badge, service stripes, ESWS, and EXW. Any other pin shows its abbreviation until a drawing is added.

`kind` on photo subjects and reflections is one of: `award`, `unit`, `operation`, `school`, `nec`, `uniform`, `warfare`, `place`, `insignia`, `milestone`, `equipment`. An optional `open` string on an award, unit, school, or operation is a blank the case should still admit.

Devices on an award are `{ kind: "star" | "oak" | "letter", metal, count, letter? }`.
