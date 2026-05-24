# Деплой на GitHub Pages

Репозиторий: [DmitriiSeitsman/xogame](https://github.com/DmitriiSeitsman/xogame)

Публичный URL: **https://крестик-нолик.рф**  
Punycode: `https://xn----itbjbgccgrkqnn.xn--p1ai`

GitHub Pages также публикует проект из ветки `main`, но основной домен — кастомный.

## Как это устроено

| Файл | Назначение |
|------|------------|
| `.github/workflows/deploy.yml` | Сборка и деплой через GitHub Actions |
| `public/CNAME` | Кастомный домен `крестик-нолик.рф` |
| `public/.nojekyll` | Отключает Jekyll на GitHub Pages |
| `vite.config.ts` → `base: "/"` | Корень сайта на кастомном домене |
| `npm run build` | Копирует `index.html` → `404.html` для SPA-роутинга |

## Однократная настройка GitHub

### 1. Secrets (Settings → Secrets and variables → Actions)

| Secret | Значение |
|--------|----------|
| `VITE_SUPABASE_URL` | `https://ukscmtyscksoqhiasnze.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ваш publishable key |

### 2. GitHub Pages (Settings → Pages)

- **Source:** GitHub Actions
- **Custom domain:** `крестик-нолик.рф`
- Включить **Enforce HTTPS** (после выпуска сертификата)

### 3. DNS у регистратора домена

Для apex-домена `крестик-нолик.рф`:

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

## Деплой

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
- Invite-ссылки строятся от `window.location.origin` — на проде будут с доменом `крестик-нолик.рф`
- URL `dmitriiseitsman.github.io/xogame/` может не открывать assets корректно — используйте кастомный домен
- Supabase: в SQL Editor должны быть выполнены миграции из `docs/database/`

## Проверка после деплоя

- [ ] https://крестик-нолик.рф/ — главная
- [ ] https://крестик-нолик.рф/rules — правила (прямая ссылка)
- [ ] https://крестик-нолик.рф/about — об игре
- [ ] Режим «С компьютером»
- [ ] Мультиплеер через Supabase
- [ ] `/robots.txt`, `/sitemap.xml`
