# Аналитика (Яндекс.Метрика)

Счётчик: **109419714** (`index.html` + SPA-хиты в `YandexMetrika.tsx`).

## Цели (reachGoal)

Создайте в интерфейсе Метрики → **Цели** → тип «JavaScript-событие» с идентификаторами:

| Идентификатор цели | Когда срабатывает |
|--------------------|-------------------|
| `game_start_computer` | Старт игры с ботом |
| `game_start_friend` | Хост создал игру с другом |
| `game_start_random` | Старт поиска случайного соперника |
| `game_join_friend` | Гость присоединился по коду/ссылке |

Дополнительно в отчётах доступны **параметры визита** (`params`):

- `game_mode` — `computer` \| `friend` \| `random`
- `board_size` — `3` … `6`
- `symbol_theme` — `classic` \| `magic` (бот и друг)
- `difficulty` — `easy` \| `medium` \| `hard` (только бот)
- `role` — `host` \| `guest` (сетевые режимы)

Код отправки: `src/utils/yandexMetrikaEvents.ts`.

## Сравнение режимов

В отчёте **Конверсии → Цели** сравните число достижений:

- `game_start_computer`
- `game_start_friend` + `game_join_friend` (вся активность «с другом»)
- `game_start_random`

Для детализации по размеру поля используйте отчёты с сегментацией по параметру `board_size`.
