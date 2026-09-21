import type { Dictionary } from "../i18n/dictionaries/ru";
import type { PlayerSymbol } from "../types/game";

/**
 * What a player tells us about themselves: an optional name, nothing else.
 *
 * Age used to be asked for too. Players are often children, and a name
 * plus an age shown to a stranger in random matchmaking was the most
 * identifying thing the game held, so it's gone — not asked, not stored,
 * not sent (see MinimizePlayerData on the backend, which also drops any age
 * an old client still sends).
 */
export type PlayerProfile = {
  name: string;
};

const STORAGE_KEY = "xogame_player_profile";

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { name: "" };
    }

    const parsed = JSON.parse(raw) as { name?: unknown; age?: unknown };
    const profile = { name: typeof parsed.name === "string" ? parsed.name : "" };

    // Profiles saved before age was dropped still carry one: rewrite them
    // without it so it doesn't linger in the browser either.
    if ("age" in parsed) {
      savePlayerProfile(profile);
    }
    return profile;
  } catch {
    return { name: "" };
  }
}

/** An empty name removes the stored profile rather than saving "". */
export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    const name = profile.name.trim();
    if (name) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode, blocked) — the name just isn't remembered.
  }
}

/** The name as sent to the API: `null` when the player left it blank. */
export function playerNameForApi(profile: PlayerProfile): string | null {
  return profile.name.trim() || null;
}

/**
 * How a player is shown: their name if they gave one, otherwise
 * "Игрок 1" for whoever created the game (always X) and "Игрок 2" for
 * whoever joined it (always O).
 */
export function playerLabel(
  t: Dictionary,
  name: string | null | undefined,
  symbol: PlayerSymbol,
): string {
  return name?.trim() || (symbol === "X" ? t.common.player1 : t.common.player2);
}
