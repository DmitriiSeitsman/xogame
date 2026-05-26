-- 007_game_symbol_theme.sql
-- Persists host symbol theme on friend games so the guest sees the same visuals.

alter table public.games
  add column if not exists symbol_theme text
  check (symbol_theme is null or symbol_theme in ('classic', 'magic'));

comment on column public.games.symbol_theme is
  'Visual symbol theme for friend games (set by host on create)';

create or replace function public.normalize_symbol_theme(p_theme text)
returns text
language plpgsql
immutable
as $$
begin
  if p_theme = 'magic' then
    return 'magic';
  end if;

  return 'classic';
end;
$$;

drop function if exists public.create_friend_game(text, int, text, int);

create or replace function public.create_friend_game(
  p_player_token text,
  p_board_size int,
  p_player_name text default null,
  p_player_age int default null,
  p_symbol_theme text default 'classic'
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
    board,
    symbol_theme
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
    public.create_empty_board(p_board_size),
    public.normalize_symbol_theme(p_symbol_theme)
  )
  returning * into v_game;

  return v_game;
end;
$$;

grant execute on function public.create_friend_game(text, int, text, int, text) to anon, authenticated;
