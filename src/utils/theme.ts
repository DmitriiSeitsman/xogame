/**
 * Theme store.
 *
 * The resolved theme is stamped on `<html data-theme>` by a small inline
 * script in index.html that runs before first paint — without it the page
 * would flash light before React mounts, which is exactly the moment a dark
 * theme is most unpleasant. This module owns the same logic afterwards, and
 * stays the single writer of that attribute.
 *
 * "system" is the default and is not stored: the setting is only written to
 * localStorage once the visitor actually picks a side, so following the OS
 * remains the behaviour until they say otherwise.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "xogame_theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Background colour reported to the browser chrome (address bar on mobile).
 * Must match --color-bg-middle for each theme in variables.css. */
const THEME_COLOR: Record<Theme, string> = {
  light: "#fff7ed",
  dark: "#181524",
};

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function readStored(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isTheme(raw) ? raw : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  try {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** True when the visitor hasn't chosen, so we're following the OS. */
export function isFollowingSystem(): boolean {
  return readStored() === null;
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEME_COLOR[theme]);
  }
}

let current: Theme =
  typeof document !== "undefined" && isTheme(document.documentElement.dataset.theme)
    ? (document.documentElement.dataset.theme as Theme)
    : readStored() ?? systemTheme();

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function getTheme(): Theme {
  return current;
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode — the choice just won't survive a reload.
  }

  if (theme === current) {
    return;
  }

  current = theme;
  apply(theme);
  emit();
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Keeps an unset ("system") preference in sync when the OS flips, e.g. at
 * sunset on a phone with automatic dark mode. */
export function watchSystemTheme(): () => void {
  let media: MediaQueryList;

  try {
    media = window.matchMedia(DARK_QUERY);
  } catch {
    return () => undefined;
  }

  const handleChange = (event: MediaQueryListEvent) => {
    if (!isFollowingSystem()) {
      return;
    }

    const next: Theme = event.matches ? "dark" : "light";
    if (next === current) {
      return;
    }

    current = next;
    apply(next);
    emit();
  };

  media.addEventListener("change", handleChange);
  return () => media.removeEventListener("change", handleChange);
}
