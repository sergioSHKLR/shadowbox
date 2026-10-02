export type Locale = "en" | "pt";
export type ThemeName = "light" | "dark";

export type Prefs = { locale: Locale; theme: ThemeName };

const KEY = "shadowbox-prefs";

export function loadPrefs(): Prefs {
  if (typeof localStorage === "undefined") return { locale: "en", theme: "light" };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Prefs>;
    return {
      locale: raw.locale === "pt" ? "pt" : "en",
      theme: raw.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return { locale: "en", theme: "light" };
  }
}

export function savePrefs(prefs: Prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
