import { useEffect, useMemo, useState } from "react";
import { ShieldUser } from "lucide-react";
import {
  awards,
  careerStops,
  caseCopy,
  credits,
  formatSpan,
  formatWhen,
  insignia,
  milestones,
  necs,
  openRecord,
  operations,
  photos,
  profile,
  ribbonRows,
  medalFor,
  medalRows,
  ranks,
  caseRanks,
  schools,
  timeline,
  uniforms,
  units,
  warfare,
  publicUrl,
  UNIFORM_GROUPS,
  EQUIPMENT_GROUPS,
  equipment,
  type Kind,
  type Selection,
} from "@/lib/shadowbox/model";
import { CareerGlyph, MedalBlock, RibbonButton } from "@/components/shadowbox/marks";
import { DetailPanel } from "@/components/shadowbox/detail";
import { UniformProgression } from "@/components/shadowbox/uniform-progression";
import { Stations } from "@/components/shadowbox/stations";

type View = "case" | "timeline" | "uniforms" | "equipment" | "map" | "sources";

const NAV: { id: View; label: string }[] = [
  { id: "case", label: "Case" },
  { id: "timeline", label: "Timeline" },
  { id: "uniforms", label: "Uniforms" },
  { id: "equipment", label: "Gear & Vehicles" },
  { id: "map", label: "Map" },
  { id: "sources", label: "Sources" },
];

export function ShadowboxApp() {
  const [view, setView] = useState<View>("case");
  const [selection, setSelection] = useState<Selection | null>(null);
  const open = (kind: Kind, id: string) => setSelection({ kind, id });
  const rows = useMemo(() => ribbonRows(awards), []);
  const bars = useMemo(() => timeline(), []);
  const stops = useMemo(() => careerStops(), []);
  const blanks = useMemo(() => openRecord(), []);

  useEffect(() => {
    document.title = profile.pageTitle;
  }, []);

  return (
    <div className="archive">
      <header className="mast">
        <div className="mast-brand">
          <ShieldUser className="mast-icon" color="#DAA520" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <h1 className="wordmark">SHADOWBOX</h1>
            <p className="mast-tagline">Not for gawking but for learning!</p>
          </div>
        </div>
        <nav className="mast-nav" aria-label="Shadowbox sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "nav-btn on" : "nav-btn"}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {view === "case" ? <Case rows={rows} onOpen={open} onOpenMedal={(id) => setSelection({ kind: "award", id, medal: true })} /> : null}
      {view === "timeline" ? <Timeline bars={bars} rows={rows} blanks={blanks} onOpen={open} /> : null}
      {view === "uniforms" ? <Uniforms onOpen={open} /> : null}
      {view === "equipment" ? <EquipmentView onOpen={open} /> : null}
      {view === "map" ? <Stations stops={stops} onOpen={open} /> : null}
      {view === "sources" ? <Sources /> : null}

      <DetailPanel selection={selection} onSelect={setSelection} onClose={() => setSelection(null)} />
    </div>
  );
}
