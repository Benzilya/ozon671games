# Этап 14.4 — Cloudflare production activation

Этот документ описывает первый реальный запуск backend после подключения Cloudflare-аккаунта. Сам GitHub Pages frontend от этого процесса не зависит.

## 1. Создать production resources

Нужны реальные Cloudflare resources:

- D1 database для binding `DB`;
- R2 bucket для binding `MEDIA`;
- Worker, имя которого задаётся через `CF_WORKER_NAME`;
- OIDC application/provider для пользовательского login.

Не коммитить resource IDs, API tokens или admin secrets в Git.

## 2. GitHub Environment `production`

Добавить Secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
ADMIN_API_TOKEN
```

Добавить Variables:

```text
CF_D1_DATABASE_ID
CF_D1_DATABASE_NAME
CF_R2_BUCKET_NAME
CF_WORKER_NAME
CF_API_BASE_URL
OIDC_ISSUER
OIDC_AUDIENCE
OIDC_JWKS_URL
USER_ALLOWED_ORIGIN
ADMIN_ALLOWED_ORIGIN
```

`CF_API_BASE_URL`, `USER_ALLOWED_ORIGIN` и `ADMIN_ALLOWED_ORIGIN` должны быть HTTPS URL без path/query. `OIDC_JWKS_URL` должен указывать на конкретный JWKS endpoint.

Для текущего GitHub Pages frontend `USER_ALLOWED_ORIGIN` должен соответствовать фактическому origin браузера. Если CMS остаётся на том же origin, `ADMIN_ALLOWED_ORIGIN` может совпадать с ним; при переносе CMS на отдельный домен нужно указать точный origin CMS.

## 3. Запустить workflow вручную

Workflow: `Deploy Cloudflare backend`.

Он выполняет шаги в строгом порядке:

1. проверяет наличие и синтаксис обязательных Secrets/Variables;
2. генерирует production Wrangler config;
3. запускает `wrangler check`;
4. собирает Worker/static assets через Cloudflare Vite plugin;
5. применяет D1 migrations к remote database;
6. деплоит Worker;
7. устанавливает `ADMIN_API_TOKEN` как Worker secret;
8. выполняет production smoke check.

## 4. Условия успешного smoke check

`GET /api/health` должен вернуть признаки:

```text
ok = true
databaseConfigured = true
mediaConfigured = true
adminAuthConfigured = true
```

Затем `GET /api/admin/health` с bearer admin token должен подтвердить те же production bindings.

Smoke script делает несколько повторов, чтобы пережить короткую задержку распространения нового Worker deployment.

## 5. После первого успешного deploy

Проверить вручную только продуктовые действия, которые нельзя безопасно симулировать в CI:

- `/admin.html` подключается к `CF_API_BASE_URL`;
- создание draft work появляется в D1;
- публикация без `rights_status = cleared` отклоняется;
- asset регистрируется как `unverified`;
- тестовый разрешённый файл загружается в R2;
- публичная выдача asset запрещена до rights clearance и опубликованной связи;
- OIDC login получает access token с ожидаемыми issuer/audience и `/api/me` создаёт обычного пользователя с ролью `user`.

Реальные платежи и создание заказов не включать на этом этапе: commerce остаётся отдельным production контуром.
