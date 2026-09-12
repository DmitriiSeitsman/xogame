# Деплой

Проект теперь состоит из двух независимо деплоящихся частей:

- **Фронтенд** — статический SPA на GitHub Pages (этот файл)
- **Бэкенд** — Vapor/Swift API + WebSocket на своём сервере (`195.209.215.87`), репозиторий [XOGameBackend](https://github.com/DmitriiSeitsman/XOGameBackend). Инструкция по деплою бэкенда — `Docs/DEPLOYMENT.md` в том репозитории, здесь она не дублируется.

## Фронтенд: GitHub Pages

Репозиторий: [DmitriiSeitsman/xogame](https://github.com/DmitriiSeitsman/xogame)

Публичный URL: **https://xo-game.online**

> Ранее сайт жил на `крестик-нолик.рф` (кириллический IDN-домен). Из-за проблем с индексацией и открытием сайта в некоторых браузерах/клиентах домен сменили на `xo-game.online` без редиректа со старого домена — просто отказались от него.

GitHub Pages также публикует проект из ветки `main`, но основной домен — кастомный.

### Как это устроено

| Файл | Назначение |
|------|------------|
| `.github/workflows/deploy.yml` | Сборка и деплой через GitHub Actions |
| `public/CNAME` | Кастомный домен `xo-game.online` |
| `public/.nojekyll` | Отключает Jekyll на GitHub Pages |
| `vite.config.ts` → `base: "/"` | Корень сайта на кастомном домене |
| `npm run build` | Копирует `index.html` → `404.html` для SPA-роутинга |

### Однократная настройка GitHub

#### 1. Secrets (Settings → Secrets and variables → Actions)

| Secret | Значение |
|--------|----------|
| `VITE_API_BASE_URL` | `https://api.xo-game.online` |
| `VITE_WS_URL` | `wss://api.xo-game.online/ws/game` |

Старые `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` больше не используются — Supabase из проекта убран, вся логика теперь на своём бэкенде.

#### 2. GitHub Pages (Settings → Pages)

- **Source:** GitHub Actions
- **Custom domain:** `xo-game.online`
- Включить **Enforce HTTPS** (после выпуска сертификата)

#### 3. DNS у регистратора домена `xo-game.online`

Для apex-домена:

```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

Для `www` (опционально):

```
CNAME    www    dmitriiseitsman.github.io
```

Точные записи GitHub покажет в Settings → Pages после добавления домена.

Отдельно нужна DNS-запись для бэкенда (на своём сервере, не GitHub Pages):

```
A    api    195.209.215.87
```

## Деплой фронтенда

```bash
git add .
git commit -m "Deploy setup"
git push origin main
```

После push откройте **Actions** → workflow **Deploy to GitHub Pages**.

Каждый push в `main` автоматически пересобирает и публикует сайт.

## Локальная проверка production-сборки

```bash
npm run build
npm run preview
```

Откройте http://localhost:4173

## Важно

- **Не коммитьте `.env`** — секреты только в GitHub Actions Secrets
- Invite-ссылки строятся от `window.location.origin` — на проде будут с доменом `xo-game.online`
- URL `dmitriiseitsman.github.io/xogame/` может не открывать assets корректно — используйте кастомный домен
- Бэкенд (Postgres + миграции) деплоится и мигрируется отдельно — см. `Docs/DEPLOYMENT.md` в `XOGameBackend`

## Проверка после деплоя

- [ ] https://xo-game.online/ — главная
- [ ] https://xo-game.online/rules — правила (прямая ссылка)
- [ ] https://xo-game.online/about — об игре
- [ ] Режим «С компьютером»
- [ ] Мультиплеер через свой бэкенд (`api.xo-game.online`)
- [ ] `/robots.txt`, `/sitemap.xml`
