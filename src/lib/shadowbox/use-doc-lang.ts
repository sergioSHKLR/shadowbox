import { useEffect, useState } from "react";

/** Current site language, read from <html lang> (set by app.tsx), for components without a locale prop. */
export function useDocLang(): "en" | "pt" {
  const read = () => (typeof document !== "undefined" && document.documentElement.lang.startsWith("pt") ? "pt" : "en");
  const [lang, setLang] = useState<"en" | "pt">(read);
  useEffect(() => {
    setLang(read());
    const mo = new MutationObserver(() => setLang(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => mo.disconnect();
  }, []);
  return lang;
}
