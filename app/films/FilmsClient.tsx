"use client";

import { useMemo, useState } from "react";
import { quietDan } from "../data/stories";

type FilmType = "AI-концепт" | "Фанатская работа" | "Making-of";

type FilmRecord = {
  id: string;
  title: string;
  story: string;
  type: FilmType;
  format: "Фильм" | "Короткий метр" | "Клип" | "Материал";
  description: string;
  tone: "red" | "blue" | "gray";
  ai: boolean;
};

const films: FilmRecord[] = [
  { id: "td-night", title: "Тихий Дэн: Ночная смена", story: quietDan.title, type: "AI-концепт", format: "Фильм", description: "Демонстрационный концепт экранизации в дождливой noir-эстетике. Не является реальной съёмкой.", tone: "red", ai: true },
  { id: "nt-road", title: "Ночное такси: Последний рейс", story: "Ночное такси", type: "AI-концепт", format: "Короткий метр", description: "Визуальная концепция ночного маршрута. Видео появится только после редакционного подтверждения источника.", tone: "blue", ai: true },
  { id: "s6-signal", title: "Сириус 6Б: Сигнал", story: "Сириус 6Б", type: "AI-концепт", format: "Клип", description: "Короткая концептуальная сцена для будущего визуального раздела.", tone: "blue", ai: true },
  { id: "fan-archive", title: "Архив фанатских адаптаций", story: "Вселенная 671", type: "Фанатская работа", format: "Материал", description: "Будущая витрина работ сообщества с указанием автора, разрешения и исходной площадки.", tone: "gray", ai: false },
  { id: "making-noir", title: "Как собирается Rain Noir", story: quietDan.title, type: "Making-of", format: "Материал", description: "Место для раскадровок, тестов света, заметок и разрешённых материалов производства.", tone: "red", ai: false },
];

const filters: Array<"Все" | FilmType> = ["Все", "AI-концепт", "Фанатская работа", "Making-of"];
const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

export default function FilmsClient() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Все");
  const [activeId, setActiveId] = useState(films[0].id);
  const [noticeOpen, setNoticeOpen] = useState(true);

  const visible = useMemo(() => filter === "Все" ? films : films.filter((film) => film.type === filter), [filter]);
  const active = films.find((film) => film.id === activeId) ?? films[0];
  const isQuietDan = active.story === "Тихий Дэн";

  return (
    <main className="films-page">
      <header className="films-header">
        <a href={`${publicBase}/`} className="films-brand"><span>671</span><strong>OZON 671 / STORIES</strong></a>
        <nav aria-label="Навигация раздела"><a href="#premiere">Премьера</a><a href="#archive">Архив</a><a href="#about-ai">Об AI-материалах</a></nav>
        <a className="films-back" href={`${publicBase}/`}>← Главная</a>
      </header>

      <section className="films-premiere" id="premiere">
        <div className="films-rain" aria-hidden="true" />
        <div className="films-scene" aria-hidden="true"><div className="films-car"/><div className="films-light fl-a"/><div className="films-light fl-b"/></div>
        <div className="films-premiere-copy">
          <div className="case-label">AI FILM / CONCEPT PREMIERE</div>
          <h1>ТИХИЙ ДЭН:<br/><span>НОЧНАЯ СМЕНА</span></h1>
          <p>Концептуальная визуальная адаптация атмосферы произведения. Сейчас это интерфейсный макет будущего медиараздела — не реальное видео и не официальная экранизация.</p>
          <div className="films-labels"><span className="ds-pill ds-pill--signal">Создано с помощью ИИ</span><span className="ds-pill">Концепт</span><span className="ds-pill">Видео не подключено</span></div>
          <div className="films-actions"><button type="button" className="ds-button ds-button--primary" onClick={() => setActiveId("td-night")}>▶ Открыть концепт</button><a className="ds-button ds-button--ghost" href={`${publicBase}/stories/tihiy-den.html`}>К произведению</a></div>
        </div>
        <div className="films-premiere-file">VISUAL FILE / {quietDan.code} / CONCEPT<br/><strong>STATUS: CONCEPT</strong><br/>REAL FOOTAGE: NO</div>
      </section>

      {noticeOpen && <aside className="ai-disclosure" id="about-ai">
        <div><strong>AI DISCLOSURE</strong><p>Материалы с генеративными изображениями или видео всегда маркируются. Они не выдаются за документальные кадры, реальные события или официальные материалы правообладателя.</p></div>
        <button type="button" onClick={() => setNoticeOpen(false)} aria-label="Закрыть уведомление">×</button>
      </aside>}

      <section className="films-archive" id="archive">
        <div className="films-section-head"><div><div className="ds-kicker">Streaming archive / 671</div><h2>Визуальный архив</h2></div><p>Фильмы, короткие концепты, фанатские адаптации и making-of будут храниться раздельно, чтобы происхождение каждого материала было понятно.</p></div>

        <div className="films-filters" aria-label="Фильтры видео">{filters.map((item) => <button type="button" className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>

        <div className="films-layout">
          <div className="films-grid">
            {visible.map((film) => <button type="button" className={`film-card film-tone-${film.tone}${film.id === activeId ? " active" : ""}`} key={film.id} onClick={() => setActiveId(film.id)}>
              <div className="film-card-frame"><span>{film.type.toUpperCase()}</span><strong>{film.story}</strong><i>▶</i>{film.ai && <b>AI</b>}</div>
              <div className="film-card-copy"><small>{film.format}</small><h3>{film.title}</h3><p>{film.description}</p></div>
            </button>)}
          </div>

          <aside className="film-inspector ds-panel" aria-live="polite">
            <div className={`film-inspector-screen film-tone-${active.tone}`}><span>{active.type}</span><strong>{active.title}</strong><div className="film-fake-controls"><button type="button" disabled aria-label="Видео пока не подключено">▶</button><div><i/></div><small>00:00 / —</small><small>CC</small><small>QUALITY —</small><small>⛶</small></div></div>
            <div className="film-inspector-copy">
              <div className="films-labels">{active.ai && <span className="ds-pill ds-pill--signal">Создано с помощью ИИ</span>}<span className="ds-pill">{active.type}</span><span className="ds-pill">{active.format}</span></div>
              <h2>{active.title}</h2><p>{active.description}</p>
              <dl><div><dt>Авторство</dt><dd>Будет указано у реального материала</dd></div><div><dt>Источник</dt><dd>Будет указан после проверки</dd></div><div><dt>Статус</dt><dd>Демонстрационная карточка</dd></div></dl>
              <div className="case-crosslinks" aria-label="Связанные дела">
                {isQuietDan && <a href={`${publicBase}/stories/tihiy-den.html`}>Произведение / TD</a>}
                {isQuietDan && <a href={`${publicBase}/characters.html`}>Персонаж / TD</a>}
                <a href={`${publicBase}/universe.html`}>Карта вселенной</a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="films-scenes">
        <div className="films-section-head"><div><div className="ds-kicker">Scene index / Demo</div><h2>Сцены и фрагменты</h2></div><p>При подключении реального видео этот блок станет навигацией по сценам, субтитрам и дополнительным материалам.</p></div>
        <div className="scene-strip">{["Ночной город", "Коридор", "Дождь", "Красный свет"].map((scene,index)=><article key={scene}><div><span>SCENE 0{index+1}</span><strong>{scene}</strong></div><p>Демонстрационная сцена</p></article>)}</div>
      </section>

      <footer className="films-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>AI-контент маркируется. Фанатские и официальные материалы не смешиваются.</p><span>VISUAL ARCHIVE · WIP</span></footer>
    </main>
  );
}
