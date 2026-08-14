# Вселенная Ozon671Games

Рабочий репозиторий сайта «Вселенная Ozon671Games» — авторской медиаплатформы для аудиоисторий, AI-фильмов, энциклопедии мира, коллекционных материалов и сообщества.

> Проект Ozon671Games не связан с маркетплейсом OZON и использует самостоятельную айдентику.

## Публичная версия

GitHub Pages: https://benzilya.github.io/ozon671games/

Публикация выполняется автоматически из `main` через `.github/workflows/pages.yml`.

## Текущее состояние

Статический frontend уже является рабочим публичным продуктом. Реализованы:

- editorial noir главная «архив криминального дела»;
- каталог аудиокниг и глобальный поиск;
- страница «Тихий Дэн» с локальным demo-плеером;
- AI-фильмы, персонажи, хронология и карта вселенной;
- магазин с честным demo checkout без списаний;
- сообщество;
- локальный account prototype;
- admin/CMS prototype;
- SEO, sitemap/robots и structured data;
- accessibility/performance baseline;
- privacy / rights / AI-disclosure page;
- D1/Drizzle backend schema и rights-aware read API в Cloudflare Worker.

Подробный живой статус: `docs/PROJECT_STATUS.md`.

## Архитектура

- `app/` — React/vinext frontend и статически экспортируемые маршруты;
- `app/data/` — общая модель контента и CMS contract;
- `app/player/` — локальное состояние аудиоплеера;
- `app/components/` — loading/media/right-safe UI;
- `db/schema.ts` — Drizzle/D1 schema;
- `worker/index.ts` — Cloudflare Worker и read-only API foundation;
- `docs/CMS_CONTRACT.md` — контракт будущей CMS;
- `docs/BACKEND_FOUNDATION.md` — D1/R2/API архитектура;
- `public/` — статические материалы, sitemap и robots;
- `tests/` — тесты реального static export;
- `.github/workflows/ci.yml` — lint, DB schema validation, build, bundle budget и export contracts;
- `.github/workflows/product-tests.yml` — продуктовые тесты экспортированного сайта;
- `.github/workflows/security-audit.yml` — high/critical audit production dependencies;
- `.github/workflows/pages.yml` — production GitHub Pages deploy.

## Стек

- React 19
- TypeScript
- vinext / Vite
- Tailwind CSS 4
- Drizzle ORM
- Cloudflare Worker / D1 / R2 foundation
- GitHub Actions / GitHub Pages

Требуется Node.js `>=22.13.0`.

## Локальная разработка

```bash
npm install
npm run dev
```

Проверки:

```bash
npm run lint
npm run db:generate
npm run build
npm run check:budget
npm test
npm audit --omit=dev --audit-level=high
```

`npm test` ожидает уже собранный `dist/client`, поэтому сначала запускайте `npm run build`.

## Арт-дирекшн

Основное направление: **Editorial Crime Archive / Rain Noir / Quiet Dan**.

- дождь, мокрый асфальт и ночной город;
- типографика криминального журнала и титров триллера;
- досье, архивные индексы, фотолисты, штампы и технические подписи;
- минимум универсальных rounded cards и pill UI;
- красный используется как стоп-сигнал, штамп и предупреждение, а не декоративный SaaS accent;
- современный media UI остаётся там, где он действительно полезен;
- AI-материалы имеют явную маркировку «Создано с помощью ИИ».

## Контент и права

- не публиковать книги, изображения, аудио или видео без подтверждённых прав;
- не выдавать AI-видео и AI-изображения за реальные съёмки;
- не фиксировать цены, остатки, длительности или канонические факты без подтверждённого источника/CMS;
- атмосферный интерфейсный текст не выдавать за цитату из произведения;
- публичный backend должен отдавать только опубликованные и rights-cleared материалы.

## Backend

Кодовая основа выбрана под **Cloudflare Worker + D1 + R2**.

Worker уже содержит read-only API foundation (`/api/health`, works, films, characters, timeline, products, links), но настоящий cloud backend ещё не активирован: в `.openai/hosting.json` D1 и R2 bindings пока `null`.

Write API намеренно отключён до production authentication. Это означает, что account sync, реальные комментарии, заказы и CMS persistence не притворяются рабочими раньше времени.

## Что осталось до полного production backend

Нужны внешние ресурсы, которых нельзя безопасно выдумать в репозитории:

1. создать/привязать Cloudflare D1;
2. создать/привязать R2 для разрешённых media assets;
3. выбрать и настроить production authentication;
4. перед реальными продажами подключить payment provider, доставку и юридические данные продавца;
5. при необходимости подключить analytics/error monitoring и собственный домен.

До этого момента GitHub Pages остаётся полностью открывающейся, независимой статической версией сайта.
