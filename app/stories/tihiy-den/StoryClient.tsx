"use client";

import { useState } from "react";
import { quietDan } from "../../data/stories";
import { formatPlayerTime, type PlayerChapter, useLocalPlayer } from "../../player/useLocalPlayer";

const demoChapters: Array<PlayerChapter & { label: string }> = [
  { id: "chapter-01", label: "Глава 01", title: "Демонстрационный фрагмент 01", durationSeconds: 10 * 60 },
  { id: "chapter-02", label: "Глава 02", title: "Демонстрационный фрагмент 02", durationSeconds: 12 * 60 },
  { id: "chapter-03", label: "Глава 03", title: "Демонстрационный фрагмент 03", durationSeconds: 9 * 60 },
];

const storageKey = "ozon671:player:tihiy-den";
const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

export default function StoryClient() {
  const [tab, setTab] = useState<"chapters" | "media" | "world">("chapters");
  const player = useLocalPlayer(storageKey, demoChapters);
  const activeChapter = demoChapters[player.chapterIndex];

  return (
    <main className="story-page">
      <section className="story-hero" id="top">
        <div className="story-rain" aria-hidden="true" />
        <div className="story-skyline" aria-hidden="true"><span /><span /><span /></div>
        <div className="story-figure" aria-hidden="true" />
        <a className="story-back" href="../../">← Архив 671</a>
        <div className="story-hero-copy">
          <div className="case-label">FILE / {quietDan.code} · QUIET DAN</div>
          <h1>ТИХИЙ <span>ДЭН</span></h1>
          <p>{quietDan.description}</p>
          <div className="story-tags">
            <span className="ds-pill ds-pill--signal">Главная история</span>
            {quietDan.formats.map((format) => <span className="ds-pill" key={format}>{format}</span>)}
          </div>
          <div className="story-actions">
            <button className="ds-button ds-button--primary" type="button" onClick={() => player.setPlaying(!player.playing)}>{player.playing ? "Ⅱ Пауза" : "▶ Слушать"}</button>
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
        <div className="story-player-cover">{quietDan.code}</div>
        <div className="story-player-copy">
          <small>Сейчас выбрано · DEMO</small>
          <strong>{activeChapter?.title}</strong>
          <span>Реальный аудиофайл будет подключён только после подтверждения прав.</span>
        </div>
        <div className="story-player-main-controls">
          <button className="story-mini-control" type="button" onClick={player.previousChapter} aria-label="Предыдущая глава">‹|</button>
          <button className="story-skip" type="button" onClick={() => player.seek(-15)} aria-label="Назад на 15 секунд">−15</button>
          <button className="story-play" type="button" onClick={() => player.setPlaying(!player.playing)} aria-label={player.playing ? "Пауза" : "Воспроизвести"}>{player.playing ? "Ⅱ" : "▶"}</button>
          <button className="story-skip" type="button" onClick={() => player.seek(15)} aria-label="Вперёд на 15 секунд">+15</button>
          <button className="story-mini-control" type="button" onClick={player.nextChapter} aria-label="Следующая глава">|›</button>
        </div>
        <div className="story-progress story-progress--full">
          <input type="range" min="0" max="100" step="0.1" value={player.progressPercent} onChange={(event) => player.seekToPercent(Number(event.target.value))} aria-label="Позиция воспроизведения" />
          <div className="story-progress-meta"><span>{formatPlayerTime(player.positionSeconds)} / {formatPlayerTime(player.durationSeconds)} · демо-таймлайн</span><span>{Math.round(player.progressPercent)}% · localStorage</span></div>
        </div>
        <span className="story-rec">REC</span>
      </section>

      <section className="player-options" aria-label="Настройки плеера">
        <button type="button" className="player-option" onClick={player.cyclePlaybackRate}><small>Скорость</small><strong>{player.playbackRate}×</strong></button>
        <label className="player-option player-option--range"><small>Громкость</small><input type="range" min="0" max="1" step="0.05" value={player.volume} onChange={(event) => player.setVolume(Number(event.target.value))} aria-label="Громкость" /><strong>{Math.round(player.volume * 100)}%</strong></label>
        <label className="player-option"><small>Таймер сна</small><select value={player.sleepMinutes ?? "off"} onChange={(event) => player.setSleepTimer(event.target.value === "off" ? null : Number(event.target.value))} aria-label="Таймер сна"><option value="off">Выкл.</option><option value="15">15 мин</option><option value="30">30 мин</option><option value="45">45 мин</option><option value="60">60 мин</option></select></label>
        <div className="player-shortcuts"><small>Клавиши</small><span><kbd>Space</kbd> play/pause · <kbd>←</kbd>/<kbd>→</kbd> ±15 сек</span></div>
      </section>

      <section className="story-body">
        <nav className="story-tabs" aria-label="Разделы произведения">
          <button type="button" className={tab === "chapters" ? "active" : ""} onClick={() => setTab("chapters")}>Главы</button>
          <button type="button" className={tab === "media" ? "active" : ""} onClick={() => setTab("media")}>Видео и материалы</button>
          <button type="button" className={tab === "world" ? "active" : ""} onClick={() => setTab("world")}>Персонажи и мир</button>
        </nav>

        {tab === "chapters" && <div className="story-tab-panel">
          <div className="story-section-head"><div><div className="ds-kicker">Audio log / Demo</div><h2>Главы</h2></div><p>Названия и длительности ниже — только интерфейсные демо-данные, а не официальные сведения.</p></div>
          <div className="chapter-list">{demoChapters.map((chapter, index) => <button type="button" className={player.chapterIndex === index ? "chapter-row active" : "chapter-row"} key={chapter.id} onClick={() => player.selectChapter(index)}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{chapter.label} · demo {formatPlayerTime(chapter.durationSeconds)}</small><strong>{chapter.title}</strong></div><i>{player.chapterIndex === index && player.playing ? "Ⅱ" : "▶"}</i></button>)}</div>
        </div>}

        {tab === "media" && <div className="story-tab-panel">
          <div className="story-section-head"><div><div className="ds-kicker">Visual evidence</div><h2>Видео и материалы</h2></div><p>Реальные ролики и иллюстрации подключаются только с разрешением правообладателей.</p></div>
          <div className="story-media-grid">
            <a className="story-media-card story-media-card-link ds-panel" href={`${publicBase}/films.html`}><div className="story-media-frame"><span>AI CONCEPT</span><strong>ТИХИЙ ДЭН<br/>Ночная смена</strong></div><div><span className="ds-pill ds-pill--signal">Создано с помощью ИИ</span><h3>Концепт визуальной адаптации</h3><p>Открыть связанное дело в визуальном архиве. Не выдаётся за реальные съёмки.</p></div></a>
            <article className="story-media-card ds-panel"><div className="story-media-frame story-media-frame--notes"><span>MAKING OF</span><strong>АРХИВ<br/>МАТЕРИАЛОВ</strong></div><div><span className="ds-pill">Редакционный материал</span><h3>Как создаётся атмосфера</h3><p>Место для разрешённых эскизов, раскадровок и комментариев команды.</p></div></article>
          </div>
        </div>}

        {tab === "world" && <div className="story-tab-panel">
          <div className="story-section-head"><div><div className="ds-kicker">Case connections</div><h2>Персонажи и мир</h2></div><p>Канонические связи появятся после редакционной проверки. Подтверждённые страницы уже связаны между собой.</p></div>
          <div className="story-world-grid">
            <a className="story-world-card story-world-card-link ds-panel" href={`${publicBase}/characters.html`}><span>PERSON / 01</span><h3>Тихий Дэн</h3><p>Открыть подтверждённую карточку главного героя в архиве персонажей.</p></a>
            <article className="story-world-card ds-panel"><span>LOCATION / WIP</span><h3>Локации</h3><p>Конкретные места будут добавлены только после проверки редакционных источников.</p></article>
            <a className="story-world-card story-world-card-link ds-panel" href={`${publicBase}/universe.html`}><span>CONNECTION / OPEN</span><h3>Связи вселенной</h3><p>Перейти к карте совпадений и подтверждённым связям архива 671.</p></a>
          </div>
        </div>}
      </section>

      <section className="story-quote-band"><small>CASE NOTE / INTERFACE COPY</small><p>Некоторые истории начинаются с выстрела. Эта начинается с обычной работы.</p><span>Атмосферный текст сайта, не цитата из произведения.</span></section>

      <footer className="story-footer"><a href="../../">OZON 671 / STORIES</a><p>Материалы подключаются только при наличии прав. AI-контент маркируется отдельно.</p><span>FILE {quietDan.code}</span></footer>
    </main>
  );
}
