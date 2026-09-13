import { useSyncExternalStore } from "react";
import { getTheme, subscribeToTheme, type Theme } from "../utils/theme";

/** Subscribes to the theme store (src/utils/theme.ts). No provider needed —
 * the store is a module singleton, and the attribute it writes is what the
 * CSS actually reacts to. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, getTheme, getTheme);
}
