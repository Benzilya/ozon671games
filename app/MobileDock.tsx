const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

export default function MobileDock() {
  return (
    <nav className="mobile-dock" aria-label="Мобильная навигация">
      <a href={`${publicBase}/`}><span aria-hidden="true">⌂</span><span>Главная</span></a>
      <a href={`${publicBase}/audiobooks.html`}><span aria-hidden="true">▤</span><span>Истории</span></a>
      <a href={`${publicBase}/films.html`}><span aria-hidden="true">▶</span><span>Фильмы</span></a>
      <a href={`${publicBase}/universe.html`}><span aria-hidden="true">◎</span><span>Мир</span></a>
      <a href={`${publicBase}/shop.html`}><span aria-hidden="true">▱</span><span>Магазин</span></a>
    </nav>
  );
}
