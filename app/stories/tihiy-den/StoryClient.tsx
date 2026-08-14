"use client";

import { useEffect, useState } from "react";
import { quietDan } from "../../data/stories";

const storageKey = "ozon671:progress:tihiy-den";
const demoChapters = [
  { id: "chapter-01", label: "Глава 01", title: "Демонстрационный фрагмент 01" },
  { id: "chapter-02", label: "Глава 02", title: "Демонстрационный фрагмент 02" },
  { id: "chapter-03", label: "Глава 03", title: "Демонстрационный фрагмент 03" },
];

export default function StoryClient() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(18);
  const [activeChapter, setActiveChapter] = useState(demoChapters[0].id);
  const [tab, setTab] = useState<"chapters" | "media" | "world">("chapters");

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      try {
        const value = JSON.parse(saved) as { progress?: number; chapter?: string };
        if (typeof value.progress === "number") setProgress(Math.min(100, Math.max(0, value.progress)));
        if (value.chapter && demoChapters.some((chapter) => chapter.id === value.chapter)) setActiveChapter(value.chapter);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ progress, chapter: activeChapter }));
  }, [progress, activeChapter]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 0.25)), 1200);
    return () => window.clearInterval(timer);
  }, [playing]);

  const chooseChapter = (id: string) => {
    setActiveChapter(id);
    setProgress(0);
    setPlaying(true);
  };

  return (
    <main className="story-page">
      <section className="story-hero" id="top">
        <div className="story-rain" aria-hidden="true" />
        <div className="story-skyline" aria-hidden="true"><span /><span /><span /></div>
        <div className="story-figure" aria-hidden="true" />
        <a className="story-back" href="../../">← Архив 671</a>
        <div className="story-hero-copy">
          <div className="case-label">FILE / TD-671 · QUIET DAN</div>
          <h1>ТИХИЙ <span>ДЭН</span></h1>
          <p>{quietDan.description}</p>
          <div className="story-tags">
            <span className="ds-pill ds-pill--signal">Главная история</span>
            {quietDan.formats.map((format) => <span className="ds-pill" key={format}>{format}</span>)}
          </div>
          <div className="story-actions">
            <button className="ds-button ds-button--primary" type="button" onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ Пауза" : "▶ Слушать"}</button>
            <button className="ds-button ds-button--ghost" type="button" onClick={() => setTab("media")}>Смотреть материалы</button>
          </div>
        </div>
        <aside className="story-dossier ds-panel" aria-label="Данные произведения">
          <div><small>Жанр</small><strong>{quietDan.genre}</strong></div>
          <div><small>Год</small><strong>{quietDan.year}</strong></div>
          <div><small>Длительность</small><strong>Из CMS</strong></div>
          <div><small>Статус</small><strong>{quietDan.status}</strong></div>
          <p>{quietDan.metadataNote}</p>
        </aside>
      </section>

      <section className="story-player ds-panel" aria-label="Аудиоплеер">
        <div className="story-player-cover">TD</div>
        <div className="story-player-copy"><small>Сейчас выбрано</small><strong>{demoChapters.find((chapter) => chapter.id === activeChapter)?.title}</strong><span>DEMO · реальный аудиофайл будет подключён после подтверждения прав</span></div>
        <button className="story-skip" type="button" onClick={() => setProgress((value) => Math.max(0, value - 4))}>−15</button>
        <button className="story-play" type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Пауза" : "Воспроизвести"}>{playing ? "Ⅱ" : "▶"}</button>
        <button className="story-skip" type="button" onClick={() => setProgress((value) => Math.min(100, value + 4))}>+15</button>
        <div className="story-progress"><div><i style={{ width: `${progress}%` }} /></div><span>{Math.round(progress)}% · сохраняется локально</span></div>
        <span className="story-rec">REC</span>
      </section>

      <section className="story-body">
        <nav className="story-tabs" aria-label="Разделы произведения">
          <button type="button" className={tab === "chapters" ? "active" : ""} onClick={() => setTab("chapters")}>Главы</button>
          <button type="button" className={tab === "media" ? "active" : ""} onClick={() => setTab("media")}>Видео и материалы</button>
          <button type="button" className={tab === "world" ? "active" : ""} onClick={() => setTab("world")}>Персонажи и мир</button>
        </nav>

        {tab === "chapters" && <div className="story-tab-panel">
          <div className="story-section-head"><div><div className="ds-kicker">Audio log / Demo</div><h2>Главы</h2></div><p>Названия ниже — интерфейсные заглушки, а не официальные названия глав.</p></div>
          <div className="chapter-list">
            {demoChapters.map((chapter, index) => <button type="button" className={activeChapter === chapter.id ? "chapter-row active" : "chapter-row"} key={chapter.id} onClick={() => chooseChapter(chapter.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span><div><small>{chapter.label}</small><strong>{chapter.title}</strong></div><i>{activeChapter === chapter.id && playing ? "Ⅱ" : "▶"}</i>
            </button>)}
          </div>
        </div>}

        {tab === "media" && <div className="story-tab-panel">
          <div className="story-section-head"><div><div className="ds-kicker">Visual evidence</div><h2>Видео и материалы</h2></div><p>Реальные ролики и иллюстрации подключаются только с разрешением правообладателей.</p></div>
          <div className="story-media-grid">
            <article className="story-media-card ds-panel"><div className="story-media-frame"><span>AI CONCEPT</span><strong>ТИХИЙ ДЭН<br/>Ночная смена</strong></div><div><span className="ds-pill ds-pill--signal">Создано с помощью ИИ</span><h3>Концепт визуальной адаптации</h3><p>Демонстрационная карточка будущего AI-фильма. Не выдаётся за реальные съёмки.</p></div></article>
            <article className="story-media-card ds-panel"><div className="story-media-frame story-media-frame--notes"><span>MAKING OF</span><strong>АРХИВ<br/>МАТЕРИАЛОВ</strong></div><div><span className="ds-pill">Редакционный материал</span><h3>Как создаётся атмосфера</h3><p>Место для разрешённых эскизов, раскадровок и комментариев команды.</p></div></article>
          </div>
        </div>}

        {tab === "world" && <div className="story-tab-panel">
          <div className="story-section-head"><div><div className="ds-kicker">Case connections</div><h2>Персонажи и мир</h2></div><p>Канонические связи появятся после редакционной проверки. Пока показываем структуру раздела.</p></div>
          <div className="story-world-grid">
            <article className="story-world-card ds-panel"><span>PERSON / 01</span><h3>Тихий Дэн</h3><p>Главный герой произведения. Подробная карточка будет заполнена подтверждёнными сведениями.</p></article>
            <article className="story-world-card ds-panel"><span>LOCATION / 01</span><h3>Ночной город</h3><p>Атмосферная интерфейсная категория; конкретные локации будут добавлены после проверки источников.</p></article>
            <article className="story-world-card ds-panel"><span>CONNECTION / 671</span><h3>Связи вселенной</h3><p>Будущая точка входа в карту персонажей, событий, пасхалок и альтернативных версий.</p></article>
          </div>
        </div>}
      </section>

      <section className="story-quote-band"><small>CASE NOTE / INTERFACE COPY</small><p>Некоторые истории начинаются с выстрела. Эта начинается с обычной работы.</p><span>Атмосферный текст сайта, не цитата из произведения.</span></section>

      <footer className="story-footer"><a href="../../">OZON 671 / STORIES</a><p>Материалы подключаются только при наличии прав. AI-контент маркируется отдельно.</p><span>FILE TD-671</span></footer>
    </main>
  );
}
