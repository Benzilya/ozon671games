"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { stories } from "../data/stories";

const allGenres = ["Все жанры", ...Array.from(new Set(stories.map((story) => story.genre)))];
const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";
const storageKey = "ozon671:catalog-filters";

type SavedFilters = {
  query: string;
  genre: string;
  status: string;
  format: string;
  view: "grid" | "list";
};

export default function AudiobooksClient() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Все жанры");
  const [status, setStatus] = useState("Все статусы");
  const [format, setFormat] = useState("Все форматы");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let saved: Partial<SavedFilters> = {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw) as Partial<SavedFilters>;
    } catch {
      window.localStorage.removeItem(storageKey);
    }

    const urlQuery = new URLSearchParams(window.location.search).get("q")?.trim();
    const next: SavedFilters = {
      query: urlQuery || saved.query || "",
      genre: saved.genre && allGenres.includes(saved.genre) ? saved.genre : "Все жанры",
      status: saved.status || "Все статусы",
      format: saved.format || "Все форматы",
      view: saved.view === "list" ? "list" : "grid",
    };

    const timer = window.setTimeout(() => {
      setQuery(next.query);
      setGenre(next.genre);
      setStatus(next.status);
      setFormat(next.format);
      setView(next.view);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: SavedFilters = { query, genre, status, format, view };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [format, genre, hydrated, query, status, view]);

  const filtered = useMemo(() => stories.filter((story) => {
    const matchesQuery = `${story.title} ${story.genre}`.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = genre === "Все жанры" || story.genre === genre;
    const matchesStatus = status === "Все статусы" || story.status === status;
    const matchesFormat = format === "Все форматы" || story.formats.includes(format);
    return matchesQuery && matchesGenre && matchesStatus && matchesFormat;
  }), [query, genre, status, format]);

  const resetFilters = () => {
    setQuery("");
    setGenre("Все жанры");
    setStatus("Все статусы");
    setFormat("Все форматы");
    window.localStorage.removeItem(storageKey);
    if (window.location.search) window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <a className="catalog-back" href={`${publicBase}/`}>← Главная</a>
        <div className="case-label">Archive / Audio files</div>
        <h1>АУДИОКНИГИ</h1>
        <p>Каталог историй Ozon671Games. Официальные метаданные подключаются только из подтверждённых источников или CMS.</p>
      </section>

      <section className="catalog-tools" aria-label="Фильтры каталога" aria-busy={!hydrated}>
        <label className="catalog-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название или жанр" aria-label="Название или жанр" /></label>
        <select value={genre} onChange={(event) => setGenre(event.target.value)} aria-label="Жанр">{allGenres.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Статус"><option>Все статусы</option><option>Статус не подтверждён</option><option>Завершено</option><option>Продолжается</option></select>
        <select value={format} onChange={(event) => setFormat(event.target.value)} aria-label="Формат"><option>Все форматы</option><option>Аудио</option><option>Видео</option><option>Книга</option></select>
        <div className="view-toggle" aria-label="Режим отображения">
          <button type="button" className={view === "grid" ? "active" : ""} aria-pressed={view === "grid"} onClick={() => setView("grid")} aria-label="Сетка">▦</button>
          <button type="button" className={view === "list" ? "active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")} aria-label="Список">☷</button>
        </div>
      </section>

      <section className="catalog-results">
        <div className="catalog-summary"><span className="ds-kicker" aria-live="polite">{hydrated ? `Найдено / ${filtered.length}` : "Восстанавливаем фильтры…"}</span><button type="button" onClick={resetFilters}>Сбросить фильтры</button></div>

        {!hydrated && <LoadingSkeleton rows={4} label="Восстанавливаем каталог и сохранённые фильтры" />}

        {hydrated && <div className={`catalog-items catalog-items--${view}`}>
          {filtered.map((story, index) => (
            <article className="catalog-card ds-panel" key={story.slug}>
              <div className={`catalog-poster tone-${story.tone}`} aria-hidden="true"><span>CASE {String(index + 1).padStart(2, "0")}</span><strong>{story.code}</strong></div>
              <div className="catalog-card-copy">
                <div className="ds-kicker">{story.series}</div>
                <h2>{story.title}</h2>
                <p>{story.genre} · {story.status}</p>
                <div className="catalog-badges">{story.formats.map((item) => <span className="ds-pill" key={item}>{item}</span>)}</div>
                <div className="catalog-meta"><span>Год: {story.year}</span><span>Длительность: из CMS</span></div>
                {story.slug === "tihiy-den"
                  ? <a className="ds-button ds-button--primary" href={`${publicBase}/stories/tihiy-den.html`}>Открыть дело</a>
                  : <button className="ds-button ds-button--ghost" type="button" disabled>Карточка готовится</button>}
              </div>
            </article>
          ))}
        </div>}

        {hydrated && filtered.length === 0 && <div className="catalog-empty ds-panel"><strong>Ничего не найдено</strong><p>Попробуйте снять часть фильтров или изменить запрос.</p></div>}
      </section>
    </main>
  );
}
