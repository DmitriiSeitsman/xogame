-- 002_create_rpc_functions.sql
-- Game helpers and RPC functions for friend invite, random matchmaking, and moves.

create or replace function public.create_empty_board(p_board_size int)
returns jsonb
language plpgsql
immutable
as $$
begin
  if p_board_size < 3 or p_board_size > 6 then
    raise exception 'Invalid board size: %', p_board_size;
  end if;

  return (
    select jsonb_agg(''::text)
    from generate_series(1, p_board_size * p_board_size)
  );
end;
$$;

create or replace function public.get_win_length(p_board_size int)
returns int
language plpgsql
immutable
as $$
begin
  if p_board_size = 3 then
    return 3;
  end if;

  return 4;
end;
$$;

create or replace function public.calculate_winner(
  p_board jsonb,
  p_board_size int,
  p_win_length int
)
returns text
language plpgsql
immutable
as $$
declare
  v_row int;
  v_col int;
  v_symbol text;
  v_dr int;
  v_dc int;
  v_step int;
  v_count int;
  v_next_row int;
  v_next_col int;
  v_next_index int;
  v_direction int[];
  v_directions constant int[][] := array[
    array[0, 1],
    array[1, 0],
    array[1, 1],
    array[1, -1]
  ];
begin
  for v_row in 0..(p_board_size - 1) loop
    for v_col in 0..(p_board_size - 1) loop
      v_symbol := p_board ->> (v_row * p_board_size + v_col);

      if v_symbol is null or v_symbol = '' then
        continue;
      end if;

      foreach v_direction slice 1 in array v_directions loop
        v_dr := v_direction[1];
        v_dc := v_direction[2];
        v_count := 1;

        for v_step in 1..(p_win_length - 1) loop
          v_next_row := v_row + v_dr * v_step;
          v_next_col := v_col + v_dc * v_step;

          if v_next_row < 0
             or v_next_row >= p_board_size
             or v_next_col < 0
             or v_next_col >= p_board_size then
            exit;
          end if;

          v_next_index := v_next_row * p_board_size + v_next_col;

          if (p_board ->> v_next_index) is distinct from v_symbol then
            exit;
          end if;

          v_count := v_count + 1;
        end loop;

        if v_count >= p_win_length then
          return v_symbol;
        end if;
      end loop;
    end loop;
  end loop;

  return null;
end;
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  v_chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text := '';
  v_i int;
  v_exists boolean;
begin
  loop
    v_code := '';

    for v_i in 1..5 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;

    select exists(
      select 1
      from public.games
      where invite_code = v_code
    ) into v_exists;

    exit when not v_exists;
  end loop;

  return v_code;
end;
$$;

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

create or replace function public.find_or_create_random_game(
  p_player_token text,
  p_board_size int
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

  select *
  into v_game
  from public.games
  where mode = 'random'
    and status = 'waiting'
    and board_size = p_board_size
    and player_o_token is null
    and player_x_token <> p_player_token
  order by created_at asc
  limit 1
  for update skip locked;

  if found then
    update public.games
    set
      player_o_token = p_player_token,
      status = 'playing'
    where id = v_game.id
    returning * into v_game;

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
    'X',
    public.create_empty_board(p_board_size)
  )
  returning * into v_game;

  return v_game;
end;
$$;

create or replace function public.cancel_random_search(
  p_player_token text,
  p_game_id uuid
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
  where id = p_game_id
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
  where id = p_game_id
  returning * into v_game;

  return v_game;
end;
$$;

create or replace function public.make_move(
  p_player_token text,
  p_game_id uuid,
  p_cell_index int
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.games;
  v_symbol text;
  v_board jsonb;
  v_winner text;
  v_board_length int;
  v_is_full boolean;
begin
  select *
  into v_game
  from public.games
  where id = p_game_id
  for update;

  if not found then
    raise exception 'Game not found';
  end if;

  if v_game.status <> 'playing' then
    raise exception 'Game is not in playing state';
  end if;

  if v_game.player_x_token = p_player_token then
    v_symbol := 'X';
  elsif v_game.player_o_token = p_player_token then
    v_symbol := 'O';
  else
    raise exception 'Player is not part of this game';
  end if;

  if v_game.current_turn <> v_symbol then
    raise exception 'Not your turn';
  end if;

  v_board_length := v_game.board_size * v_game.board_size;

  if p_cell_index < 0 or p_cell_index >= v_board_length then
    raise exception 'Invalid cell index';
  end if;

  if coalesce(v_game.board ->> p_cell_index, '') <> '' then
    raise exception 'Cell is already occupied';
  end if;

  v_board := jsonb_set(v_game.board, array[p_cell_index::text], to_jsonb(v_symbol), false);

  v_winner := public.calculate_winner(v_board, v_game.board_size, v_game.win_length);

  if v_winner is not null then
    update public.games
    set
      board = v_board,
      winner = v_winner,
      status = 'finished'
    where id = p_game_id
    returning * into v_game;

    return v_game;
  end if;

  select bool_and(value <> '')
  into v_is_full
  from jsonb_array_elements_text(v_board) as value;

  if v_is_full then
    update public.games
    set
      board = v_board,
      winner = 'draw',
      status = 'finished'
    where id = p_game_id
    returning * into v_game;

    return v_game;
  end if;

  update public.games
  set
    board = v_board,
    current_turn = case when v_symbol = 'X' then 'O' else 'X' end
  where id = p_game_id
  returning * into v_game;

  return v_game;
end;
$$;

grant execute on function public.create_friend_game(text, int, text, int) to anon, authenticated;
grant execute on function public.join_friend_game(text, text, text, int) to anon, authenticated;
grant execute on function public.find_or_create_random_game(text, int) to anon, authenticated;
grant execute on function public.cancel_random_search(text, uuid) to anon, authenticated;
grant execute on function public.make_move(text, uuid, int) to anon, authenticated;
