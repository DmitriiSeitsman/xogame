# Realtime and RLS Notes

## Security model (MVP)

For the MVP, reading from `public.games` is allowed for `anon` and `authenticated` roles via a permissive SELECT policy. This keeps the frontend simple while Realtime subscriptions work out of the box.

**Important:**

- Do **not** perform direct `UPDATE`/`INSERT`/`DELETE` from the client.
- All game state changes must go through RPC functions:
  - `create_friend_game`
  - `join_friend_game`
  - `join_random_matchmaking`
  - `heartbeat_random_matchmaking`
  - `leave_random_matchmaking`
  - `get_matchmaking_queue_counts`
  - `cancel_random_search`
  - `make_move`

In a future hardening pass, consider:

- Removing broad SELECT access and exposing game state only through RPC or a view.
- Adding rate limiting at the edge.
- Validating player tokens with signed session tokens instead of plain UUID strings.

## Realtime

Enable Realtime for the `games` table so clients receive `UPDATE` events when moves are made or matchmaking completes.

### Dashboard

1. Open Supabase Dashboard → **Database** → **Replication**
2. Ensure `public.games` is enabled for Realtime

### SQL

If the table is not already in the publication, run:

```sql
alter publication supabase_realtime add table public.games;
```

If the table is already included, this command may fail — that is expected.

## Client subscription pattern

The frontend subscribes only to a single game by id:

```ts
supabase
  .channel(`game:${gameId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "games",
      filter: `id=eq.${gameId}`,
    },
    handler,
  )
  .subscribe();
```

Both players receive board updates after each RPC `make_move` call because the RPC updates the row and Realtime broadcasts the change.

## Matchmaking race conditions

Random matchmaking uses `matchmaking_queue` with heartbeat (45s TTL) and `join_random_matchmaking` / `try_match_random_player` with:

```sql
for update skip locked
```

This prevents two clients from joining the same waiting game simultaneously in conflicting ways.

Friend join uses `for update` on the invite lookup to avoid two players claiming `player_o_token` at the same time.
