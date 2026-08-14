"use client";

import { useMemo, useState } from "react";

type Story = {
  title: string;
  code: string;
  genre: string;
  series: string;
  status: "Завершено" | "Продолжается";
  formats: string[];
  year: string;
  length: "Короткая" | "Средняя" | "Длинная";
};

const stories: Story[] = [
  { title: "Тихий Дэн", code: "TD", genre: "Криминальная история", series: "Вселенная 671", status: "Завершено", formats: ["Аудио", "Видео", "Книга"], year: "Не указано", length: "Средняя" },
  { title: "Ночное такси", code: "NT", genre: "Мистика", series: "Вселенная 671", status: "Завершено", formats: ["Аудио", "Видео"], year: "Не указано", length: "Короткая" },
  { title: "Сириус 6Б", code: "S6", genre: "Фантастика", series: "Вселенная 671", status: "Завершено", formats: ["Аудио", "Книга"], year: "Не указано", length: "Длинная" },
  { title: "Ёжлесово", code: "EZ", genre: "Мистика", series: "Вселенная 671", status: "Продолжается", formats: ["Аудио"], year: "Не указано", length: "Средняя" },
  { title: "Курьер", code: "KR", genre: "Городская история", series: "Вселенная 671", status: "Завершено", formats: ["Аудио", "Видео"], year: "Не указано", length: "Средняя" },
  { title: "Квартира 101", code: "101", genre: "Хоррор", series: "Вселенная 671", status: "Завершено", formats: ["Аудио"], year: "Не указано", length: "Короткая" },
  { title: "Вода среди нас", code: "WS", genre: "Мистика", series: "Вселенная 671", status: "Завершено", formats: ["Аудио"], year: "Не указано", length: "Средняя" },
  { title: "Тёмное зло", code: "TZ", genre: "Хоррор", series: "Вселенная 671", status: "Продолжается", formats: ["Аудио"], year: "Не указано", length: "Длинная" },
  { title: "Бездна вечности", code: "BV", genre: "Фантастика", series: "Вселенная 671", status: "Завершено", formats: ["Аудио"], year: "Не указано", length: "Длинная" },
  { title: "Больница 286", code: "286", genre: "Хоррор", series: "Вселенная 671", status: "Продолжается", formats: ["Аудио", "Видео"], year: "Не указано", length: "Средняя" },
];

const allGenres = ["Все жанры", ...Array.from(new Set(stories.map((story) => story.genre)))];

export default function AudiobooksClient() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Все жанры");
  const [status, setStatus] = useState("Все статусы");
  const [format, setFormat] = useState("Все форматы");
  const [length, setLength] = useState("Любая длина");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => stories.filter((story) => {
    const matchesQuery = `${story.title} ${story.genre}`.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = genre === "Все жанры" || story.genre === genre;
    const matchesStatus = status === "Все статусы" || story.status === status;
    const matchesFormat = format === "Все форматы" || story.formats.includes(format);
    const matchesLength = length === "Любая длина" || story.length === length;
    return matchesQuery && matchesGenre && matchesStatus && matchesFormat && matchesLength;
  }), [query, genre, status, format, length]);

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <a className="catalog-back" href="../">← Главная</a>
        <div className="case-label">Archive / Audio files</div>
        <h1>АУДИОКНИГИ</h1>
        <p>Каталог историй Ozon671Games. Метаданные, длительности и годы публикации будут подключены только из подтверждённых источников или CMS.</p>
      </section>

      <section className="catalog-tools" aria-label="Фильтры каталога">
        <label className="catalog-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название или жанр" /></label>
        <select value={genre} onChange={(event) => setGenre(event.target.value)} aria-label="Жанр">{allGenres.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Статус"><option>Все статусы</option><option>Завершено</option><option>Продолжается</option></select>
        <select value={length} onChange={(event) => setLength(event.target.value)} aria-label="Продолжительность"><option>Любая длина</option><option>Короткая</option><option>Средняя</option><option>Длинная</option></select>
        <select value={format} onChange={(event) => setFormat(event.target.value)} aria-label="Формат"><option>Все форматы</option><option>Аудио</option><option>Видео</option><option>Книга</option></select>
        <div className="view-toggle" aria-label="Режим отображения">
          <button type="button" className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>▦</button>
          <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")}>☷</button>
        </div>
      </section>

      <section className="catalog-results">
        <div className="catalog-summary"><span className="ds-kicker">Найдено / {filtered.length}</span><button type="button" onClick={() => { setQuery(""); setGenre("Все жанры"); setStatus("Все статусы"); setFormat("Все форматы"); setLength("Любая длина"); }}>Сбросить фильтры</button></div>

        <div className={`catalog-items catalog-items--${view}`}>
          {filtered.map((story, index) => (
            <article className="catalog-card ds-panel" key={story.title}>
              <div className="catalog-poster" aria-hidden="true"><span>CASE {String(index + 1).padStart(2, "0")}</span><strong>{story.code}</strong></div>
              <div className="catalog-card-copy">
                <div className="ds-kicker">{story.series}</div>
                <h2>{story.title}</h2>
                <p>{story.genre} · {story.status}</p>
                <div className="catalog-badges">{story.formats.map((item) => <span className="ds-pill" key={item}>{item}</span>)}</div>
                <div className="catalog-meta"><span>Год: {story.year}</span><span>Длина: {story.length}</span></div>
                <button className="ds-button ds-button--primary" type="button">Открыть дело</button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && <div className="catalog-empty ds-panel"><strong>Ничего не найдено</strong><p>Попробуйте снять часть фильтров или изменить запрос.</p></div>}
      </section>
    </main>
  );
}
