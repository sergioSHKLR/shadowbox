const WHATSAPP = "https://wa.me/5547988695995";
const GUESTBOOK = "https://forms.gle/1nprDDo1dLpZnRmn9";
const GUESTBOOK_EMBED =
  "https://docs.google.com/forms/d/e/1FAIpQLScMaJJCnk2CT0cElS6uy7h3VgBXhF3in3N3qDwASAv3WtYNRg/viewform?embedded=true";

export function Contact() {
  return (
    <main className="sheet">
      <h2>Contact</h2>
      <p>This is a personal record, kept so the uniform and the tours can be read. A question about a date, a graphic, or a credit can go to WhatsApp.</p>
      <p>Itajaí, Santa Catarina, Brazil.</p>
      <p><a className="nav-btn on" href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp +55 47 98869-5995</a></p>
    </main>
  );
}

export function Guestbook() {
  return (
    <main className="sheet">
      <h2>Guestbook</h2>
      <p>
        <a className="nav-btn on" href={GUESTBOOK} target="_blank" rel="noreferrer">
          Sign
        </a>
      </p>
      <iframe className="guest-frame" title="Shadowbox Guestbook" src={GUESTBOOK_EMBED} />
    </main>
  );
}

export function VisitorCount() {
  return null;
}
