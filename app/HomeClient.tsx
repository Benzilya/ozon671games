"use client";

import { useMemo, useState } from "react";
import { featuredStories, quietDan, type StoryRecord } from "./data/stories";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

const nav = [
  ["01", "Аудиокниги", "/audiobooks.html"],
  ["02", "AI-фильмы", "/films.html"],
  ["03", "Персонажи", "/characters.html"],
  ["04", "Хронология", "/timeline.html"],
  ["05", "Магазин", "/shop.html"],
  ["06", "Сообщество", "/community.html"],
  ["07", "Аккаунт", "/account.html"],
] as const;

const universeNodes = ["Тихий Дэн", "Ночное такси", "Город", "Ёжлесово", "Сириус 6Б"];

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<StoryRecord>(quietDan);

  const filtered = useMemo(
    () => featuredStories.filter((item) => `${item.title} ${item.genre}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const play = (story: StoryRecord = quietDan) => {
    setActive(story);
    setPlaying(true);
  };

  return (
    <main className="archive-home">
      <header className="archive-header">
        <a className="archive-brand" href={`${publicBase}/`} aria-label="Ozon 671 — на главную">
          <strong>671</strong><span>OZON STORIES<br />NIGHT ARCHIVE</span>
        </a>
        <button className="archive-menu" type="button" onClick={() => setMenu(!menu)} aria-expanded={menu}>INDEX</button>
        <nav className={`archive-nav${menu ? " is-open" : ""}`} aria-label="Основная навигация">
          {nav.map(([n, label, href]) => <a key={href} href={`${publicBase}${href}`}><small>{n}</small>{label}</a>)}
        </nav>
        <form className="archive-search" action={`${publicBase}/search.html`} method="get" role="search">
          <label htmlFor="global-search">SEARCH /</label>
          <input id="global-search" name="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="название, герой, место" />
        </form>
      </header>

      <section className="cover-story" id="top" aria-labelledby="hero-title">
        <div className="cover-city cover-city-art" style={{ backgroundImage: `url(${publicBase}/hero-ozon671.png)` }} aria-hidden="true">
          <div className="cover-moon" /><div className="cover-block a" /><div className="cover-block b" /><div className="cover-road" /><div className="cover-man" /><div className="cover-red" />
        </div>
        <div className="cover-rain" aria-hidden="true" />
        <div className="cover-copy">
          <div className="archive-meta">CASE 671 / NEW YORK / NIGHT FILE</div>
          <h1 id="hero-title"><span>ТИХИЙ</span><b>ДЭН</b></h1>
          <p className="cover-deck">{quietDan.description}</p>
          <blockquote>Некоторые истории начинаются с выстрела. Эта — со швабры.</blockquote>
          <div className="cover-actions">
            <button type="button" onClick={() => play(quietDan)}>▶ НАЧАТЬ ИСТОРИЮ</button>
            <a href={`${publicBase}/stories/tihiy-den.html`}>Открыть дело ↗</a>
          </div>
        </div>
        <aside className="cover-dossier" aria-label="Сведения о деле">
          <span>FILE</span><strong>TD-671-01</strong>
          <span>FORM</span><strong>AUDIO / VIDEO / PRINT</strong>
          <span>STATUS</span><strong>ARCHIVE OPEN</strong>
          <span>TIME</span><strong>03:17 AM</strong>
        </aside>
        <div className="cover-stamp" aria-hidden="true">ДЕЛО<br />ОТКРЫТО</div>
        <div className="cover-caption">Обычный человек.<br />Необычная история.</div>
      </section>

      <section className="tape-strip" aria-label="Продолжить прослушивание">
        <div className="tape-id">REC / 01</div>
        <div className="tape-copy"><small>ПРОДОЛЖИТЬ</small><strong>Тихий Дэн</strong><span>демонстрационный фрагмент</span></div>
        <div className="tape-wave" aria-hidden="true">▁▂▅▃▇▄▂▆▃▁▅▇▃▆▂▁▃▅▇▄▂▆▁▃▇▅▂▁▆▃▅</div>
        <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Пауза" : "Воспроизвести"}>{playing ? "Ⅱ" : "▶"}</button>
        <a href={`${publicBase}/stories/tihiy-den.html`}>FULL PLAYER ↗</a>
      </section>

      <section className="archive-index" id="stories">
        <header className="editorial-heading">
          <div><span>SECTION 01 / LIBRARY</span><h2>Дела из архива</h2></div>
          <p>Не витрина стриминга. Каталог историй, собранный как папка следователя: код, жанр, носитель и следующее действие.</p>
        </header>

        {query && <div className="search-note">LOCAL INDEX / найдено: {filtered.length}</div>}
        <div className="case-ledger">
          {filtered.map((story, index) => (
            <article className="case-row" key={story.slug}>
              <div className="case-number">0{index + 1}</div>
              <button className={`case-photo tone-${story.tone}`} type="button" onClick={() => play(story)} aria-label={`Запустить демо ${story.title}`}>
                <span>{story.code}</span><i>PLAY</i>
              </button>
              <div className="case-name"><small>{story.genre}</small><h3>{story.title}</h3></div>
              <div className="case-formats">{story.formats.map((format) => <span key={format}>{format}</span>)}</div>
              <div className="case-action">{story.slug === "tihiy-den" ? <a href={`${publicBase}/stories/tihiy-den.html`}>ОТКРЫТЬ ДЕЛО ↗</a> : <button type="button" onClick={() => play(story)}>СЛУШАТЬ ДЕМО →</button>}</div>
            </article>
          ))}
        </div>
        <a className="archive-wide-link" href={`${publicBase}/audiobooks.html`}><span>ВСЕ МАТЕРИАЛЫ</span><b>Открыть полный каталог</b><i>→</i></a>
      </section>

      <section className="screening-room" id="films">
        <div className="screening-frame" aria-hidden="true"><div className="taxi-light" /><div className="screen-person" /><strong>НОЧНОЕ<br />ТАКСИ</strong><small>GENERATED MATERIAL / AI LABEL REQUIRED</small></div>
        <div className="screening-copy">
          <span>SECTION 02 / MOVING IMAGE</span>
          <h2>Истории<br />выходят из текста.</h2>
          <p>Трейлеры, короткие формы, AI-экранизации и фанатские визуальные работы. Генеративные материалы всегда помечаются отдельно.</p>
          <div className="warning-line">● СОЗДАНО С ПОМОЩЬЮ ИИ — если применимо</div>
          <a href={`${publicBase}/films.html`}>ВОЙТИ В ПРОЕКЦИОННУЮ →</a>
        </div>
      </section>

      <section className="evidence-board" id="world">
        <header className="editorial-heading inverse">
          <div><span>SECTION 03 / CONNECTIONS</span><h2>Карта совпадений</h2></div>
          <p>Герои, места и события лежат не в аккуратной схеме, а в связях, которые постепенно становятся видимыми.</p>
        </header>
        <a className="evidence-canvas" href={`${publicBase}/universe.html`} aria-label="Открыть карту вселенной">
          <span className="thread t1" /><span className="thread t2" /><span className="thread t3" />
          {universeNodes.map((node, i) => <span className={`evidence-note note-${i + 1}`} key={node}><small>REF / 0{i + 1}</small><b>{node}</b></span>)}
          <span className="evidence-center">671<br /><small>ARCHIVE</small></span>
        </a>
        <div className="evidence-links"><a href={`${publicBase}/characters.html`}>ПЕРСОНАЖИ / 03</a><a href={`${publicBase}/timeline.html`}>ХРОНОЛОГИЯ / 04</a><a href={`${publicBase}/universe.html`}>ПОЛНАЯ КАРТА / OPEN →</a></div>
      </section>

      <section className="print-file" id="shop">
        <div className="book-object" aria-hidden="true"><div className="book-spine">671</div><div className="book-face"><small>COLLECTOR FILE</small><strong>ТИХИЙ<br />ДЭН</strong><span>OZON 671 GAMES</span></div></div>
        <div className="print-copy">
          <span>SECTION 04 / PHYSICAL OBJECT</span>
          <h2>Не мерч.<br />Вещдок.</h2>
          <p>Печатное издание должно ощущаться продолжением истории: бумага, переплёт, тиснение, иллюстрации и подпись автора. Цена и наличие подключаются только из подтверждённых данных.</p>
          <dl><div><dt>ФОРМАТ</dt><dd>будет подтверждён</dd></div><div><dt>КОМПЛЕКТАЦИЯ</dt><dd>из CMS</dd></div><div><dt>СТАТУС</dt><dd>данные магазина</dd></div></dl>
          <a href={`${publicBase}/shop.html`}>ОТКРЫТЬ МАГАЗИН →</a>
        </div>
      </section>

      <section className="fan-wire" id="community">
        <div className="fan-title"><span>SECTION 05 / COMMUNITY</span><h2>РЕСПЕКТ ФАНАМ</h2><em>Стандартно.</em></div>
        <div className="fan-copy"><p>Стримы, фан-арты, теории, премьеры и материалы людей, которые не могут остановиться.</p><a href={`${publicBase}/community.html`}>ВОЙТИ В СООБЩЕСТВО →</a></div>
        <div className="fan-links"><a href="https://youtube.com/@ozon671games3" target="_blank" rel="noreferrer">YOUTUBE ↗</a><a href="https://t.me/ozon671games3official" target="_blank" rel="noreferrer">TELEGRAM ↗</a><a href="https://boosty.to/ozon671games3" target="_blank" rel="noreferrer">BOOSTY ↗</a></div>
      </section>

      <footer className="archive-footer">
        <div><strong>671</strong><span>OZON STORIES / NIGHT ARCHIVE</span></div>
        <p>Самостоятельная цифровая вселенная Ozon671Games. Не связана с маркетплейсом OZON.</p>
        <span>© 2026 / WORK IN PROGRESS</span>
      </footer>

      <div className={`recorder${playing ? " is-visible" : ""}`} aria-hidden={!playing}>
        <div className="rec-dot">● REC</div><div className="rec-track"><strong>{active.title}</strong><span>DEMO / локальный прогресс</span></div><button type="button" onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ" : "▶"}</button><div className="rec-wave">▂▅▃▇▄▂▆▁▃▅▇▂▆▃▁▅</div><a href={`${publicBase}/stories/tihiy-den.html`}>OPEN ↗</a><button type="button" onClick={() => setPlaying(false)} aria-label="Закрыть">×</button>
      </div>
    </main>
  );
}
