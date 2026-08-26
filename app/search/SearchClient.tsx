"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { stories } from "../data/stories";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

const sections = [
  { title: "Аудиокниги", type: "Раздел", description: "Каталог историй и фильтры по жанру, статусу и формату.", href: "/audiobooks.html", keywords: "истории аудио каталог" },
  { title: "AI-фильмы", type: "Раздел", description: "AI-концепты, фанатские адаптации и визуальный архив.", href: "/films.html", keywords: "видео фильм трейлер ai" },
  { title: "Персонажи", type: "Раздел", description: "Архив подтверждённых персонажей и закрытых полей, ожидающих редакционных данных.", href: "/characters.html", keywords: "герои персонажи" },
  { title: "Хронология", type: "Раздел", description: "Хронология подтверждённых событий с отдельными редакционными и альтернативными слоями.", href: "/timeline.html", keywords: "события время хронология" },
  { title: "Карта вселенной", type: "Раздел", description: "Карта произведений архива. Межкнижные связи появляются только после подтверждения авторскими материалами или CMS.", href: "/universe.html", keywords: "карта мир произведения архив" },
  { title: "Магазин", type: "Раздел", description: "Печатные и другие товары; точные цены, тиражи и наличие только из CMS.", href: "/shop.html", keywords: "книга товар издание постер" },
  { title: "Сообщество", type: "Раздел", description: "Фан-работы, локальные демо-опросы, будущие стримы и внешние каналы проекта.", href: "/community.html", keywords: "фанаты фанарт опрос стрим" },
];

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    const timer = window.setTimeout(() => {
      setQuery(value);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
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

  const clearSearch = () => {
    setQuery("");
    if (window.location.search) window.history.replaceState({}, "", window.location.pathname);
  };

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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: Тихий Дэн, мистика, карта"
            aria-label="Поиск по вселенной"
          />
        </label>
        <div className="global-search-meta" aria-live="polite">
          {!ready ? "Читаем запрос…" : query ? `Найдено: ${results.length}` : "Введите запрос"}
        </div>
      </section>

      <section className="global-search-results" aria-label="Результаты поиска">
        {!ready && <LoadingSkeleton rows={3} label="Подготавливаем результаты поиска" />}

        {ready && results.map((item) => (
          <a className="global-search-result ds-panel" href={`${publicBase}${item.href}`} key={`${item.type}-${item.title}`}>
            <span className="ds-kicker">{item.type}</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <span className="global-search-open">Открыть →</span>
          </a>
        ))}

        {ready && query && results.length === 0 && (
          <div className="global-search-empty ds-panel">
            <div>
              <strong>Ничего не найдено</strong>
              <p>Снимите запрос или продолжите исследование через основные архивные разделы.</p>
            </div>
            <div className="global-search-empty-actions">
              <button type="button" onClick={clearSearch}>Очистить запрос</button>
              <a href={`${publicBase}/audiobooks.html`}>Аудиоархив</a>
              <a href={`${publicBase}/universe.html`}>Карта вселенной</a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
