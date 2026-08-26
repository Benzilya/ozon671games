"use client";

import { useMemo, useState } from "react";
import { quietDan } from "../data/stories";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

type CharacterStatus = "Подтверждено" | "Ожидает данных";

type CharacterRecord = {
  id: string;
  name: string;
  code: string;
  work: string;
  status: CharacterStatus;
  role: string;
  description: string;
};

const characters: CharacterRecord[] = [
  {
    id: "tihiy-den",
    name: "Тихий Дэн",
    code: quietDan.code,
    work: quietDan.title,
    status: "Подтверждено",
    role: "Главный герой",
    description: `${quietDan.description} На странице используются только сведения, уже подтверждённые описанием произведения.`,
  },
  { id: "redacted-02", name: "REDACTED", code: "—", work: "Архив 671", status: "Ожидает данных", role: "Не указано", description: "Карточка зарезервирована. Имя, роль и связи появятся только после редакционного подтверждения." },
  { id: "redacted-03", name: "REDACTED", code: "—", work: "Архив 671", status: "Ожидает данных", role: "Не указано", description: "Карточка зарезервирована. Мы не заполняем биографию догадками или фанатскими версиями." },
  { id: "redacted-04", name: "REDACTED", code: "—", work: "Архив 671", status: "Ожидает данных", role: "Не указано", description: "Будущая карточка персонажа с источником, произведениями, связями и предупреждением о спойлерах." },
];

export default function CharactersClient() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"Все" | CharacterStatus>("Все");
  const [activeId, setActiveId] = useState(characters[0].id);
  const [spoilers, setSpoilers] = useState(false);

  const visible = useMemo(() => characters.filter((character) => {
    const matchesQuery = `${character.name} ${character.work} ${character.role}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "Все" || character.status === status;
    return matchesQuery && matchesStatus;
  }), [query, status]);

  const active = characters.find((character) => character.id === activeId) ?? characters[0];

  return (
    <main className="characters-page">
      <header className="characters-header">
        <a href={`${publicBase}/`} className="characters-brand"><span>671</span><strong>OZON 671 / STORIES</strong></a>
        <a href={`${publicBase}/audiobooks.html`}>Истории</a>
        <a href={`${publicBase}/films.html`}>AI-фильмы</a>
        <a className="characters-home" href={`${publicBase}/`}>← Главная</a>
      </header>

      <section className="characters-hero">
        <div className="characters-grid-bg" aria-hidden="true" />
        <div className="characters-hero-copy">
          <div className="case-label">PERSONNEL ARCHIVE / 671</div>
          <h1>ПЕРСОНАЖИ<br/><span>ДЕЛА</span></h1>
          <p>Энциклопедия героев строится как архив расследования. Канонические сведения отделяются от фанатских гипотез, а неподтверждённые поля остаются закрытыми.</p>
        </div>
        <div className="characters-stamp" aria-hidden="true">CASE<br/>FILES<br/><strong>671</strong></div>
      </section>

      <section className="characters-workspace">
        <div className="characters-tools">
          <label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, произведение, роль" aria-label="Поиск персонажей" /></label>
          <div className="characters-filter">{(["Все", "Подтверждено", "Ожидает данных"] as const).map((item) => <button type="button" key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item}</button>)}</div>
          <label className="spoiler-switch"><input type="checkbox" checked={spoilers} onChange={(event) => setSpoilers(event.target.checked)} /><span>Показывать спойлерные поля</span></label>
        </div>

        <div className="characters-layout">
          <div className="characters-list" aria-label="Список персонажей">
            {visible.map((character) => <button type="button" key={character.id} className={`character-file${character.id === activeId ? " active" : ""}`} onClick={() => setActiveId(character.id)}>
              <div className={`character-photo${character.status === "Ожидает данных" ? " redacted" : ""}`}><span>{character.code}</span><strong>{character.status === "Подтверждено" ? quietDan.code : "?"}</strong></div>
              <div><small>{character.work}</small><h2>{character.name}</h2><p>{character.role}</p></div>
              <span className={`character-status ${character.status === "Подтверждено" ? "verified" : "pending"}`}>{character.status}</span>
            </button>)}
            {visible.length === 0 && <div className="characters-empty">В архиве ничего не найдено.</div>}
          </div>

          <aside className="character-inspector ds-panel" aria-live="polite">
            <div className={`character-portrait${active.status === "Ожидает данных" ? " redacted" : ""}`}><small>PERSON / {active.code}</small><strong>{active.status === "Подтверждено" ? quietDan.code : "CLASSIFIED"}</strong><span>{active.status}</span></div>
            <div className="character-inspector-copy">
              <div className="ds-kicker">{active.work} / {active.code}</div>
              <h2>{active.name}</h2>
              <p>{active.description}</p>
              <dl>
                <div><dt>Роль</dt><dd>{active.role}</dd></div>
                <div><dt>Источник</dt><dd>{active.status === "Подтверждено" ? "Описание произведения" : "Ожидается"}</dd></div>
                <div><dt>Связи</dt><dd>{active.status === "Подтверждено" ? "Открыть связанные дела ниже" : "REDACTED"}</dd></div>
                <div><dt>Спойлеры</dt><dd>{spoilers ? "Поле открыто, подтверждённых данных пока нет" : "Скрыты"}</dd></div>
              </dl>
              <div className="case-crosslinks" aria-label="Связанные дела">
                {active.id === "tihiy-den" && <a href={`${publicBase}/stories/tihiy-den.html`}>Произведение / TD</a>}
                <a href={`${publicBase}/universe.html`}>Карта вселенной</a>
                <a href={`${publicBase}/films.html`}>Визуальный архив</a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="characters-rules">
        <div><div className="ds-kicker">Archive rules</div><h2>Канон отдельно.<br/>Теории отдельно.</h2></div>
        <div className="characters-rule-grid"><article><strong>01</strong><h3>Источник</h3><p>Каждый факт должен иметь редакционное происхождение или ссылку на разрешённый материал.</p></article><article><strong>02</strong><h3>Спойлеры</h3><p>Сюжетные детали в будущем будут закрываться отдельным переключателем.</p></article><article><strong>03</strong><h3>Фанатские версии</h3><p>Гипотезы сообщества будут визуально отделены от официальных сведений.</p></article></div>
      </section>

      <footer className="characters-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Персонажи добавляются только после подтверждения сведений.</p><span>PERSONNEL ARCHIVE · WIP</span></footer>
    </main>
  );
}
