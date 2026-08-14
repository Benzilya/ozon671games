# Состояние проекта

Обновлено: 2026-08-14.

Текущий milestone: **полноценный статический frontend на GitHub Pages + editorial noir дизайн + подготовленный Cloudflare backend-контур**.

Публичная версия: `https://benzilya.github.io/ozon671games/`

## Завершено

### Инфраструктура

- один источник приложения на React/vinext;
- GitHub Pages deploy из `main`;
- корректный static export с GitHub Pages asset prefix;
- CI: lint, Drizzle schema validation, production build, bundle budget и static-export contracts;
- отдельные продуктовые тесты реального экспортированного сайта;
- production dependency audit для runtime-зависимостей.

### Дизайн и основные страницы

- bespoke editorial noir / criminal archive главная вместо generic AI/SaaS UI;
- страница «Тихий Дэн» в формате дела/архивной записи;
- каталог аудиокниг с поиском, фильтрами и сохранением фильтров;
- AI-фильмы;
- персонажи;
- хронология;
- карта вселенной;
- магазин с локальной демо-корзиной и честным demo checkout;
- сообщество;
- глобальный поиск;
- локальный account prototype;
- admin/CMS prototype;
- публичная страница privacy/rights/AI disclosure.

### Медиа и плеер

- локальный demo player;
- главы;
- предыдущая/следующая глава;
- ±15 секунд;
- скорость 0.5–2×;
- громкость;
- sleep timer;
- keyboard controls;
- localStorage progress;
- AI disclosure и rights-safe media gate в UI.

### Data / backend foundation

- общая модель произведений;
- CMS TypeScript contract;
- нормализованная Drizzle/D1 schema для works, chapters, assets, films, characters, products, users, favorites, progress, orders, events, comments и links;
- Cloudflare Worker read API: health, works, work detail, films, characters, timeline, products и links;
- публичные works API требуют `published` + `rights=cleared`;
- write API намеренно выключен до production authentication;
- R2 media binding предусмотрен архитектурой.

### SEO / quality

- canonical URLs;
- Open Graph / Twitter metadata;
- исправленный canonical social image URL;
- sitemap + robots;
- JSON-LD WebSite, Book, Product, VideoObject;
- accessibility baseline: skip link, focus-visible, keyboard paths, reduced motion;
- performance baseline: content visibility, reduced-data rules, JS/CSS bundle budget;
- product tests проверяют экспортированные маршруты, внутренние ссылки, player UI и AI disclosure.

## Что требует внешней инфраструктуры

Эти пункты нельзя завершить только изменениями Git-репозитория:

1. Создать и привязать реальный Cloudflare D1 resource (`.openai/hosting.json` сейчас содержит `d1: null`).
2. Создать и привязать R2 bucket для разрешённых audio/video/image assets (`r2: null`).
3. Выбрать и настроить production authentication для аккаунтов, progress sync, comments, orders и admin roles.
4. Перед реальными продажами выбрать payment provider, заполнить реквизиты продавца, доставку и юридические условия.
5. По желанию подключить analytics/error monitoring и собственный домен.

## Текущая задача

Production hardening перед внешним backend provisioning:

- отделить production dependency vulnerabilities от dev-tooling;
- удерживать product tests и CI зелёными после каждого merge;
- проверить финальный Pages deploy;
- после этого остановиться только на реальном external-resource blocker: D1/R2/auth/payment configuration.

## Следующий milestone

**Backend activation:** D1 + R2 + auth. После подключения внешних ресурсов read API станет production-доступным, затем можно включать authenticated write operations, cross-device progress, real comments/orders и CMS persistence.
