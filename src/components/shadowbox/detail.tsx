import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo } from "react";
import {
  photosFor,
  placeById,
  publicUrl,
  reflectionFor,
  toSubject,
  type Selection,
  type Stop,
} from "@/lib/shadowbox/model";
import { MapView } from "@/components/shadowbox/map-view";

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
      .map((place) => ({ place, labels: [place.locality], when: "" }));
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
