# План миграции XOGame с Supabase на собственный сервер (195.209.215.87)

Дата: 2026-09-12. Автор: Claude, по итогам анализа `xogame` и `JustTwoBackend`.

## TL;DR

Переносим не игровую логику, а транспорт. Сейчас клиент дёргает Supabase (PostgREST RPC + Realtime по `postgres_changes`). Вместо Supabase поднимаем на `195.209.215.87` свой Vapor-сервис `XOGameBackend`, который: 1) держит ту же схему Postgres и те же SQL-функции (`make_move`, `join_random_matchmaking` и т.д.) почти без изменений — они уже обкатаны и решают конкурентность через `for update skip locked`; 2) отдаёт их наружу как обычные HTTP-эндпоинты вместо `supabase.rpc(...)`; 3) вместо `postgres_changes` — свой WebSocket-канал `/ws/game`, построенный на связке `RealtimeConnectionRegistry` + `RealtimeEventBus` из `JustTwoBackend/Sources/JustTwoBackend/Realtime/*`, у которой меняется только предметная область (game вместо conversation, нет JWT/аккаунтов — только `playerToken`, который уже является UUID).

Ключевая экономия риска: игровая логика (проверка победителя, инвайт-коды, матчмейкинг с блокировками строк) не переписывается на Swift — она остаётся в тех же `plpgsql`-функциях из `docs/database/*.sql`, а Vapor просто вызывает их через `SQLKit` и раздаёт результат по HTTP/WS. Переписывать на Swift стоит только тонкий транспортный слой, который у тебя уже готов в виде рабочего паттерна.

Фронтенд остаётся на GitHub Pages (как договорились), меняются только `src/services/supabaseClient.ts` и `src/services/gameService.ts` — на HTTP-клиент и WebSocket-клиент.

## 1. Что сейчас происходит в xogame

Стек: React 19 + Vite + TypeScript, состояние на клиенте не хранится — вся правда в таблице `public.games` (Supabase Postgres). Игрок анонимный, идентифицируется `playerToken` (`crypto.randomUUID()` в `localStorage`, ключ `xogame_player_token`).

Три режима: локальная игра с компьютером (полностью на клиенте, backend не нужен), игра с другом по инвайт-коду, случайный матчмейкинг с очередью и heartbeat 25 сек. Все мутации идут через RPC-функции (`create_friend_game`, `join_friend_game`, `join_random_matchmaking`, `heartbeat_random_matchmaking`, `leave_random_matchmaking`, `cancel_random_search`, `offer/accept/decline_friend_rematch`, `make_move`, `get_matchmaking_queue_counts`). Обновления партии игрок получает через Supabase Realtime — подписку на `UPDATE` события таблицы `games` с фильтром по `id`.

Таблица `public.games` и функции лежат в `docs/database/001-007*.sql` — там же логика подсчёта победителя для досок 3×3..6×6, генерации инвайт-кода, честной блокировки строк при матчмейкинге. Фронтенд деплоится статикой на GitHub Pages, домен `xo-game.online`, секреты (`VITE_SUPABASE_URL/ANON_KEY`) лежат в GitHub Actions Secrets.

## 2. Что уже есть в JustTwoBackend и что из этого берём

`JustTwoBackend` — Vapor 4 + Fluent + PostgresDriver + JWT, задеплоен на отдельный VPS (`77.239.107.143`) под юзером `justtwo`, слушает `127.0.0.1:8080`, наружу торчит через nginx с TLS от Certbot. Из него почти без изменений переносим весь модуль `Realtime/`:

- `RealtimeConnectionRegistry` — потокобезопасный реестр активных WebSocket-соединений, ключ — UUID (у джаствту это `userID`, у нас будет `playerToken`, он и так UUID).
- `RealtimeEventBus` — рассылка сообщений по UUID-ключу или множеству ключей.
- `RealtimeController` — обработка `GET /ws/realtime`: аутентификация в момент хендшейка, `onText`/`onClose`, ping/pong, subscribe/unsubscribe с проверкой прав на конкретный ресурс (у джаствту — `conversationID`, у нас — `gameID`).
- `RealtimeServerMessage` / `RealtimeClientMessage` — конверт сообщений (`type`, `eventID`, `occurredAt`, `payload`), уже с нормальным JSON-кодированием.

Не берём: JWT/аккаунты (у нас их нет и не нужно), APNs/push, messenger-модули, email-верификацию, object storage. Берём паттерн деплоя один в один: systemd unit + nginx reverse proxy с `Upgrade`/`Connection: upgrade` для WS + Certbot, потому что он у тебя уже проверен в бою (`Docs/DEPLOYMENT.md`, `Docs/ServerConfig.md` в JustTwoBackend).

## 3. Целевая архитектура

```
Браузер (`xo-game.online`, GitHub Pages)
   │  fetch()  →  HTTPS  →  nginx  →  127.0.0.1:PORT  →  Vapor XOGameBackend
   │  WebSocket → WSS     →  nginx  →  127.0.0.1:PORT  →  /ws/game
   ▼
Vapor XOGameBackend (195.209.215.87, отдельный linux-юзер, напр. "xogame")
   │
   ├─ GameController / MatchmakingController — HTTP, вызывают SQL-функции через SQLKit,
   │  после успешной мутации публикуют game.updated в RealtimeEventBus
   │
   ├─ RealtimeController — /ws/game, регистрирует соединение по playerToken,
   │  subscribe.game проверяет, что playerToken реально участник этой игры
   │
   └─ Postgres (своя БД xogame_prod, свой юзер xogame_user)
        └─ таблицы games / matchmaking_queue + функции из docs/database/*.sql (без изменений)
```

### 3.1 Данные и функции — переносим как есть

Файлы `001_create_games.sql` … `007_game_symbol_theme.sql` из xogame выполняются на новой базе `xogame_prod` буквально построчно (это уже вся нужная схема + `calculate_winner`, `generate_invite_code`, `create_friend_game`, `join_friend_game`, `try_match_random_player`, `join_random_matchmaking`, `heartbeat_random_matchmaking`, `leave_random_matchmaking`, `make_move`, `offer/accept/decline_friend_rematch`). Единственное, что стоит убрать — `grant execute ... to anon, authenticated` (это роли PostgREST/Supabase, у нас доступ и так только у бэкенда через `xogame_user`), и RLS-политики из `001` (`enable row level security`) — они нужны были только потому, что PostgREST раньше пускал `anon` читать таблицу напрямую; теперь наружу торчит только Vapor, прямого доступа к Postgres снаружи нет вообще.

### 3.2 HTTP API — замена `supabase.rpc(...)`

| Было (Supabase RPC) | Стало (Vapor HTTP) |
|---|---|
| `create_friend_game` | `POST /games/friend` |
| `join_friend_game` | `POST /games/friend/join` |
| `join_random_matchmaking` | `POST /games/random/join` |
| `heartbeat_random_matchmaking` | `POST /games/random/heartbeat` |
| `leave_random_matchmaking` / `cancel_random_search` | `POST /games/random/leave` |
| `get_matchmaking_queue_counts` | `GET /games/random/queue-counts` |
| `offer_friend_rematch` | `POST /games/:id/rematch/offer` |
| `accept_friend_rematch` | `POST /games/:id/rematch/accept` |
| `decline_friend_rematch` | `POST /games/:id/rematch/decline` |
| `make_move` | `POST /games/:id/move` |
| `.from("games").select("*").eq("id", id)` | `GET /games/:id` |

Тело каждого запроса — то же самое, что сейчас летит в `p_*`-параметры RPC (`playerToken`, `boardSize`, `playerName`, `cellIndex` и т.д.), только в camelCase JSON. Контроллер внутри делает ровно один SQL-вызов вида:

```swift
struct GameController: RouteCollection {
    func makeMove(req: Request) async throws -> GameDTO {
        let body = try req.content.decode(MakeMoveRequest.self)
        let sql = req.db as! any SQLDatabase
        let row = try await sql.raw("""
            select * from public.make_move(\(bind: body.playerToken), \(bind: body.gameId), \(bind: body.cellIndex))
            """).first(decoding: GameRow.self)
        guard let row else { throw Abort(.internalServerError) }
        let game = row.toDTO()
        req.application.realtimeEventBus.publish(.gameUpdated(game), toParticipantsOf: game)
        return game
    }
}
```

Ошибки Postgres (`raise exception 'Not your turn'` и т.п.) прилетают как `PSQLError` — их нужно замапить в понятные HTTP-статусы через тот же `APIErrorMiddleware`, что уже есть в JustTwoBackend (там уже есть паттерн централизованной обработки ошибок, `Sources/JustTwoBackend/Middleware/APIErrorMiddleware.swift` и `Errors/APIError.swift` — переносим как есть).

### 3.3 Realtime — замена `postgres_changes`

Вместо supabase-канала `game:${gameId}` — один WebSocket на вкладку, `wss://<домен>/ws/game?token=<playerToken>`, и после коннекта клиент шлёт:

```json
{"type": "subscribe.game", "gameID": "<uuid>"}
```

Сервер отвечает `subscription.ready`/`error` (`forbidden`, если `playerToken` не участник игры — проверка: `game.player_x_token == token || game.player_o_token == token`), а после каждой успешной мутации (`make_move`, `join_friend_game`, рематч и т.д.) рассылает всем подписанным соединениям обеих сторон:

```json
{
  "type": "game.updated",
  "eventID": "uuid",
  "occurredAt": "2026-09-12T10:00:00Z",
  "payload": { "game": { ...тот же формат, что и сейчас Game из types/game.ts... } }
}
```

Это один в один паттерн `subscribe.conversation` → `message.created` из `JustTwoBackend`, только без JWT: `playerToken` передаётся как query-параметр по тому же fallback-пути, что уже реализован в `RealtimeAuthTokenExtractor` (там уже поддержан и заголовок, и `?token=`).

Матчмейкинг-heartbeat (`heartbeat_random_matchmaking` каждые ~25 сек) и опрос очереди (`useMatchmakingQueueCounts`, раз в 12 сек) в первой версии оставляем как обычный HTTP-polling — это работает и сейчас, переписывать под WS не обязательно, это можно сделать вторым шагом уже после того, как заработает основной перенос.

## 4. Аудит сервера 195.209.215.87 (сначала, до установки)

Ты отметил, что на сервере уже что-то крутится — значит, повторяем ровно ту же разведку, что уже делалась для VPS JustTwo (см. `JustTwoBackend/Docs/ServerConfig.md` — там описан точно такой же сценарий с `cryptobot` рядом). Зайди по SSH и собери:

```bash
lsb_release -a                          # версия ОС
whoami; ls /home                        # какие юзеры уже заведены
sudo systemctl list-units --type=service --state=running
sudo ss -tlnp                           # какие порты уже заняты
sudo nginx -T | grep -E "server_name|listen"   # какие домены/сайты уже настроены
psql --version; sudo -u postgres psql -c '\l'  # какие БД уже есть
df -h; free -h                          # место и память
```

Дальше по аналогии с разделением `cryptobot`/`justtwo` заводим отдельного непривилегированного юзера `xogame` (без sudo), кладём проект в `/home/xogame/XOGameBackend`, находим свободный локальный порт (например `8081` или `8082`, смотря что покажет `ss -tlnp`) и не трогаем существующие nginx-конфиги других проектов — только добавляем новый файл в `sites-available`. Если увидишь на сервере уже установленный Swift/Postgres — это ускорит установку, если нет — ставим с нуля тем же способом, что описан в `Docs/DEPLOYMENT.md` (Swift через Swiftly под юзером `xogame`, отдельная роль/база в существующем или новом кластере Postgres).

Отдельный вопрос — домен. Фронтенд на `xo-game.online` отдаётся по HTTPS, значит и API/WS обязаны быть по HTTPS/WSS (браузер заблокирует смешанный контент и `ws://` с https-страницы). Нужен A-запись на поддомен, указывающая на `195.209.215.87` — например `api.xo-game.online` (в DNS/Certbot он будет как punycode `api.xo-game.online`) или любой другой домен/поддомен, который у тебя есть под рукой. Без этого шага TLS не выпустить и wss:// не заработает.

## 5. Пошаговый план развёртывания

1. Аудит сервера (раздел 4), выбор порта и домена/поддомена для API.
2. DNS: A-запись поддомена → `195.209.215.87`, дождаться распространения.
3. Новый репозиторий `XOGameBackend` (рядом с `JustTwoBackend` и `xogame` в `~/projects`) — копируем структуру `Package.swift`, `Dockerfile`, `configure.swift`, `routes.swift`, весь `Realtime/*` практически без изменений (переименовать `conversationID`→`gameID`, убрать messenger-специфичные типы событий, оставить `ping`/`pong`/`subscribe`/`unsubscribe`/`error`/`connection.ready` и добавить `game.updated`). Добавляем `GameController`, `MatchmakingController`, `GameRow`/`GameDTO`, SQL-миграцию, которая один раз накатывает `docs/database/001-007*.sql` из xogame (без grant/RLS, см. 3.1).
4. Локальная сборка и `swift test` — как минимум smoke-тест на `make_move`/`calculate_winner`, аналогично тому, как уже тестируется `JustTwoBackend` (`Tests/JustTwoBackendTests`).
5. На сервере: юзер `xogame`, Swift через Swiftly, клонируем репозиторий, `swift build -c release`, БД `xogame_prod` + роль `xogame_user`, накатываем миграции.
6. systemd unit `xogame-api.service` (копия `justtwo-api.service` с другим путём/портом/юзером), `WorkingDirectory=/home/xogame/XOGameBackend`, слушает `127.0.0.1:<PORT>`.
7. Nginx: новый файл в `sites-available/xogame-api` (не трогая существующие), `location /` и `location /ws/` проксируют на `127.0.0.1:<PORT>` с `proxy_set_header Upgrade`/`Connection "upgrade"` и `proxy_read_timeout 3600s` для WS — конфиг можно взять почти дословно из `JustTwoBackend/Docs/ServerConfig.md`, раздел «WebSocket Proxy».
8. Certbot на новый домен, проверка `curl https://<домен>/health` и WS смоук через `websocat` (тем же способом, каким уже проверяли `wss://api.jtwo.online/ws/realtime`).
9. Правки фронтенда (раздел 6), тест против нового бэкенда локально (`.env` с новыми `VITE_API_BASE_URL`/`VITE_WS_URL`), все три режима игры + рематч + матчмейкинг на двух вкладках.
10. Обновляем секреты в GitHub Actions (`VITE_API_BASE_URL`, `VITE_WS_URL` вместо `VITE_SUPABASE_*`), мерджим в `main`, GitHub Pages передеплоивается, проверяем на `xo-game.online`.
11. Несколько дней смотрим логи (`journalctl -u xogame-api -f`, `nginx error.log`), затем удаляем `@supabase/supabase-js` из `package.json`, выключаем проект в Supabase.

## 6. Изменения во фронтенде

`src/services/supabaseClient.ts` и `src/services/gameService.ts` заменяются на `src/services/apiClient.ts` (обычные `fetch` на новые REST-эндпоинты, та же сигнатура функций `createFriendGame`, `joinFriendGame`, `makeMove` и т.д. — чтобы компоненты (`GamePage.tsx`, `FriendRematchDialog.tsx`, `JoinGamePage.tsx`, `useMatchmakingQueueCounts.ts`) не пришлось переписывать) и `src/services/realtimeClient.ts` (нативный `WebSocket`, реализует `subscribeToGame({gameId, onUpdate})` с тем же интерфейсом, что и сейчас, плюс реконнект с backoff — паттерн реконнекта уже описан для iOS-клиента в `JustTwoBackend/Docs/REALTIME.md`, раздел Reconnect Strategy, переносится и на веб один в один: экспоненциальный backoff, пересоздание подписки после реконнекта, дедупликация по `eventID`).

`.env`/`.env.example` — вместо `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` два новых: `VITE_API_BASE_URL` (`https://<домен>`) и `VITE_WS_URL` (`wss://<домен>/ws/game`). `package.json` — убрать `@supabase/supabase-js`. `docs/architecture.md` и `docs/deploy.md` стоит обновить после переноса, чтобы не вводить в заблуждение следующего человека (или себя через полгода).

## 7. Данные

Отдельная миграция данных не нужна: партия в крестики-нолики живёт от секунд до пары минут, `matchmaking_queue` вообще эфемерна (TTL 45 сек). Можно просто переключить фронт на новый бэкенд в момент низкого трафика — старые незавершённые игры в Supabase просто останутся недоигранными, это не критично для такого продукта. Если хочется подстраховаться — сделать `pg_dump --table=games --table=matchmaking_queue` перед выключением Supabase просто как архив.

## 8. Риски и что сознательно откладываем

Модель безопасности не меняется и не ухудшается: сейчас `playerToken` — это просто UUID, которому Supabase доверяет как есть; в новой схеме то же самое. Не добавляем JWT/подписанные сессии в первой итерации — это отдельное улучшение, не блокер миграции. Rate limiting на `/ws/game` handshake и на мутирующие эндпоинты стоит включить сразу — в `JustTwoBackend` уже есть готовый `RateLimitMiddleware`, применённый к `/ws/realtime` (20 запросов/60 сек) — переносится один в один. Что не переносим сейчас: presence (кто онлайн) и typing-индикаторы — в игре они не нужны, это messenger-специфика.

Единственная часть, которую я не смог проверить сам — реальное состояние сервера `195.209.215.87` (у меня в песочнице исходящий трафик идёт через прокси с allowlist по доменам, голый IP не пускает). Раздел 4 — это ровно то, что нужно прогнать вручную или через связанный с этой сессией компьютер, прежде чем начинать установку.

## 9. Открытые вопросы

Нужны ответы до начала работ: 1) какой домен/поддомен повесим на `195.209.215.87` под API/WS; 2) что именно уже стоит на сервере (ОС, Postgres, другие сервисы/порты, есть ли уже non-root пользователь под новые проекты) — результат аудита из раздела 4; 3) кто выполняет деплой на сервер — я через связанный с сессией компьютер (SSH-доступ туда я сам не получу, могу только через `device_bash`, если сервер в той же сети/доступен, или ты сам по инструкции).
