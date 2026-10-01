              <ul className="patch-row" aria-label="Commands and partners, in career order">
                {tiles.flatMap(({ unit, affiliation }) => {
                  if (!unit) return [];
                  const card = (
                    <li key={unit.id}>
                      <button type="button" className={unit.image && unit.id !== "ia-army" ? "patch has-crest" : "patch"} onClick={() => onOpen("unit", unit.id)} aria-label={`${unit.name}, ${affiliation}. Open the sidebar.`}>
                        {unit.image && unit.id !== "ia-army" ? <img className="patch-crest" src={publicUrl(unit.image)} alt="" /> : null}
                        <span className="patch-mark">{unit.id === "ia-army" ? "IRON" : unit.patch}</span>
                        <span className="designator">{affiliation}</span>
                        <span>{formatSpan(unit.start, unit.end)}</span>
                      </button>
                    </li>
                  );
                  if (unit.id !== "eodmu5") return [card];
                  return [
                    card,
                    ...HOSTS.map((host) => (
                      <li key={host.id}>
                        <button type="button" className="patch" onClick={() => onOpen("unit", "eodmu5")} aria-label={`${host.name}, ${host.affiliation}. Open the EOD Mobile Unit Five sidebar.`}>
                          <span className="patch-mark">{host.patch}</span>
                          <span className="designator">{host.affiliation}</span>
                        </button>
                      </li>
                    )),
                  ];
                })}
              </ul>