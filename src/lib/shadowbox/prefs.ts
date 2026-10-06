export type Locale = "en" | "pt";
export type ThemeName = "light" | "dark" | "system";
export type AppliedTheme = "light" | "dark";

/** Site-wide text size (Settings modal). Scales the root font size, so every rem-based size follows. */
export type FontSize = "small" | "default" | "large" | "xlarge";
export const FONT_SIZES: FontSize[] = ["small", "default", "large", "xlarge"];
/** Root font-size, in percent of the browser default. pages/index.html repeats this table for the pre-paint script. */
export const FONT_SCALE: Record<FontSize, number> = { small: 87.5, default: 100, large: 112.5, xlarge: 125 };

export type Prefs = { locale: Locale; theme: ThemeName; fontSize: FontSize };

function storedFontSize(value: unknown): FontSize {
  return value === "small" || value === "large" || value === "xlarge" ? value : "default";
}

export function applyFontSize(size: FontSize) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (size === "default") {
    root.style.removeProperty("font-size");
    delete root.dataset.fontSize;
  } else {
    root.style.fontSize = `${FONT_SCALE[size]}%`;
    root.dataset.fontSize = size;
  }
}

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
  if (typeof localStorage === "undefined") return { locale: "en", theme: "system", fontSize: "default" };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Prefs>;
    return {
      locale: raw.locale === "pt" ? "pt" : "en",
      theme: storedTheme(raw.theme),
      fontSize: storedFontSize(raw.fontSize),
    };
  } catch {
    return { locale: "en", theme: "system", fontSize: "default" };
  }
}

export function savePrefs(prefs: Prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
