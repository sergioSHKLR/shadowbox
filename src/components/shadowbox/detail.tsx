import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  photosFor,
  awards,
  medalFor,
  placeById,
  pinNumbersFor,
  publicUrl,
  reflectionFor,
  toSubject,
  type Selection,
  type Stop,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";
import { MedalArt, RibbonArt } from "@/components/shadowbox/marks";

export function DetailPanel({
  selection,
  onSelect,
  onClose,
}: {
  selection: Selection | null;
  onSelect: (sel: Selection) => void;
  onClose: () => void;
}) {
  const subject = selection ? toSubject(selection) : null;
  const photos = selection ? photosFor(selection.kind, selection.id) : [];
  const words = selection ? reflectionFor(selection.kind, selection.id) : null;
  const stops: Stop[] = useMemo(() => {
    if (!subject) return [];
    return subject.placeIds
      .map((id) => placeById(id))
      .filter((place): place is NonNullable<typeof place> => Boolean(place && place.lat != null))
      .map((place) => ({ place, labels: [place.locality], when: "", n: pinNumbersFor(place.id)[0] }));
  }, [subject]);

  return (
    <Dialog.Root open={Boolean(subject)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="detail-overlay" />
        <Dialog.Content className="detail-panel" aria-describedby={undefined}>
          {subject ? (
            <>
              <div className="detail-head">
                <div>
                  <p className="kicker">{subject.kicker}</p>
                  <Dialog.Title className="detail-title">{subject.title}</Dialog.Title>
                </div>
                <Dialog.Close className="icon-btn" aria-label="Close">
                  <X />
                </Dialog.Close>
              </div>
              {selection?.medal && selection.kind === "award" && medalFor(selection.id) ? (
                <MedalHero key={selection.id} awardId={selection.id} />
              ) : subject.hero ? (
                <figure className={`detail-hero hero-${subject.hero.type === "ribbon" ? "ribbon" : subject.hero.shape}`}>
                  {subject.hero.type === "ribbon" ? (
                    <RibbonArt award={subject.hero.award} className="ribbon-hero" />
                  ) : (
                    <img src={publicUrl(subject.hero.src)} alt={subject.hero.alt} />
                  )}
                </figure>
              ) : null}
              {subject.extraImages?.map((extra) => (
                <figure key={extra.src} className="detail-hero hero-extra">
                  <img src={publicUrl(extra.src)} alt={extra.alt} />
                  <figcaption>{extra.caption}</figcaption>
                </figure>
              ))}
              <div className="detail-body">
                <p className="lede">{subject.explanation}</p>
                {subject.criteria ? (
                  <section>
                    <h3>What it takes</h3>
                    <p>{subject.criteria}</p>
                  </section>
                ) : null}
                {subject.facts.length ? (
                  <dl className="facts">
                    {subject.facts.map((fact) => (
                      <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {subject.usedHere?.length ? (
                  <section className="used-here">
                    <h3>Used here</h3>
                    <ul>
                      {subject.usedHere.map((item) => (
                        <li key={item.kind + item.id}>
                          <button type="button" onClick={() => onSelect({ kind: item.kind, id: item.id })} aria-label={`${item.name}. Open.`}>
                            <img src={publicUrl(item.image)} alt="" loading="lazy" />
                            <span>{item.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {subject.instances ? (
                  <section>
                    <h3>Each award</h3>
                    <ul className="instance-list">
                      {subject.instances.map((row) => (
                        <li key={row.title + row.detail}>
                          <strong>{row.title}</strong>
                          <span>{row.detail}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                <section>
                  <h3>Map</h3>
                  {stops.length ? (
                    <>
                      <MapView stops={stops} onSelect={(id) => onSelect({ kind: "place", id })} />
                      <ul className="place-list">
                        {stops.map((stop) => (
                          <li key={stop.place.id}>
                            <button type="button" onClick={() => onSelect({ kind: "place", id: stop.place.id })}>
                              {stop.place.name}
                              {stop.place.accuracy === "placeholder" ? " · placeholder" : ""}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="quiet">No map location has been entered for this yet.</p>
                  )}
                </section>
                <section>
                  <h3>Photographs</h3>
                  {photos.length ? (
                    <ul className="gallery">
                      {photos.map((photo) => (
                        <li key={photo.id}>
                          <img src={publicUrl(photo.src)} alt={photo.alt} />
                          <p>{photo.caption}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="quiet">No photographs have been added for this yet.</p>
                  )}
                </section>
                <section>
                  <h3>In my words</h3>
                  {words ? <p className="words">{words}</p> : <p className="quiet">Nothing written here yet.</p>}
                </section>
                {subject.related.length ? (
                  <section>
                    <h3>Connected in this record</h3>
                    <ul className="related">
                      {subject.related.map((item) => (
                        <li key={item.kind + item.id}>
                          <button type="button" onClick={() => onSelect({ kind: item.kind, id: item.id })}>
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The full-size medal in the popup, with a Front/Back toggle. The back is the published public-domain reverse image;
 *  when there is none the Back chip is disabled (a reverse is never drawn or made up). */
function MedalHero({ awardId }: { awardId: string }) {
  const [face, setFace] = useState<"front" | "back">("front");
  const award = awards.find((entry) => entry.id === awardId);
  const medal = medalFor(awardId);
  if (!award || !medal) return null;
  const showBack = face === "back" && medal.back;
  return (
    <figure className="detail-hero medal-hero">
      <div className="rack-toggle" role="group" aria-label="Medal side">
        <button type="button" className={face === "front" ? "nav-btn on" : "nav-btn"} aria-pressed={face === "front"} onClick={() => setFace("front")}>Front</button>
        <button type="button" className={showBack ? "nav-btn on" : "nav-btn"} aria-pressed={Boolean(showBack)} disabled={!medal.back} onClick={() => setFace("back")}>Back</button>
      </div>
      {showBack ? (
        <div className="back-stage">
          <img className="medal-back" src={publicUrl(medal.back!)} alt={`${award.name}, reverse`} style={{ width: `calc(var(--mi) * ${medal.w})` }} />
        </div>
      ) : (
        <MedalArt award={award} medal={medal} />
      )}
      {!medal.back ? <figcaption className="face-note">Reverse image not available</figcaption> : null}
    </figure>
  );
}
