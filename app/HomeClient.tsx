"use client";

import { useMemo, useState } from "react";

const stories = [
  { title: "Тихий Дэн", genre: "Криминальный триллер", time: "2 ч 48 мин", code: "TD", tone: "red", formats: ["Аудио", "Фильм", "Книга"] },
  { title: "Ночное такси", genre: "Мистика", time: "1 ч 36 мин", code: "NT", tone: "blue", formats: ["Аудио", "Фильм"] },
  { title: "Сириус 6Б", genre: "Научная фантастика", time: "3 ч 12 мин", code: "S6", tone: "violet", formats: ["Аудио", "Книга"] },
  { title: "Ёжлесово", genre: "Мистический детектив", time: "2 ч 05 мин", code: "EZ", tone: "green", formats: ["Аудио"] },
  { title: "Курьер", genre: "Городской триллер", time: "4 ч 18 мин", code: "KR", tone: "orange", formats: ["Аудио", "Фильм"] },
  { title: "Квартира 101", genre: "Хоррор", time: "1 ч 44 мин", code: "101", tone: "gray", formats: ["Аудио"] },
];

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(stories[0]);
  const [cart, setCart] = useState(0);

  const filtered = useMemo(() => stories.filter((item) =>
    `${item.title} ${item.genre}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const play = (story = stories[0]) => {
    setActive(story);
    setPlaying(true);
  };

  return (
    <main>
      <header className="header">
        <a className="brand" href="#top" aria-label="Ozon 671 Stories — на главную">
          <span className="brand-mark">671</span><span>OZON<br/><b>STORIES</b></span>
        </a>
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Открыть меню" aria-expanded={menu}>☰</button>
        <nav className={menu ? "nav open" : "nav"} aria-label="Основная навигация">
          <a href="#stories">Аудиокниги</a><a href="#films">AI-фильмы</a><a href="#world">Вселенная</a><a href="#shop">Магазин</a>
        </nav>
        <div className="header-actions">
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти историю" aria-label="Поиск" /></label>
          <button className="cart" aria-label={`Корзина: ${cart} товаров`}>Корзина <i>{cart}</i></button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-noise" />
        <div className="hero-copy">
          <div className="eyebrow"><span /> Культовая история · 18+</div>
          <h1>ТИХИЙ<br/><em>ДЭН</em></h1>
          <p>Он просто мыл полы. Но одна случайная встреча запустила цепь событий, после которых тихой жизни уже не будет.</p>
          <div className="hero-meta"><span>Криминальный триллер</span><span>2 ч 48 мин</span><span>2025</span></div>
          <div className="hero-buttons">
            <button className="primary" onClick={() => play()}>▶ Слушать бесплатно</button>
            <a className="secondary" href="#films">Смотреть трейлер</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="moon"/><div className="building b1"/><div className="building b2"/><div className="street"/><div className="person"/><div className="red-glow"/>
          <div className="poster-caption">Обычный человек.<br/>Необычная история.</div>
        </div>
        <div className="scroll-cue">Листайте, чтобы войти во вселенную <span>↓</span></div>
      </section>

      <section className="section stories" id="stories">
        <div className="section-head"><div><div className="kicker">Библиотека 671</div><h2>Истории на вечер</h2></div><button className="text-button">Смотреть все →</button></div>
        {query && <p className="results">Результаты поиска: {filtered.length}</p>}
        <div className="story-grid">
          {filtered.map((story, index) => (
            <article className="story-card" key={story.title}>
              <button className={`cover ${story.tone}`} onClick={() => play(story)} aria-label={`Слушать ${story.title}`}>
                <span className="cover-number">0{index + 1}</span><b>{story.code}</b><small>OZON 671 STORIES</small><i>▶</i>
              </button>
              <div className="story-info"><h3>{story.title}</h3><p>{story.genre} · {story.time}</p><div>{story.formats.map(f => <span key={f}>{f}</span>)}</div></div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <div className="empty">Ничего не найдено. Попробуйте другое название.</div>}
      </section>

      <section className="film-section" id="films">
        <div className="film-visual"><div className="film-frame"><span>AI FILM · 01</span><strong>НОЧНОЕ<br/>ТАКСИ</strong><button onClick={() => setPlaying(!playing)} aria-label="Воспроизвести трейлер">▶</button></div></div>
        <div className="film-copy"><div className="kicker">Вселенная оживает</div><h2>Знакомые истории.<br/>Теперь в кино.</h2><p>Атмосферные экранизации, созданные с помощью искусственного интеллекта и воображения фанатов.</p><div className="tags"><span>AI-фильм</span><span>Фанатская работа</span><span>4K</span></div><button className="primary">Смотреть коллекцию</button></div>
      </section>

      <section className="section world" id="world">
        <div className="section-head"><div><div className="kicker">Связи и пасхалки</div><h2>Одна большая вселенная</h2></div><p>Места, герои и события переплетаются.<br/>Нажмите на точку, чтобы узнать больше.</p></div>
        <div className="map">
          <div className="map-lines" />
          {["Тихий Дэн", "Сириус 6Б", "Ночное такси", "Ёжлесово", "Больница 286"].map((label, i) => <button className={`node n${i+1}`} key={label}><span>{i+1}</span>{label}</button>)}
          <div className="map-center"><b>671</b><span>STORY<br/>UNIVERSE</span></div>
        </div>
      </section>

      <section className="shop-section" id="shop">
        <div className="book-art"><div className="book"><span>КОЛЛЕКЦИОННОЕ ИЗДАНИЕ</span><strong>ТИХИЙ<br/><i>ДЭН</i></strong><small>OZON 671 GAMES</small></div><div className="book-shadow"/></div>
        <div className="shop-copy"><div className="kicker">Ограниченный тираж</div><h2>История, которую<br/>можно держать в руках</h2><p>Твёрдый переплёт с тиснением, яркие полноцветные иллюстрации и автограф автора.</p><ul><li>Формат А5+</li><li>Авторская подпись</li><li>Доставка СДЭК</li></ul><div className="price-row"><div><small>Стоимость</small><strong>3 500 ₽</strong></div><button className="primary" onClick={() => setCart(cart + 1)}>Добавить в корзину</button></div></div>
      </section>

      <section className="community"><div><div className="kicker">Респект фанам</div><h2>Присоединяйтесь<br/>к сообществу</h2></div><p>Стримы, премьеры, аукционы и новые истории.<br/>Будьте там, где всё начинается.</p><div className="socials"><a href="https://youtube.com/@ozon671games3" target="_blank" rel="noreferrer">YouTube ↗</a><a href="https://t.me/ozon671games3official" target="_blank" rel="noreferrer">Telegram ↗</a><a href="https://boosty.to/ozon671games3" target="_blank" rel="noreferrer">Boosty ↗</a></div></section>

      <footer><a className="brand" href="#top"><span className="brand-mark">671</span><span>OZON<br/><b>STORIES</b></span></a><p>Фанатский концепт цифровой вселенной Ozon671Games.<br/>Не связан с маркетплейсом OZON.</p><span>© 2026</span></footer>

      <div className={playing ? "player visible" : "player"} aria-hidden={!playing}>
        <div className={`player-cover ${active.tone}`}>{active.code}</div><div className="track"><b>{active.title}</b><span>Глава 1 · Начало</span></div>
        <button onClick={() => setPlaying(!playing)} className="play-button" aria-label={playing ? "Пауза" : "Воспроизвести"}>{playing ? "Ⅱ" : "▶"}</button>
        <div className="progress"><span>12:48</span><div><i /></div><span>{active.time}</span></div><button className="close" onClick={() => setPlaying(false)} aria-label="Закрыть плеер">×</button>
      </div>
    </main>
  );
}
