# План миграции XOGame: свой бэкенд + смена домена

Дата: 2026-09-12 (обновлено по итогам аудита сервера и решения сменить домен). Автор: Claude, по итогам анализа `xogame`, `JustTwoBackend` и живого аудита `195.209.215.87`.

## TL;DR

Два независимых, но связанных изменения:

1. **Домен фронтенда**: `крестик-нолик.рф` → `xo-game.online` (уже куплен). Причина — проблемы с индексацией/открытием IDN-домена на кириллице (классика: часть краулеров, соцсетей и внешних сервисов не умеет нормально работать с punycode). Старый домен просто бросаем, без 301-редиректа — так решили осознанно, значит теряем старые бэклинки, но это разовая потеря на молодом проекте.
2. **Бэкенд**: Supabase → свой Vapor-сервис на `195.209.215.87`, с доменом `api.xo-game.online`. Игровая логика (проверка победителя, инвайт-коды, матчмейкинг с блокировками строк) остаётся в тех же `plpgsql`-функциях из `docs/database/*.sql` — они уже обкатаны. Переписывается только транспорт: вместо PostgREST RPC — HTTP-эндпоинты Vapor, вместо Supabase Realtime (`postgres_changes`) — свой WebSocket на связке `RealtimeConnectionRegistry`/`RealtimeEventBus`, один в один портированной из `JustTwoBackend/Sources/JustTwoBackend/Realtime/*`.

Важное уточнение по итогам аудита сервера: `195.209.215.87` — не пустая машина. Там уже живут `fetchnow.online` и `slts-rossiya.online` (оба — твои проекты), всё крутится через Docker (`docker.service`/`containerd` активны) с nginx на хосте как reverse proxy. Значит бэкенд игры тоже разворачиваем через Docker Compose (у `JustTwoBackend` уже есть готовый рабочий `Dockerfile`), а не через "голый" Swift на хосте — это будет естественнее вписываться в то, что там уже есть, и не потребует ничего ставить на хост напрямую, кроме нового nginx-сайта.

## 1. Что сейчас в xogame

Стек: React 19 + Vite + TypeScript, вся правда — в таблице `public.games` (Supabase Postgres). Игрок анонимный, идентификатор — `playerToken` (`crypto.randomUUID()` в `localStorage`, ключ `xogame_player_token`).

Три режима: локальная игра с компьютером (полностью на клиенте), игра с другом по инвайт-коду, случайный матчмейкинг с очередью и heartbeat 25 сек. Мутации — через RPC-функции (`create_friend_game`, `join_friend_game`, `join_random_matchmaking`, `heartbeat_random_matchmaking`, `leave_random_matchmaking`, `cancel_random_search`, `offer/accept/decline_friend_rematch`, `make_move`, `get_matchmaking_queue_counts`). Обновления партии — через Supabase Realtime, подписку на `UPDATE` таблицы `games` с фильтром по `id`.

Схема и функции лежат в `docs/database/001-007*.sql` — там же подсчёт победителя для досок 3×3..6×6, генерация инвайт-кода, блокировка строк при матчмейкинге (`for update skip locked`). Фронтенд — статика на GitHub Pages, секреты в GitHub Actions Secrets.

## 2. Что берём из JustTwoBackend

`JustTwoBackend` — Vapor 4 + Fluent + PostgresDriver + JWT, живёт на отдельном VPS (`77.239.107.143`), деплой через systemd + nginx + Certbot. Оттуда почти без изменений переносим модуль `Realtime/`:

- `RealtimeConnectionRegistry` — потокобезопасный реестр WebSocket-соединений по UUID-ключу (у джаствту — `userID`, у нас будет `playerToken`, он и так UUID).
- `RealtimeEventBus` — рассылка сообщений по ключу/множеству ключей.
- `RealtimeController` — `GET /ws/...`: аутентификация на хендшейке, `onText`/`onClose`, ping/pong, subscribe/unsubscribe с проверкой прав на ресурс.
- `RealtimeServerMessage`/`RealtimeClientMessage` — конверт сообщений (`type`, `eventID`, `occurredAt`, `payload`).

Не берём: JWT/аккаунты, APNs/push, messenger-модули, email-верификацию, object storage. Берём — Dockerfile (multi-stage сборка Swift 6.1 → слим ubuntu-образ) практически без изменений, только с новым именем.

## 3. Реальная картина сервера 195.209.215.87 (аудит от 2026-09-12)

```
OS:        Ubuntu 26.04 LTS (resolute)
Users:     ubuntu, ubuntuuser (без разделения по проектам, sudo без пароля)
Диск:      150G всего, 20G занято, 124G свободно
RAM:       15Gi всего, ~1.7Gi занято, 13Gi available, swap отсутствует
Сервисы:   nginx (host, systemd), docker.service + containerd (активны),
           fail2ban, chrony, ssh — стандартный набор, ничего специфичного под FetchNow
           видно как systemd-юнит (значит FetchNow работает в контейнерах)
Postgres:  на хосте НЕ установлен (psql отсутствует) — если FetchNow использует
           Postgres, он тоже в контейнере, снаружи не виден
Порты:     0.0.0.0:80/443 — nginx (host)
           0.0.0.0:22 — sshd
           127.0.0.1:8091 — docker-proxy (какой-то контейнер FetchNow/slts)
           127.0.0.1:3100 — docker-proxy (ещё один контейнер)
           127.0.0.53/54:53 — systemd-resolved, не трогаем
Nginx:     server_name fetchnow.online (с Certbot-сертификатом)
           server_name slts-rossiya.online + www (тоже с Certbot)
           default_server на 80 для голого IP
```

Вывод: хост целиком на Docker-модели, изолированных Linux-пользователей под проекты (как `justtwo`/`cryptobot` на другом VPS) тут нет — разграничение идёт через отдельные docker-compose проекты и nginx server-блоки. Значит и `XOGameBackend` разворачиваем так же: свой docker-compose стек (приложение + Postgres в отдельном контейнере с именованным volume, БД **не публикуется на хост** — доступна только приложению по внутренней docker-сети), плюс новый nginx server-блок на хосте, слушающий `api.xo-game.online` и проксирующий на `127.0.0.1:<свободный порт>`.

**Ещё не собрано** (я отправлял команду, жду вывод, когда будет удобно) — нужно перед реальным деплоем, чтобы не столкнуться с уже занятым:

```bash
sudo docker ps -a
sudo docker network ls
sudo docker volume ls
sudo find / -maxdepth 4 -iname "docker-compose*.y*ml" 2>/dev/null
ls -la /etc/nginx/sites-enabled/
sudo certbot certificates
sudo ss -tlnp | grep -E ":(809[2-5])\b" || echo "8092-8095 свободны"
```

По умолчанию план ниже предполагает порт `127.0.0.1:8092` для приложения — если он окажется занят, просто берём следующий свободный, это единственное число, которое реально нужно подтвердить перед запуском.

## 4. Смена домена фронтенда: крестик-нолик.рф → xo-game.online

Домен уже куплен, старый бросаем без редиректа (осознанное решение). Что нужно поменять в репозитории `xogame`:

- `public/CNAME` → заменить содержимое на `xo-game.online`.
- DNS у регистратора `xo-game.online`: A-записи apex-домена на IP GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`), при желании `www` → CNAME на `dmitriiseitsman.github.io`.
- GitHub → Settings → Pages → Custom domain: вписать `xo-game.online`, дождаться выпуска сертификата, включить Enforce HTTPS.
- `src/constants/seo.ts`, `docs/seo.md`, `public/sitemap.xml`, `public/robots.txt`, `public/site.webmanifest`, `public/og-image.png`-ссылки (если где-то захардкожен старый домен в OG/canonical) — прогнать grep по репозиторию на `крестик-нолик` и `xn----itbjbgccgrkqnn`, поправить на `xo-game.online`.
- `docs/deploy.md` — обновить публичный URL и чек-лист после деплоя.
- Инвайт-ссылки в игре строятся от `window.location.origin`, так что сами по себе они автоматически подхватят новый домен — трогать код инвайтов не нужно.
- Yandex.Metrika / любые сервисы, где домен прописан вручную (Search Console, Яндекс.Вебмастер, если подключены) — добавить и подтвердить новый домен отдельно, старый можно оставить как есть или удалить, это не блокирует остальное.

Домен под API — `api.xo-game.online`, A-запись на `195.209.215.87`, разворачивается в рамках раздела 6 ниже.

## 5. Целевая архитектура бэкенда

```
Браузер (xo-game.online, GitHub Pages)
   │  fetch()  →  HTTPS  →  nginx (host, 195.209.215.87)  →  127.0.0.1:8092  →  Vapor XOGameBackend (в докере)
   │  WebSocket → WSS     →  nginx (host)                  →  127.0.0.1:8092  →  /ws/game
   ▼
docker-compose проект "xogame" на 195.209.215.87
   ├─ контейнер app  (Vapor, порт 8092 опубликован только на 127.0.0.1)
   │    ├─ GameController / MatchmakingController — HTTP, вызывают SQL-функции через SQLKit,
   │    │  после успешной мутации публикуют game.updated в RealtimeEventBus
   │    └─ RealtimeController — /ws/game, регистрирует соединение по playerToken,
   │       subscribe.game проверяет, что playerToken реально участник этой игры
   └─ контейнер db (postgres, порт НЕ опубликован на хост, только внутренняя docker-сеть)
        └─ таблицы games / matchmaking_queue + функции из docs/database/*.sql (без grant/RLS)
```

### 5.1 Данные и функции — переносим как есть

Файлы `001_create_games.sql` … `007_game_symbol_theme.sql` из xogame выполняются на новой базе один в один. Убираем только `grant execute ... to anon, authenticated` (роли PostgREST, тут не нужны) и `enable row level security`/политики из `001` (нужны были только потому, что PostgREST раньше пускал `anon` читать таблицу напрямую; теперь снаружи торчит только сам Vapor, прямого доступа к Postgres извне нет вообще — тем более порт БД даже не будет опубликован на хост).

### 5.2 HTTP API — замена `supabase.rpc(...)`

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

Тело запроса — то же самое, что сейчас летит в `p_*`-параметры RPC, только camelCase JSON. Контроллер внутри — один SQL-вызов вида:

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

Ошибки Postgres (`raise exception 'Not your turn'` и т.п.) мапятся в HTTP-статусы через `APIErrorMiddleware`, переносим как есть из JustTwoBackend.

### 5.3 Realtime — замена `postgres_changes`

Один WebSocket на вкладку: `wss://api.xo-game.online/ws/game?token=<playerToken>`. После коннекта клиент шлёт:

```json
{"type": "subscribe.game", "gameID": "<uuid>"}
```

Сервер отвечает `subscription.ready`/`error` (`forbidden`, если `playerToken` не участник игры), а после каждой мутации рассылает обеим сторонам:

```json
{
  "type": "game.updated",
  "eventID": "uuid",
  "occurredAt": "2026-09-12T10:00:00Z",
  "payload": { "game": { ...тот же формат, что и Game из types/game.ts... } }
}
```

Один в один паттерн `subscribe.conversation` → `message.created` из `JustTwoBackend`, только без JWT — `playerToken` идёт как query-параметр по тому же fallback-пути, что уже реализован в `RealtimeAuthTokenExtractor`.

Матчмейкинг-heartbeat (каждые ~25 сек) и опрос очереди (раз в 12 сек) в первой версии оставляем HTTP-поллингом — это уже работает, переводить на WS не обязательно для MVP.

## 6. Пошаговый план развёртывания бэкенда

1. Доуточнить свободный порт и уже занятые докер-сети/имена контейнеров (команды из раздела 3).
2. DNS: A-запись `api.xo-game.online` → `195.209.215.87`, дождаться распространения.
3. Новый репозиторий `XOGameBackend` (рядом с `JustTwoBackend` и `xogame` в `~/projects`): копируем `Package.swift`, `Dockerfile` из JustTwoBackend почти без изменений (переименовать таргет), весь `Realtime/*` (переименовать `conversationID`→`gameID`, убрать messenger-специфичные типы событий, оставить `ping`/`pong`/`subscribe`/`unsubscribe`/`error`/`connection.ready`, добавить `game.updated`). Добавляем `GameController`, `MatchmakingController`, `GameRow`/`GameDTO`, миграцию, накатывающую `docs/database/001-007*.sql` из xogame (без grant/RLS).
4. Свой `docker-compose.yml` в новом репозитории — по образцу `JustTwoBackend/docker-compose.yml`, но: `app` публикует `127.0.0.1:8092:8080` (не `0.0.0.0`), `db` **не публикует порт на хост вообще** (убрать секцию `ports` у сервиса `db`), у обоих контейнеров — отдельная docker-сеть `xogame_default` (compose создаст её сам, имя не пересечётся с сетями FetchNow/slts, но стоит свериться со списком из `docker network ls`).
5. На сервере: `git clone` в `/home/ubuntuuser/xogame-backend` (или другое место по вкусу), `.env` с `DATABASE_PASSWORD`/`JWT_SECRET` (JWT тут не используется для авторизации игроков, но конфиг Vapor всё равно требует секрет — сгенерировать любой случайный), `sudo docker compose up -d --build`, `sudo docker compose run --rm app migrate --yes` (или свой аналог применения SQL-файлов).
6. Nginx: новый файл `/etc/nginx/sites-available/xogame-api` (не трогая существующие `fetchnow.online`/`slts-rossiya.online`), `location /` и `location /ws/` проксируют на `127.0.0.1:8092` с `proxy_set_header Upgrade`/`Connection "upgrade"` и `proxy_read_timeout 3600s` для WS-путей. Симлинк в `sites-enabled`, `sudo nginx -t`, `sudo systemctl reload nginx`.
7. `sudo certbot --nginx -d api.xo-game.online` — выпустит сертификат и сам допишет TLS-блок в конфиг (как уже сделано для двух других доменов на этом сервере).
8. Смоук-тест: `curl https://api.xo-game.online/health`, WS через `websocat wss://api.xo-game.online/ws/game?token=test`.
9. Правки фронтенда (раздел 7), тест против нового бэкенда локально (`.env` с новыми `VITE_API_BASE_URL`/`VITE_WS_URL`), все три режима игры + рематч + матчмейкинг на двух вкладках.
10. Обновляем секреты в GitHub Actions (`VITE_API_BASE_URL`, `VITE_WS_URL` вместо `VITE_SUPABASE_*`), CNAME на `xo-game.online` (раздел 4), мерджим в `main`.
11. Несколько дней смотрим `sudo docker compose logs -f app` и nginx-логи, затем убираем `@supabase/supabase-js` из `package.json`, выключаем проект в Supabase.

## 7. Изменения во фронтенде (сводно)

`src/services/supabaseClient.ts` + `src/services/gameService.ts` → `src/services/apiClient.ts` (обычный `fetch` на новые REST-эндпоинты, те же сигнатуры функций, чтобы `GamePage.tsx`, `FriendRematchDialog.tsx`, `JoinGamePage.tsx`, `useMatchmakingQueueCounts.ts` не пришлось переписывать) + `src/services/realtimeClient.ts` (нативный `WebSocket`, тот же интерфейс `subscribeToGame({gameId, onUpdate})`, плюс реконнект с backoff — паттерн один в один как в `JustTwoBackend/Docs/REALTIME.md`, раздел Reconnect Strategy).

`.env`/`.env.example`: вместо `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` → `VITE_API_BASE_URL=https://api.xo-game.online`, `VITE_WS_URL=wss://api.xo-game.online/ws/game`. `package.json` — убрать `@supabase/supabase-js`. `public/CNAME` → `xo-game.online` (раздел 4).

## 8. Данные

Отдельная миграция не нужна: партия живёт от секунд до пары минут, `matchmaking_queue` эфемерна (TTL 45 сек). Переключаем фронт на новый бэкенд в момент низкого трафика, старые незавершённые игры в Supabase просто останутся недоигранными — не критично. Для подстраховки — `pg_dump --table=games --table=matchmaking_queue` перед выключением Supabase, просто как архив.

## 9. Риски и что сознательно откладываем

Модель безопасности не ухудшается: `playerToken` как был просто доверенным UUID, так и остаётся — JWT/подписанные сессии не добавляем в этой итерации. Rate limiting на `/ws/game` handshake и мутирующие эндпоинты — переносим готовый `RateLimitMiddleware` из JustTwoBackend один в один (там уже применён к `/ws/realtime`, 20 запросов/60 сек). Presence и typing-индикаторы из джаствту не переносим — в игре не нужны.

Единственное, что физически не могу проверить сам — состояние сервера через SSH (у меня нет прямого доступа к произвольным TCP-хостам ни из облачной песочницы, ни из сэндбокс-шелла на связанном компьютере). Всё, что в разделе 3 помечено как "ещё не собрано", нужно прогнать вручную.

## 10. Открытые вопросы

1. Порт для приложения — по умолчанию `8092`, подтвердить после `ss -tlnp | grep 809`.
2. Не пересекается ли имя docker-сети/volume с уже существующими (`docker network ls`/`docker volume ls`) — проверить перед `docker compose up`.
3. Нужен ли на GitHub Pages ещё и `www.xo-game.online`, или только apex-домен.
