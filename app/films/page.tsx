import type { Metadata } from "next";
import FilmsClient from "./FilmsClient";
import { siteUrl } from "../seo";
import "./films.css";

export const dynamic = "force-static";

const description = "Визуальный архив AI-концептов, фанатских адаптаций и материалов вселенной Ozon671Games.";

export const metadata: Metadata = {
  title: "AI-фильмы — Ozon 671 Stories",
  description,
  alternates: { canonical: "/films.html" },
  openGraph: { title: "AI-фильмы — Ozon 671 Stories", description, url: "/films.html", type: "website" },
};

const videoConceptSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Тихий Дэн: Ночная смена — AI-концепт",
  description: "Концепт визуальной адаптации в архиве Ozon671Games. Материал явно относится к AI-контенту и не выдаётся за реальные съёмки.",
  url: `${siteUrl}/films.html`,
  inLanguage: "ru",
  additionalProperty: [
    { "@type": "PropertyValue", name: "AI disclosure", value: "Создано с помощью ИИ / концепт" },
    { "@type": "PropertyValue", name: "Статус", value: "Концепт, не реальные съёмки" },
  ],
};

export default function FilmsPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoConceptSchema) }} /><FilmsClient /></>;
}
