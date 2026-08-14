"use client";

import { useMemo, useState } from "react";

const stories = [
  { title: "Тихий Дэн", genre: "Криминальная история", code: "TD", tone: "red", formats: ["Аудио", "Видео", "Книга"] },
  { title: "Ночное такси", genre: "Мистика", code: "NT", tone: "blue", formats: ["Аудио", "Видео"] },
  { title: "Сириус 6Б", genre: "Фантастика", code: "S6", tone: "blue", formats: ["Аудио", "Книга"] },
  { title: "Ёжлесово", genre: "Мистика", code: "EZ", tone: "green", formats: ["Аудио"] },
  { title: "Курьер", genre: "Городская история", code: "KR", tone: "red", formats: ["Аудио", "Видео"] },
  { title: "Квартира 101", genre: "Хоррор", code: "101", tone: "gray", formats: ["Аудио"] },
];

const universeNodes = ["Тихий Дэн", "Ночное такси", "Город", "Ёжлесово", "Сириус 6Б"];

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(stories[0]);
  const [cart, setCart] = useState(0);

  const filtered = useMemo(
    () => stories.filter((item) => `${item.title} ${item.genre}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const play = (story = stories[0]) => {
    setActive(story);
    setPlaying(true);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Ozon 671 Stories — на главную">
          <span className="brand__mark">671</span>
          <span className="brand__copy">OZON 671<b>/ STORIES</b></span>
        </a>

        <button className="menu-button" type="button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Открыть меню">☰</button>

        <nav className="site-nav" aria-label="Основная навигация">
          <a href="#stories">Аудиокниги</a>
          <a href="#films">AI-фильмы</a>
          <a href="#world">Персонажи</a>
          <a href="#world">Хронология</a>
          <a href="#shop">Магазин</a>
          <a href="#community">Сообщество</a>
        </nav>

        <div className="header-tools">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти историю" aria-label="Глобальный поиск" />
          </label>
          <button className="icon-button" type="button" aria-label="Войти">↳</button>
          <button className="icon-button" type="button" aria-label={`Корзина: ${cart}`}><span aria-hidden="true">▱</span>{cart > 0 && <span className="cart-count">{cart}</span>}</button>
        </div>
      </header>

      <section className="noir-hero" id="top" aria-labelledby="hero-title">
        <div className="city-scene" aria-hidden="true">
          <div className="city-glow" />
          <div className="block block--a" />
          <div className="block block--b" />
          <div className="block block--c" />
          <div className="wet-road" />
          <div className="hero-person" />
          <div className="tail-light" />
        </div>
        <div className="rain-field" aria-hidden="true" />
        <div className="film-grain" aria-hidden="true" />

        <div className="hero-copy">
          <div className="case-label">Case 671 · Quiet Dan</div>
          <h1 id="hero-title">ТИХИЙ<span>ДЭН</span></h1>
          <p>История обычного мойщика полов, чья жизнь навсегда изменилась после цепочки загадочных событий.</p>
          <div className="hero-badges" aria-label="Информация о произведении">
            <span className="ds-pill ds-pill--signal">В центре вселенной</span>
            <span className="ds-pill">Аудио</span>
            <span className="ds-pill">Видео</span>
            <span className="ds-pill">Печатное издание</span>
          </div>
          <div className="hero-actions">
            <button className="ds-button ds-button--primary" type="button" onClick={() => play()}>▶ Слушать</button>
            <a className="ds-button ds-button--ghost" href="#films">Смотреть AI-фильм</a>
            <a className="ds-button ds-button--ghost" href="#stories">О произведении</a>
          </div>
        </div>

        <div className="hero-file" aria-hidden="true">
          File / TD-671<br />
          Status / Archive open
          <strong>03:17 AM · Rain</strong>
        </div>
      </section>

      <section className="resume-panel ds-panel" aria-label="Продолжить прослушивание">
        <div className="resume-cover">TD</div>
        <div className="resume-title">
          <small>Продолжить прослушивание</small>
          <strong>Тихий Дэн</strong>
          <span>Демонстрационная глава</span>
        </div>
        <div className="resume-progress">
          <div className="resume-track"><i /></div>
          <div className="resume-meta"><span>Прогресс сохраняется локально</span><span>DEMO</span></div>
        </div>
        <div className="resume-controls">
          <button className="round-control" type="button" aria-label="Назад на 15 секунд">−15</button>
          <button className="round-control round-control--play" type="button" onClick={() => setPlaying(!playing)} aria-label="Воспроизведение">{playing ? "Ⅱ" : "▶"}</button>
        </div>
      </section>

      <section className="content-section" id="stories">
        <div className="section-heading">
          <div><div className="ds-kicker">Library / Case files</div><h2 className="ds-section-title">Истории из архива 671</h2></div>
          <p>Постеры пока являются атмосферными заглушками. Официальные обложки и метаданные будут подключаться только после подтверждения прав и источников.</p>
        </div>
        {query && <p className="ds-kicker">Найдено: {filtered.length}</p>}
        <div className="story-grid">
          {filtered.map((story, index) => (
            <article className="story-card" key={story.title}>
              <button className={`story-poster tone-${story.tone}`} type="button" onClick={() => play(story)} aria-label={`Открыть ${story.title}`}>
                <span className="poster-index">CASE 0{index + 1}</span>
                <strong className="poster-code">{story.code}</strong>
                <span className="poster-play">▶</span>
              </button>
              <h3>{story.title}</h3>
              <p>{story.genre}</p>
              <div className="story-formats">{story.formats.map((format) => <span key={format}>{format}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="cinema-section" id="films">
        <div className="cinema-shell ds-panel">
          <div className="cinema-visual">
            <div className="cinema-frame"><strong>НОЧНОЕ<br />ТАКСИ</strong></div>
            <button className="cinema-play" type="button" aria-label="Запустить концепт-превью">▶</button>
          </div>
          <div className="cinema-copy">
            <div className="ds-kicker">Universe comes alive</div>
            <h2 className="ds-section-title">Знакомые истории — теперь в кадре</h2>
            <p>Раздел для экранизаций, трейлеров, фанатских работ и визуальных экспериментов по вселенной.</p>
            <div className="ai-note">AI-КОНТЕНТ: материалы, созданные с помощью генеративных инструментов, будут явно отмечены и не будут выдаваться за реальные съёмки.</div>
            <button className="ds-button ds-button--primary" type="button">Смотреть коллекцию</button>
          </div>
        </div>
      </section>

      <section className="content-section" id="world">
        <div className="section-heading">
          <div><div className="ds-kicker">Connections / Evidence board</div><h2 className="ds-section-title">Карта вселенной</h2></div>
          <p>Связи между историями, героями, событиями и местами будут раскрываться как интерактивное расследование.</p>
        </div>
        <div className="universe-map ds-panel">
          <span className="map-line ml1" /><span className="map-line ml2" /><span className="map-line ml3" />
          {universeNodes.map((label, index) => <button type="button" className={`map-node mn${index + 1}${index === 0 ? " active" : ""}`} key={label}>{label}</button>)}
        </div>
      </section>

      <section className="collector-section" id="shop">
        <div className="collector-book-wrap" aria-hidden="true">
          <div className="collector-book"><small>COLLECTOR FILE / 671</small><strong>ТИХИЙ<br />ДЭН</strong><small>КОНЦЕПТ ИЗДАНИЯ</small></div>
        </div>
        <div className="collector-copy">
          <div className="ds-kicker">Printed artifact</div>
          <h2 className="ds-section-title">История, которую можно держать в руках</h2>
          <p>Премиальный блок коллекционного издания: крупные фотографии, детали переплёта, комплектация и история создания.</p>
          <ul className="collector-list"><li>Твёрдый переплёт</li><li>Тиснение и полноцветные материалы</li><li>Варианты комплектации из CMS</li><li>Информация о доставке и предзаказе</li></ul>
          <div className="hero-actions">
            <button className="ds-button ds-button--ghost" type="button">Посмотреть издание</button>
            <button className="ds-button ds-button--primary" type="button" onClick={() => setCart(cart + 1)}>Добавить демо-предзаказ</button>
          </div>
          <p className="cms-note">Цена, наличие и тираж не зафиксированы в интерфейсе: эти данные должны поступать из CMS/админ-панели.</p>
        </div>
      </section>

      <section className="community-section" id="community">
        <div className="section-heading">
          <div><div className="ds-kicker">Respect to the fans</div><h2 className="ds-section-title">Сообщество 671</h2></div>
          <p>Стримы, фан-арты, теории и материалы сообщества — отдельный слой живой вселенной. Стандартно.</p>
        </div>
        <div className="community-grid">
          <article className="community-card ds-panel"><div className="ds-kicker"><span className="live-dot" />Ближайший эфир</div><h3>Разговор после полуночи</h3><p>Карточка будущего стрима. Дата и время будут поступать из панели управления.</p></article>
          <article className="community-card ds-panel"><div className="ds-kicker">Fan archive</div><h3>Работы сообщества</h3><p>Фан-арты и концепты с обязательным указанием автора и статуса материала.</p></article>
          <article className="community-card ds-panel"><div className="ds-kicker">External channels</div><h3>Где нас найти</h3><div className="social-links"><a href="https://youtube.com/@ozon671games3" target="_blank" rel="noreferrer">YouTube</a><a href="https://t.me/ozon671games3official" target="_blank" rel="noreferrer">Telegram</a><a href="https://boosty.to/ozon671games3" target="_blank" rel="noreferrer">Boosty</a></div></article>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top"><span className="brand__mark">671</span><span className="brand__copy">OZON 671<b>/ STORIES</b></span></a>
        <p>Самостоятельная цифровая вселенная Ozon671Games.<br />Не связана с маркетплейсом OZON.</p>
        <span>© 2026 · WORK IN PROGRESS</span>
      </footer>

      <div className={`mini-player${playing ? " visible" : ""}`} aria-hidden={!playing}>
        <div className="player-cover">{active.code}</div>
        <div className="player-info"><strong>{active.title}</strong><span>Демонстрационный плеер</span></div>
        <button className="player-main" type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Пауза" : "Воспроизвести"}>{playing ? "Ⅱ" : "▶"}</button>
        <div className="player-progress"><div><i /></div><div className="player-times"><span>прогресс</span><span>localStorage — следующий этап</span></div></div>
        <div className="player-tools"><span className="rec">REC</span><button className="icon-button" type="button" onClick={() => setPlaying(false)} aria-label="Закрыть плеер">×</button></div>
      </div>
    </main>
  );
}
