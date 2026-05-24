-- 001_create_games.sql
-- Creates the games table, indexes, and updated_at trigger.

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('computer', 'friend', 'random')),
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished', 'cancelled')),
  board_size int not null check (board_size between 3 and 6),
  win_length int not null check (win_length between 3 and 6),
  invite_code text,
  player_x_token text not null,
  player_o_token text,
  current_turn text not null default 'X' check (current_turn in ('X', 'O')),
  board jsonb not null,
  winner text check (winner in ('X', 'O', 'draw')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists games_invite_code_idx
  on public.games (invite_code)
  where invite_code is not null;

create index if not exists games_random_waiting_idx
  on public.games (mode, status, board_size, created_at)
  where mode = 'random' and status = 'waiting';

create index if not exists games_updated_at_idx
  on public.games (updated_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_games_updated_at on public.games;

create trigger set_games_updated_at
before update on public.games
for each row
execute function public.set_updated_at();

-- MVP RLS: allow read for anon/authenticated
alter table public.games enable row level security;

drop policy if exists "Allow read games for anon" on public.games;
create policy "Allow read games for anon"
  on public.games
  for select
  to anon, authenticated
  using (true);
