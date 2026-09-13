import { createContext } from "react";
import type { Language } from "./language";
import type { Dictionary } from "./dictionaries/ru";

export type I18nValue = {
  /** Active language, derived from the URL. */
  lang: Language;
  /** The active dictionary. Used as `t.home.heading`, `t.board.label(3)`. */
  t: Dictionary;
  /** Prefixes a route for the active language: "/rules" -> "/en/rules". */
  path: (route: string) => string;
};

/** Created in its own module so this file only exports context (keeps
 * react-refresh happy — component files must only export components). */
export const I18nContext = createContext<I18nValue | null>(null);
