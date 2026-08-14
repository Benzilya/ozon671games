"use client";

import { useMemo, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

type NodeKind = "Произведение" | "Персонаж" | "Локация" | "Событие" | "Альтернативная версия";
type Status = "Подтверждено" | "Редакционная заглушка" | "Отдельный слой";

type UniverseNode = {
  id: string;
  label: string;
  kind: NodeKind;
  status: Status;
  x: number;
  y: number;
  text: string;
  link?: string;
};

const nodes: UniverseNode[] = [
  { id: "quiet-dan", label: "Тихий Дэн", kind: "Произведение", status: "Подтверждено", x: 48, y: 46, text: "Подтверждённая центральная история: жизнь обычного мойщика полов меняется после цепочки загадочных событий.", link: `${publicBase}/stories/tihiy-den.html` },
  { id: "quiet-dan-person", label: "Тихий Дэн", kind: "Персонаж", status: "Подтверждено", x: 26, y: 30, text: "Главный герой произведения. Дополнительные биографические детали пока не фиксируются без редакционного источника.", link: `${publicBase}/characters.html` },
  { id: "night-city", label: "Ночной город", kind: "Локация", status: "Редакционная заглушка", x: 72, y: 24, text: "Атмосферный слой интерфейса. Конкретная каноническая локация будет названа только после проверки материалов." },
  { id: "event-chain", label: "Цепочка событий", kind: "Событие", status: "Подтверждено", x: 70, y: 62, text: "Сам факт цепочки загадочных событий подтверждён описанием. Их точный порядок, даты и участники пока не публикуются.", link: `${publicBase}/timeline.html` },
  { id: "redacted-link", label: "Связь 671", kind: "Событие", status: "Редакционная заглушка", x: 34, y: 72, text: "Будущий узел связи между произведениями. До редакционной проверки не считается каноном." },
  { id: "alternate", label: "ALT / 671", kind: "Альтернативная версия", status: "Отдельный слой", x: 83, y: 78, text: "Зона для фанатских и альтернативных трактовок. Она намеренно отделена от подтверждённого канона." },
];

const relations = [
  ["quiet-dan", "quiet-dan-person"],
  ["quiet-dan", "night-city"],
  ["quiet-dan", "event-chain"],
  ["quiet-dan", "redacted-link"],
  ["event-chain", "alternate"],
];

const kinds: Array<"Все" | NodeKind> = ["Все", "Произведение", "Персонаж", "Локация", "Событие", "Альтернативная версия"];

export default function UniverseClient() {
  const [kind, setKind] = useState<(typeof kinds)[number]>("Все");
  const [selected, setSelected] = useState("quiet-dan");
  const [showPending, setShowPending] = useState(true);

  const visibleNodes = useMemo(() => nodes.filter((node) => (kind === "Все" || node.kind === kind) && (showPending || node.status !== "Редакционная заглушка")), [kind, showPending]);
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const active = nodes.find((node) => node.id === selected) ?? nodes[0];

  return (
    <main className="universe-page">
      <header className="universe-header">
        <a className="universe-brand" href={`${publicBase}/`}><span>671</span><strong>OZON 671 / STORIES</strong></a>
        <nav><a href={`${publicBase}/audiobooks.html`}>Истории</a><a href={`${publicBase}/characters.html`}>Персонажи</a><a href={`${publicBase}/timeline.html`}>Хронология</a><a href={`${publicBase}/films.html`}>AI-фильмы</a></nav>
        <a className="universe-home" href={`${publicBase}/`}>← Главная</a>
      </header>

      <section className="universe-hero">
        <div className="case-label">EVIDENCE BOARD / UNIVERSE 671</div>
        <h1>КАРТА<br/><span>ВСЕЛЕННОЙ</span></h1>
        <p>Интерактивное поле связей между произведениями, персонажами, событиями и местами. Неподтверждённые сведения остаются отдельным редакционным слоем.</p>
      </section>

      <section className="universe-controls">
        <div className="universe-filters">{kinds.map((item) => <button type="button" key={item} className={kind === item ? "active" : ""} onClick={() => setKind(item)}>{item}</button>)}</div>
        <label><input type="checkbox" checked={showPending} onChange={(event) => setShowPending(event.target.checked)} />Показывать редакционные узлы</label>
      </section>

      <section className="universe-workspace">
        <div className="universe-board ds-panel" aria-label="Интерактивная карта связей">
          <svg className="universe-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {relations.map(([a,b]) => {
              const first = nodes.find((node) => node.id === a)!;
              const second = nodes.find((node) => node.id === b)!;
              if (!visibleIds.has(a) || !visibleIds.has(b)) return null;
              return <line key={`${a}-${b}`} x1={first.x} y1={first.y} x2={second.x} y2={second.y} />;
            })}
          </svg>
          {visibleNodes.map((node) => <button key={node.id} type="button" onClick={() => setSelected(node.id)} className={`universe-node ${node.status === "Подтверждено" ? "verified" : node.status === "Отдельный слой" ? "alternate" : "pending"}${selected === node.id ? " active" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <small>{node.kind}</small><strong>{node.label}</strong><span>{node.status}</span>
          </button>)}
        </div>

        <aside className="universe-inspector ds-panel" aria-live="polite">
          <div className="universe-inspector-top"><span>{active.kind}</span><em>{active.status}</em></div>
          <h2>{active.label}</h2>
          <p>{active.text}</p>
          <dl><div><dt>Статус</dt><dd>{active.status}</dd></div><div><dt>Канон</dt><dd>{active.status === "Подтверждено" ? "Только подтверждённая часть" : "Не подтверждён"}</dd></div><div><dt>Связи</dt><dd>{relations.filter((pair) => pair.includes(active.id)).length}</dd></div></dl>
          {active.link && <a className="ds-button ds-button--primary" href={active.link}>Открыть связанный раздел</a>}
        </aside>
      </section>

      <section className="universe-legend">
        <article><strong>КРАСНЫЙ УЗЕЛ</strong><p>Подтверждённая часть данных проекта.</p></article>
        <article><strong>СЕРЫЙ УЗЕЛ</strong><p>Редакционная заглушка, не объявленная каноном.</p></article>
        <article><strong>ПУНКТИРНЫЙ УЗЕЛ</strong><p>Альтернативная или фанатская версия в отдельном слое.</p></article>
      </section>

      <footer className="universe-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Карта расширяется только подтверждёнными связями.</p><span>UNIVERSE MAP · WIP</span></footer>
    </main>
  );
}
