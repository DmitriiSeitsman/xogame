import type { Dictionary } from "../i18n/dictionaries/ru";
import type { Game } from "../types/game";
import { formatPlayerProfile } from "./playerProfile";

export function getOpponentProfileLabel(
  t: Dictionary,
  game: Game,
  playerToken: string,
): string | null {
  const isX = game.player_x_token === playerToken;
  const isO = game.player_o_token === playerToken;

  if (!isX && !isO) {
    return null;
  }

  const opponentName = isX ? game.player_o_name : game.player_x_name;
  const opponentAge = isX ? game.player_o_age : game.player_x_age;

  if (!opponentName) {
    return null;
  }

  return formatPlayerProfile(t, opponentName, opponentAge);
}
