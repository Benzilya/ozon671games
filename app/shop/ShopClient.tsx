"use client";

import { useEffect, useMemo, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";
const storageKey = "ozon671:shop-cart";

type Category = "Печатные издания" | "Коллекционное" | "Постеры" | "Одежда" | "Аксессуары" | "Цифровое";
type Product = { id:string; title:string; category:Category; code:string; description:string; variants:string[]; status:string };
type CartItem = { id:string; variant:string; qty:number };

const products: Product[] = [
  { id:"quiet-dan-book", title:"Тихий Дэн — печатное издание", category:"Печатные издания", code:"TD / BOOK", description:"Концепт карточки будущего печатного издания: твёрдый переплёт, тиснение и полноцветные материалы — только после подтверждения финальной комплектации.", variants:["Базовое издание","Коллекционное издание"], status:"Цена и тираж — из CMS" },
  { id:"quiet-dan-collector", title:"Тихий Дэн — коллекционный комплект", category:"Коллекционное", code:"TD / COLLECTOR", description:"Премиальный комплект с будущими вариантами вложений. Состав, автограф и лимит не фиксируются до подтверждения.", variants:["Стандарт","Расширенный комплект"], status:"Предзаказ после настройки CMS" },
  { id:"archive-poster", title:"Архив 671 — постер", category:"Постеры", code:"671 / POSTER", description:"Дизайнерский постер в стилистике архива 671. Финальный арт должен использоваться только при наличии прав.", variants:["A3","A2"], status:"Цена — из CMS" },
  { id:"archive-shirt", title:"Archive 671 — футболка", category:"Одежда", code:"671 / WEAR", description:"Интерфейсная карточка будущего мерча. Макеты, ткань и размерная сетка будут подтверждены отдельно.", variants:["S","M","L","XL"], status:"Наличие — из CMS" },
  { id:"case-pin", title:"Case 671 — аксессуар", category:"Аксессуары", code:"671 / PIN", description:"Заглушка категории аксессуаров без фиксации материалов и комплектации.", variants:["Версия 01"], status:"Характеристики — из CMS" },
  { id:"digital-archive", title:"Цифровой архив материалов", category:"Цифровое", code:"671 / DIGITAL", description:"Место для легально распространяемых цифровых материалов проекта. Состав определяется правами и CMS.", variants:["Digital"], status:"Доступность — из CMS" },
];

const categories: Array<"Все" | Category> = ["Все","Печатные издания","Коллекционное","Постеры","Одежда","Аксессуары","Цифровое"];

export default function ShopClient() {
  const [category,setCategory] = useState<(typeof categories)[number]>("Все");
  const [cart,setCart] = useState<CartItem[]>([]);
  const [drawer,setDrawer] = useState(false);
  const [notice,setNotice] = useState("");

  useEffect(()=>{
    const timer = window.setTimeout(()=>{
      try { const raw = window.localStorage.getItem(storageKey); if(raw) setCart(JSON.parse(raw)); } catch { window.localStorage.removeItem(storageKey); }
    },0);
    return ()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{ window.localStorage.setItem(storageKey,JSON.stringify(cart)); },[cart]);

  const visible = useMemo(()=>category === "Все" ? products : products.filter((product)=>product.category===category),[category]);
  const count = cart.reduce((sum,item)=>sum+item.qty,0);

  const add = (product:Product,variant:string) => {
    setCart((items)=>{
      const found = items.find((item)=>item.id===product.id && item.variant===variant);
      if(found) return items.map((item)=>item===found?{...item,qty:item.qty+1}:item);
      return [...items,{id:product.id,variant,qty:1}];
    });
    setNotice("Добавлено в демо-корзину");
    window.setTimeout(()=>setNotice(""),1600);
  };

  const changeQty = (target:CartItem,delta:number) => setCart((items)=>items.flatMap((item)=>{
    if(item.id!==target.id || item.variant!==target.variant) return [item];
    const qty=item.qty+delta;
    return qty>0?[{...item,qty}]:[];
  }));

  return <main className="shop-page">
    <header className="shop-header">
      <a className="shop-brand" href={`${publicBase}/`}><span>671</span><strong>OZON 671 / STORIES</strong></a>
      <nav><a href={`${publicBase}/audiobooks.html`}>Истории</a><a href={`${publicBase}/universe.html`}>Вселенная</a><a href={`${publicBase}/films.html`}>AI-фильмы</a></nav>
      <button type="button" className="shop-cart-button" onClick={()=>setDrawer(true)}>Корзина <b>{count}</b></button>
    </header>

    <section className="shop-hero">
      <div className="case-label">ARTIFACT STORE / CASE 671</div>
      <h1>МАГАЗИН<br/><span>АРТЕФАКТОВ</span></h1>
      <p>Физические и цифровые материалы вселенной. Пока это демонстрационный storefront: реальные цены, остатки, тиражи и характеристики должны поступать из CMS.</p>
    </section>

    <section className="shop-featured">
      <div className="shop-book-visual"><small>COLLECTOR FILE / TD-671</small><strong>ТИХИЙ<br/>ДЭН</strong><span>CONCEPT EDITION</span></div>
      <div><div className="ds-kicker">Featured artifact</div><h2>Печатное издание «Тихий Дэн»</h2><p>Карточка готова для будущей галереи, комплектации, вариантов издания, реального остатка и доставки. Сейчас интерфейс намеренно не показывает выдуманную цену.</p><div className="shop-specs"><span>Твёрдый переплёт — концепт</span><span>Тиснение — концепт</span><span>Иллюстрации — только с правами</span><span>Тираж — из CMS</span></div><button className="ds-button ds-button--primary" type="button" onClick={()=>add(products[0],products[0].variants[0])}>Добавить демо-предзаказ</button></div>
    </section>

    <section className="shop-catalog">
      <div className="shop-section-head"><div><div className="ds-kicker">Catalog / Artifacts</div><h2>Каталог</h2></div><p>Все карточки ниже — структура будущего магазина. Никакие цены и остатки не считаются официальными до подключения CMS.</p></div>
      <div className="shop-filters">{categories.map((item)=><button type="button" key={item} className={category===item?"active":""} onClick={()=>setCategory(item)}>{item}</button>)}</div>
      <div className="shop-grid">{visible.map((product)=><ProductCard key={product.id} product={product} onAdd={add}/>)}</div>
    </section>

    <section className="shop-service">
      <article><strong>ДОСТАВКА</strong><p>Для production потребуется подключение CDEK API или другого подтверждённого перевозчика. Сейчас расчёт стоимости и сроков не выполняется.</p></article>
      <article><strong>ВОЗВРАТЫ</strong><p>Условия возврата должны быть заполнены юридически корректными правилами продавца перед запуском реальных продаж.</p></article>
      <article><strong>ОПЛАТА</strong><p>Checkout демонстрационный. Реальные платёжные данные не собираются и списаний не происходит.</p></article>
    </section>

    {drawer && <div className="cart-layer" role="dialog" aria-modal="true" aria-label="Корзина"><button className="cart-backdrop" type="button" aria-label="Закрыть корзину" onClick={()=>setDrawer(false)}/><aside className="cart-drawer"><div className="cart-head"><div><small>ORDER / DEMO</small><h2>Корзина</h2></div><button type="button" onClick={()=>setDrawer(false)}>×</button></div>{cart.length===0?<div className="cart-empty"><strong>Корзина пуста</strong><p>Добавьте будущий артефакт из каталога.</p></div>:<div className="cart-items">{cart.map((item)=>{const product=products.find((p)=>p.id===item.id)!;return <article key={`${item.id}-${item.variant}`}><div><small>{product.code}</small><strong>{product.title}</strong><span>{item.variant}</span></div><div className="cart-qty"><button type="button" onClick={()=>changeQty(item,-1)}>−</button><b>{item.qty}</b><button type="button" onClick={()=>changeQty(item,1)}>+</button></div></article>})}</div>}<div className="cart-total"><span>Стоимость</span><strong>Будет рассчитана из CMS</strong></div><button className="ds-button ds-button--primary" type="button" disabled={!cart.length} onClick={()=>{setNotice("Демо-заказ сформирован — списания нет");setDrawer(false)}}>Оформить демо-заказ</button><p className="cart-warning">Это прототип checkout. Платёж не производится.</p></aside></div>}
    {notice && <div className="shop-toast" role="status">{notice}</div>}
    <footer className="shop-footer"><a href={`${publicBase}/`}>OZON 671 / STORIES</a><p>Продажи включаются только после CMS, юридических условий и платёжного провайдера.</p><span>STORE · DEMO</span></footer>
  </main>;
}

function ProductCard({product,onAdd}:{product:Product;onAdd:(product:Product,variant:string)=>void}) {
  const [variant,setVariant] = useState(product.variants[0]);
  return <article className="shop-card ds-panel"><div className="shop-card-visual"><small>{product.code}</small><strong>{product.code.split(" / ")[0]}</strong><span>{product.category}</span></div><div className="shop-card-copy"><small>{product.status}</small><h3>{product.title}</h3><p>{product.description}</p><label>Вариант<select value={variant} onChange={(event)=>setVariant(event.target.value)}>{product.variants.map((item)=><option key={item}>{item}</option>)}</select></label><div className="shop-card-bottom"><strong>Цена — из CMS</strong><button type="button" onClick={()=>onAdd(product,variant)}>В корзину</button></div></div></article>;
}
