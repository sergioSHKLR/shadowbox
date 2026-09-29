import { caseCopy, publicUrl, uniforms, UNIFORM_GROUPS, type Kind } from "@/lib/shadowbox/model";

export function Uniforms({ onOpen }: { onOpen: (k: Kind, id: string) => void }) {
  return (
    <main className="sheet">
      <h2>Uniforms</h2>
      <p>{uniforms.length} uniforms. {caseCopy.uniformsLead}</p>
      {UNIFORM_GROUPS.map((group) => {
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
