# Backend foundation

## Решение

Backend-слой проекта построен вокруг **Cloudflare Worker + D1 + R2**. Это продолжает уже используемый стек: `worker/index.ts`, Cloudflare Vite plugin, Wrangler, Drizzle ORM и D1 binding `DB` находятся в одном репозитории.

GitHub Pages остаётся публичным статическим frontend до момента реального подключения backend. Базовое открытие сайта не зависит от API.

## D1

`db/schema.ts` описывает основу для works/genres, chapters/progress, assets/rights, films, characters, products/orders, users/favorites, events, comments и external links.

Неизвестные цены, остатки, длительности и канонические связи остаются nullable/draft и не подменяются выдуманными значениями.

## R2

После подключения R2 крупные разрешённые файлы должны храниться вне Git:

```text
works/<work-slug>/audio/<asset-id>.<ext>
works/<work-slug>/video/<asset-id>.<ext>
works/<work-slug>/images/<asset-id>.<ext>
community/<author-id>/<asset-id>.<ext>
products/<product-slug>/<asset-id>.<ext>
```

## Rights gate

Публичный контент обязан проходить следующие условия:

1. произведение: `publication_status = published`;
2. произведение: `rights_status = cleared`;
3. asset: `rights_status = cleared` перед публичной выдачей файла;
4. AI disclosure возвращается вместе с метаданными;
5. restricted/expired/unverified материалы не выдаются как официальный публичный контент.

Admin API дополнительно запрещает перевод произведения в `published`, если итоговый `rights_status` не равен `cleared`.

## Public read API

Реализовано в Worker:

```text
GET /api/health
GET /api/works
GET /api/works/:slug
GET /api/films
GET /api/characters
GET /api/timeline
GET /api/products
GET /api/links
```

Публичные write-запросы возвращают `405`. Это намеренно: пользовательские записи появятся только вместе с production auth.

## Admin write API

Административный контур отделён от публичного API и использует server-side secret `ADMIN_API_TOKEN`:

```text
GET   /api/admin/health
GET   /api/admin/works
POST  /api/admin/works
PATCH /api/admin/works/:id
PATCH /api/admin/comments/:id
```

Правила:

- токен передаётся только как `Authorization: Bearer <token>`;
- токен нельзя хранить в Git или в публичном frontend bundle;
- сравнение токена выполняется по SHA-256 digest, чтобы не использовать обычное раннее строковое сравнение;
- новый work всегда создаётся как `draft + unverified`;
- публикация запрещается rights gate, пока права не переведены в `cleared`;
- admin responses имеют `cache-control: no-store`;
- CORS для admin API не открывается через `*`; при browser-CMS нужно задать точный `ADMIN_ALLOWED_ORIGIN`.

Этот bearer-secret — **административная server-to-server/CMS защита**, а не пользовательская система входа. Его нельзя использовать как login для посетителей сайта.

## User auth boundary

Будущие маршруты аккаунта остаются отключёнными до выбора и настройки production authentication:

```text
GET /api/me
PUT /api/me/progress/:workId
PUT /api/me/favorites/:workId
POST /api/comments
POST /api/orders
```

После подключения auth сервер должен связывать внешнюю identity с `users.id` и проверять роль/владение данными на каждом write-запросе.

## Переменные окружения

Backend ожидает:

```text
DB                    Cloudflare D1 binding
MEDIA                 Cloudflare R2 binding (optional until media activation)
ADMIN_API_TOKEN       secret, required for /api/admin/*
ADMIN_ALLOWED_ORIGIN  exact CMS origin, optional until browser CMS activation
```

Ни одно значение secret/resource ID не должно коммититься в Git.

## Что требуется для реального подключения

В `.openai/hosting.json` сейчас реальные D1/R2 resources не provisioned. Для production нужны созданные Cloudflare D1/R2 resources и секрет окружения `ADMIN_API_TOKEN`.

До этого сайт продолжает работать как статический GitHub Pages frontend с локальными demo-state/localStorage механиками, а Worker API остаётся подготовленным к активации.