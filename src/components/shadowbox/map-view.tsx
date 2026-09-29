import { useEffect, useRef } from "react";
import type { Place, Stop } from "@/lib/shadowbox/model";
import "leaflet/dist/leaflet.css";

export type BasemapId = "topo";

const BASEMAPS: Record<BasemapId, { url: string; attribution: string; maxZoom: number }> = {
  topo: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 16,
  },
};

type Runtime = {
  map: import("leaflet").Map;
  tiles: import("leaflet").TileLayer;
  markers: import("leaflet").Marker[];
  extras: import("leaflet").Marker[];
  at: (place: Place) => [number, number];
  fit: () => void;
  spread: () => void;
};

type PlayState = {
  focusId: string | null;
  revealedIds: string[] | null;
  stops: Stop[];
  extra: Place[];
};

function applyPlay(handle: Runtime, play: PlayState) {
  const allowed = play.revealedIds ? new Set(play.revealedIds) : null;
  play.stops.forEach((stop, i) => {
    const marker = handle.markers[i];
    if (!marker) return;
    const show = !allowed || allowed.has(stop.place.id);
    const el = marker.getElement();
    if (el) el.style.display = show ? "" : "none";
    marker.setOpacity(show ? 1 : 0);
    const badge = el?.querySelector(".map-num, .map-dot");
    badge?.classList.toggle("now", Boolean(play.focusId && stop.place.id === play.focusId));
    marker.setZIndexOffset(stop.place.id === play.focusId ? 4000 : (stop.n ?? 0) * 10);
  });
  play.extra.forEach((place, i) => {
    const marker = handle.extras[i];
    if (!marker) return;
    const show = !allowed || allowed.has(place.id);
    const el = marker.getElement();
    if (el) el.style.display = show ? "" : "none";
    marker.setOpacity(show ? 1 : 0);
  });

  const focus = play.focusId ? play.stops.find((stop) => stop.place.id === play.focusId) : undefined;
  if (focus && focus.place.lat != null && focus.place.lng != null) {
    const target = handle.at(focus.place);
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const zoom = Math.min(6.5, Math.max(handle.map.getZoom(), 4));
    if (reduce) handle.map.setView(target, zoom);
    else handle.map.flyTo(target, zoom, { duration: 0.7 });
  } else if (!allowed) {
    handle.fit();
  }
}

export function MapView({
  stops,
  extra = [],
  tall = false,
  onSelect,
  focusId = null,
  revealedIds = null,
}: {
  stops: Stop[];
  extra?: Place[];
  tall?: boolean;
  onSelect: (placeId: string) => void;
  focusId?: string | null;
  revealedIds?: string[] | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const runtime = useRef<Runtime | null>(null);
  const playRef = useRef({ focusId, revealedIds, stops, extra });
  playRef.current = { focusId, revealedIds, stops, extra };
  const signature = [...stops.map((stop) => `${stop.place.id}:${stop.n ?? ""}`), ...extra.map((place) => place.id)].join("|");

  useEffect(() => {
    const el = ref.current;
    if (!el || stops.length + extra.length === 0) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;
      const PIN_PX = ref.current.clientWidth < 520 ? 18 : 22;
      map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: true, zoomSnap: 0.25, zoomDelta: 0.5 });
      const spec = BASEMAPS.topo;
      const tiles = L.tileLayer(spec.url, { attribution: spec.attribution, maxZoom: spec.maxZoom }).addTo(map);

      const lngs = stops.map((stop) => stop.place.lng ?? 0).sort((a, b) => a - b);
      let cut = Infinity;
      if (tall && lngs.length > 1) {
        let widest = lngs[0] + 360 - lngs[lngs.length - 1];
        for (let i = 1; i < lngs.length; i++) {
          if (lngs[i] - lngs[i - 1] > widest) {
            widest = lngs[i] - lngs[i - 1];
            cut = lngs[i];
          }
        }
      }
      const at = (place: Place): [number, number] => [place.lat ?? 0, (place.lng ?? 0) < cut ? (place.lng ?? 0) + 360 : (place.lng ?? 0)];

      const pinHtml = (stop: Stop, dx = 0, dy = 0) => {
        const cls = `map-num ${PIN_PX < 22 ? "sm " : ""}${stop.place.type ? `${stop.place.type} ` : ""}${stop.place.accuracy}`;
        return `<span class="${cls}" style="transform:translate(${dx}px,${dy}px)">${stop.n ?? ""}</span>`;
      };
      const iconFor = (stop: Stop, dx = 0, dy = 0) =>
        stop.n
          ? L.divIcon({ className: "map-pin", html: pinHtml(stop, dx, dy), iconSize: [PIN_PX, PIN_PX], iconAnchor: [PIN_PX / 2, PIN_PX / 2] })
          : L.divIcon({ className: "map-pin", html: `<span class="map-dot ${stop.place.type === "base" ? "base " : ""}${stop.place.accuracy}"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] });

      const markers = stops.map((stop) => {
        const marker = L.marker(at(stop.place), {
          icon: iconFor(stop),
          title: stop.n ? `${stop.n}. ${stop.place.name}` : stop.place.name,
          zIndexOffset: (stop.n ?? 0) * 10,
        });
        marker.on("click", () => selectRef.current(stop.place.id));
        marker.bindTooltip(stop.n ? `${stop.n} · ${stop.place.name}` : stop.place.name, { direction: "top", offset: [0, -12] });
        return marker;
      });
      const baseMarkers = extra.map((place) => {
        const icon = L.divIcon({ className: "map-pin", html: `<span class="map-dot base ${place.accuracy}"></span>`, iconSize: [14, 14], iconAnchor: [7, 7] });
        const marker = L.marker(at(place), { icon, title: place.name });
        marker.on("click", () => selectRef.current(place.id));
        marker.bindTooltip(place.name, { direction: "top", offset: [0, -7] });
        return marker;
      });
      const group = L.featureGroup([...markers, ...baseMarkers]).addTo(map);

      const spread = () => {
        if (!map) return;
        const truePts = stops.map((stop) => map!.latLngToContainerPoint(at(stop.place)));
        const pos = truePts.map((pt) => ({ x: pt.x, y: pt.y }));
        const gap = PIN_PX + 2;
        for (let iter = 0; iter < 80; iter++) {
          let moved = false;
          for (let i = 0; i < stops.length; i++) {
            if (!stops[i].n) continue;
            for (let j = i + 1; j < stops.length; j++) {
              if (!stops[j].n) continue;
              let dx = pos[j].x - pos[i].x;
              let dy = pos[j].y - pos[i].y;
              let d = Math.hypot(dx, dy);
              if (d >= gap) continue;
              if (d < 0.01) {
                const angle = (j - i) * 2.4;
                dx = Math.cos(angle);
                dy = Math.sin(angle);
                d = 1;
              }
              const push = (gap - d) / 2 + 0.1;
              pos[i].x -= (dx / d) * push;
              pos[i].y -= (dy / d) * push;
              pos[j].x += (dx / d) * push;
              pos[j].y += (dy / d) * push;
              moved = true;
            }
          }
          if (!moved) break;
        }
        stops.forEach((stop, i) => markers[i].setIcon(iconFor(stop, Math.round(pos[i].x - truePts[i].x), Math.round(pos[i].y - truePts[i].y))));
      };

      const fit = () => {
        const bounds = group.getBounds();
        if (!map || !bounds.isValid()) return;
        if (tall) map.fitBounds(bounds, { padding: [PIN_PX * 1.6, PIN_PX * 1.6] });
        else map.fitBounds(bounds.pad(0.35));
      };
      fit();
      spread();
      map.on("zoomend", spread);

      window.setTimeout(() => {
        map?.invalidateSize();
        fit();
        spread();
        if (runtime.current) applyPlay(runtime.current, playRef.current);
      }, 180);

      if (map) {
        runtime.current = { map, tiles, markers, extras: baseMarkers, at, fit, spread };
        applyPlay(runtime.current, playRef.current);
      }
    });

    return () => {
      cancelled = true;
      runtime.current = null;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  useEffect(() => {
    if (runtime.current) applyPlay(runtime.current, playRef.current);
  }, [focusId, revealedIds, stops, extra]);

  if (!stops.length && !extra.length) {
    return <p className="quiet">No map location has been entered for this yet.</p>;
  }

  return <div ref={ref} className={tall ? "map-frame tall" : "map-frame"} role="application" aria-label="Map of duty stations, numbered in order" />;
}
