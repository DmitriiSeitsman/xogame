-- 005_matchmaking_queue.sql
-- Reliable random matchmaking queue with heartbeat, player profiles, and queue counts.
-- Requires 004_add_player_profiles.sql (normalize_player_name / normalize_player_age).

create table if not exists public.matchmaking_queue (
  player_token text primary key,
  board_size int not null check (board_size between 3 and 6),
  player_name text not null,
  player_age int check (player_age is null or (player_age >= 1 and player_age <= 120)),
  game_id uuid references public.games (id) on delete set null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists matchmaking_queue_board_size_idx
  on public.matchmaking_queue (board_size, last_seen_at);

create index if not exists matchmaking_queue_game_id_idx
  on public.matchmaking_queue (game_id)
  where game_id is not null;

alter table public.matchmaking_queue enable row level security;

-- Queue is managed only through RPC functions.
drop policy if exists "Deny direct access to matchmaking_queue" on public.matchmaking_queue;
create policy "Deny direct access to matchmaking_queue"
  on public.matchmaking_queue
  for all
  to anon, authenticated
  using (false)
  with check (false);

create or replace function public.matchmaking_stale_after()
returns interval
language sql
immutable
as $$
  select interval '45 seconds';
$$;

create or replace function public.cleanup_stale_matchmaking_queue()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with stale as (
    delete from public.matchmaking_queue
    where last_seen_at < now() - public.matchmaking_stale_after()
    returning game_id
  )
  update public.games
  set status = 'cancelled'
  where id in (
    select game_id
    from stale
    where game_id is not null
  )
    and mode = 'random'
    and status = 'waiting'
    and player_o_token is null;
end;
$$;

create or replace function public.get_matchmaking_queue_counts()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_counts jsonb;
begin
  perform public.cleanup_stale_matchmaking_queue();

  select coalesce(
    jsonb_object_agg(board_size::text, queue_count),
    '{}'::jsonb
  )
  into v_counts
  from (
    select
      board_size,
      count(*)::int as queue_count
    from public.matchmaking_queue
  where last_seen_at >= now() - public.matchmaking_stale_after()
    group by board_size
  ) counts;

  return jsonb_build_object(
    '3', coalesce((v_counts ->> '3')::int, 0),
    '4', coalesce((v_counts ->> '4')::int, 0),
    '5', coalesce((v_counts ->> '5')::int, 0),
    '6', coalesce((v_counts ->> '6')::int, 0)
  );
end;
$$;

create or replace function public.try_match_random_player(
  p_player_token text,
  p_board_size int,
  p_player_name text,
  p_player_age int
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner public.matchmaking_queue;
  v_game public.games;
begin
  select *
  into v_partner
  from public.matchmaking_queue
  where board_size = p_board_size
    and player_token <> p_player_token
    and last_seen_at >= now() - public.matchmaking_stale_after()
  order by created_at asc
  limit 1
  for update skip locked;

  if not found then
    return null;
  end if;

  if v_partner.game_id is not null then
    select *
    into v_game
    from public.games
    where id = v_partner.game_id
    for update;

    if found
       and v_game.mode = 'random'
       and v_game.status = 'waiting'
       and v_game.player_o_token is null
       and v_game.player_x_token = v_partner.player_token then
      update public.games
      set
        player_o_token = p_player_token,
        player_o_name = public.normalize_player_name(p_player_name),
        player_o_age = public.normalize_player_age(p_player_age),
        status = 'playing'
      where id = v_game.id
      returning * into v_game;

      delete from public.matchmaking_queue
      where player_token in (p_player_token, v_partner.player_token);

      return v_game;
    end if;
  end if;

  insert into public.games (
    mode,
    status,
    board_size,
    win_length,
    invite_code,
    player_x_token,
    player_o_token,
    player_x_name,
    player_x_age,
    player_o_name,
    player_o_age,
    current_turn,
    board
  )
  values (
    'random',
    'playing',
    p_board_size,
    public.get_win_length(p_board_size),
    null,
    v_partner.player_token,
    p_player_token,
    v_partner.player_name,
    v_partner.player_age,
    public.normalize_player_name(p_player_name),
    public.normalize_player_age(p_player_age),
    'X',
    public.create_empty_board(p_board_size)
  )
  returning * into v_game;

  delete from public.matchmaking_queue
  where player_token in (p_player_token, v_partner.player_token);

  return v_game;
end;
$$;

create or replace function public.join_random_matchmaking(
  p_player_token text,
  p_board_size int,
  p_player_name text default null,
  p_player_age int default null
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_age int;
  v_existing public.matchmaking_queue;
  v_game public.games;
begin
  if p_board_size < 3 or p_board_size > 6 then
    raise exception 'Invalid board size: %', p_board_size;
  end if;

  perform public.cleanup_stale_matchmaking_queue();

  v_name := public.normalize_player_name(p_player_name);
  v_age := public.normalize_player_age(p_player_age);

  if v_name is null then
    raise exception 'Player name is required';
  end if;

  select *
  into v_existing
  from public.matchmaking_queue
  where player_token = p_player_token
  for update;

  if found then
    if v_existing.game_id is not null then
      update public.games
      set status = 'cancelled'
      where id = v_existing.game_id
        and mode = 'random'
        and status = 'waiting'
        and player_o_token is null;
    end if;

    delete from public.matchmaking_queue
    where player_token = p_player_token;
  end if;

  v_game := public.try_match_random_player(
    p_player_token,
    p_board_size,
    v_name,
    v_age
  );

  if v_game is not null then
    return v_game;
  end if;

  insert into public.games (
    mode,
    status,
    board_size,
    win_length,
    invite_code,
    player_x_token,
    player_o_token,
    player_x_name,
    player_x_age,
    current_turn,
    board
  )
  values (
    'random',
    'waiting',
    p_board_size,
    public.get_win_length(p_board_size),
    null,
    p_player_token,
    null,
    v_name,
    v_age,
    'X',
    public.create_empty_board(p_board_size)
  )
  returning * into v_game;

  insert into public.matchmaking_queue (
    player_token,
    board_size,
    player_name,
    player_age,
    game_id,
    last_seen_at
  )
  values (
    p_player_token,
    p_board_size,
    v_name,
    v_age,
    v_game.id,
    now()
  );

  return v_game;
end;
$$;

create or replace function public.heartbeat_random_matchmaking(
  p_player_token text
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue public.matchmaking_queue;
  v_game public.games;
begin
  perform public.cleanup_stale_matchmaking_queue();

  select *
  into v_queue
  from public.matchmaking_queue
  where player_token = p_player_token
  for update;

  if not found then
    raise exception 'Not in matchmaking queue';
  end if;

  update public.matchmaking_queue
  set last_seen_at = now()
  where player_token = p_player_token;

  if v_queue.game_id is not null then
    select *
    into v_game
    from public.games
    where id = v_queue.game_id;

    if found and v_game.status = 'playing' then
      delete from public.matchmaking_queue
      where player_token = p_player_token;

      return v_game;
    end if;
  end if;

  v_game := public.try_match_random_player(
    p_player_token,
    v_queue.board_size,
    v_queue.player_name,
    v_queue.player_age
  );

  if v_game is not null then
    return v_game;
  end if;

  select *
  into v_game
  from public.games
  where id = v_queue.game_id;

  if not found then
    raise exception 'Waiting game not found';
  end if;

  return v_game;
end;
$$;

create or replace function public.leave_random_matchmaking(
  p_player_token text,
  p_game_id uuid default null
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queue public.matchmaking_queue;
  v_game public.games;
  v_game_id uuid;
begin
  select *
  into v_queue
  from public.matchmaking_queue
  where player_token = p_player_token;

  v_game_id := coalesce(p_game_id, v_queue.game_id);

  delete from public.matchmaking_queue
  where player_token = p_player_token;

  if v_game_id is null then
    raise exception 'Game not found';
  end if;

  select *
  into v_game
  from public.games
  where id = v_game_id
  for update;

  if not found then
    raise exception 'Game not found';
  end if;

  if v_game.mode <> 'random'
     or v_game.status <> 'waiting'
     or v_game.player_x_token <> p_player_token then
    raise exception 'Cannot cancel this search';
  end if;

  update public.games
  set status = 'cancelled'
  where id = v_game_id
  returning * into v_game;

  return v_game;
end;
$$;

-- Replace legacy random matchmaking RPCs with queue-based versions.
drop function if exists public.find_or_create_random_game(text, int);

create or replace function public.cancel_random_search(
  p_player_token text,
  p_game_id uuid
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.leave_random_matchmaking(p_player_token, p_game_id);
end;
$$;

grant execute on function public.get_matchmaking_queue_counts() to anon, authenticated;
grant execute on function public.join_random_matchmaking(text, int, text, int) to anon, authenticated;
grant execute on function public.heartbeat_random_matchmaking(text) to anon, authenticated;
grant execute on function public.leave_random_matchmaking(text, uuid) to anon, authenticated;
grant execute on function public.cancel_random_search(text, uuid) to anon, authenticated;
