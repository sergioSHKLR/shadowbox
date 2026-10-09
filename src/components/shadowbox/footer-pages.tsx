import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP = "https://wa.me/5547988695995";
const WHATSAPP_LABEL = "WhatsApp"; // Sergio: no spelled-out number on the page (EN and PT)
const GUESTBOOK = "https://forms.gle/1nprDDo1dLpZnRmn9";

const CONTACT_LINK = "https://forms.gle/2Qnmg5FN7sitW24N9";

/**
 * Contact form → Sergio's "Signum Contact" Google Form (formResponse, no-cors), feeding his Sheet (Oct 2026).
 * Ids read from the form's public page (FB_PUBLIC_LOAD_DATA_); all three questions are required there too:
 *   Name/Nome         → entry.575537492  (short answer)
 *   Email             → entry.2078104732 (short answer)
 *   Message/Mensagem  → entry.701316181  (paragraph)
 * The form does not collect Google account emails and needs no sign-in.
 */
export const CONTACT_FORM = {
  formId: "1FAIpQLSeX8qdQdu8q8gP7T9iV0Sduh4tX0eavZcshCzaAeosR_Ro5Og",
  fields: {
    name: "entry.575537492",
    email: "entry.2078104732",
    message: "entry.701316181",
  },
};
export const contactPostUrl = () => `https://docs.google.com/forms/d/e/${CONTACT_FORM.formId}/formResponse`;
const contactReady = () => !!CONTACT_FORM.formId && Object.values(CONTACT_FORM.fields).every((id) => /^entry\.\d+$/.test(id));

type Lang = "en" | "pt";
const COPY = {
  en: {
    title: "Contact",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send",
    sending: "Sending…",
    thanks: "Thank you. Your message was sent.",
    another: "Send another",
    notReady: "The contact form isn't connected yet. Please use WhatsApp for now.",
    failed: "That didn't go through. Please try again, use the Google Forms link below, or WhatsApp.",
    formLabel: "Contact form",
    alt: "Open in Google Forms",
  },
  pt: {
    title: "Contato",
    name: "Nome",
    email: "E-mail",
    message: "Mensagem",
    send: "Enviar",
    sending: "Enviando…",
    thanks: "Obrigado. Sua mensagem foi enviada.",
    another: "Enviar outra",
    notReady: "O formulário de contato ainda não está conectado. Por enquanto, use o WhatsApp.",
    failed: "Não foi possível enviar. Tente de novo, use o link do Google Forms abaixo ou o WhatsApp.",
    formLabel: "Formulário de contato",
    alt: "Abrir no Google Forms",
  },
} as const;

function WhatsAppButton() {
  return (
    <a className="contact-whatsapp" href={WHATSAPP} target="_blank" rel="noreferrer">
      <MessageCircle className="contact-whatsapp-icon" size={20} strokeWidth={2.2} aria-hidden="true" />
      {WHATSAPP_LABEL}
    </a>
  );
}

function ContactForm({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "notReady" | "failed">("idle");
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactReady()) {
      setStatus("notReady");
      return;
    }
    setStatus("sending");
    const body = new URLSearchParams();
    body.set(CONTACT_FORM.fields.name, values.name.trim());
    body.set(CONTACT_FORM.fields.email, values.email.trim());
    body.set(CONTACT_FORM.fields.message, values.message.trim());
    try {
      // no-cors: Google Forms doesn't send CORS headers, so the response is opaque; a network error is all we can detect.
      await fetch(contactPostUrl(), { method: "POST", mode: "no-cors", body });
      setStatus("sent");
      setValues({ name: "", email: "", message: "" });
    } catch {
      setStatus("failed");
    }
  };

  // Fallback (Oct 2026): the Google Form itself, in a new tab.
  const alt = (
    <p className="guest-alt contact-alt quiet">
      <a href={CONTACT_LINK} target="_blank" rel="noreferrer">{c.alt}</a>
    </p>
  );
  if (status === "sent") {
    return (
      <>
        <section className="site-card contact-card" aria-label={c.formLabel}>
          <p className="contact-thanks" role="status">{c.thanks}</p>
          <button type="button" className="nav-btn" onClick={() => setStatus("idle")}>{c.another}</button>
        </section>
        {alt}
      </>
    );
  }
  return (
    <>
    <section className="site-card contact-card" aria-label={c.formLabel}>
      <form className="site-form" onSubmit={submit}>
        <label className="site-field">
          <span>{c.name}</span>
          <input type="text" name="name" autoComplete="name" required maxLength={120} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        </label>
        <label className="site-field">
          <span>{c.email}</span>
          <input type="email" name="email" autoComplete="email" required maxLength={200} value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
        </label>
        <label className="site-field">
          <span>{c.message}</span>
          <textarea name="message" required rows={6} maxLength={4000} value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} />
        </label>
        <div className="site-form-bar">
          <button type="submit" className="nav-btn on" disabled={status === "sending"}>{status === "sending" ? c.sending : c.send}</button>
          <span className="site-form-status quiet" role="status" aria-live="polite">
            {status === "notReady" ? c.notReady : status === "failed" ? c.failed : ""}
          </span>
        </div>
      </form>
    </section>
    {alt}
    </>
  );
}

/** Contact (Sergio, Oct 2026): no visible header. WhatsApp first in PT, the form first in EN. */
export function Contact({ locale = "en" }: { locale?: string }) {
  const lang: Lang = locale === "pt" ? "pt" : "en";
  const whatsapp = (
    <div className="contact-whatsapp-row" key="wa">
      <WhatsAppButton />
    </div>
  );
  const form = <ContactForm lang={lang} key="form" />;
  return (
    <div className="contact-page" id="contact-form">
      <h2 className="sr-only">{COPY[lang].title}</h2>
      {lang === "pt" ? [whatsapp, form] : [form, whatsapp]}
    </div>
  );
}

/**
 * Guestbook (Sergio, Oct 2026): a site-styled native form that posts to the same "Signum Guestbook" Google Form
 * (formResponse, no-cors), replacing the iframe embed. Field ids read from the form's public page:
 *   Name/Nome  → entry.57294514   (optional, short answer)
 *   Note/Nota  → entry.1071052798 (required, paragraph)
 * No visible page header (sr-only h1).
 */
export const GUESTBOOK_FORM = {
  formId: "1FAIpQLScMaJJCnk2CT0cElS6uy7h3VgBXhF3in3N3qDwASAv3WtYNRg",
  fields: { name: "entry.57294514", note: "entry.1071052798" },
};
export const guestbookPostUrl = () => `https://docs.google.com/forms/d/e/${GUESTBOOK_FORM.formId}/formResponse`;

const GB_COPY = {
  en: {
    title: "Guestbook",
    formLabel: "Sign the guestbook",
    name: "Name",
    optional: "optional",
    note: "Note",
    send: "Sign",
    sending: "Sending…",
    thanks: "Thank you for signing the guestbook.",
    another: "Sign again",
    noteMissing: "Please write a note before signing.",
    failed: "That didn't go through. Please try again, or use the Google Forms link below.",
    alt: "Open in Google Forms",
    notePre: "Messages may be shown publicly after review. For a private message, use the ",
    noteLink: "Contact form",
    notePost: ".",
  },
  pt: {
    title: "Livro de visitas",
    formLabel: "Assinar o livro de visitas",
    name: "Nome",
    optional: "opcional",
    note: "Nota",
    send: "Assinar",
    sending: "Enviando…",
    thanks: "Obrigado por assinar o livro de visitas.",
    another: "Assinar de novo",
    noteMissing: "Escreva uma nota antes de assinar.",
    failed: "Não foi possível enviar. Tente de novo ou use o link do Google Forms abaixo.",
    alt: "Abrir no Google Forms",
    notePre: "As mensagens podem ser exibidas publicamente após revisão. Para uma mensagem privada, use o ",
    noteLink: "formulário de Contato",
    notePost: ".",
  },
} as const;

/** onContact opens the Contact page (the app has no per-page URLs, so the note's link is an in-app button styled as a link). */
export function Guestbook({ locale = "en", onContact }: { locale?: string; onContact?: () => void }) {
  const lang: Lang = locale === "pt" ? "pt" : "en";
  const c = GB_COPY[lang];
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "noteMissing" | "failed">("idle");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const noteId = "guestbook-note";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    if (!note.trim()) {
      setStatus("noteMissing");
      document.getElementById(noteId)?.focus();
      return;
    }
    setStatus("sending");
    const body = new URLSearchParams();
    if (name.trim()) body.set(GUESTBOOK_FORM.fields.name, name.trim());
    body.set(GUESTBOOK_FORM.fields.note, note.trim());
    try {
      // no-cors: Google Forms sends no CORS headers, so the response is opaque; only a network failure is detectable.
      await fetch(guestbookPostUrl(), { method: "POST", mode: "no-cors", body });
      setStatus("sent");
      setName("");
      setNote("");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <main className="sheet site-page guestbook-page">
      <h1 className="sr-only">{c.title}</h1>
      {status === "sent" ? (
        <section className="site-card guest-card" aria-label={c.formLabel}>
          <p className="contact-thanks" role="status">{c.thanks}</p>
          <button type="button" className="nav-btn" onClick={() => setStatus("idle")}>{c.another}</button>
        </section>
      ) : (
        <section className="site-card guest-card" aria-label={c.formLabel}>
          <form className="site-form gb-form" onSubmit={submit} noValidate>
            <label className="site-field">
              <span>{c.name} <em className="site-field-opt">({c.optional})</em></span>
              <input type="text" name="name" autoComplete="name" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="site-field" htmlFor={noteId}>
              <span>{c.note} <span aria-hidden="true">*</span></span>
              <textarea
                id={noteId}
                name="note"
                required
                aria-required="true"
                aria-invalid={status === "noteMissing" ? true : undefined}
                rows={6}
                maxLength={2000}
                value={note}
                onChange={(e) => { setNote(e.target.value); if (status === "noteMissing" || status === "failed") setStatus("idle"); }}
              />
            </label>
            <p className="gb-privacy quiet" id="guestbook-privacy">
              {c.notePre}
              <button type="button" className="gb-privacy-link" onClick={onContact}>{c.noteLink}</button>
              {c.notePost}
            </p>
            <div className="site-form-bar">
              <button type="submit" className="nav-btn on" aria-describedby="guestbook-privacy" disabled={status === "sending"}>{status === "sending" ? c.sending : c.send}</button>
              <span className="site-form-status quiet" role="status" aria-live="polite">
                {status === "noteMissing" ? c.noteMissing : status === "failed" ? c.failed : ""}
              </span>
            </div>
          </form>
        </section>
      )}
      <p className="guest-alt quiet">
        <a href={GUESTBOOK} target="_blank" rel="noreferrer">{c.alt}</a>
      </p>
    </main>
  );
}

export function VisitorCount() {
  return null;
}
