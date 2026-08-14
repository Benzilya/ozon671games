"use client";

import { useMemo, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

type TimelineKind = "Подтверждено" | "Редакционная заглушка" | "Альтернативная версия";

type TimelineEntry = {
  id: string;
  marker: string;
  title: string;
  work: string;
  kind: TimelineKind;
  text: string;
};

const entries: TimelineEntry[] = [
  {
    id: "quiet-dan-entry",
    marker: "DATE / NOT SPECIFIED",
    title: "История Тихого Дэна",
    work: "Тихий Дэн",
    kind: "Подтверждено",
    text: "Из подтверждённого описания известно только, что жизнь обычного мойщика полов меняется после цепочки загадочных событий. Точная внутренняя дата и порядок конкретных событий пока не фиксируются.",
  },
  { id: "gap-01", marker: "CHRONOLOGY / REDACTED", title: "Событие ожидает редакционной проверки", work: "Вселенная 671", kind: "Редакционная заглушка", text: "Здесь появится каноническое событие после подтверждения даты, участников, произведения и источника." },
  { id: "gap-02", marker: "CONNECTION / REDACTED", title: "Связь между произведениями", work: "Вселенная 671", kind: "Редакционная заглушка", text: "Точка будущей связи между историями. До проверки она не считается частью канона." },
  { id: "alt-01", marker: "ALT / SEPARATE LAYER", title: "Альтернативные версии", work: "Отдельный слой", kind: "Альтернативная версия", text: "Фанатские и альтернативные трактовки будут отображаться отдельно от основной хронологии, чтобы не смешивать версии событий." },
];

const kinds: Array<"Все" | TimelineKind> = ["Все", "Подтверждено", "Редакционная заглушка", "Альтернативная версия"];

export default function TimelineClient() {
  const [kind, setKind] = useState<(typeof kinds)[number]>("Все");
  const [spoilers, setSpoilers] = useState(false);
  const [selected, setSelected] = useState(entries[0].id);

  const visible = useMemo(() => kind === "Все" ? entries : entries.filter((entry) => entry.kind === kind), [kind]);
  const active = entries.find((entry) => entry.id === selected) ?? entries[0];

  return (
    <main className="timeline-page">
      <header className="timeline-header">
        <a className="timeline-brand" href={`${publicBase}/`}><span>671</span><strong>OZON 671 / STORIES</strong></a>
        <nav><a href={`${publicBase}/audiobooks.html`}>Истории</a><a href={`${publicBase}/characters.html`}>Персонажи</a><a href={`${publicBase}/films.html`}>AI-фильмы</a></nav>
        <a className="timeline-home" href={`${publicBase}/`}>← Главная</a>
      </header>

      <section className="timeline-hero">
        <div className="timeline-grid-bg" aria-hidden="true" />
        <div className="timeline-copy"><div className="case-label">CHRONOLOGY / CASE 671</div><h1>ХРОНОЛОГИЯ<br/><span>СОБЫТИЙ</span></h1><p>Лента времени строится только из подтверждённых фактов. Неизвестные даты остаются неизвестными, альтернативные версии вынесены в отдельный слой.</p></div>
        <div className="timeline-scale" aria-hidden="true"><span>PAST</span><i/><i/><i/><i/><strong>?</strong><i/><i/><span>FUTURE</span></div>
      </section>

      <section className="timeline-controls">
        <div className="timeline-filters">{kinds.map((item)=><button type="button" key={item} className={kind===item?"active":""} onClick={()=>setKind(item)}>{item}</button>)}</div>
        <label className="timeline-spoilers"><input type="checkbox" checked={spoilers} onChange={(event)=>setSpoilers(event.target.checked)}/><span>Спойлерный слой</span></label>
      </section>

      <section className="timeline-workspace">
        <div className="timeline-track">
          {visible.map((entry,index)=><button type="button" key={entry.id} className={`timeline-event ${entry.kind === "Подтверждено" ? "verified" : entry.kind === "Альтернативная версия" ? "alternate" : "pending"}${selected===entry.id?" active":""}`} onClick={()=>setSelected(entry.id)}>
            <div className="timeline-node"><span>{String(index+1).padStart(2,"0")}</span></div>
            <div className="timeline-event-copy"><small>{entry.marker}</small><h2>{entry.title}</h2><p>{entry.work}</p><em>{entry.kind}</em></div>
          </button>)}
        </div>

        <aside className="timeline-inspector ds-panel" aria-live="polite">
          <div className="timeline-inspector-top"><small>{active.marker}</small><span>{active.kind}</span></div>
          <h2>{active.title}</h2>
          <p>{active.text}</p>
          <dl><div><dt>Произведение</dt><dd>{active.work}</dd></div><div><dt>Точная дата</dt><dd>{active.id === "quiet-dan-entry" ? "Не указана" : "Ожидается"}</dd></div><div><dt>Канон</dt><dd>{active.kind === "Подтверждено" ? "Только общая завязка" : "Нет"}</dd></div><div><dt>Спойлеры</dt><dd>{spoilers ? "Слой включён; подтверждённых дополнительных данных нет" : "Скрыты"}</dd></div></dl>
          {active.id === "quiet-dan-entry" && <a className="ds-button ds-button--primary" href={`${publicBase}/stories/tihiy-den.html`}>Открыть «Тихий Дэн»</a>}
        </aside>
      </section>

      <section className="timeline-legend"><div><strong>КАК ЧИТАТЬ ЛЕНТУ</strong><p>Красный узел — подтверждённая точка. Серый — место под редакционные данные. Пунктирный — альтернативная версия, не смешанная с каноном.</p></div><div><strong>ПОЧЕМУ НЕТ ДАТ?</strong><p>Мы не придумываем годы и последовательность событий, пока они не подтверждены материалами проекта.</p></div></section>
      <footer className="timeline-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Хронология обновляется только после редакционной проверки.</p><span>CHRONOLOGY · WIP</span></footer>
    </main>
  );
}
