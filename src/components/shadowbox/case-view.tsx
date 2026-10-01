function Felt({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const [path, setPath] = useState<Card[]>([]);
  const [moreDown, setMoreDown] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const cards = path.length ? path[path.length - 1].children ?? [] : FELT;
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setMoreDown(el.scrollHeight - el.scrollTop - el.clientHeight > 24);
    check();
    el.addEventListener("scroll", check);
    return () => el.removeEventListener("scroll", check);
  }, [path]);
  return (
    <div className="felt-window">
      {path.length ? <button type="button" className="felt-left" onClick={() => setPath(path.slice(0, -1))} aria-label={`Back to ${path.length > 1 ? path[path.length - 2].title : "Supplemental"}`} /> : null}
      <div className="felt-track" style={{ transform: `translateX(-${path.length * 33.333}%)` }}>
        {[0, 1, 2].map((pane) => {
          const shown = pane === path.length;
          return (
            <section key={pane} className="felt-pane" aria-hidden={!shown} ref={shown ? scroller : undefined}>
              <ul>
                {(shown ? cards : []).map((card) => {
                  const image = crest(card);
                  return (
                    <li key={card.title}>
                      <button type="button" onClick={() => { if (card.open && card.id) onOpen(card.open, card.id); if (card.children?.length) setPath([...path, card]); }} aria-label={card.title}>
                        {image ? <img src={publicUrl(image)} alt="" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      {moreDown ? <span className="felt-down" aria-hidden="true" /> : null}
    </div>
  );
}
