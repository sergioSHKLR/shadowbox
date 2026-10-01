const PATCH: Record<string, string> = {
  "E-4": "/uniforms/pieces/patch-e4-red.svg",
  "E-5": "/uniforms/pieces/patch-e5-red.svg",
  "E-6": "/uniforms/pieces/patch-e6-red.svg",
  "E-6-gold": "/uniforms/pieces/patch-e6-gold.svg",
  "E-7": "/uniforms/pieces/patch-e7-gold.svg",
};
function Collar({ grade, gold }: { grade: string; gold?: boolean }) {
  const src = gold && grade === "E-6" ? PATCH["E-6-gold"] : PATCH[grade];
  return src ? <img className="rate-patch" src={publicUrl(src)} alt="" /> : null;
}
