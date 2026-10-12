import { awards, type Award, type Kind } from "@/lib/shadowbox/model";
import { RibbonArt } from "@/components/shadowbox/marks";

/** End-of-career ribbons, highest precedence first. Unranked ribbons follow, in record order. */
function byPrecedence(list: Award[]): Award[] {
  const ranked = list.filter((award) => Number.isFinite(award.precedence));
  const unranked = list.filter((award) => !Number.isFinite(award.precedence));
  return [...ranked.sort((a, b) => a.precedence - b.precedence), ...unranked];
}

export function Decorations({ onOpen, title }: { onOpen: (k: Kind, id: string) => void; title: string }) {
  return (
    <main className="sheet decorations-page">
      <h2>{title}</h2>
      <p>The end-of-career ribbons, in order of precedence.</p>
      <ul className="decorations-ribbons">
        {byPrecedence(awards).map((award) => (
          <li key={award.id}>
            <button type="button" className="decorations-ribbon" onClick={() => onOpen("award", award.id)} aria-label={`${award.abbreviation}, ${award.name}`}>
              <RibbonArt award={award} />
              <span>{award.abbreviation}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
