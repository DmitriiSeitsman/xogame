import type { SymbolTheme } from "../types/gameTheme";

const STORAGE_KEY = "xogame_symbol_theme";

export function getSavedSymbolTheme(): SymbolTheme {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "magic" ? "magic" : "classic";
}

export function saveSymbolTheme(theme: SymbolTheme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}
