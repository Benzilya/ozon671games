# Backend foundation

## Решение

Backend-слой проекта готовится на **Cloudflare Worker + D1 + R2**. Это не новая смена стека: репозиторий уже содержит `worker/index.ts`, Cloudflare Vite plugin, Wrangler, Drizzle ORM и D1 binding `DB`. Поэтому этот вариант требует меньше инфраструктурных прослоек, чем добавление второго backend-провайдера.

GitHub Pages остаётся публичным статическим frontend до момента, когда backend будет реально подключён. Frontend не должен зависеть от недоступного API для базового открытия сайта.

## D1

`db/schema.ts` описывает production-ready основу для:

- works и genres;
- chapters и progress;
- assets и rights/AI disclosure;
- films;
- characters и связи с произведениями;
- products, variants, orders и order items;
- users, favorites, saved moments;
- events;
- comments/moderation;
- external links.

Схема намеренно хранит только подтверждённые CMS-данные. Неизвестные цены, остатки, длительности и канонические связи остаются nullable/draft.

## R2

После подключения R2 в нём должны храниться крупные разрешённые файлы:

- аудио;
- видео;
- изображения/постеры;
- документы и downloadable media.

Большие media-файлы не должны попадать в Git-репозиторий.

Рекомендуемая структура ключей:

```text
works/<work-slug>/audio/<asset-id>.<ext>
works/<work-slug>/video/<asset-id>.<ext>
works/<work-slug>/images/<asset-id>.<ext>
community/<author-id>/<asset-id>.<ext>
products/<product-slug>/<asset-id>.<ext>
```

## Rights gate

Перед публичной отдачей asset backend обязан проверить:

1. `rights_status = cleared`;
2. publication status связанного материала = `published`;
3. AI disclosure возвращается вместе с метаданными;
4. restricted/expired/unverified assets не выдаются как публичный контент.

## API boundary

Планируемая первая версия API:

```text
GET  /api/works
GET  /api/works/:slug
GET  /api/works/:slug/chapters
GET  /api/films
GET  /api/characters
GET  /api/timeline
GET  /api/products
GET  /api/community
GET  /api/me
PUT  /api/me/progress/:workId
PUT  /api/me/favorites/:workId
POST /api/comments
POST /api/orders
```

Admin write endpoints должны быть отделены от публичных read endpoints и проверять роль `editor`, `moderator` или `admin`.

## Что требуется для реального подключения

В `.openai/hosting.json` сейчас `d1` и `r2` равны `null`. Для production нужны реальные Cloudflare resources/bindings и секреты окружения. Их нельзя выдумывать или хранить в Git.

До подключения ресурсов сайт продолжает работать как статический GitHub Pages frontend с локальными demo-state/localStorage механиками.
