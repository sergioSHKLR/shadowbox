export type Locale = "en" | "pt";
export type ThemeName = "light" | "dark" | "system";
export type AppliedTheme = "light" | "dark";

export type Prefs = { locale: Locale; theme: ThemeName };

const KEY = "shadowbox-prefs";

function storedTheme(value: unknown): ThemeName {
  return value === "light" || value === "dark" ? value : "system";
}

/** System follows the device. Light and dark stay as chosen. */
export function resolveTheme(theme: ThemeName, prefersDark: boolean): AppliedTheme {
  if (theme === "system") return prefersDark ? "dark" : "light";
  return theme;
}

export function loadPrefs(): Prefs {
  if (typeof localStorage === "undefined") return { locale: "en", theme: "system" };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Prefs>;
    return {
      locale: raw.locale === "pt" ? "pt" : "en",
      theme: storedTheme(raw.theme),
    };
  } catch {
    return { locale: "en", theme: "system" };
  }
}

export function savePrefs(prefs: Prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
