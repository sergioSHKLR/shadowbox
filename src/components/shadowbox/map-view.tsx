import { useEffect, useRef } from "react";
import type { MarkerClusterGroup } from "leaflet";
import type { Place, Stop } from "@/lib/shadowbox/model";
import { allowRemoteAssets } from "@/lib/shadowbox/remote";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export type BasemapId = "topo";

const BASEMAPS: Record<BasemapId, { url: string; attribution: string; maxZoom: number }> = {
  topo: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 16,
  },
};

type Runtime = {
  map: import("leaflet").Map;
  tiles: import("leaflet").TileLayer;
  markers: import("leaflet").Marker[];
  extras: import("leaflet").Marker[];
  cluster: MarkerClusterGroup;
  playGen: number;
  at: (place: Place) => [number, number];
  fit: () => void;
  spread: () => void;
};

type PlayState = {
  focusId: string | null;
  /** Stop index in `stops` to highlight; preferred over focusId when set. */
  focusIndex: number | null;
  /** Show only stops[0..revealedCount). null = show all (full map). */
  revealedCount: number | null;
  stops: Stop[];
  extra: Place[];
  /** Stop indices kept off this map view (e.g. a Logbook beat that hides a nearby pin). */
  hidden?: number[];
};

/** Great-circle distance in km between [lat, lng] points (lng may be unwrapped). */
function kmBetween(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Nearby pins within this range share a tighter play framing. */
const CLUSTER_KM = 220;
// Calmer camera (Sergio, Oct 2026): play / fly-to zooms sit lower (were 11 and 6.5) so fewer tiles load, the motion is
// gentler and the route around each stop stays readable. The full map opens a half step wider than a tight fit.
const CLUSTER_MAX_ZOOM = 8;
const SOLO_ZOOM = 5;
const FULL_MAP_ZOOM_OUT = 0.5;
const FLY_SECONDS = 0.7;

function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type LeafletApi = typeof import("leaflet");

function leafletApi(mod: LeafletApi): LeafletApi {
  const record = mod as unknown as LeafletApi & { default?: LeafletApi };
  return typeof record.map === "function" ? record : (record.default ?? record);
}

function sized(map: import("leaflet").Map) {
  const size = map.getSize();
  return size.x >= 1 && size.y >= 1;
}

/** Leaflet throws "Set map center and zoom first" from flyTo/getCenter until a view exists. */
function loaded(map: import("leaflet").Map) {
  return (map as unknown as { _loaded?: boolean })._loaded === true;
}

/** Map errors must never escape into React effects: an uncaught throw there unmounts the whole app. */
function safeApply(handle: Runtime | null, play: PlayState) {
  if (!handle) return;
  try {
    applyPlay(handle, play);
  } catch (error) {
    console.warn("[map] play step skipped:", error instanceof Error ? error.message : error);
  }
}

function toward(map: import("leaflet").Map, at: [number, number]): [number, number] {
  if (!loaded(map) || !Number.isFinite(map.getZoom())) return at;
  const center = map.getCenter().lng;
  if (!Number.isFinite(center)) return at;
  let lng = at[1];
  while (lng - center > 180) lng -= 360;
  while (center - lng > 180) lng += 360;
  return [at[0], lng];
}

function flyUnwrapped(map: import("leaflet").Map, target: [number, number], zoom: number, instant: boolean) {
  // A 0×0 map (the page is mounted with display:none) makes flyTo's
  // denominator 0. The animation then moves to NaN and the tile layer throws.
  // Leave wrapLng on. Clearing it makes the western Pacific copy ask for
  // tile columns the basemap does not have, and those tiles stay blank.
  if (!sized(map)) return;
  if (!Number.isFinite(target[0]) || !Number.isFinite(target[1]) || !Number.isFinite(zoom)) return;
  try {
    if (instant || !loaded(map)) map.setView(target, zoom, { animate: false });
    else map.flyTo(target, zoom, { duration: FLY_SECONDS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("infinite number of tiles")) return;
    throw error;
  }
}

function syncClusterMembership(handle: Runtime, play: PlayState) {
  const revealedCount = play.revealedCount;
  const focusIndex =
    play.focusIndex != null && play.focusIndex >= 0 && play.focusIndex < play.stops.length
      ? play.focusIndex
      : play.focusId
        ? play.stops.findIndex((stop) => stop.place.id === play.focusId)
        : -1;

  const toAdd: import("leaflet").Layer[] = [];
  const toRemove: import("leaflet").Layer[] = [];

  play.stops.forEach((stop, i) => {
    const marker = handle.markers[i];
    if (!marker) return;
    const show = (revealedCount == null || i < revealedCount) && !play.hidden?.includes(i);
    const has = handle.cluster.hasLayer(marker);
    if (show && !has) toAdd.push(marker);
    if (!show && has) toRemove.push(marker);
    marker.setZIndexOffset(focusIndex === i ? 4000 : (stop.n ?? 0) * 10);
  });

  play.extra.forEach((_place, i) => {
    const marker = handle.extras[i];
    if (!marker) return;
    // Extras stay hidden during progressive play; full map shows them.
    const show = revealedCount == null;
    const has = handle.cluster.hasLayer(marker);
    if (show && !has) toAdd.push(marker);
    if (!show && has) toRemove.push(marker);
  });

  if (toRemove.length) handle.cluster.removeLayers(toRemove);
  if (toAdd.length) handle.cluster.addLayers(toAdd);

  play.stops.forEach((stop, i) => {
    const marker = handle.markers[i];
    if (!marker) return;
    const show = (revealedCount == null || i < revealedCount) && !play.hidden?.includes(i);
    if (!show) return;
    const el = marker.getElement();
    const isNow = focusIndex === i;
    const badge = el?.querySelector(".map-num, .map-dot");
    badge?.classList.toggle("now", isNow);
  });

  return focusIndex;
}

function applyPlay(handle: Runtime, play: PlayState) {
  const revealedCount = play.revealedCount;
  const focusIndex = syncClusterMembership(handle, play);

  const focus = focusIndex >= 0 ? play.stops[focusIndex] : undefined;
  if (focus && focus.place.lat != null && focus.place.lng != null) {
    if (!sized(handle.map)) return;
    const target = toward(handle.map, handle.at(focus.place));
    // Before the first view exists, animated moves throw; jump instead.
    const reduce = !loaded(handle.map) || prefersReducedMotion();
    const limit = revealedCount == null ? play.stops.length : Math.min(revealedCount, play.stops.length);
    const neighbors: [number, number][] = [];
    for (let i = 0; i < limit; i++) {
      const stop = play.stops[i];
      if (play.hidden?.includes(i)) continue;
      if (stop.place.lat == null || stop.place.lng == null) continue;
      const pt = toward(handle.map, handle.at(stop.place));
      if (kmBetween(target, pt) <= CLUSTER_KM) neighbors.push(pt);
    }

    const gen = ++handle.playGen;
    const afterFrame = () => {
      if (handle.playGen !== gen) return;
      const marker = handle.markers[focusIndex];
      if (!marker || !handle.cluster.hasLayer(marker)) return;
      const ring = () => {
        if (handle.playGen !== gen) return;
        // spread() rebuilds pin icons, so ring the current pin after it.
        handle.spread();
        marker.getElement()?.querySelector(".map-num, .map-dot")?.classList.add("now");
      };
      // Show the current pin without zooming in: if it sits inside a cluster bubble, fan that bubble out (spiderfy) at
      // the current zoom. zoomToShowLayer used to dive to street level (zoom 13-16) for pins that share a base.
      // Wait for the cluster layer to finish re-clustering after the move (spiderfy is ignored mid-animation), or the
      // fan-out never happens.
      let tries = 0;
      const expand = () => {
        if (handle.playGen !== gen || !handle.cluster.hasLayer(marker)) return;
        const group = handle.cluster as unknown as MarkerClusterGroup & { _inZoomAnimation?: number };
        if (group._inZoomAnimation && tries++ < 6) {
          window.setTimeout(expand, 120);
          return;
        }
        try {
          const parent = handle.cluster.getVisibleParent(marker) as unknown as (import("leaflet").Marker & { spiderfy?: () => void }) | null;
          if (!parent || parent === marker) {
            ring();
          } else if (typeof parent.spiderfy === "function") {
            parent.spiderfy();
            window.setTimeout(ring, prefersReducedMotion() ? 0 : 320);
          } else {
            handle.cluster.zoomToShowLayer(marker, ring);
          }
        } catch (error) {
          console.warn("[map] cluster expand skipped:", error instanceof Error ? error.message : error);
        }
      };
      window.setTimeout(expand, prefersReducedMotion() ? 0 : 200);
    };

    if (neighbors.length >= 2) {
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;
      for (const [lat, lng] of neighbors) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
      // Identical / nearly identical coords still need a box so maxZoom can bite.
      if (maxLat - minLat < 0.04) {
        minLat -= 0.06;
        maxLat += 0.06;
      }
      if (maxLng - minLng < 0.04) {
        minLng -= 0.06;
        maxLng += 0.06;
      }
      try {
        const bounds: [[number, number], [number, number]] = [
          [minLat, minLng],
          [maxLat, maxLng],
        ];
        const opts = { padding: [64, 64] as [number, number], maxZoom: CLUSTER_MAX_ZOOM };
        if (reduce) {
          handle.map.fitBounds(bounds, { ...opts, animate: false });
          afterFrame();
        } else {
          handle.map.once("moveend", afterFrame);
          handle.map.flyToBounds(bounds, { ...opts, duration: FLY_SECONDS });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("infinite number of tiles")) return;
        throw error;
      }
    } else {
      if (reduce) {
        flyUnwrapped(handle.map, target, SOLO_ZOOM, true);
        afterFrame();
      } else {
        handle.map.once("moveend", afterFrame);
        flyUnwrapped(handle.map, target, SOLO_ZOOM, false);
      }
    }
  } else if (revealedCount == null) {
    handle.fit();
  }

  handle.spread();
}

const NO_HIDDEN: number[] = [];

export function MapView({
  stops,
  extra = [],
  tall = false,
  onSelect,
  focusId = null,
  focusIndex = null,
  revealedCount = null,
  hidden = NO_HIDDEN,
  layoutEpoch = "inline",
  fitMaxZoom,
}: {
  stops: Stop[];
  extra?: Place[];
  tall?: boolean;
  onSelect: (placeId: string) => void;
  focusId?: string | null;
  focusIndex?: number | null;
  /** Progressive play: only indices [0, revealedCount) are visible. null = full map. */
  revealedCount?: number | null;
  /** Stop indices to keep off this view without rebuilding the markers. */
  hidden?: number[];
  /** Bumps when the map chrome resizes (e.g. fullscreen) so Leaflet reflows and play continues. */
  layoutEpoch?: string | number;
  /** Cap for the fit-to-pins zoom (small maps with one pin otherwise zoom to street level). */
  fitMaxZoom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const runtime = useRef<Runtime | null>(null);
  const playRef = useRef({ focusId, focusIndex, revealedCount, stops, extra, hidden });
  playRef.current = { focusId, focusIndex, revealedCount, stops, extra, hidden };
  const hiddenKey = hidden.join(",");
  const signature = [...stops.map((stop) => `${stop.place.id}:${stop.n ?? ""}`), ...extra.map((place) => place.id)].join("|");
  const revealKey = revealedCount == null ? "all" : String(revealedCount);

  useEffect(() => {
    const el = ref.current;
    if (!el || stops.length + extra.length === 0) return;
    let map: import("leaflet").Map | undefined;
    let alive = true;
    let started = false;
    let timer = 0;
    let observer: ResizeObserver | undefined;
    let onOnline: (() => void) | undefined;

    const boot = () => {
      if (!alive || started || map) return;
      const node = ref.current;
      // display:none reports 0×0. Wait until the pane is actually shown.
      if (!node || node.clientWidth < 1 || node.clientHeight < 1) return;
      started = true;

      void import("leaflet").then(async (mod) => {
        // leaflet.markercluster's UMD build attaches to the global `L` once (the module is cached). Keep that first
        // Leaflet object for every later map (e.g. the detail drawer) so L.markerClusterGroup and its instanceof checks exist.
        const root = globalThis as typeof globalThis & { L?: LeafletApi };
        root.L ??= leafletApi(mod);
        await import("leaflet.markercluster");
        const L = root.L;
        if (!alive || map || !ref.current) return;
        if (ref.current.clientWidth < 1 || ref.current.clientHeight < 1) {
          started = false;
          return;
        }
        const crs = { ...L.CRS.EPSG3857, wrapLng: [-180, 180] as [number, number], infinite: true };
        const PIN_PX = ref.current.clientWidth < 520 ? 18 : 22;
        const still = prefersReducedMotion();
        // Reduced motion: no zoom / fade / marker animations anywhere on the map; every camera move is a jump.
        const view = L.map(ref.current, { crs, scrollWheelZoom: false, zoomControl: true, zoomSnap: 0.25, zoomDelta: 0.5, zoomAnimation: !still, fadeAnimation: !still, markerZoomAnimation: !still });
        map = view;
        // Give Leaflet a view up front. Focused maps (Logbook) skip fit(), and
        // flyTo/flyToBounds/getCenter throw until a center and zoom exist.
        view.setView([20, 0], 2, { animate: false });
        const spec = BASEMAPS.topo;
        const tiles = L.tileLayer(spec.url, {
          attribution: spec.attribution,
          maxZoom: spec.maxZoom,
        });
        // Places east of 100°E are drawn one world to the west. Repeat the
        // tile columns so that copy is the Pacific, not an empty grid.
        tiles.getTileUrl = (coords) => {
          const span = 2 ** coords.z;
          const x = ((coords.x % span) + span) % span;
          return spec.url.replace("{z}", String(coords.z)).replace("{y}", String(coords.y)).replace("{x}", String(x));
        };
        const mountTiles = () => {
          if (!map || map.hasLayer(tiles)) return;
          if (!allowRemoteAssets()) return;
          tiles.addTo(map);
        };
        mountTiles();
        onOnline = mountTiles;
        window.addEventListener("online", onOnline);

        const wrapLng = (lng: number) => (lng > 100 ? lng - 360 : lng);
        const at = (place: Place): [number, number] => [place.lat ?? 0, wrapLng(place.lng ?? 0)];

        const pinHtml = (stop: Stop, dx = 0, dy = 0) => {
          const kind = stop.kind ? `${stop.kind} ` : stop.place.type ? `${stop.place.type} ` : "";
          const cls = `map-num ${PIN_PX < 22 ? "sm " : ""}${kind}${stop.place.pin ? `${stop.place.pin} ` : ""}${stop.place.accuracy}`;
          return `<span class="${cls}" style="transform:translate(${dx}px,${dy}px)">${stop.n ?? ""}</span>`;
        };
        const iconFor = (stop: Stop, dx = 0, dy = 0) =>
          stop.n
            ? L.divIcon({ className: "map-pin", html: pinHtml(stop, dx, dy), iconSize: [PIN_PX, PIN_PX], iconAnchor: [PIN_PX / 2, PIN_PX / 2] })
            : L.divIcon({ className: "map-pin", html: `<span class="map-dot ${stop.kind ? `${stop.kind} ` : stop.place.type === "base" ? "base " : ""}${stop.place.pin ? `${stop.place.pin} ` : ""}${stop.place.accuracy}"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] });

        const markers = stops.map((stop) => {
          const marker = L.marker(at(stop.place), {
            icon: iconFor(stop),
            title: stop.n ? `${stop.n}. ${stop.place.name}` : stop.place.name,
            zIndexOffset: (stop.n ?? 0) * 10,
          });
          marker.on("click", () => selectRef.current(stop.place.id));
          marker.bindTooltip(stop.n ? `${stop.n} \u00b7 ${stop.place.name}` : stop.place.name, { direction: "top", offset: [0, -12] });
          return marker;
        });
        const baseMarkers = extra.map((place) => {
          const icon = L.divIcon({ className: "map-pin", html: `<span class="map-dot base ${place.accuracy}"></span>`, iconSize: [14, 14], iconAnchor: [7, 7] });
          const marker = L.marker(at(place), { icon, title: place.name });
          marker.on("click", () => selectRef.current(place.id));
          marker.bindTooltip(place.name, { direction: "top", offset: [0, -7] });
          return marker;
        });

        const cluster = L.markerClusterGroup({
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          spiderfyOnMaxZoom: true,
          animate: !still,
          animateAddingMarkers: !still,
          maxClusterRadius: 56,
          iconCreateFunction: (group) => {
            const count = group.getChildCount();
            const size = count < 10 ? "small" : count < 30 ? "medium" : "large";
            return L.divIcon({
              html: `<div><span>${count}</span></div>`,
              className: `marker-cluster marker-cluster-${size} map-cluster`,
              iconSize: L.point(40, 40),
            });
          },
        });
        cluster.addTo(map);

        const spread = () => {
          if (!map) return;
          const limit =
            playRef.current.revealedCount == null
              ? stops.length
              : Math.min(playRef.current.revealedCount, stops.length);
          const visible: number[] = [];
          for (let i = 0; i < limit; i++) {
            const marker = markers[i];
            if (!marker || !cluster.hasLayer(marker)) continue;
            // Only nudge pins that are drawn on their own (not inside a cluster bubble).
            if (cluster.getVisibleParent(marker) !== marker) continue;
            // Pins fanned out of a bubble (spiderfied) already sit apart on their legs.
            if ((marker as unknown as { _spiderLeg?: unknown })._spiderLeg) continue;
            if (!stops[i].n) continue;
            visible.push(i);
          }
          if (visible.length < 2) return;
          const truePts = visible.map((i) => map!.latLngToContainerPoint(at(stops[i].place)));
          const pos = truePts.map((pt) => ({ x: pt.x, y: pt.y }));
          const gap = PIN_PX + 2;
          for (let iter = 0; iter < 80; iter++) {
            let moved = false;
            for (let a = 0; a < visible.length; a++) {
              for (let b = a + 1; b < visible.length; b++) {
                let dx = pos[b].x - pos[a].x;
                let dy = pos[b].y - pos[a].y;
                let d = Math.hypot(dx, dy);
                if (d >= gap) continue;
                if (d < 0.01) {
                  const angle = (b - a) * 2.4;
                  dx = Math.cos(angle);
                  dy = Math.sin(angle);
                  d = 1;
                }
                const push = (gap - d) / 2 + 0.1;
                pos[a].x -= (dx / d) * push;
                pos[a].y -= (dy / d) * push;
                pos[b].x += (dx / d) * push;
                pos[b].y += (dy / d) * push;
                moved = true;
              }
            }
            if (!moved) break;
          }
          for (let a = 0; a < visible.length; a++) {
            const i = visible[a];
            markers[i].setIcon(iconFor(stops[i], Math.round(pos[a].x - truePts[a].x), Math.round(pos[a].y - truePts[a].y)));
          }
        };

        const fit = () => {
          if (!map || !sized(map)) return;
          const bounds = cluster.getBounds();
          if (!bounds.isValid()) return;
          if (tall) {
            // Half a step wider than the tightest fit, so the whole route reads at a glance and fewer tiles load.
            const pad = L.point(PIN_PX * 1.6, PIN_PX * 1.6);
            const tight = map.getBoundsZoom(bounds, false, pad);
            // Never so far out that the world is shorter than the frame (grey bands above and below on phones).
            const fill = Math.ceil(Math.log2(Math.max(1, map.getSize().y) / 256) * 4) / 4;
            const zoom = Math.max(map.getMinZoom(), fill, tight - FULL_MAP_ZOOM_OUT);
            // The full map is a reset, so it jumps (no fly) and keeps the world's top and bottom edges outside the frame.
            map.setView(bounds.getCenter(), zoom, { animate: false });
            map.panInsideBounds(L.latLngBounds([-85.05, -1e5], [85.05, 1e5]), { animate: false });
          } else {
            // Fit the padded pins, but never so far out that the world is shorter than the frame (grey "no data" bands on tall
            // frames such as the enlarged phone map) as long as the pins themselves still fit at that zoom.
            const padded = bounds.pad(0.35);
            let zoom = Math.min(map.getBoundsZoom(padded, false), fitMaxZoom ?? Infinity);
            const fill = Math.ceil(Math.log2(Math.max(1, map.getSize().y) / 256) * 4) / 4;
            if (zoom < fill && map.getBoundsZoom(bounds, false) >= fill) zoom = fill;
            map.setView(padded.getCenter(), Math.max(map.getMinZoom(), zoom), { animate: !prefersReducedMotion() });
            if (zoom <= fill) map.panInsideBounds(L.latLngBounds([-85.05, -1e5], [85.05, 1e5]), { animate: false });
          }
        };

        timer = window.setTimeout(() => {
          if (!alive || !map) return;
          map.invalidateSize();
          if (!playRef.current.focusId) {
            fit();
            spread();
          }
          safeApply(runtime.current, playRef.current);
          // Markers added before the first real view (e.g. a map built inside a just-shown tab) can stay
          // undrawn until the next move; re-add the shown ones once the view exists.
          try {
            const shown = markers.filter((marker) => cluster.hasLayer(marker));
            if (shown.length) {
              cluster.removeLayers(shown);
              cluster.addLayers(shown);
              spread();
            }
          } catch (error) {
            console.warn("[map] marker refresh skipped:", error instanceof Error ? error.message : error);
          }
        }, 180);

        map.on("zoomend", spread);
        map.on("animationend", spread);

        runtime.current = { map, tiles, markers, extras: baseMarkers, cluster, playGen: 0, at, fit, spread };
        safeApply(runtime.current, playRef.current);
      });
    };

    boot();
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        if (!alive) return;
        if (!map) {
          boot();
          return;
        }
        try {
          const node = ref.current;
          // Skip while the pane is collapsed (flex fullscreen transition can hit 0×0 briefly).
          if (!node || node.clientWidth < 1 || node.clientHeight < 1) return;
          const before = map.getSize();
          map.invalidateSize({ animate: false });
          const after = map.getSize();
          if (!runtime.current || after.x < 1 || after.y < 1) return;
          const grew = before.x < 1 || before.y < 1 || Math.abs(after.x - before.x) > 1 || Math.abs(after.y - before.y) > 1;
          if (!grew) return;
          const play = playRef.current;
          const focused = play.focusIndex != null || play.focusId != null || play.revealedCount != null;
          if (!focused) {
            runtime.current.fit();
            runtime.current.spread();
          }
          // Always re-apply the current play step after a real resize so fullscreen
          // reflow does not leave the tour stuck on a stale camera.
          safeApply(runtime.current, play);
        } catch (error) {
          console.warn("[map] resize skipped:", error instanceof Error ? error.message : error);
        }
      });
      observer.observe(el);
    }

    return () => {
      alive = false;
      window.clearTimeout(timer);
      observer?.disconnect();
      if (onOnline) window.removeEventListener("online", onOnline);
      const current = map;
      map = undefined;
      runtime.current = null;
      current?.remove();
    };
  }, [signature]);

  useEffect(() => {
    safeApply(runtime.current, playRef.current);
  }, [focusId, focusIndex, revealKey, signature, hiddenKey]);

  // Fullscreen / CSS cover changes the stage size without remounting. Wait a frame
  // for flex layout, then invalidate and re-run the current play step.
  useEffect(() => {
    const handle = runtime.current;
    if (!handle) return;
    let alive = true;
    const run = () => {
      if (!alive || !runtime.current) return;
      const node = ref.current;
      if (!node || node.clientWidth < 1 || node.clientHeight < 1) return;
      try {
        runtime.current.map.invalidateSize({ animate: false });
      } catch (error) {
        console.warn("[map] layout invalidate skipped:", error instanceof Error ? error.message : error);
        return;
      }
      safeApply(runtime.current, playRef.current);
    };
    const raf = window.requestAnimationFrame(() => {
      window.setTimeout(run, 50);
    });
    const later = window.setTimeout(run, 220);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(later);
    };
  }, [layoutEpoch]);

  if (!stops.length && !extra.length) {
    return <p className="quiet">No map location has been entered for this yet.</p>;
  }

  return <div ref={ref} className={tall ? "map-frame tall" : "map-frame"} role="application" aria-label="Map of duty stations, numbered in order" />;
}
