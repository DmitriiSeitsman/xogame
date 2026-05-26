-- 006_friend_rematch.sql
-- Friend-mode rematch: host offers, guest accepts or declines (same game row).

alter table public.games
  add column if not exists rematch_status text
  check (rematch_status is null or rematch_status in ('offered', 'declined'));

comment on column public.games.rematch_status is
  'Friend rematch: offered = host asked guest; declined = someone refused';

create or replace function public.offer_friend_rematch(
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

  if v_game.mode <> 'friend' then
    raise exception 'Rematch is only available in friend mode';
  end if;

  if v_game.status <> 'finished' then
    raise exception 'Game is not finished';
  end if;

  if v_game.player_x_token <> p_player_token then
    raise exception 'Only the game host can offer a rematch';
  end if;

  if v_game.player_o_token is null then
    raise exception 'Opponent has not joined yet';
  end if;

  if v_game.rematch_status = 'offered' then
    return v_game;
  end if;

  update public.games
  set rematch_status = 'offered'
  where id = p_game_id
  returning * into v_game;

  return v_game;
end;
$$;

create or replace function public.accept_friend_rematch(
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

  if v_game.mode <> 'friend' then
    raise exception 'Rematch is only available in friend mode';
  end if;

  if v_game.status <> 'finished' then
    raise exception 'Game is not finished';
  end if;

  if v_game.player_o_token <> p_player_token then
    raise exception 'Only the guest can accept a rematch';
  end if;

  if v_game.rematch_status <> 'offered' then
    raise exception 'No rematch offer pending';
  end if;

  update public.games
  set
    status = 'playing',
    board = public.create_empty_board(v_game.board_size),
    current_turn = 'X',
    winner = null,
    rematch_status = null
  where id = p_game_id
  returning * into v_game;

  return v_game;
end;
$$;

create or replace function public.decline_friend_rematch(
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

  if v_game.mode <> 'friend' then
    raise exception 'Rematch is only available in friend mode';
  end if;

  if v_game.status <> 'finished' then
    raise exception 'Game is not finished';
  end if;

  if v_game.player_x_token <> p_player_token
     and v_game.player_o_token <> p_player_token then
    raise exception 'Player is not part of this game';
  end if;

  update public.games
  set rematch_status = 'declined'
  where id = p_game_id
  returning * into v_game;

  return v_game;
end;
$$;

grant execute on function public.offer_friend_rematch(text, uuid) to anon, authenticated;
grant execute on function public.accept_friend_rematch(text, uuid) to anon, authenticated;
grant execute on function public.decline_friend_rematch(text, uuid) to anon, authenticated;
