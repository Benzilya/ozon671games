"use client";

import { useEffect, useMemo, useState } from "react";
import { stories } from "../data/stories";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

const sections = [
  { title: "Аудиокниги", type: "Раздел", description: "Каталог историй и фильтры по жанру, статусу и формату.", href: "/audiobooks.html", keywords: "истории аудио каталог" },
  { title: "AI-фильмы", type: "Раздел", description: "AI-концепты, фанатские адаптации и визуальный архив.", href: "/films.html", keywords: "видео фильм трейлер ai" },
  { title: "Персонажи", type: "Раздел", description: "Архив подтверждённых персонажей и редакционных связей.", href: "/characters.html", keywords: "герои персонажи" },
  { title: "Хронология", type: "Раздел", description: "Редакционная хронология событий вселенной.", href: "/timeline.html", keywords: "события время хронология" },
  { title: "Карта вселенной", type: "Раздел", description: "Связи произведений, персонажей, событий и локаций.", href: "/universe.html", keywords: "карта мир связи локации" },
  { title: "Магазин", type: "Раздел", description: "Концепты печатных изданий и других товаров; цены и наличие только из CMS.", href: "/shop.html", keywords: "книга товар издание постер" },
  { title: "Сообщество", type: "Раздел", description: "Фан-работы, опросы, стримы и внешние каналы проекта.", href: "/community.html", keywords: "фанаты фанарт опрос стрим" },
];

export default function SearchClient() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    setQuery(value);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ru");
    if (!normalized) return [];

    const storyResults = stories.map((story) => ({
      title: story.title,
      type: "История",
      description: `${story.genre}. ${story.description}`,
      keywords: `${story.genre} ${story.series} ${story.formats.join(" ")}`,
      href: story.slug === "tihiy-den"
        ? "/stories/tihiy-den.html"
        : `/audiobooks.html?q=${encodeURIComponent(story.title)}`,
    }));

    return [...storyResults, ...sections].filter((item) =>
      `${item.title} ${item.description} ${item.keywords}`.toLocaleLowerCase("ru").includes(normalized),
    );
  }, [query]);

  return (
    <main className="global-search-page">
      <header className="global-search-hero">
        <a href={`${publicBase}/`}>← Главная</a>
        <div className="ds-kicker">Search / Archive index</div>
        <h1>ПОИСК</h1>
        <p>Единый индекс по произведениям и публичным разделам Ozon671Games. Неподтверждённые факты в индекс не добавляются.</p>
      </header>

      <section className="global-search-shell ds-panel" aria-label="Глобальный поиск">
        <label className="global-search-input">
          <span aria-hidden="true">⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: Тихий Дэн, мистика, карта"
            aria-label="Поиск по вселенной"
          />
        </label>
        <div className="global-search-meta" aria-live="polite">
          {query ? `Найдено: ${results.length}` : "Введите запрос"}
        </div>
      </section>

      <section className="global-search-results" aria-label="Результаты поиска">
        {results.map((item) => (
          <a className="global-search-result ds-panel" href={`${publicBase}${item.href}`} key={`${item.type}-${item.title}`}>
            <span className="ds-kicker">{item.type}</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <span className="global-search-open">Открыть →</span>
          </a>
        ))}

        {query && results.length === 0 && (
          <div className="global-search-empty ds-panel">
            <strong>Ничего не найдено</strong>
            <p>Попробуйте название истории, жанр или название раздела.</p>
          </div>
        )}
      </section>
    </main>
  );
}
