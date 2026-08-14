# Состояние проекта

Обновлено: 2026-08-15.

Текущий milestone: **полноценный статический frontend на GitHub Pages + editorial noir дизайн + подготовленный Cloudflare backend-контур + browser QA gates**.

Публичная версия: `https://benzilya.github.io/ozon671games/`

## Завершено

### Этапы 0–13 — frontend / product scope

- стабилизация проекта и GitHub Pages deployment;
- единая React/vinext кодовая база;
- bespoke editorial noir / criminal archive дизайн;
- главная, аудиокниги, «Тихий Дэн», AI-фильмы, персонажи, хронология, вселенная, магазин, сообщество, поиск, account prototype и admin/CMS UI;
- локальный demo player с главами, seek, ±15 секунд, скоростью, громкостью, sleep timer, keyboard controls и localStorage progress;
- rights-safe media UI и видимая пометка AI-generated материалов;
- локальная demo-корзина без фиктивных цен и без реального checkout.

### Этап 14 — backend foundation / auth

- нормализованная Drizzle/D1 schema для assets, works, chapters, films, characters, products, users, orders, favorites, playback progress, saved moments, events, comments и external links;
- Cloudflare Worker public read API: health, works, work detail, chapters, films, characters, timeline, products и links;
- публичный контент выдаётся только при `published` + `rights=cleared`;
- защищённый admin write API с отдельным `ADMIN_API_TOKEN` и exact-origin CORS;
- admin works create/update, rights/publication controls и comment moderation;
- provider-neutral OIDC/JWT user API с RS256/JWKS validation;
- `GET /api/me`, favorites, progress, saved moments и comments;
- user-facing writes ограничены текущим authenticated user и published/rights-cleared works;
- comments создаются только в состоянии moderation pending;
- order/payment writes намеренно не реализованы до выбора реального commerce provider.

### Этап 15 — CMS/Admin integration

- `/admin.html` работает как operator console;
- backend URL и admin token вводятся вручную;
- admin token хранится только в `sessionStorage`;
- health/read/create draft/rights/publication controls;
- asset registration, R2 upload и rights metadata controls;
- реальная persistence включится после production Cloudflare activation.

### Этап 16 — Media Storage

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
- корректный social image URL.

### Этап 18 — Performance QA

- permanent Chromium browser-quality workflow для PR и `main`;
- проверка page errors, console errors и failed resources;
- DOM budget: до 2500 nodes;
- transfer budget: до 4 MiB;
- navigation budget: до 5000 ms;
- проверка ключевых desktop и mobile routes;
- последний browser gate на `main` — green.

### Этап 19 — Accessibility QA

- skip link, focus-visible, keyboard paths, reduced motion;
- автоматизированный Chromium + axe gate для serious/critical violations;
- проверка `main`/`h1` и ключевых маршрутов;
- выявленные contrast regressions исправлены;
- последний axe/browser gate на `main` — green;
- автоматический axe не заменяет ручную проверку screen reader / assistive technology, но серьёзные обнаруживаемые regressions теперь блокируют CI.

### Этап 20 — Mobile

- responsive layout и mobile dock;
- browser QA на 390×844;
- найден и исправлен shop horizontal overflow;
- mobile overflow теперь regression-gated в CI.

### Этапы 21–22 — Tests / CI

- product tests экспортированного сайта;
- Validate project workflow;
- production dependency audit (`npm audit --omit=dev --audit-level=high`);
- permanent browser quality workflow;
- GitHub Pages deploy workflow;
- после merge PR #39 все пять main workflows прошли успешно.

### Этап 23 — Production hardening

- production/runtime dependency audit отделён от dev-tooling audit noise;
- Cloudflare production config generator;
- manual production deploy workflow;
- D1 migrations before deploy;
- production env preflight validation;
- post-deploy smoke checks для public/admin API;
- activation runbook в `docs/CLOUDFLARE_ACTIVATION.md`.

## Что требует внешней инфраструктуры

Эти пункты нельзя завершить только изменениями Git-репозитория:

1. Создать реальный Cloudflare D1 database и получить `CF_D1_DATABASE_ID`.
2. Создать production R2 bucket и получить `CF_R2_BUCKET_NAME`.
3. Иметь Cloudflare credentials для GitHub Actions: `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ACCOUNT_ID`.
4. Сгенерировать production `ADMIN_API_TOKEN` и добавить его как GitHub Actions secret.
5. Выбрать и настроить OIDC provider/app и заполнить `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_JWKS_URL`.
6. Задать реальный Worker API origin в `CF_API_BASE_URL` и exact frontend origins в `USER_ALLOWED_ORIGIN` / `ADMIN_ALLOWED_ORIGIN`.
7. Перед реальными продажами выбрать payment provider, merchant/legal data и shipping provider.
8. Analytics/error monitoring и custom domain — опционально.

## Текущая задача

**Этап 14.4 — Cloudflare production activation.**

Репозиторий уже содержит весь подготовительный код: production config generation, env validation, D1 migration, deploy, admin secret setup и smoke checks. Следующий технический шаг начинается сразу после появления реальных Cloudflare resources/credentials и OIDC application settings.

Порядок активации:

1. заполнить GitHub Secrets / Variables из `docs/CLOUDFLARE_ACTIVATION.md`;
2. запустить manual `Cloudflare deploy` workflow;
3. подтвердить `GET /api/health`;
4. проверить public read APIs;
5. проверить admin deny-without-token / allow-with-token;
6. подтвердить D1 writes;
7. проверить R2 register/upload/rights-gated serve;
8. после подключения OIDC provider проверить `/api/me`, favorites, progress, moments и comments.

## Следующий milestone

**Live backend:** Worker + D1 + R2 + OIDC. После этого можно переводить account/admin из prepared prototype в реальную persistent production работу и отдельно начинать commerce integration.
