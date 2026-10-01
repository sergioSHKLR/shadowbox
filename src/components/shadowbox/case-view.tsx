type Side = { title: string; src?: string; open?: Kind; id?: string; partners: { name: string; src: string }[] };
const LINKED: { id: string; sides: Side[] }[] = [
  {
    id: "eodmu5",
    sides: [
      { title: "Cobra Gold", src: "/incoming/cobra-gold.png", partners: [{ name: "Royal Thai Navy", src: "/incoming/rtn.png" }] },
      { title: "Talisman Saber", src: "/incoming/talisman-saber.png", partners: [{ name: "AUSCDT", src: "/incoming/auscdt-1.png" }] },
      { title: "Operation Iraqi Freedom", src: "/incoming/troy.png", open: "unit", id: "troy", partners: [{ name: "EODMU 11", src: "/incoming/eodmu11.png" }, { name: "52nd EOD", src: "/incoming/52nd-eod.png" }, { name: "16th EN", src: "/incoming/16th-en.png" }] },
    ],
  },
  {
    id: "sercc",
    sides: [
      { title: "Individual Augmentee", src: "/incoming/ia-army.png", open: "unit", id: "ia-army", partners: [] },
      { title: "Operation Iraqi Freedom", open: "unit", id: "ia-army", partners: [{ name: "11th ADA", src: "/incoming/11th-ada.png" }] },
    ],
  },
  {
    id: "jcse",
    sides: [
      { title: "Operation Enduring Freedom", src: "/incoming/cjsotf.png", open: "unit", id: "cjsotf", partners: [{ name: "3rd SFG", src: "/incoming/3rd-sfg.png" }] },
      { title: "Operation Enduring Freedom", src: "/incoming/cjsotf.png", open: "unit", id: "cjsotf", partners: [{ name: "75th Rangers", src: "/incoming/75th-rgr.png" }] },
    ],
  },
];
function SideRow({ sides, onOpen }: { sides: Side[]; onOpen: (k: Kind, id: string) => void }) {
  return (
    <div className="side-row">
      {sides.map((side) => (
        <article key={side.title + (side.partners[0]?.name ?? "")}>
          <button type="button" className="story-crest" onClick={() => side.open && side.id && onOpen(side.open, side.id)} aria-label={side.title}>
            {side.src ? <img src={publicUrl(side.src)} alt="" /> : <span>{side.title}</span>}
          </button>
          <p>{side.title}</p>
          <ul className="mini-crests">
            {side.partners.map((partner) => <li key={partner.name}><img src={publicUrl(partner.src)} alt="" /><span>{partner.name}</span></li>)}
          </ul>
        </article>
      ))}
    </div>
  );
}
