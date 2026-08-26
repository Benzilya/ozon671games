# Этап 23 — Финальная стабилизация: защита `main`

Обновлено: 2026-08-26.

## Текущее состояние

На момент проверки GitHub API сообщает:

- ветка `main` не защищена (`protected: false`);
- repository rulesets отсутствуют;
- CI уже выполняет обязательные проверки продукта, Cloudflare dry-run, production audit и полный Chromium/axe/browser-link gate.

Это означает, что сами quality gates работают, но GitHub пока не запрещает прямой push или merge в обход этих проверок.

## Требуемое production-состояние

Источник правды для настроек: [`docs/repository-hardening.json`](./repository-hardening.json).

Для `main` необходимо включить repository ruleset или эквивалентную branch protection со следующими требованиями:

1. Изменения попадают в `main` только через pull request.
2. Для solo-owner репозитория обязательное число approvals = `0`: PR обязателен как контролируемый change-set, но внешний reviewer не блокирует владельца проекта.
3. Перед merge должны успешно пройти checks:
   - `validate`;
   - `cloudflare-config-smoke`;
   - `product-tests`;
   - `audit`;
   - `browser-quality`.
4. Ветка должна быть актуальна относительно `main` перед merge.
5. Все review conversations должны быть разрешены.
6. Force push в `main` запрещён.
7. Удаление `main` запрещено.
8. Direct push в `main` запрещён.
9. GitHub Pages `deploy` не является pre-merge check: он запускается после попадания commit в `main` и проверяется отдельно как post-merge deployment gate.

## Почему это внешний hardening-пункт

Текущий GitHub connector позволяет читать branch protection/rulesets, PR, Actions и содержимое репозитория, но не предоставляет mutation для repository ruleset/branch-protection settings. Поэтому этот пункт нельзя честно активировать commit'ом в Git.

Репозиторий содержит machine-readable контракт и regression-тест, чтобы требуемый набор checks не расходился с фактическим CI. После появления операции изменения repository settings правила нужно применить к `main` и затем повторно проверить API:

- `protected: true` или активный ruleset, таргетящий `main`;
- required checks совпадают с `docs/repository-hardening.json`;
- force pushes / branch deletion запрещены.
