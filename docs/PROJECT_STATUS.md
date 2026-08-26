# Состояние проекта

Обновлено: 2026-08-26.

Текущий milestone: **рабочий статический frontend на GitHub Pages + единый living archive / editorial noir дизайн + подготовленный Cloudflare backend-контур + постоянные browser/Cloudflare CI gates**.

Публичная версия: `https://benzilya.github.io/ozon671games/`

## Завершено

### Этапы 0–13 — frontend и продуктовый контур

- стабилизация проекта и GitHub Pages deployment;
- единая React/vinext кодовая база;
- bespoke editorial noir / criminal archive дизайн;
- главная, аудиокниги, «Тихий Дэн», AI-фильмы, персонажи, хронология, вселенная, магазин, сообщество, поиск, account prototype и admin/CMS UI;
- локальный demo player с главами, seek, ±15 секунд, скоростью, громкостью, sleep timer, keyboard controls и localStorage progress;
- rights-safe media UI и видимая пометка «Создано с помощью ИИ» для AI-generated материалов;
- локальная demo-корзина без выдуманных production цен и без реального checkout;
- отображаемые коды, годы, длительности, цены, тиражи и связи не подменяются официально выглядящими выдуманными значениями: подтверждённые поля читаются из центральных данных/CMS, неизвестные остаются `—`, `Не указано` или `Из CMS`;
- атмосферный copy на главной и странице произведения явно отделён от цитат/канона.

### Этап 14 — backend foundation и авторизация

- нормализованная Drizzle/D1 schema для assets, works, chapters, films, characters, products, users, orders, favorites, playback progress, saved moments, events, comments и external links;
- Cloudflare Worker public read API: health, works, work detail, chapters, films, characters, timeline, products и links;
- публичный контент выдаётся только при `published` + `rights=cleared`;
- защищённый admin write API с отдельным `ADMIN_API_TOKEN` и exact-origin CORS;
- admin works create/update, rights/publication controls и comment moderation;
- provider-neutral OIDC/JWT user API с RS256/JWKS validation;
- `GET /api/me`, favorites, progress, saved moments и comments;
- user-facing writes ограничены текущим authenticated user и опубликованными rights-cleared works;
- comments создаются только в состоянии moderation pending;
- order/payment writes намеренно не включены до выбора реального commerce provider.

### Этап 15 — интеграция CMS/Admin

- `/admin.html` работает как operator console;
- backend URL и admin token вводятся вручную;
- admin token хранится только в `sessionStorage`;
- health/read/create draft/rights/publication controls;
- asset registration, R2 upload и rights metadata controls;
- реальная persistence включится после production Cloudflare activation.

### Этап 16 — хранение медиа

- D1 asset metadata;
- R2 storage refs формата `r2://<storage-key>`;
- asset register/update endpoints;
- protected upload endpoint;
- public media serving через Worker, а не прямой public bucket;
- content-type validation, storage-key validation, ETag/cache и `nosniff`;
- выдача media только для разрешённых опубликованных references;
- production R2 bucket ещё требует внешнего provisioning.

### Этап 17 — SEO

- canonical URLs;
- Open Graph / Twitter metadata;
- sitemap + robots;
- JSON-LD WebSite, Book, Product и VideoObject;
- корректный canonical social image URL.

### Этап 18 — производительность

- permanent Chromium browser-quality workflow для PR и `main`;
- проверка page errors, console errors и failed resources;
- DOM budget: до 2500 nodes;
- transfer budget: до 4 MiB;
- navigation budget: до 5000 ms;
- проверка ключевых desktop и mobile routes.

### Этап 19 — доступность

- skip link, focus-visible, keyboard paths, reduced motion;
- автоматизированный Chromium + axe gate для serious/critical violations;
- проверка `main`/`h1` и ключевых маршрутов;
- contrast regressions исправлены, включая новый `CASE PATH`;
- автоматический axe не заменяет ручную screen-reader/assistive-technology проверку, но серьёзные автоматически обнаруживаемые regressions блокируют CI.

### Этап 20 — мобильная версия

- responsive layout и mobile dock;
- browser QA на 390×844;
- исправлен shop horizontal overflow;
- `CASE PATH` имеет отдельный mobile clearance над dock;
- mobile overflow regression-gated в CI.

### Этапы 21–22 — тесты и CI

- product tests экспортированного сайта;
- Validate project workflow;
- production dependency audit (`npm audit --omit=dev --audit-level=high`);
- permanent browser quality workflow;
- GitHub Pages deploy workflow;
- `cloudflare-config-smoke`: synthetic production env → Wrangler config generation → Cloudflare Vite build → `wrangler deploy --dry-run` без production secrets;
- regression tests блокируют возврат выдуманных псевдоканонических file IDs, цен, cross-story claims и немаркированного interface copy.

### Этап 23 — production hardening

- production/runtime dependency audit отделён от dev-tooling audit noise;
- Cloudflare production config generator;
- manual production deploy workflow;
- D1 migrations перед Worker deploy;
- production env preflight validation;
- Worker deploy dry-run до remote migrations;
- post-deploy smoke checks для public/admin API;
- activation runbook в `docs/CLOUDFLARE_ACTIVATION.md`.

### Этап 24 — Living Archive / визуальная и контентная целостность

- главная закреплена в концепции живого криминального архива;
- hero «Тихого Дэна» усилен актуальным фоном и noir-типографикой, пересечение строк заголовка устранено;
- карта вселенной переведена в data-driven архив: названия произведений берутся из `stories.ts`, подтверждённые межкнижные связи не выдумываются, до появления авторских/CMS данных показывается 0 подтверждённых связей;
- персонажи, AI-фильмы, магазин, поиск и hero-досье очищены от официально выглядящих, но неподтверждённых кодов, качеств, дат и связей;
- процедурный `NIGHT SIGNAL` через Web Audio API постоянно смонтирован в UI и не требует внешних музыкальных файлов;
- звук запускается только действием пользователя, имеет громкость и мобильный clearance над dock;
- отдельный regression contract блокирует случайное исчезновение soundscape из production UI;
- внутренние публичные страницы получили единый archival spine, служебную красную линию, `INDEX / FILTERS` и `ACTIVE FILE` язык;
- добавлен контекстный `CASE PATH` между публичными тематическими разделами с keyboard focus, mobile clearance и reduced-transparency fallback;
- account/admin намеренно не превращаются в художественные «досье», чтобы сохранить функциональную ясность;
- визуальные и контентные изменения проходят Validate project, Product tests, Production dependency audit, Cloudflare dry-run и Browser quality gates перед merge.

## Что требует внешней инфраструктуры

Эти пункты нельзя завершить только изменениями Git-репозитория:

1. Создать реальный Cloudflare D1 database и получить `CF_D1_DATABASE_ID`.
2. Создать production R2 bucket и получить `CF_R2_BUCKET_NAME`.
3. Подключить Cloudflare credentials для GitHub Actions: `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ACCOUNT_ID`.
4. Сгенерировать production `ADMIN_API_TOKEN` и добавить его как GitHub Actions secret.
5. Выбрать и настроить OIDC provider/application и заполнить `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_JWKS_URL`.
6. Задать реальный Worker API origin в `CF_API_BASE_URL` и exact frontend origins в `USER_ALLOWED_ORIGIN` / `ADMIN_ALLOWED_ORIGIN`.
7. Перед реальными продажами выбрать payment provider, merchant/legal data и shipping provider.
8. Analytics/error monitoring и custom domain — опционально.

## Текущая задача

**Этап 24.1 — дальнейшая продуктовая полировка статического frontend без внешних credentials.**

До появления production Cloudflare/OIDC ресурсов работа продолжается в репозитории только там, где есть реальный подтверждаемый выигрыш: UX-переходы, визуальная целостность, content-safety/rights-safe copy, regression tests, accessibility и performance. Неподтверждённые связи/метаданные не используются для искусственного наполнения интерфейса.

Параллельный инфраструктурный milestone остаётся: **Этап 14.4 — Активация production-backend в Cloudflare**.

Порядок активации после появления внешних ресурсов:

1. заполнить GitHub Secrets / Variables из `docs/CLOUDFLARE_ACTIVATION.md`;
2. запустить manual `Deploy Cloudflare backend` workflow;
3. подтвердить `GET /api/health`;
4. проверить public read APIs;
5. проверить admin deny-without-token / allow-with-token;
6. подтвердить D1 writes;
7. проверить R2 register/upload/rights-gated serve;
8. после подключения OIDC provider проверить `/api/me`, favorites, progress, moments и comments.

## Следующий milestone

**Живой backend:** Worker + D1 + R2 + OIDC. После этого account/admin можно переводить из подготовленного frontend-контура в реальную persistent production работу. Commerce остаётся отдельным production контуром и не должен включаться до появления реального payment/shipping/legal setup.
