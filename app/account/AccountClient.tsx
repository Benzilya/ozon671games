"use client";

import { useEffect, useMemo, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";
const playerKey = "ozon671:player:tihiy-den";
const cartKey = "ozon671:shop-cart";
const favoritesKey = "ozon671:favorites";

type PlayerSnapshot = { chapterId?: string; positionSeconds?: number; playbackRate?: number; volume?: number };
type CartItem = { id:string; variant:string; qty:number };

const tabs = ["Обзор","История","Избранное","Заказы","Моменты","Достижения","Настройки"] as const;

type Tab = (typeof tabs)[number];

export default function AccountClient() {
  const [tab,setTab] = useState<Tab>("Обзор");
  const [player,setPlayer] = useState<PlayerSnapshot>({});
  const [cart,setCart] = useState<CartItem[]>([]);
  const [favorites,setFavorites] = useState<string[]>(["Тихий Дэн"]);
  const [notice,setNotice] = useState("");

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try {
        const playerRaw=window.localStorage.getItem(playerKey);
        const cartRaw=window.localStorage.getItem(cartKey);
        const favRaw=window.localStorage.getItem(favoritesKey);
        if(playerRaw) setPlayer(JSON.parse(playerRaw));
        if(cartRaw) setCart(JSON.parse(cartRaw));
        if(favRaw) setFavorites(JSON.parse(favRaw));
      } catch {
        window.localStorage.removeItem(playerKey);
        window.localStorage.removeItem(cartKey);
        window.localStorage.removeItem(favoritesKey);
      }
    },0);
    return()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{window.localStorage.setItem(favoritesKey,JSON.stringify(favorites));},[favorites]);

  const cartCount=useMemo(()=>cart.reduce((sum,item)=>sum+item.qty,0),[cart]);
  const chapterLabel=player.chapterId ? player.chapterId.replace("chapter-","Глава ") : "Нет сохранённого прогресса";
  const position=Math.max(0,Math.floor(player.positionSeconds??0));
  const minutes=Math.floor(position/60);
  const seconds=String(position%60).padStart(2,"0");

  const toggleFavorite=(title:string)=>setFavorites((items)=>items.includes(title)?items.filter((item)=>item!==title):[...items,title]);

  return <main className="account-page">
    <header className="account-header">
      <a className="account-brand" href={`${publicBase}/`}><span>671</span><strong>OZON 671 / STORIES</strong></a>
      <nav><a href={`${publicBase}/audiobooks.html`}>Истории</a><a href={`${publicBase}/universe.html`}>Вселенная</a><a href={`${publicBase}/shop.html`}>Магазин</a></nav>
      <div className="account-state">LOCAL PROFILE</div>
    </header>

    <section className="account-hero">
      <div><div className="case-label">PROFILE / LOCAL DEVICE</div><h1>ЛИЧНЫЙ<br/><span>КАБИНЕТ</span></h1><p>Пока без серверной авторизации: данные этого прототипа живут только в localStorage текущего браузера. После backend/auth здесь появится синхронизация между устройствами.</p></div>
      <aside className="account-card ds-panel"><div className="account-avatar">671</div><div><small>Профиль</small><strong>Гость архива</strong><span>Локальный режим</span></div><em>SYNC / OFFLINE</em></aside>
    </section>

    <nav className="account-tabs" aria-label="Разделы профиля">{tabs.map((item)=><button key={item} type="button" className={tab===item?"active":""} onClick={()=>setTab(item)}>{item}</button>)}</nav>

    <section className="account-content">
      {tab==="Обзор" && <div className="account-overview">
        <article className="account-wide ds-panel"><div className="ds-kicker">Continue / Local state</div><h2>Продолжить «Тихий Дэн»</h2><p>{chapterLabel} · {minutes}:{seconds}. Скорость: {player.playbackRate??1}×.</p><a className="ds-button ds-button--primary" href={`${publicBase}/stories/tihiy-den.html`}>Продолжить слушать</a></article>
        <Metric title="В избранном" value={String(favorites.length)} note="Сохраняется локально"/>
        <Metric title="В демо-корзине" value={String(cartCount)} note="Не является заказом"/>
        <Metric title="Покупки" value="0" note="Backend не подключён"/>
        <Metric title="Достижения" value="2" note="Демо-уровень"/>
        <article className="account-note ds-panel"><strong>СИНХРОНИЗАЦИЯ</strong><p>История, покупки, заказы, уведомления и прогресс между устройствами появятся после авторизации и серверного хранилища.</p></article>
      </div>}

      {tab==="История" && <Section title="История прослушивания" kicker="Listening history"><div className="account-list"><article><span>TD</span><div><small>Локальный прогресс</small><strong>Тихий Дэн</strong><p>{chapterLabel} · позиция {minutes}:{seconds}</p></div><a href={`${publicBase}/stories/tihiy-den.html`}>Открыть →</a></article></div></Section>}

      {tab==="Избранное" && <Section title="Избранное" kicker="Saved stories"><div className="account-list">{favorites.map((title)=><article key={title}><span>★</span><div><small>Сохранено локально</small><strong>{title}</strong><p>Синхронизация появится после авторизации.</p></div><button type="button" onClick={()=>toggleFavorite(title)}>Убрать</button></article>)}{favorites.length===0&&<Empty text="Пока ничего не добавлено."/>}</div><button className="ds-button ds-button--ghost" type="button" onClick={()=>toggleFavorite("Тихий Дэн")}>{favorites.includes("Тихий Дэн")?"Убрать «Тихий Дэн»":"Добавить «Тихий Дэн»"}</button></Section>}

      {tab==="Заказы" && <Section title="Заказы и покупки" kicker="Orders / Demo"><div className="account-order-state ds-panel"><strong>Реальных заказов нет</strong><p>Текущая корзина содержит {cartCount} демо-позиций. Она не передаётся продавцу и не создаёт оплату.</p><a className="ds-button ds-button--primary" href={`${publicBase}/shop.html`}>Перейти в магазин</a></div></Section>}

      {tab==="Моменты" && <Section title="Сохранённые моменты" kicker="Bookmarks"><div className="account-grid"><article className="ds-panel"><small>FEATURE / FUTURE</small><h3>Метки внутри главы</h3><p>После подключения реального аудио здесь можно будет сохранять таймкод, комментарий и устройство.</p></article><article className="ds-panel"><small>RIGHTS AWARE</small><h3>Синхронный текст</h3><p>Текстовые цитаты и синхронизация появятся только если права позволяют их публикацию.</p></article></div></Section>}

      {tab==="Достижения" && <Section title="Достижения" kicker="Archive badges"><div className="achievement-grid"><Achievement code="01" title="В архиве" text="Открыт личный кабинет прототипа."/><Achievement code="02" title="Первое дело" text="Доступна история «Тихий Дэн»."/><Achievement code="??" title="Засекречено" text="Будущие достижения будут связаны с подтверждёнными действиями пользователя." locked/></div></Section>}

      {tab==="Настройки" && <Section title="Настройки" kicker="Preferences"><div className="settings-grid"><label><span>Уведомления</span><select defaultValue="important"><option value="important">Только важные</option><option value="all">Все</option><option value="off">Выключены</option></select></label><label><span>Автовоспроизведение</span><select defaultValue="off"><option value="off">Выключено</option><option value="on">Включено</option></select></label><button type="button" onClick={()=>{window.localStorage.removeItem(playerKey);setPlayer({});setNotice("Локальный прогресс очищен")}}>Очистить локальный прогресс</button><button type="button" onClick={()=>{window.localStorage.removeItem(cartKey);setCart([]);setNotice("Демо-корзина очищена")}}>Очистить демо-корзину</button></div></Section>}
    </section>

    {notice&&<div className="account-toast" role="status">{notice}</div>}
    <footer className="account-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Личный кабинет работает локально до подключения auth/backend.</p><span>PROFILE · LOCAL</span></footer>
  </main>;
}

function Metric({title,value,note}:{title:string;value:string;note:string}){return <article className="account-metric ds-panel"><small>{title}</small><strong>{value}</strong><span>{note}</span></article>}
function Section({title,kicker,children}:{title:string;kicker:string;children:React.ReactNode}){return <div className="account-section"><div className="ds-kicker">{kicker}</div><h2>{title}</h2>{children}</div>}
function Empty({text}:{text:string}){return <div className="account-empty">{text}</div>}
function Achievement({code,title,text,locked=false}:{code:string;title:string;text:string;locked?:boolean}){return <article className={`achievement ds-panel${locked?" locked":""}`}><span>{code}</span><h3>{title}</h3><p>{text}</p></article>}
