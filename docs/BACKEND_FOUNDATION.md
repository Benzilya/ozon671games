# Backend foundation

## Решение

Backend-слой проекта построен вокруг **Cloudflare Worker + D1 + R2**. Runtime entry — `worker/entry.ts`: он сначала обрабатывает пользовательский OIDC API, а затем передаёт остальные запросы в основной `worker/index.ts`. Cloudflare Vite plugin, Wrangler, Drizzle ORM и D1/R2 bindings остаются в одном репозитории.

GitHub Pages остаётся публичным статическим frontend до момента реального подключения backend. Базовое открытие сайта не зависит от API.

## D1

`db/schema.ts` описывает основу для works/genres, chapters/progress, assets/rights, films, characters, products/orders, users/favorites, events, comments и external links.

Неизвестные цены, остатки, длительности и канонические связи остаются nullable/draft и не подменяются выдуманными значениями.

## R2 / Media Storage

Крупные разрешённые файлы хранятся вне Git в binding `MEDIA`. Asset metadata живёт в D1, а `assets.url` для R2-объектов хранит внутреннюю ссылку вида `r2://<storage-key>`.

Рекомендуемая структура ключей:

```text
works/<work-slug>/audio/<asset-id>.<ext>
works/<work-slug>/video/<asset-id>.<ext>
works/<work-slug>/images/<asset-id>.<ext>
community/<author-id>/<asset-id>.<ext>
products/<product-slug>/<asset-id>.<ext>
```

Реализованный media flow:

```text
POST  /api/admin/assets
PATCH /api/admin/assets/:id
PUT   /api/admin/media/:assetId
GET   /api/media/:assetId
HEAD  /api/media/:assetId
```

Загрузка защищена `ADMIN_API_TOKEN`. `storageKey` валидируется и не допускает `..`/абсолютные пути. Content-Type сверяется с `asset.kind`. При отсутствующем `MEDIA` endpoint возвращает `503 backend_not_configured`.

Публичная выдача **не открывает bucket напрямую**. Worker проверяет `rights_status = cleared`, опубликованную связь с произведением/главой/фильмом/персонажем/товаром и физическое наличие объекта в R2. Только затем возвращается тело файла с ETag, cache policy и `X-Content-Type-Options: nosniff`.

## Rights gate

Публичный контент обязан проходить следующие условия:

1. произведение: `publication_status = published`;
2. произведение: `rights_status = cleared`;
3. asset: `rights_status = cleared` перед публичной выдачей файла;
4. AI disclosure возвращается вместе с метаданными;
5. restricted/expired/unverified материалы не выдаются как официальный публичный контент.

Admin API дополнительно запрещает перевод произведения в `published`, если итоговый `rights_status` не равен `cleared`.

## Public read API

```text
GET /api/health
GET /api/works
GET /api/works/:slug
GET /api/films
GET /api/characters
GET /api/timeline
GET /api/products
GET /api/links
GET /api/media/:assetId
```

## Admin write API

Административный контур использует отдельный server-side secret `ADMIN_API_TOKEN`:

```text
GET   /api/admin/health
GET   /api/admin/works
POST  /api/admin/works
PATCH /api/admin/works/:id
POST  /api/admin/assets
PATCH /api/admin/assets/:id
PUT   /api/admin/media/:assetId
PATCH /api/admin/comments/:id
```

Admin token нельзя использовать как пользовательский login. Browser-CMS принимает только точный `ADMIN_ALLOWED_ORIGIN`; token не должен храниться в Git или публичном bundle.

## User authentication — provider-neutral OIDC

Пользовательская авторизация теперь имеет готовый provider-neutral backend contract. Проект не привязан в коде к Clerk, Auth0, Supabase или другому конкретному поставщику.

Worker ожидает стандартный **OIDC access token / JWT с RS256** и проверяет:

1. три части JWT;
2. `alg = RS256` и `kid`;
3. подпись по ключу из JWKS;
4. точный `iss`;
5. `aud`;
6. обязательный и неистёкший `exp`;
7. `nbf`, если он присутствует;
8. обязательный `sub`.

JWKS кэшируется в Worker на короткий срок. Стабильный внутренний `users.id` создаётся как SHA-256 от пары `issuer + subject`, поэтому одинаковые `sub` у разных identity providers не конфликтуют. Email намеренно не используется как первичный идентификатор.

При первом успешном запросе пользователь автоматически создаётся в D1 с ролью `user`. Внешняя identity не может самостоятельно назначить `editor/moderator/admin`.

Реализованные authenticated routes:

```text
GET  /api/me
PUT  /api/me/favorites/:workId
PUT  /api/me/progress/:workId
POST /api/me/moments
POST /api/comments
```

`GET /api/me` возвращает профиль, избранное, прогресс, сохранённые моменты и заказы текущего пользователя. Favorite/progress разрешены только для опубликованных rights-cleared произведений. Комментарии всегда создаются как `pending` и проходят admin moderation.

`POST /api/orders` намеренно не реализован до подключения реального commerce/payment flow — пользовательская авторизация сама по себе не должна превращать демо-корзину в настоящий заказ.

CORS для пользовательского API ограничивается точным `USER_ALLOWED_ORIGIN`; bearer token не сохраняется backend-кодом.

## Переменные окружения

```text
DB                    Cloudflare D1 binding
MEDIA                 Cloudflare R2 binding
ADMIN_API_TOKEN       secret для /api/admin/*
ADMIN_ALLOWED_ORIGIN  exact CMS origin
OIDC_ISSUER           exact expected JWT issuer
OIDC_AUDIENCE         exact expected API audience
OIDC_JWKS_URL         HTTPS JWKS endpoint identity provider
USER_ALLOWED_ORIGIN   exact public frontend origin
```

Ни одно значение secret/resource ID не должно коммититься в Git.

## Что требуется для реального подключения

В `.openai/hosting.json` реальные D1/R2 resources пока не provisioned. Для production нужны:

- D1 database binding `DB`;
- R2 bucket binding `MEDIA`;
- secret `ADMIN_API_TOKEN`;
- OIDC provider/application, из которого будут получены issuer/audience/JWKS URL;
- точные CORS origins.

До этого GitHub Pages продолжает работать как статический frontend с локальными demo-state/localStorage механиками. Backend contract уже готов к активации без привязки к конкретному auth-вендору.