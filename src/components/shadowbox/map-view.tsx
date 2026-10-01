import { useEffect, useRef } from "react";
import type { Place, Stop } from "@/lib/shadowbox/model";
import "leaflet/dist/leaflet.css";

export type BasemapId = "topo";

const BASEMAPS: Record<BasemapId, { url: string; attribution: string; maxZoom: number }> = {
  topo: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 16,
  },
};
