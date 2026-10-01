function HashMarks({ end }: { end?: string }) {
  const years = end ? Number(end) - 1997 : 0;
  const count = Math.floor(years / 4);
  const gold = years >= 12;
  if (!count) return null;
  return (
    <span className="hashes" aria-label={`${count} ${gold ? "gold" : "red"} service stripes`}>
      {Array.from({ length: count }, (_, index) => (
        <img key={index} src={publicUrl(gold ? "/incoming/hash-gold.jpg" : "/incoming/hash-red.jpg")} alt="" />
      ))}
    </span>
  );
}
function Collar({ grade }: { grade: string }) {