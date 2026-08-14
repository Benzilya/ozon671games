# Build helpers

`prepare-pages-export.mjs` нормализует структуру статического экспорта для GitHub Pages.

Текущая beta-версия vinext при `assetPrefix: "/ozon671games/"` одновременно добавляет префикс в HTML-ссылки и создаёт физический каталог `dist/client/ozon671games/_next`. GitHub Pages уже монтирует весь артефакт под `/ozon671games/`, поэтому такой каталог приводит к двойному пути и 404 для CSS/JS.

Скрипт после каждой production-сборки переносит физический `_next` в корень `dist/client`, сохраняя URL `/ozon671games/_next/...` в HTML, а затем проверяет наличие CSS и JS.
