# Record schemas

Every file in `src/data` is JSON. The app reads them. Nothing here holds a Social Security number, a date of birth, a DoD ID, or a home address.

Dates are `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. A missing end date means the item is a single point.

| File | What it is |
| --- | --- |
| `profile.json` | Who this case is. Name, rate, dates, stripes, portrait, and `caseMarks` (which pins sit on the cloth) |
| `case.json` | The sentences on the case: how to read the rack, timeline, map, sources. Change these for another branch |
| `branches.json` | Short name for a branch code (`USN`, `USA`, `JOINT`, `navy`, `army`, `joint`, `foreign`) |
| `awards.json` | One ribbon type: precedence, image, count, devices, explanation, criteria |
| `award-instances.json` | Each time an award was given. `year` may be null when the form lists the award and the worksheet does not date it |
| `units.json` | Commands, with NEC, dates, a `placeId`, optional `workcenter`, and an optional crest `image` in `public/crests` |
| `command-plates.json` | One row per case command: in/out rank, ending rack with counts, warfare pins, and extra crests that slide in after the plate |
| `operations.json` | Deployments and the campaign phase name |
| `schools.json` | Courses. `placeConfidence` is `recorded`, `inferred`, or `unknown` |
| `necs.json` | Navy Enlisted Classifications and time in each |
| `uniforms.json` | The uniforms. `group` is one of `pt`, `organizational`, `work`, `dress`, `battle`; `order` is wear order within the page. `image` is the figure in `public/uniforms` |
| `places.json` | Map points. `accuracy` is `public-site`, `approximate`, or `placeholder` |
| `warfare.json` / `insignia.json` | Pins and chief insignia |
| `milestones.json` | Enlistment, chief, Fleet Reserve |
| `photos.json` | `{ id, src, alt, caption, kind, subjectId }`. Empty subjects show the blank line |
| `reflections.json` | `{ id, kind, subjectId, text }`. Empty array until notes are added |
| `credits.json` | Ribbon files, licenses, and the portrait note |
| `medals.json` | Full-size medal art. `front` is `/incoming/medals/{id}.png`. Sizes are inches. |

Decorations no longer assemble a rack. Drop finished slides in `incoming/decorations` as `YYYY.png` or `YYYY-MM.png`. The date in the name picks the slide on the timeline.

A second sailor is a new set of these files, not a change to the layout. Another branch needs a line in `branches.json`, a rack width in `profile.json` (`rackColumns`), and its own sentences in `case.json`. Drawings exist for a chief’s anchor, a chief rating badge, service stripes, ESWS, and EXW. Any other pin shows its abbreviation until a drawing is added.

`kind` on photos and reflections is one of: `award`, `unit`, `operation`, `school`, `nec`, `uniform`, `warfare`, `place`, `insignia`, `milestone`. An optional `open` string on an award, unit, school, or operation is a blank the case should still admit.

Devices on an award are `{ kind: "star" | "oak" | "letter", metal, count, letter? }`.
