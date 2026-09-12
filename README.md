# Крестики-нолики (XOGame)

Современная веб-игра «Крестики-нолики» на React + Vite + TypeScript. Бэкенд — свой Vapor (Swift) API + WebSocket поверх Postgres, см. репозиторий [XOGameBackend](https://github.com/DmitriiSeitsman/XOGameBackend).

Прод: **https://xo-game.online**

## Режимы игры

- **С компьютером** — локальная игра, без обращений к бэкенду
- **С другом** — создание игры по коду/ссылке приглашения
- **Случайный игрок** — matchmaking через свой API

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
VITE_API_BASE_URL=https://api.xo-game.online
VITE_WS_URL=wss://api.xo-game.online/ws/game
VITE_ADS_ENABLED=false
```

Для локальной разработки против бэкенда, поднятого локально:

```env
VITE_API_BASE_URL=http://localhost:8092
VITE_WS_URL=ws://localhost:8092/ws/game
```

## Запуск

```bash
npm run dev
```

Сборка:

```bash
npm run build
```

## Бэкенд и база данных

Вся игровая логика (создание игр, ходы, matchmaking, реванши) живёт в Postgres-функциях, а не в этом репозитории. SQL-файлы в `docs/database/` — это **историческая справка** о том, как схема была устроена изначально на Supabase; актуальная миграция, применяемая при деплое, лежит в [XOGameBackend](https://github.com/DmitriiSeitsman/XOGameBackend) (`Sources/XOGameBackend/Migrations/CreateGameSchema.swift`) и содержит финальное состояние всех этих функций.

Эндпоинты API, которые вызывает фронтенд:

| Endpoint | Назначение |
|---------|------------|
| `POST /games/friend` | Создать игру с другом |
| `POST /games/friend/join` | Подключиться по invite code |
| `POST /games/random/join` | Встать в очередь / найти соперника |
| `POST /games/random/heartbeat` | Поддержать presence в очереди |
| `POST /games/random/leave` | Выйти из очереди (алиас: cancel) |
| `GET /games/random/queue-counts` | Счётчики поиска по размеру поля |
| `POST /games/:gameID/move` | Сделать ход |
| `POST /games/:gameID/rematch/offer\|accept\|decline` | Реванш в игре с другом |
| `GET /ws/game` | WebSocket-подписка на обновления игры |

## Структура проекта

```
src/
  app/           — App и router
  pages/         — HomePage, JoinGamePage, GamePage
  components/    — UI компоненты
  services/      — apiClient, realtimeClient, gameService
  utils/         — game engine, player token, invite helpers
  types/         — TypeScript типы
  styles/        — global CSS
docs/
  database/      — исторические SQL миграции (Supabase-эпоха)
  architecture.md
  deploy.md      — деплой фронтенда (GitHub Pages)
```

## Идентификация игрока

Регистрации нет. Игрок получает анонимный `playerToken` через `crypto.randomUUID()` и хранит его в `localStorage` (`xogame_player_token`). Токен передаётся бэкенду как bearer-токен/query-параметр и является единственным «удостоверением» — так же, как раньше был anon-ключ Supabase для RPC.

## Реклама

Рекламные зоны управляются через `VITE_ADS_ENABLED`. На игровом экране используются placements `game_top` и `game_bottom` — они не перекрывают поле и не используют fixed/sticky поверх игры.

## Документация

- [Архитектура](docs/architecture.md)
- [Деплой фронтенда](docs/deploy.md)
- [Деплой бэкенда](https://github.com/DmitriiSeitsman/XOGameBackend/blob/main/Docs/DEPLOYMENT.md)
