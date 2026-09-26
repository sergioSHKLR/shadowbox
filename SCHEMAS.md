# Record schemas

Every file in `src/data` is JSON. The app reads them. Nothing here holds a Social Security number, a date of birth, a DoD ID, or a home address.

Dates are `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. A missing end date means the item is a single point.

| File | What it is |
| --- | --- |
| `profile.json` | Name, rate, dates of service, sea and foreign service, stripe count, portrait path |
| `awards.json` | One ribbon type: precedence, image, count, devices, explanation, criteria |
| `award-instances.json` | Each time an award was given. `year` may be null when the form lists the award and the worksheet does not date it |
| `units.json` | Commands, with NEC, dates, and a `placeId` |
| `operations.json` | Deployments and the campaign phase name |
| `schools.json` | Courses. `placeConfidence` is `recorded`, `inferred`, or `unknown` |
| `necs.json` | Navy Enlisted Classifications and time in each |
| `uniforms.json` | The fourteen uniforms, in wear order |
| `places.json` | Map points. `accuracy` is `public-site`, `approximate`, or `placeholder` |
| `warfare.json` / `insignia.json` | Pins and chief insignia |
| `milestones.json` | Enlistment, chief, Fleet Reserve |
| `photos.json` | `{ id, src, alt, caption, kind, subjectId }`. Empty subjects show the blank line |
| `reflections.json` | `{ id, kind, subjectId, text }`. Empty array until notes are added |
| `credits.json` | Ribbon files, licenses, and the portrait note |

`kind` on photos and reflections is one of: `award`, `unit`, `operation`, `school`, `nec`, `uniform`, `warfare`, `place`, `insignia`, `milestone`.

Devices on an award are `{ kind: "star" | "oak" | "letter", metal, count, letter? }`.
