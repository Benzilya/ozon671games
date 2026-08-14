"use client";

import { FormEvent, useMemo, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";
const urlKey = "ozon671:admin-api-url";
const tokenKey = "ozon671:admin-api-token";

type Work = {
  id: string;
  slug: string;
  title: string;
  description: string;
  publicationStatus: "draft" | "review" | "published" | "archived";
  rightsStatus: "unverified" | "cleared" | "restricted" | "expired";
  year: number | null;
  durationSeconds: number | null;
  ageRating: string | null;
};

type Asset = {
  id: string;
  kind: "image" | "audio" | "video" | "document";
  url: string;
  rightsStatus: "unverified" | "cleared" | "restricted" | "expired";
  aiDisclosure: "none" | "ai-assisted" | "ai-generated";
};

const sections = [
  { id:"works", title:"Произведения", note:"Создание draft, редактура, rights gate и публикация через защищённый API." },
  { id:"media", title:"Медиа / R2", note:"Регистрация asset metadata, загрузка файла и перевод прав после проверки." },
  { id:"chapters", title:"Главы и аудио", note:"Порядок глав, audio asset, длительность и права на синхронный текст." },
  { id:"films", title:"Фильмы и видео", note:"AI disclosure, авторство, fan-work status, video asset и публикация." },
  { id:"characters", title:"Персонажи", note:"Проверенные карточки, spoiler level и canon status." },
  { id:"products", title:"Товары", note:"Цена, валюта, остаток, варианты и тираж должны поступать только с backend/CMS." },
  { id:"comments", title:"Комментарии", note:"Очередь модерации pending / approved / rejected." },
];

const rules = [
  ["RIGHTS", "Материал публикуется только после rightsStatus = cleared."],
  ["AI", "AI-assisted и AI-generated материалы всегда получают видимую маркировку."],
  ["SECRET", "Admin token живёт только в sessionStorage текущей вкладки и не попадает в bundle."],
  ["CORS", "Worker принимает browser-CMS только с точного ADMIN_ALLOWED_ORIGIN."],
  ["COMMERCE", "Цена, остаток, тираж и реальные заказы принадлежат backend/CMS."],
];

function normalizeApiUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function sessionValue(key: string) {
  return typeof window === "undefined" ? "" : window.sessionStorage.getItem(key) ?? "";
}

export default function AdminClient(){
  const [active,setActive]=useState(sections[0].id);
  const [apiUrl,setApiUrl]=useState(()=>sessionValue(urlKey));
  const [token,setToken]=useState(()=>sessionValue(tokenKey));
  const [connected,setConnected]=useState(false);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("Backend не подключён");
  const [works,setWorks]=useState<Work[]>([]);
  const [selectedId,setSelectedId]=useState("");
  const [createdAsset,setCreatedAsset]=useState<Asset | null>(null);

  const current=sections.find((item)=>item.id===active)??sections[0];
  const selected=works.find((item)=>item.id===selectedId) ?? works[0] ?? null;
  const counts=useMemo(()=>({works: connected ? String(works.length) : "—", media: createdAsset ? "1 session" : "—"}),[connected,works.length,createdAsset]);

  const request = async <T,>(path:string, init:RequestInit={}) => {
    const base=normalizeApiUrl(apiUrl);
    if(!base || !token) throw new Error("Укажите backend URL и admin token");
    const headers=new Headers(init.headers);
    headers.set("Authorization",`Bearer ${token}`);
    if(init.body && !(init.body instanceof Blob) && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type","application/json");
    const response=await fetch(`${base}${path}`,{...init,headers});
    const contentType=response.headers.get("content-type") ?? "";
    const payload=contentType.includes("application/json") ? await response.json() : null;
    if(!response.ok) throw new Error(payload?.message ?? payload?.error ?? `HTTP ${response.status}`);
    return payload as T;
  };

  const loadWorks=async()=>{
    const payload=await request<{data:Work[]}>("/api/admin/works");
    setWorks(payload.data);
    if(!selectedId && payload.data[0]) setSelectedId(payload.data[0].id);
  };

  const connect=async(event?:FormEvent)=>{
    event?.preventDefault();
    setBusy(true);
    try{
      const base=normalizeApiUrl(apiUrl);
      window.sessionStorage.setItem(urlKey,base);
      window.sessionStorage.setItem(tokenKey,token);
      const health=await request<{ok:boolean;databaseConfigured:boolean;mediaConfigured:boolean}>("/api/admin/health");
      if(!health.ok) throw new Error("Backend health check failed");
      setConnected(true);
      setNotice(`D1: online · R2: ${health.mediaConfigured ? "online" : "not configured"}`);
      await loadWorks();
    }catch(error){
      setConnected(false);
      setNotice(error instanceof Error ? error.message : "Ошибка подключения");
    }finally{setBusy(false)}
  };

  const disconnect=()=>{
    window.sessionStorage.removeItem(urlKey);
    window.sessionStorage.removeItem(tokenKey);
    setToken("");setConnected(false);setWorks([]);setCreatedAsset(null);setNotice("Сессия CMS закрыта");
  };

  const createWork=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setBusy(true);
    try{
      const form=new FormData(event.currentTarget);
      const payload=await request<{data:Work}>("/api/admin/works",{method:"POST",body:JSON.stringify({title:form.get("title"),slug:form.get("slug"),description:form.get("description")})});
      setNotice(`Draft создан: ${payload.data.title}`);event.currentTarget.reset();await loadWorks();setSelectedId(payload.data.id);
    }catch(error){setNotice(error instanceof Error?error.message:"Ошибка создания")}finally{setBusy(false)}
  };

  const patchWork=async(patch:Partial<Pick<Work,"publicationStatus"|"rightsStatus"|"title"|"description">>)=>{
    if(!selected)return;setBusy(true);
    try{
      const payload=await request<{data:Work}>(`/api/admin/works/${encodeURIComponent(selected.id)}`,{method:"PATCH",body:JSON.stringify(patch)});
      setWorks((items)=>items.map((item)=>item.id===payload.data.id?payload.data:item));
      setNotice(`Сохранено: ${payload.data.title}`);
    }catch(error){setNotice(error instanceof Error?error.message:"Ошибка сохранения")}finally{setBusy(false)}
  };

  const createAsset=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setBusy(true);
    try{
      const form=new FormData(event.currentTarget);
      const payload=await request<{data:Asset}>("/api/admin/assets",{method:"POST",body:JSON.stringify({kind:form.get("kind"),storageKey:form.get("storageKey"),aiDisclosure:form.get("aiDisclosure"),alt:form.get("alt")})});
      setCreatedAsset(payload.data);setNotice(`Asset зарегистрирован: ${payload.data.id}`);
    }catch(error){setNotice(error instanceof Error?error.message:"Ошибка asset")}finally{setBusy(false)}
  };

  const uploadAsset=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(!createdAsset)return;
    const form=new FormData(event.currentTarget);const file=form.get("file");
    if(!(file instanceof File)||!file.size){setNotice("Выберите файл");return}
    setBusy(true);
    try{
      await request(`/api/admin/media/${encodeURIComponent(createdAsset.id)}`,{method:"PUT",headers:{"Content-Type":file.type||"application/octet-stream"},body:file});
      setNotice(`R2 upload завершён: ${file.name}`);event.currentTarget.reset();
    }catch(error){setNotice(error instanceof Error?error.message:"Ошибка загрузки")}finally{setBusy(false)}
  };

  const patchAssetRights=async(rightsStatus:Asset["rightsStatus"])=>{
    if(!createdAsset)return;
    setBusy(true);
    try{
      const payload=await request<{data:Asset}>(`/api/admin/assets/${createdAsset.id}`,{method:"PATCH",body:JSON.stringify({rightsStatus})});
      setCreatedAsset(payload.data);
      setNotice(`Права asset: ${payload.data.rightsStatus}`);
    }catch(error){
      setNotice(error instanceof Error?error.message:"Ошибка прав");
    }finally{
      setBusy(false);
    }
  };

  return <main className="admin-page">
    <header className="admin-header"><a href={`${publicBase}/`}><span>671</span><strong>CMS OPERATOR</strong></a><div className={connected?"admin-status online":"admin-status"}>{connected?"CONNECTED":"OFFLINE"} · {notice}</div></header>
    <aside className="admin-sidebar"><div className="admin-sidebar-title">CONTENT TYPES</div>{sections.map((item)=><button type="button" key={item.id} className={active===item.id?"active":""} onClick={()=>setActive(item.id)}><span>{item.title}</span><b>{counts[item.id as keyof typeof counts]??"—"}</b></button>)}<a href={`${publicBase}/`}>← Публичный сайт</a></aside>
    <section className="admin-main">
      <div className="admin-hero"><div className="case-label">BACKOFFICE / PROTECTED API CONSOLE</div><h1>CMS / ADMIN</h1><p>Операторская консоль не содержит секретов в исходном коде. Backend URL и bearer token вводятся вручную и живут только в sessionStorage текущей вкладки. Без D1/R2 bindings интерфейс остаётся безопасно неактивным.</p></div>

      <form className="admin-connect ds-panel" onSubmit={connect}>
        <label><span>BACKEND URL</span><input type="url" required value={apiUrl} onChange={(event)=>setApiUrl(event.target.value)} placeholder="https://api.example.com" autoComplete="off"/></label>
        <label><span>ADMIN TOKEN</span><input type="password" required value={token} onChange={(event)=>setToken(event.target.value)} placeholder="Bearer secret" autoComplete="off"/></label>
        <button type="submit" disabled={busy}>{busy?"Проверка…":"Подключиться"}</button>
        <button type="button" className="ghost" onClick={disconnect}>Закрыть сессию</button>
      </form>

      <div className="admin-grid">
        <article className="admin-current ds-panel"><div className="admin-card-top"><small>SELECTED ENTITY</small><span>{counts[current.id as keyof typeof counts]??"—"}</span></div><h2>{current.title}</h2><p>{current.note}</p>
          {active==="works" ? <WorksConsole connected={connected} works={works} selected={selected} setSelectedId={setSelectedId} createWork={createWork} patchWork={patchWork} busy={busy}/> : active==="media" ? <MediaConsole connected={connected} createdAsset={createdAsset} createAsset={createAsset} uploadAsset={uploadAsset} patchAsset={patchAssetRights} busy={busy}/> : <div className="admin-placeholder"><strong>API contract ready</strong><p>UI для этого content type будет подключаться к уже определённой D1-схеме после появления соответствующих write endpoints. Неизвестные данные здесь не симулируются.</p></div>}
        </article>
        <article className="admin-rules ds-panel"><small>PUBLISHING GATES</small><h2>Правила публикации</h2>{rules.map(([code,text])=><div key={code}><strong>{code}</strong><p>{text}</p></div>)}</article>
      </div>
      <section className="admin-flow"><div><span>01</span><strong>DRAFT</strong><p>Запись создаётся без права публикации.</p></div><i>→</i><div><span>02</span><strong>RIGHTS / REVIEW</strong><p>Редактор подтверждает метаданные, права и AI disclosure.</p></div><i>→</i><div><span>03</span><strong>PUBLISHED</strong><p>Worker пропускает только материал, прошедший rights gate.</p></div></section>
      <section className="admin-backend"><div className="ds-kicker">Architecture boundary</div><h2>Что остаётся серверным</h2><div><article><strong>AUTH</strong><p>Пользовательские identity и роли не заменяются admin token.</p></article><article><strong>PAYMENTS</strong><p>Заказы и webhook платёжного провайдера не живут в браузере.</p></article><article><strong>DELIVERY</strong><p>Адреса и трекинг появляются только после production commerce.</p></article><article><strong>MEDIA</strong><p>Мастер-файлы лежат в R2, публичная выдача проходит через rights gate.</p></article></div></section>
    </section>
  </main>;
}

function WorksConsole({connected,works,selected,setSelectedId,createWork,patchWork,busy}:{connected:boolean;works:Work[];selected:Work|null;setSelectedId:(id:string)=>void;createWork:(event:FormEvent<HTMLFormElement>)=>void;patchWork:(patch:Partial<Pick<Work,"publicationStatus"|"rightsStatus"|"title"|"description">>)=>Promise<void>;busy:boolean}){
  if(!connected)return <div className="admin-placeholder"><strong>Нет backend-сессии</strong><p>Подключите Worker, чтобы читать и менять записи D1.</p></div>;
  return <div className="admin-console"><form className="admin-create-form" onSubmit={createWork}><input name="title" required placeholder="Название"/><input name="slug" required pattern="[a-z0-9-]+" placeholder="slug-latin"/><textarea name="description" placeholder="Описание"/><button disabled={busy}>Создать draft</button></form><div className="admin-work-list">{works.length?works.map((work)=><button type="button" className={selected?.id===work.id?"active":""} key={work.id} onClick={()=>setSelectedId(work.id)}><strong>{work.title}</strong><span>{work.publicationStatus} · {work.rightsStatus}</span></button>):<p>В D1 пока нет произведений.</p>}</div>{selected&&<div className="admin-work-editor"><div><small>ID</small><code>{selected.id}</code></div><div className="admin-gates"><label>RIGHTS<select value={selected.rightsStatus} onChange={(event)=>patchWork({rightsStatus:event.target.value as Work["rightsStatus"]})} disabled={busy}><option>unverified</option><option>cleared</option><option>restricted</option><option>expired</option></select></label><label>PUBLICATION<select value={selected.publicationStatus} onChange={(event)=>patchWork({publicationStatus:event.target.value as Work["publicationStatus"]})} disabled={busy}><option>draft</option><option>review</option><option>published</option><option>archived</option></select></label></div><p>Worker отклонит `published`, пока rights status не станет `cleared`.</p></div>}</div>;
}

function MediaConsole({connected,createdAsset,createAsset,uploadAsset,patchAsset,busy}:{connected:boolean;createdAsset:Asset|null;createAsset:(event:FormEvent<HTMLFormElement>)=>void;uploadAsset:(event:FormEvent<HTMLFormElement>)=>void;patchAsset:(rightsStatus:Asset["rightsStatus"])=>Promise<void>;busy:boolean}){
  if(!connected)return <div className="admin-placeholder"><strong>Нет backend-сессии</strong><p>R2-инструменты доступны только после авторизации Worker.</p></div>;
  return <div className="admin-console"><form className="admin-create-form" onSubmit={createAsset}><select name="kind"><option value="image">image</option><option value="audio">audio</option><option value="video">video</option><option value="document">document</option></select><input name="storageKey" required placeholder="works/tihiy-den/images/cover.webp"/><select name="aiDisclosure"><option value="none">AI: none</option><option value="ai-assisted">AI: assisted</option><option value="ai-generated">AI: generated</option></select><input name="alt" placeholder="Alt / описание"/><button disabled={busy}>Зарегистрировать asset</button></form>{createdAsset&&<div className="admin-asset-card"><code>{createdAsset.id}</code><p>{createdAsset.kind} · {createdAsset.rightsStatus} · {createdAsset.aiDisclosure}</p><form onSubmit={uploadAsset}><input type="file" name="file" required/><button disabled={busy}>Загрузить в R2</button></form><label>Права<select value={createdAsset.rightsStatus} onChange={(event)=>patchAsset(event.target.value as Asset["rightsStatus"])} disabled={busy}><option>unverified</option><option>cleared</option><option>restricted</option><option>expired</option></select></label><small>Перевод в cleared выполняется только после реальной проверки прав. Сам по себе upload ничего не публикует.</small></div>}</div>;
}
