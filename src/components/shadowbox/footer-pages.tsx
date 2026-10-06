import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP = "https://wa.me/5547988695995";
const WHATSAPP_LABEL = "WhatsApp +55 47 98869-5995";
const GUESTBOOK = "https://forms.gle/1nprDDo1dLpZnRmn9";
const GUESTBOOK_EMBED =
  "https://docs.google.com/forms/d/e/1FAIpQLScMaJJCnk2CT0cElS6uy7h3VgBXhF3in3N3qDwASAv3WtYNRg/viewform?embedded=true";

/**
 * Contact form → Sergio's Google Form (formResponse, no-cors).
 * CONFIG PLACEHOLDERS: fill these in from the form Sergio provides. Do not guess.
 *   formId: the long id in https://docs.google.com/forms/d/e/<FORM_ID>/viewform
 *   fields: the entry ids for each question, e.g. "entry.123456789"
 * Until formId and all three entry ids are set, the form shows but does not post (it points people to WhatsApp).
 */
export const CONTACT_FORM = {
  formId: "", // TODO(Sergio): Google Form id (the 1FAIpQL... string)
  fields: {
    name: "", // TODO(Sergio): entry.<id> for Name
    email: "", // TODO(Sergio): entry.<id> for Email
    message: "", // TODO(Sergio): entry.<id> for Message
  },
};
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
    failed: "That didn't go through. Please try again or use WhatsApp.",
    formLabel: "Contact form",
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
    failed: "Não foi possível enviar. Tente de novo ou use o WhatsApp.",
    formLabel: "Formulário de contato",
  },
} as const;

function WhatsAppButton() {
  return (
    <a className="nav-btn on contact-whatsapp" href={WHATSAPP} target="_blank" rel="noreferrer">
      <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
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
      await fetch(`https://docs.google.com/forms/d/e/${CONTACT_FORM.formId}/formResponse`, { method: "POST", mode: "no-cors", body });
      setStatus("sent");
      setValues({ name: "", email: "", message: "" });
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <section className="site-card contact-card" aria-label={c.formLabel}>
        <p className="contact-thanks" role="status">{c.thanks}</p>
        <button type="button" className="nav-btn" onClick={() => setStatus("idle")}>{c.another}</button>
      </section>
    );
  }
  return (
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
    <main className="sheet site-page contact-page">
      <h1 className="sr-only">{COPY[lang].title}</h1>
      {lang === "pt" ? [whatsapp, form] : [form, whatsapp]}
    </main>
  );
}

/**
 * Guestbook (Sergio, Oct 2026): no visible header or lead. Entries still go to Sergio's Google Form through its own
 * embed (unchanged). The embed is a cross-origin iframe, so its inside can't be restyled from here; the page frames it in the
 * site's card.
 */
export function Guestbook() {
  return (
    <main className="sheet site-page guestbook-page">
      <h1 className="sr-only">Guestbook</h1>
      <section className="site-card guest-card" aria-label="Sign the guestbook">
        <iframe className="guest-frame" title="Signum Guestbook" src={GUESTBOOK_EMBED} loading="lazy" />
      </section>
      <p className="guest-alt quiet">
        <a href={GUESTBOOK} target="_blank" rel="noreferrer">Open the guestbook in Google Forms</a>
      </p>
    </main>
  );
}

export function VisitorCount() {
  return null;
}
