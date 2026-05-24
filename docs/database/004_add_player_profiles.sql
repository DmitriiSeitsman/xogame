-- 004_add_player_profiles.sql
-- Adds display name and optional age for friend-mode players.

alter table public.games
  add column if not exists player_x_name text,
  add column if not exists player_x_age int,
  add column if not exists player_o_name text,
  add column if not exists player_o_age int;

alter table public.games
  drop constraint if exists games_player_x_age_check;

alter table public.games
  add constraint games_player_x_age_check
  check (player_x_age is null or (player_x_age >= 1 and player_x_age <= 120));

alter table public.games
  drop constraint if exists games_player_o_age_check;

alter table public.games
  add constraint games_player_o_age_check
  check (player_o_age is null or (player_o_age >= 1 and player_o_age <= 120));

create or replace function public.normalize_player_name(p_name text)
returns text
language plpgsql
immutable
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(p_name), '');

  if v_name is null then
    return null;
  end if;

  if char_length(v_name) > 32 then
    raise exception 'Player name is too long';
  end if;

  return v_name;
end;
$$;

create or replace function public.normalize_player_age(p_age int)
returns int
language plpgsql
immutable
as $$
begin
  if p_age is null then
    return null;
  end if;

  if p_age < 1 or p_age > 120 then
    raise exception 'Invalid player age: %', p_age;
  end if;

  return p_age;
end;
$$;

drop function if exists public.create_friend_game(text, int);

create or replace function public.create_friend_game(
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
  v_game public.games;
begin
  if p_board_size < 3 or p_board_size > 6 then
    raise exception 'Invalid board size: %', p_board_size;
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
    'friend',
    'waiting',
    p_board_size,
    public.get_win_length(p_board_size),
    public.generate_invite_code(),
    p_player_token,
    null,
    public.normalize_player_name(p_player_name),
    public.normalize_player_age(p_player_age),
    'X',
    public.create_empty_board(p_board_size)
  )
  returning * into v_game;

  return v_game;
end;
$$;

drop function if exists public.join_friend_game(text, text);

create or replace function public.join_friend_game(
  p_player_token text,
  p_invite_code text,
  p_player_name text default null,
  p_player_age int default null
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.games;
begin
  select *
  into v_game
  from public.games
  where invite_code = upper(trim(p_invite_code))
  for update;

  if not found then
    raise exception 'Game not found';
  end if;

  if v_game.status in ('finished', 'cancelled') then
    raise exception 'Game is not joinable';
  end if;

  if v_game.player_x_token = p_player_token then
    return v_game;
  end if;

  if v_game.player_o_token = p_player_token then
    return v_game;
  end if;

  if v_game.player_o_token is null then
    update public.games
    set
      player_o_token = p_player_token,
      player_o_name = public.normalize_player_name(p_player_name),
      player_o_age = public.normalize_player_age(p_player_age),
      status = 'playing'
    where id = v_game.id
    returning * into v_game;

    return v_game;
  end if;

  raise exception 'Game already has two players';
end;
$$;

grant execute on function public.create_friend_game(text, int, text, int) to anon, authenticated;
grant execute on function public.join_friend_game(text, text, text, int) to anon, authenticated;
