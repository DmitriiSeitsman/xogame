# Крестики-нолики (XOGame)

Современная веб-игра «Крестики-нолики» на React + Vite + TypeScript + Supabase.

## Режимы игры

- **С компьютером** — локальная игра без Supabase
- **С другом** — создание игры по коду/ссылке приглашения
- **Случайный игрок** — matchmaking через Supabase RPC

## Размеры поля

- 3×3 — победа при 3 в ряд
- 4×4 — победа при 4 в ряд
- 5×5 — победа при 4 в ряд
- 6×6 — победа при 4 в ряд

## Установка

```bash
npm install
```

## Настройка окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADS_ENABLED=false
```

## Запуск

```bash
npm run dev
```

Сборка:

```bash
npm run build
```

## Supabase: SQL миграции

Файлы находятся в `docs/database/`:

1. `001_create_games.sql` — таблица `games`, индексы, trigger `updated_at`, базовая RLS policy
2. `002_create_rpc_functions.sql` — RPC функции и helpers
3. `003_realtime_and_rls_notes.md` — заметки по Realtime и безопасности
4. `004_add_player_profiles.sql` — имена и возраст игроков (если БД создана до этого обновления)
5. `005_matchmaking_queue.sql` — очередь matchmaking с heartbeat и счётчиками по размеру поля

Выполните SQL в Supabase SQL Editor в указанном порядке.

## RPC функции

| Функция | Назначение |
|---------|------------|
| `create_friend_game` | Создать игру с другом |
| `join_friend_game` | Подключиться по invite code |
| `join_random_matchmaking` | Встать в очередь / найти соперника |
| `heartbeat_random_matchmaking` | Поддержать presence в очереди |
| `leave_random_matchmaking` | Выйти из очереди |
| `get_matchmaking_queue_counts` | Счётчики поиска по размеру поля |
| `cancel_random_search` | Отменить поиск (алиас для leave) |
| `make_move` | Сделать ход |

## Realtime

Включите Realtime для таблицы `games`:

```sql
alter publication supabase_realtime add table public.games;
```

Подробнее: `docs/database/003_realtime_and_rls_notes.md`

## Структура проекта

```
src/
  app/           — App и router
  pages/         — HomePage, JoinGamePage, GamePage
  components/    — UI компоненты
  services/      — Supabase и game service
  utils/         — game engine, player token, invite helpers
  types/         — TypeScript типы
  styles/        — global CSS
docs/
  database/      — SQL миграции
  architecture.md
```

## Идентификация игрока

Регистрации нет. Игрок получает анонимный `playerToken` через `crypto.randomUUID()` и хранит его в `localStorage` (`xogame_player_token`).

## Реклама

Рекламные зоны управляются через `VITE_ADS_ENABLED`. На игровом экране используются placements `game_top` и `game_bottom` — они не перекрывают поле и не используют fixed/sticky поверх игры.

## Документация

- [Архитектура](docs/architecture.md)
- [Realtime и RLS](docs/database/003_realtime_and_rls_notes.md)
# xogame
