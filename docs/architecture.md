# Architecture

## Overview

XOGame is a browser-based tic-tac-toe application built with React, Vite, TypeScript, and Supabase. Players are identified anonymously via a `playerToken` stored in `localStorage` — no registration is required.

The codebase separates:

- **UI** — React pages and components
- **Game logic** — pure functions in `src/utils/gameEngine.ts`
- **Multiplayer transport** — Supabase RPC + Realtime in `src/services/gameService.ts`
- **Local AI** — `src/services/computerPlayerService.ts`

## Game modes

### 1. Computer (`/game/local?size=N`)

Runs entirely on the client. The human plays as **X**, the computer as **O**. Board state, win detection, and AI moves use the shared game engine. No Supabase calls are made.

### 2. Friend invite

Flow:

1. Player A selects "С другом" and clicks Start.
2. Frontend calls `create_friend_game` RPC (includes host `symbol_theme` from home page).
3. Supabase creates a `waiting` game with a 5-character invite code and stored theme.
4. Player A sees `InviteBox` with link `/join/:inviteCode` and the code.
5. Player B opens the link or enters the code on the home page.
6. Frontend calls `join_friend_game` RPC.
7. Game status becomes `playing`.
8. Both clients navigate to `/game/:gameId` and subscribe to Realtime updates.

All moves go through `make_move` RPC.

After a friend game ends (`status = finished`):

1. The **host** (player who created the game, `player_x_token`) sees a dialog: play again?
2. If the host confirms, `offer_friend_rematch` sets `rematch_status = offered`.
3. The **guest** (`player_o_token`) sees an invitation with the host’s display name and can accept or decline.
4. Accept → `accept_friend_rematch` resets the same game row (`playing`, empty board, same invite code and players).
5. Decline or host “No” → `decline_friend_rematch`, then return to home.

SQL: `docs/database/006_friend_rematch.sql`.

Symbol theme for friend games is stored on `games.symbol_theme` (`007_game_symbol_theme.sql`) so both players see the same visuals.

### 3. Random matchmaking

Flow:

1. Player selects "Случайный игрок" and clicks Start.
2. Frontend asks for name and optional age (same profile dialog as friend mode).
3. Frontend calls `join_random_matchmaking` RPC.
4. The player is added to `matchmaking_queue` with a 45-second heartbeat window.
5. If another active queue entry exists for the same board size, both players are matched into a `playing` game with profile names stored on the game row.
6. Otherwise a `waiting` random game is created and the player sees "Ищем соперника…".
7. While waiting, the client sends `heartbeat_random_matchmaking` every ~25 seconds to stay in queue and retry matching.
8. Queue counts per board size are shown on the home page via `get_matchmaking_queue_counts`.
9. Cancel or leaving the page calls `leave_random_matchmaking` (also exposed as `cancel_random_search`).

SQL migration: `docs/database/005_matchmaking_queue.sql` (requires `004_add_player_profiles.sql` for name normalization helpers).

## Board sizes and win rules

| Board size | Cells | Win length |
|-----------|-------|------------|
| 3×3       | 9     | 3 in a row |
| 4×4       | 16    | 4 in a row |
| 5×5       | 25    | 4 in a row |
| 6×6       | 36    | 4 in a row |

Win detection is implemented generically for all sizes in both TypeScript (`calculateWinner`) and PostgreSQL (`public.calculate_winner`).

## Player identity

```ts
localStorage key: xogame_player_token
value: crypto.randomUUID()
```

The token is sent to RPC functions to authorize moves and matchmaking actions.

## Routing

| Route              | Purpose                          |
|--------------------|----------------------------------|
| `/`                | Home — mode/size selection       |
| `/join/:inviteCode`| Auto-join friend game            |
| `/game/:gameId`    | Multiplayer game + Realtime      |
| `/game/local`      | Local game vs computer           |

URL paths and invite codes use Latin characters only, even if the site domain is Cyrillic (e.g. `крестик-нолик.рф`).

## Layout and ads

The game screen uses `GameLayout`:

```
┌─────────────────────┐
│   AdSlot game_top   │
├─────────────────────┤
│                     │
│   centered board    │
│                     │
├─────────────────────┤
│ AdSlot game_bottom  │
└─────────────────────┘
```

Ads are controlled by `VITE_ADS_ENABLED`. When disabled, slots render nothing. When enabled, placeholders reserve space so the board does not jump.

Additional placements exist for home/waiting/result screens:

- `home_top`, `home_bottom`
- `waiting_top`, `waiting_bottom`
- `result_top`, `result_bottom`

## Data model

Single table: `public.games`

Key fields:

- `mode` — `computer` | `friend` | `random` (multiplayer modes use `friend`/`random`; computer mode is client-only)
- `status` — `waiting` | `playing` | `finished` | `cancelled`
- `board` — JSON array of `""`, `"X"`, `"O"`
- `invite_code` — unique 5-char code for friend games
- `player_x_token`, `player_o_token` — anonymous player identifiers

## Realtime

Clients subscribe to `UPDATE` events filtered by `id`. After each RPC mutation, both players receive the latest board without polling.

## Future improvements

- Persist computer games optionally
- Reconnect / resume in-progress multiplayer games
- Stronger auth for move validation
- Leaderboards and game history
- Integrate real ad network scripts into `AdSlot`
