import type { Dictionary } from "../i18n/dictionaries/ru";
import type { Game } from "../types/game";
import { playerLabel } from "./playerProfile";

export type RematchStatus = "offered" | "declined";

export function isFriendGameHost(game: Game, playerToken: string): boolean {
  return game.player_x_token === playerToken;
}

export function isFriendGameGuest(game: Game, playerToken: string): boolean {
  return game.player_o_token === playerToken;
}

export function getHostProfileLabel(t: Dictionary, game: Game): string {
  return playerLabel(t, game.player_x_name, "X");
}
