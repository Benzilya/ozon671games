const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

export default function MobileDock() {
  return (
    <nav className="mobile-dock" aria-label="Мобильная навигация">
      <a href={`${publicBase}/`}><span>⌂</span>Главная</a>
      <a href={`${publicBase}/audiobooks.html`}><span>▤</span>Истории</a>
      <a href={`${publicBase}/films.html`}><span>▶</span>Фильмы</a>
      <a href={`${publicBase}/characters.html`}><span>◎</span>Персонажи</a>
      <a href={`${publicBase}/#shop`}><span>▱</span>Магазин</a>
    </nav>
  );
}
