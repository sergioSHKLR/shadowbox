import { useEffect, useRef } from "react";
import type { Place, Stop } from "@/lib/shadowbox/model";
import "leaflet/dist/leaflet.css";

export function MapView({
  stops,
  extra = [],
  onSelect,
}: {
  stops: Stop[];
  /** Extra pins (deployment bases) drawn without joining the career line. */
  extra?: Place[];
  onSelect: (placeId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const signature = [...stops.map((stop) => stop.place.id), ...extra.map((place) => place.id)].join("|");

  useEffect(() => {
    const el = ref.current;
    if (!el || stops.length === 0) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 16,
      }).addTo(map);

      const markers = stops.map((stop) => {
        const icon = L.divIcon({
          className: "map-pin",
          html: `<span class="map-dot ${stop.place.accuracy}"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const marker = L.marker([stop.place.lat ?? 0, stop.place.lng ?? 0], { icon, title: stop.place.name });
        marker.on("click", () => selectRef.current(stop.place.id));
        marker.bindTooltip(stop.place.name, { direction: "top", offset: [0, -8] });
        return marker;
      });
      const baseMarkers = extra.map((place) => {
        const icon = L.divIcon({
          className: "map-pin",
          html: `<span class="map-dot base ${place.accuracy}"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([place.lat ?? 0, place.lng ?? 0], { icon, title: place.name });
        marker.on("click", () => selectRef.current(place.id));
        marker.bindTooltip(place.name, { direction: "top", offset: [0, -7] });
        return marker;
      });
      const group = L.featureGroup([...markers, ...baseMarkers]).addTo(map);
      if (stops.length > 1) {
        const line = stops.map((stop) => [stop.place.lat ?? 0, stop.place.lng ?? 0] as [number, number]);
        L.polyline(line, { color: "#c4a35a", weight: 2, opacity: 0.9 }).addTo(map);
      }
      const bounds = group.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.35));
      window.setTimeout(() => map?.invalidateSize(), 180);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
    // signature covers the stop list; the click handler is read from a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (!stops.length) {
    return <p className="quiet">No map location has been entered for this yet.</p>;
  }

  return <div ref={ref} className="map-frame" role="application" aria-label="Map of duty stations" />;
}
