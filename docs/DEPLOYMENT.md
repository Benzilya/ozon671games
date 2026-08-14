# GitHub Pages deployment

Публичный сайт публикуется workflow `.github/workflows/pages.yml` из `dist/client`.

Репозиторий является project-site, поэтому публичный URL имеет префикс `/ozon671games/`. В HTML ссылки на клиентские ресурсы должны выглядеть как `/ozon671games/_next/...`, но внутри deploy-артефакта каталог `_next` должен находиться в корне.

После `npm run build` автоматически выполняется `scripts/prepare-pages-export.mjs`, который исправляет физическую структуру, если vinext beta создаёт `dist/client/ozon671games/_next`.

CI отдельно проверяет:

- наличие `index.html`;
- наличие CSS и JS в `dist/client/_next/static`;
- отсутствие дублированного `dist/client/ozon671games/_next`;
- наличие правильного публичного префикса в ссылках HTML.
