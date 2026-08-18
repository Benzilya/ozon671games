"use client";

import { useMemo, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

type Universe = "Тихий Дэн" | "Ночное такси" | "Сириус 6Б" | "Ёжлесово" | "Курьер" | "Квартира 101";
type NodeStatus = "Канон" | "На проверке";

type CharacterNode = {
  id: string;
  name: string;
  role: string;
  universe: Universe;
  code: string;
  status: NodeStatus;
  x: number;
  y: number;
  summary: string;
  color: string;
  link?: string;
};

type Connection = {
  id: string;
  from: string;
  to: string;
  title: string;
  evidence: string;
  confidence: number;
  status: NodeStatus;
};

const characters: CharacterNode[] = [
  { id:"dan", name:"Тихий Дэн", role:"Главный герой", universe:"Тихий Дэн", code:"TD-001", status:"Канон", x:49, y:48, color:"#d94731", summary:"Обычный мойщик полов, чья жизнь меняется после цепочки загадочных событий.", link:`${publicBase}/stories/tihiy-den.html` },
  { id:"driver", name:"Водитель", role:"Имя ожидает подтверждения", universe:"Ночное такси", code:"NT-001", status:"На проверке", x:22, y:22, color:"#638da4", summary:"Рабочий узел для героя «Ночного такси». Имя и биография не объявлены каноном." },
  { id:"passenger", name:"Пассажир", role:"Связующая фигура", universe:"Ночное такси", code:"NT-002", status:"На проверке", x:19, y:54, color:"#638da4", summary:"Редакционная карточка возможного участника ночного маршрута." },
  { id:"operator", name:"Оператор 6Б", role:"Получатель сигнала", universe:"Сириус 6Б", code:"S6-001", status:"На проверке", x:46, y:16, color:"#6676ad", summary:"Условное обозначение персонажа научно-фантастической линии до получения авторских данных." },
  { id:"observer", name:"Наблюдатель", role:"Источник передачи", universe:"Сириус 6Б", code:"S6-002", status:"На проверке", x:76, y:22, color:"#6676ad", summary:"Возможный источник повторяющегося сигнала. Связь пока является гипотезой." },
  { id:"forester", name:"Житель леса", role:"Хранитель места", universe:"Ёжлесово", code:"EZ-001", status:"На проверке", x:82, y:49, color:"#64836b", summary:"Ролевая карточка персонажа Ёжлесово без выдуманного имени и биографии." },
  { id:"courier", name:"Курьер", role:"Переносчик объекта", universe:"Курьер", code:"KR-001", status:"На проверке", x:72, y:78, color:"#a95a3f", summary:"Герой городской линии, через которого карта проверяет перемещение предметов между историями." },
  { id:"resident", name:"Жилец 101", role:"Получатель", universe:"Квартира 101", code:"101-001", status:"На проверке", x:36, y:82, color:"#777b82", summary:"Условная карточка героя хоррор-линии. Точная личность ожидает подтверждения автора." },
];

const connections: Connection[] = [
  { id:"dan-driver", from:"dan", to:"driver", title:"Одна ночная смена", evidence:"Сходство городского времени и рабочих ролей", confidence:62, status:"На проверке" },
  { id:"driver-passenger", from:"driver", to:"passenger", title:"Последний маршрут", evidence:"Персонажи одной книги", confidence:78, status:"На проверке" },
  { id:"passenger-operator", from:"passenger", to:"operator", title:"Повторяющийся сигнал", evidence:"Мотив сообщения, которое приходит ночью", confidence:41, status:"На проверке" },
  { id:"operator-observer", from:"operator", to:"observer", title:"Канал 6Б", evidence:"Персонажи одной книги", confidence:74, status:"На проверке" },
  { id:"observer-forester", from:"observer", to:"forester", title:"Наблюдение издалека", evidence:"Одинаковый знак в разных средах", confidence:29, status:"На проверке" },
  { id:"forester-courier", from:"forester", to:"courier", title:"Предмет из Ёжлесово", evidence:"Объект может покидать одну историю и появляться в другой", confidence:36, status:"На проверке" },
  { id:"courier-resident", from:"courier", to:"resident", title:"Доставка в квартиру 101", evidence:"Адрес и роль получателя", confidence:67, status:"На проверке" },
  { id:"resident-dan", from:"resident", to:"dan", title:"След дела 671", evidence:"Совпадающий номер в архивных записях", confidence:31, status:"На проверке" },
  { id:"dan-courier", from:"dan", to:"courier", title:"Красный автомобиль", evidence:"Визуальный мотив; требует текстового подтверждения", confidence:24, status:"На проверке" },
];

const universes: Array<"Все миры" | Universe> = ["Все миры", "Тихий Дэн", "Ночное такси", "Сириус 6Б", "Ёжлесово", "Курьер", "Квартира 101"];

export default function UniverseClient() {
  const [universe, setUniverse] = useState<(typeof universes)[number]>("Все миры");
  const [selected, setSelected] = useState("dan");
  const [showHypotheses, setShowHypotheses] = useState(true);

  const visibleCharacters = useMemo(() => characters.filter((character) => {
    const universeMatch = universe === "Все миры" || character.universe === universe;
    return universeMatch && (showHypotheses || character.status === "Канон");
  }), [universe, showHypotheses]);

  const visibleIds = new Set(visibleCharacters.map((character) => character.id));
  const active = characters.find((character) => character.id === selected) ?? characters[0];
  const activeConnections = connections.filter((connection) => connection.from === active.id || connection.to === active.id);

  return (
    <main className="universe-page">
      <header className="universe-header">
        <a className="universe-brand" href={`${publicBase}/`}><span>671</span><strong>OZON 671 / STORIES</strong></a>
        <nav><a href={`${publicBase}/audiobooks.html`}>Истории</a><a href={`${publicBase}/characters.html`}>Персонажи</a><a href={`${publicBase}/timeline.html`}>Хронология</a><a href={`${publicBase}/films.html`}>AI-фильмы</a></nav>
        <a className="universe-home" href={`${publicBase}/`}>← Главная</a>
      </header>

      <section className="universe-hero">
        <div className="case-label">CROSS-UNIVERSE EVIDENCE BOARD / 671</div>
        <h1>КАРТА<br/><span>СОВПАДЕНИЙ</span></h1>
        <p>Связи персонажей из разных книг Ozon671Games. Красным отмечен подтверждённый канон, пунктиром — редакционные гипотезы, которые требуют проверки по авторским материалам.</p>
        <div className="universe-stats"><span><b>06</b> миров</span><span><b>08</b> персонажей</span><span><b>09</b> совпадений</span></div>
      </section>

      <section className="universe-controls" aria-label="Фильтры карты">
        <div className="universe-filters">{universes.map((item) => <button type="button" key={item} className={universe === item ? "active" : ""} onClick={() => setUniverse(item)}>{item}</button>)}</div>
        <label><input type="checkbox" checked={showHypotheses} onChange={(event) => setShowHypotheses(event.target.checked)} />Показывать гипотезы</label>
      </section>

      <section className="universe-workspace">
        <div className="universe-board ds-panel" aria-label="Интерактивная карта связей персонажей">
          <div className="board-axis axis-x">РАССТОЯНИЕ МЕЖДУ МИРАМИ →</div>
          <div className="board-axis axis-y">УРОВЕНЬ ПОДТВЕРЖДЕНИЯ →</div>
          <svg className="universe-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {connections.map((connection) => {
              const first = characters.find((character) => character.id === connection.from)!;
              const second = characters.find((character) => character.id === connection.to)!;
              if (!visibleIds.has(first.id) || !visibleIds.has(second.id)) return null;
              return <line key={connection.id} className={connection.status === "Канон" ? "verified" : "hypothesis"} x1={first.x} y1={first.y} x2={second.x} y2={second.y} />;
            })}
          </svg>
          {visibleCharacters.map((character) => <button key={character.id} type="button" onClick={() => setSelected(character.id)} className={`universe-node ${character.status === "Канон" ? "verified" : "pending"}${selected === character.id ? " active" : ""}`} style={{ left:`${character.x}%`, top:`${character.y}%`, "--node-color":character.color } as React.CSSProperties}>
            <small>{character.code}</small><strong>{character.name}</strong><span>{character.universe}</span>
          </button>)}
          {visibleCharacters.length === 0 && <div className="universe-empty">В выбранном слое нет подтверждённых персонажей.</div>}
        </div>

        <aside className="universe-inspector ds-panel" aria-live="polite">
          <div className="universe-inspector-top"><span>{active.code}</span><em>{active.status}</em></div>
          <small className="inspector-universe">ВСЕЛЕННАЯ / {active.universe}</small>
          <h2>{active.name}</h2>
          <p>{active.summary}</p>
          <dl><div><dt>Роль</dt><dd>{active.role}</dd></div><div><dt>Статус</dt><dd>{active.status}</dd></div><div><dt>Связей</dt><dd>{activeConnections.length}</dd></div></dl>
          <div className="connection-list">
            <h3>Линии совпадений</h3>
            {activeConnections.map((connection) => {
              const otherId = connection.from === active.id ? connection.to : connection.from;
              const other = characters.find((character) => character.id === otherId)!;
              return <button type="button" key={connection.id} onClick={() => setSelected(other.id)}><span>{connection.confidence}%</span><div><strong>{connection.title}</strong><small>→ {other.name} / {other.universe}</small><p>{connection.evidence}</p></div></button>;
            })}
          </div>
          {active.link && <a className="ds-button ds-button--primary" href={active.link}>Открыть произведение</a>}
        </aside>
      </section>

      <section className="universe-legend">
        <article><strong>КАНОН</strong><p>Подтверждённые сведения из опубликованных материалов.</p></article>
        <article><strong>СОВПАДЕНИЕ</strong><p>Наблюдаемая пара мотивов, ролей, мест или предметов.</p></article>
        <article><strong>ГИПОТЕЗА</strong><p>Рабочая связь, которая не считается каноном без подтверждения автора.</p></article>
      </section>

      <footer className="universe-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Карта отделяет подтверждённый канон от редакционных гипотез.</p><span>CROSS-UNIVERSE MAP · WIP</span></footer>
    </main>
  );
}
