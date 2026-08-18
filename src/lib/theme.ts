import { useEffect, useState } from "react";

/**
 * Theme is stored as an explicit choice or left as "system". Until the user
 * picks a side we follow the OS, which is what the reference build does.
 *
 * The resolved theme is applied as a `dark` class on <html> — that is what the
 * `dark` custom variant and the `.dark` token block in styles.css key off.
 */
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const KEY = "db.theme";
const EVENT = "db-theme-change";

const MEDIA = "(prefers-color-scheme: dark)";

export function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MEDIA).matches;
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : "system";
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return prefersDark() ? "dark" : "light";
  return theme;
}

/** Toggles the class only — no storage write, so the pre-paint script can reuse it. */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
}

export function setTheme(theme: Theme) {
  if (theme === "system") window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(EVENT));
}

export function useTheme() {
  // Start on the SSR default and correct in an effect, or hydration mismatches.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const sync = () => {
      const t = getTheme();
      setThemeState(t);
      setResolved(resolveTheme(t));
    };
    sync();

    const media = window.matchMedia(MEDIA);
    // Only matters while the user is on "system", but syncing always is harmless.
    const onMedia = () => {
      if (getTheme() === "system") {
        applyTheme("system");
        sync();
      }
    };

    window.addEventListener(EVENT, sync);
    media.addEventListener("change", onMedia);
    return () => {
      window.removeEventListener(EVENT, sync);
      media.removeEventListener("change", onMedia);
    };
  }, []);

  /** Flip to the opposite of what is on screen, as the reference build does. */
  const toggle = () => setTheme(resolved === "dark" ? "light" : "dark");

  return { theme, resolved, setTheme, toggle };
}

/**
 * Runs in <head> before first paint so the correct tokens are in place and the
 * page never flashes the wrong theme. Inlined as a string — it cannot import.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");var d=t==="dark"||(t!=="light"&&window.matchMedia("${MEDIA}").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;
