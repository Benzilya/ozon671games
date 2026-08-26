"use client";

import { useMemo, useState } from "react";
import { quietDan, stories, type StoryRecord } from "../data/stories";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

type WorkStatus = "Подтверждено" | "Метаданные не подтверждены";

type WorkNode = {
  story: StoryRecord;
  status: WorkStatus;
  x: number;
  y: number;
  color: string;
};

const positions: Record<string, { x: number; y: number }> = {
  "tihiy-den": { x: 49, y: 47 },
  "nochnoe-taksi": { x: 21, y: 22 },
  "sirius-6b": { x: 47, y: 16 },
  yozhlesovo: { x: 80, y: 25 },
  kuryer: { x: 82, y: 52 },
  "kvartira-101": { x: 72, y: 79 },
  "voda-sredi-nas": { x: 43, y: 82 },
  "temnoe-zlo": { x: 18, y: 72 },
  "bezdna-vechnosti": { x: 13, y: 46 },
  "bolnitsa-286": { x: 58, y: 66 },
};

const toneColor: Record<StoryRecord["tone"], string> = {
  red: "#d94731",
  blue: "#638da4",
  green: "#64836b",
  gray: "#777b82",
};

const works: WorkNode[] = stories.map((story, index) => {
  const fallbackAngle = (Math.PI * 2 * index) / Math.max(stories.length, 1);
  const fallback = {
    x: 50 + Math.cos(fallbackAngle) * 34,
    y: 50 + Math.sin(fallbackAngle) * 32,
  };

  return {
    story,
    status: story.slug === quietDan.slug ? "Подтверждено" : "Метаданные не подтверждены",
    ...(positions[story.slug] ?? fallback),
    color: toneColor[story.tone],
  };
});

const filters = ["Все произведения", ...stories.map((story) => story.title)] as const;

export default function UniverseClient() {
  const [filter, setFilter] = useState<string>("Все произведения");
  const [selected, setSelected] = useState(quietDan.slug);
  const [showUnverified, setShowUnverified] = useState(true);

  const visibleWorks = useMemo(() => works.filter((node) => {
    const filterMatch = filter === "Все произведения" || node.story.title === filter;
    return filterMatch && (showUnverified || node.status === "Подтверждено");
  }), [filter, showUnverified]);

  const active = works.find((node) => node.story.slug === selected) ?? works[0];
  const confirmedConnections = 0;

  return (
    <main className="universe-page">
      <header className="universe-header">
        <a className="universe-brand" href={`${publicBase}/`}><span>671</span><strong>OZON 671 / STORIES</strong></a>
        <nav><a href={`${publicBase}/audiobooks.html`}>Истории</a><a href={`${publicBase}/characters.html`}>Персонажи</a><a href={`${publicBase}/timeline.html`}>Хронология</a><a href={`${publicBase}/films.html`}>AI-фильмы</a></nav>
        <a className="universe-home" href={`${publicBase}/`}>← Главная</a>
      </header>

      <section className="universe-hero">
        <div className="case-label">UNIVERSE EVIDENCE BOARD / 671</div>
        <h1>КАРТА<br/><span>АРХИВА</span></h1>
        <p>Произведения Ozon671Games собраны в одном поле без выдуманных персонажей и связей. Межкнижные совпадения появятся только после подтверждения авторскими материалами или CMS.</p>
        <div className="universe-stats"><span><b>{String(stories.length).padStart(2, "0")}</b> произведений</span><span><b>01</b> подтверждённое описание</span><span><b>{String(confirmedConnections).padStart(2, "0")}</b> подтверждённых связей</span></div>
      </section>

      <section className="universe-controls" aria-label="Фильтры карты">
        <div className="universe-filters">{filters.map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <label><input type="checkbox" checked={showUnverified} onChange={(event) => setShowUnverified(event.target.checked)} />Показывать неподтверждённые метаданные</label>
      </section>

      <section className="universe-workspace">
        <div className="universe-board ds-panel" aria-label="Карта произведений архива">
          <div className="board-axis axis-x">АРХИВНЫЙ ИНДЕКС →</div>
          <div className="board-axis axis-y">СТАТУС ДАННЫХ →</div>
          {visibleWorks.map((node) => <button key={node.story.slug} type="button" onClick={() => setSelected(node.story.slug)} className={`universe-node ${node.status === "Подтверждено" ? "verified" : "pending"}${selected === node.story.slug ? " active" : ""}`} style={{ left:`${node.x}%`, top:`${node.y}%`, "--node-color":node.color } as React.CSSProperties}>
            <small>{node.story.code}</small><strong>{node.story.title}</strong><span>{node.story.genre}</span>
          </button>)}
          {visibleWorks.length === 0 && <div className="universe-empty">В выбранном слое нет подтверждённых данных.</div>}
        </div>

        <aside className="universe-inspector ds-panel" aria-live="polite">
          <div className="universe-inspector-top"><span>{active.story.code}</span><em>{active.status}</em></div>
          <small className="inspector-universe">ПРОИЗВЕДЕНИЕ / {active.story.series}</small>
          <h2>{active.story.title}</h2>
          <p>{active.story.description}</p>
          <dl>
            <div><dt>Жанр</dt><dd>{active.story.genre}</dd></div>
            <div><dt>Статус</dt><dd>{active.story.status}</dd></div>
            <div><dt>Форматы</dt><dd>{active.story.formats.join(" / ")}</dd></div>
            <div><dt>Год</dt><dd>{active.story.year}</dd></div>
            <div><dt>Длина</dt><dd>{active.story.length}</dd></div>
          </dl>
          <div className="connection-list">
            <h3>Межкнижные связи</h3>
            <div className="universe-empty">Подтверждённых связей пока нет. Карта не публикует гипотезы как факты.</div>
          </div>
          {active.story.slug === quietDan.slug && <a className="ds-button ds-button--primary" href={`${publicBase}/stories/tihiy-den.html`}>Открыть произведение</a>}
        </aside>
      </section>

      <section className="universe-legend">
        <article><strong>ПОДТВЕРЖДЕНО</strong><p>Сведения, которые уже есть в подтверждённом контенте проекта.</p></article>
        <article><strong>ИЗ CMS</strong><p>Поля, которые остаются пустыми или нейтральными до появления редакционных данных.</p></article>
        <article><strong>СВЯЗИ</strong><p>Никакая межкнижная связь не считается каноном без отдельного подтверждения.</p></article>
      </section>

      <footer className="universe-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Карта использует только данные архива и не подменяет канон редакционными догадками.</p><span>UNIVERSE MAP · VERIFIED DATA FIRST</span></footer>
    </main>
  );
}
