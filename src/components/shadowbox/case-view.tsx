function SideRow({ sides, onOpen }: { sides: Side[]; onOpen: (k: Kind, id: string) => void }) {
  return (
    <ul className="supp-tree">
      {sides.map((side) => (
        <li key={side.title + (side.partners[0]?.name ?? "")} className="level-2">
          <button type="button" className="story-crest" onClick={() => side.open && side.id && onOpen(side.open, side.id)} aria-label={side.title}>
            {side.src ? <img src={publicUrl(side.src)} alt="" /> : <span>{side.title}</span>}
          </button>
          <p>{side.title}</p>
          {side.partners.length ? (
            <ul>
              {side.partners.map((partner) => (
                <li key={partner.name} className="level-3"><img src={publicUrl(partner.src)} alt="" /><span>{partner.name}</span></li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
