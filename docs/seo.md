# SEO

## Текущая архитектура

Проект — **Vite + React SPA** (без SSR).

- Базовые meta-теги для главной страницы находятся в `index.html`
- Динамические `title`, `description`, `canonical` и `robots` обновляются через компонент `src/components/Seo/Seo.tsx`
- JSON-LD для главной — в `index.html` и через `Seo` на `HomePage`

## Домен

- `https://xo-game.online`

Домен латинский (ASCII), поэтому везде (UI, Open Graph, canonical, `sitemap.xml`, `robots.txt`) используется один и тот же `xo-game.online`.

## Индексация

| Страница | Индексация |
|----------|------------|
| `/` | index, follow |
| `/rules` | index, follow |
| `/about` | index, follow |
| `/join/:inviteCode` | **noindex, nofollow** |
| `/game/:gameId` | **noindex, nofollow** |

Игровые и invite-страницы временные и закрыты от индексации через `Seo noIndex`.

## Файлы

```
public/
  robots.txt
  sitemap.xml
  site.webmanifest
  favicon.ico
  favicon.svg
  apple-touch-icon.png
  og-image.png
```

## Рекомендуемые размеры ассетов

| Файл | Размер | Назначение |
|------|--------|------------|
| `og-image.png` | 1200×630 | Open Graph / Telegram / VK preview |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `favicon.ico` | 16/32/48 | Браузерная вкладка |

Текущие PNG — placeholder'ы. Для продакшена можно заменить на брендированные изображения.

## Проверка

```bash
npm run build
npm run preview
```

Проверить:

- `http://localhost:4173/robots.txt`
- `http://localhost:4173/sitemap.xml`
- `http://localhost:4173/site.webmanifest`
- meta-теги в `<head>` главной страницы

После деплоя стоит подтвердить `xo-game.online` в Google Search Console / Яндекс.Вебмастере и отправить туда `sitemap.xml` — он содержит и русские, и английские URL с hreflang-альтернативами.

## Будущие улучшения

Для максимального SEO можно рассмотреть:

- **SSR/SSG** (Next.js, Astro)
- **Prerendering** статических маршрутов (`/`, `/rules`, `/about`)
- Pre-render plugin для Vite

Текущая версия оптимизирована для SPA без переделки архитектуры.
