"use client";

import { useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

const sections = [
  { id:"works", title:"Произведения", count:"10", note:"Название, описание, жанры, статус публикации, права и подтверждённые метаданные." },
  { id:"chapters", title:"Главы и аудио", count:"—", note:"Порядок глав, аудио-asset, длительность и права на синхронный текст." },
  { id:"films", title:"Фильмы и видео", count:"—", note:"AI-disclosure, авторство, fan-work status, видео-asset и публикация." },
  { id:"characters", title:"Персонажи", count:"1+", note:"Проверенные карточки, редакционные заглушки, spoiler level и canon status." },
  { id:"products", title:"Товары", count:"6 demo", note:"Цена, валюта, остаток, варианты и тираж должны поступать только с сервера/CMS." },
  { id:"orders", title:"Заказы", count:"0 real", note:"Серверные записи оплаты и доставки. Демо-корзина браузера сюда не попадает." },
  { id:"events", title:"События", count:"—", note:"Эфиры, премьеры и подтверждённые точки хронологии." },
  { id:"comments", title:"Комментарии", count:"—", note:"Очередь модерации: pending / approved / rejected." },
  { id:"links", title:"Внешние ссылки", count:"3 known", note:"YouTube, Telegram, Boosty и будущие подтверждённые каналы." },
];

const rules = [
  ["RIGHTS", "Медиа публикуется только при rightsStatus = cleared."],
  ["AI", "AI-assisted и AI-generated материалы всегда получают видимую маркировку."],
  ["CANON", "Fan/alternate слой не смешивается с подтверждённым каноном."],
  ["COMMERCE", "Цена, остаток, тираж и реальные заказы принадлежат backend/CMS."],
  ["TRANSCRIPT", "Синхронный текст доступен только при подтверждённых правах."],
];

export default function AdminClient(){
  const [active,setActive]=useState(sections[0].id);
  const current=sections.find((item)=>item.id===active)??sections[0];
  return <main className="admin-page">
    <header className="admin-header"><a href={`${publicBase}/`}><span>671</span><strong>CMS MODEL</strong></a><div>READ ONLY / FRONTEND PROTOTYPE</div></header>
    <aside className="admin-sidebar"><div className="admin-sidebar-title">CONTENT TYPES</div>{sections.map((item)=><button type="button" key={item.id} className={active===item.id?"active":""} onClick={()=>setActive(item.id)}><span>{item.title}</span><b>{item.count}</b></button>)}<a href={`${publicBase}/`}>← Публичный сайт</a></aside>
    <section className="admin-main">
      <div className="admin-hero"><div className="case-label">BACKOFFICE / CONTRACT PREVIEW</div><h1>CMS / ADMIN</h1><p>Это не подключённая админка, а read-only модель будущей системы управления. Реальные изменения контента должны выполняться через защищённый backend, а не из публичного JavaScript.</p></div>
      <div className="admin-grid">
        <article className="admin-current ds-panel"><div className="admin-card-top"><small>SELECTED ENTITY</small><span>{current.count}</span></div><h2>{current.title}</h2><p>{current.note}</p><div className="admin-fields"><span>ID / slug</span><span>publicationStatus</span><span>rightsStatus</span><span>timestamps</span><span>audit trail — backend</span></div><button type="button" disabled>Редактирование после backend/auth</button></article>
        <article className="admin-rules ds-panel"><small>PUBLISHING GATES</small><h2>Правила публикации</h2>{rules.map(([code,text])=><div key={code}><strong>{code}</strong><p>{text}</p></div>)}</article>
      </div>
      <section className="admin-flow"><div><span>01</span><strong>DRAFT</strong><p>Редактор создаёт запись.</p></div><i>→</i><div><span>02</span><strong>REVIEW</strong><p>Проверяются права, метаданные и маркировки.</p></div><i>→</i><div><span>03</span><strong>PUBLISHED</strong><p>Публичный frontend получает только разрешённые поля.</p></div></section>
      <section className="admin-backend"><div className="ds-kicker">Architecture boundary</div><h2>Что останется на сервере</h2><div><article><strong>AUTH</strong><p>Пользователи, роли редакторов, сессии и синхронизация устройств.</p></article><article><strong>PAYMENTS</strong><p>Создание заказов, webhook платёжного провайдера и статусы оплаты.</p></article><article><strong>DELIVERY</strong><p>CDEK/перевозчик, расчёт, адреса и трекинг.</p></article><article><strong>MEDIA</strong><p>Защищённое хранение мастер-файлов и выдача разрешённых публичных URL.</p></article></div></section>
    </section>
  </main>;
}
