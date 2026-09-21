/**
 * The player token is the only credential this game has: whoever holds it
 * can move, chat and receive realtime events as this player, in every game.
 *
 * The key is versioned because the server used to include the opponent's
 * token in game responses and realtime events. Bumping it gives every
 * browser a fresh token, so any token collected before that was fixed stops
 * being worth anything — it no longer belongs to anyone who is still
 * playing. Bump it again if tokens ever need to be invalidated wholesale.
 */
const STORAGE_KEY = "xogame_player_token_v2";
const RETIRED_STORAGE_KEYS = ["xogame_player_token"];

export function getOrCreatePlayerToken(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  for (const key of RETIRED_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  const token = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, token);
  return token;
}
