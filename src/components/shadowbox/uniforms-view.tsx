import { useEffect, useRef } from "react";
import { caseCopy, publicUrl, uniforms, type Kind, type UniformGroup } from "@/lib/shadowbox/model";

const UNIFORM_SECTIONS: { id: UniformGroup; label: string }[] = [
  { id: "battle", label: "Battle" },
  { id: "organizational", label: "Organizational" },
  { id: "work", label: "Working" },
  { id: "pt", label: "PT" },
  { id: "dress", label: "Dress" },
];

export function Uniforms({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  const carousel = UNIFORM_SECTIONS.flatMap((group) =>
    uniforms.filter((uniform) => uniform.group === group.id).sort((a, b) => a.order - b.order),
  );
  const loop = [...carousel, ...carousel, ...carousel];
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rail.current;
    if (!el || carousel.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const setWidth = () => el.scrollWidth / 3;
    el.scrollLeft = setWidth();
    let paused = false;
    const tick = () => {
      if (!paused) {
        el.scrollLeft += 0.6;
        const width = setWidth();
        if (el.scrollLeft >= width * 2) el.scrollLeft -= width;
        if (el.scrollLeft <= 0) el.scrollLeft += width;
      }
      frame = window.requestAnimationFrame(tick);
    };
    let frame = window.requestAnimationFrame(tick);
    const pause = () => { paused = true; };
    const play = () => { paused = false; };
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", play);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", play);
    return () => {
      window.cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", play);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", play);
    };
  }, [carousel.length]);
  return (
    <main className="sheet">
      <h2>Uniforms</h2>
      <p>{uniforms.length} uniforms. {caseCopy.uniformsLead}</p>
      <div className="filmstrip" ref={rail} aria-label="All uniforms, looping">
        {loop.map((uniform, index) => (
          <button key={`${uniform.id}-${index}`} type="button" className="film-frame" onClick={() => onOpen("uniform", uniform.id)}>
            <img src={publicUrl(uniform.image)} alt="" loading="lazy" />
            <span>{uniform.name}</span>
          </button>
        ))}
      </div>
      {UNIFORM_SECTIONS.map((group) => {
        const list = uniforms.filter((uniform) => uniform.group === group.id).sort((a, b) => a.order - b.order);
        if (!list.length) return null;
        return (
          <section key={group.id} className="uniform-group" aria-label={group.label}>
            <h3>{group.label}</h3>
            <ol className="uniform-grid">
              {list.map((uniform) => (
                <li key={uniform.id}>
                  <button type="button" className="uniform-card uniform-card--white" onClick={() => onOpen("uniform", uniform.id)}>
                    <img className="uniform-photo" src={publicUrl(uniform.image)} alt="" loading="lazy" />
                    <strong>{uniform.name}</strong>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
