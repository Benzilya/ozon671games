"use client";

import { useEffect, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";
const pollKey = "ozon671:community-poll";

const pollOptions = ["Ночной город", "Старые подъезды", "Провинциальная мистика", "Космический архив"];

const posts = [
  { id:"stream", type:"Эфир", title:"Разговор после полуночи", text:"Карточка будущего стрима. Дата и время должны приходить из CMS; сейчас событие не анонсировано как реальное.", label:"SCHEDULE / CMS", action:"status" as const },
  { id:"fan-art", type:"Фан-работа", title:"Архив фан-арта", text:"Место для работ сообщества с обязательным указанием автора, разрешения на публикацию и статуса материала.", label:"FAN WORK", action:"submit" as const },
  { id:"theory", type:"Обсуждение", title:"Теории вселенной", text:"Фанатские гипотезы не смешиваются с каноном и всегда отображаются как пользовательские трактовки.", label:"NOT CANON", action:"universe" as const },
];

export default function CommunityClient(){
  const [vote,setVote]=useState("");
  const [submitted,setSubmitted]=useState(false);

  useEffect(()=>{
    const timer=window.setTimeout(()=>setVote(window.localStorage.getItem(pollKey)??""),0);
    return()=>window.clearTimeout(timer);
  },[]);

  const choose=(value:string)=>{setVote(value);window.localStorage.setItem(pollKey,value)};

  return <main className="community-page">
    <header className="community-header"><a className="community-brand" href={`${publicBase}/`}><span>671</span><strong>OZON 671 / STORIES</strong></a><nav><a href={`${publicBase}/audiobooks.html`}>Истории</a><a href={`${publicBase}/universe.html`}>Вселенная</a><a href={`${publicBase}/shop.html`}>Магазин</a></nav><a href={`${publicBase}/account.html`}>Профиль</a></header>
    <section className="community-hero"><div className="case-label">COMMUNITY SIGNAL / 671</div><h1>СООБЩЕСТВО<br/><span>В ЭФИРЕ</span></h1><p>Респект фанам. Здесь будут стримы, обсуждения, фан-арты и пользовательские работы — с чётким разделением авторства, канона и AI-материалов.</p></section>

    <section className="community-feed"><div className="community-heading"><div><div className="ds-kicker">Feed / Community</div><h2>Поток архива</h2></div><p>Только реальные действия: неподключённые материалы помечаются статусом, а не маскируются под неработающие кнопки.</p></div><div className="community-post-grid">{posts.map((post)=><article className="community-post ds-panel" key={post.id}><div><small>{post.label}</small><span>{post.type}</span></div><h3>{post.title}</h3><p>{post.text}</p><div className="community-post-action">{post.action==="status"&&<span className="community-post-status">ОЖИДАЕТ ДАННЫХ ИЗ CMS</span>}{post.action==="submit"&&<a href="#submit-work">ПРЕДЛОЖИТЬ РАБОТУ →</a>}{post.action==="universe"&&<a href={`${publicBase}/universe.html`}>СВЕРИТЬСЯ С КАНОНОМ →</a>}</div></article>)}</div></section>

    <section className="community-poll"><div><div className="ds-kicker">Community poll / Local demo</div><h2>Какую атмосферу исследовать глубже?</h2><p>Голос хранится только в этом браузере. Итоги не считаются настоящим голосованием без backend.</p></div><div className="poll-options">{pollOptions.map((option)=><button type="button" key={option} className={vote===option?"active":""} onClick={()=>choose(option)}><span>{vote===option?"●":"○"}</span>{option}</button>)}</div></section>

    <section className="community-channels"><div className="community-heading"><div><div className="ds-kicker">External channels</div><h2>Каналы проекта</h2></div><p>Ссылки, уже указанные проектом.</p></div><div className="channel-grid"><a href="https://youtube.com/@ozon671games3" target="_blank" rel="noreferrer"><small>VIDEO</small><strong>YouTube</strong><span>@ozon671games3 →</span></a><a href="https://t.me/ozon671games3official" target="_blank" rel="noreferrer"><small>NEWS</small><strong>Telegram</strong><span>official →</span></a><a href="https://boosty.to/ozon671games3" target="_blank" rel="noreferrer"><small>SUPPORT</small><strong>Boosty</strong><span>ozon671games3 →</span></a></div></section>

    <section className="community-submit" id="submit-work"><div><div className="ds-kicker">Submission / Prototype</div><h2>Отправить работу</h2><p>В production форма должна передавать файл через защищённый backend и собирать подтверждение авторства/прав. Сейчас ничего не загружается на сервер.</p></div>{submitted?<div className="submit-success ds-panel"><strong>Демо-заявка подготовлена</strong><p>Никакой файл не был отправлен. После подключения backend здесь появится номер заявки и статус модерации.</p><button type="button" onClick={()=>setSubmitted(false)}>Вернуться к форме</button></div>:<form className="submit-form ds-panel" onSubmit={(event)=>{event.preventDefault();setSubmitted(true)}}><label>Псевдоним<input required placeholder="Автор работы"/></label><label>Тип работы<select defaultValue="fan-art"><option value="fan-art">Фан-арт</option><option value="video">Видео</option><option value="text">Текст / теория</option><option value="other">Другое</option></select></label><label>Ссылка на материал<input required type="url" placeholder="https://…"/></label><label className="submit-check"><input required type="checkbox"/>Я подтверждаю, что имею право передать материал для рассмотрения.</label><label className="submit-check"><input type="checkbox"/>Материал создан или существенно обработан с помощью ИИ.</label><button className="ds-button ds-button--primary" type="submit">Подготовить демо-заявку</button></form>}</section>

    <footer className="community-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Фан-работы публикуются только с указанием автора и прав.</p><span>COMMUNITY · PUBLIC ARCHIVE</span></footer>
  </main>;
}
