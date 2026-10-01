const COLLAR: Record<string, string> = {
  "E-4": "/incoming/collar-po3.jpg",
  "E-5": "/incoming/collar-po2.jpg",
  "E-6": "/incoming/collar-po1.jpg",
  "E-7": "/incoming/collar-cpo.jpg",
};

function Collar({ grade }: { grade: string }) {
  const src = COLLAR[grade];
  if (!src) return null;
  return <img className="collar" src={publicUrl(src)} alt="" />;
}
function caseMarks() {