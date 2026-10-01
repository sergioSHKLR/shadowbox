const RELATED: Record<string, { role: string; name: string; src: string }[]> = {
  tortuga: [{ role: "Partner", name: "ACU 4", src: "/incoming/acu-4.png" }],
  troy: [
    { role: "Partner", name: "EODMU 11", src: "/incoming/eodmu11.png" },
    { role: "Sponsor", name: "52nd EOD", src: "/incoming/52nd-eod.png" },
    { role: "Sponsor", name: "16th EN", src: "/incoming/16th-en.png" },
  ],
  "ia-army": [{ role: "Sponsor", name: "11th ADA", src: "/incoming/11th-ada.png" }],
  cjsotf: [
    { role: "Customer", name: "3rd SFG", src: "/incoming/3rd-sfg.png" },
    { role: "Customer", name: "75th Rangers", src: "/incoming/75th-rgr.png" },
  ],
  "cobra-gold": [{ role: "Partner", name: "Royal Thai Navy", src: "/incoming/rtn.png" }],
  "talisman-saber": [{ role: "Partner", name: "AUSCDT", src: "/incoming/auscdt-1.png" }],
};
function MiniCrests({ id }: { id: string }) {
  const items = RELATED[id] ?? [];
  if (!items.length) return null;
  return (
    <ul className="mini-crests">
      {items.map((item) => (
        <li key={item.name}>
          <img src={publicUrl(item.src)} alt="" />
          <span>{item.role}</span>
          <span>{item.name}</span>
        </li>
      ))}
    </ul>
  );
}
