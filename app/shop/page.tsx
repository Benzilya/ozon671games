import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import { siteUrl } from "../seo";
import "./shop.css";

export const dynamic = "force-static";

const description = "Коллекционные издания, постеры, одежда, аксессуары и цифровые материалы вселенной Ozon671Games.";

export const metadata: Metadata = {
  title: "Магазин — Ozon 671 Stories",
  description,
  alternates: { canonical: "/shop.html" },
  openGraph: { title: "Магазин — Ozon 671 Stories", description, url: "/shop.html" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Тихий Дэн — печатное издание",
  description: "Концепт будущего печатного издания. Цена, тираж, наличие и финальная комплектация публикуются только после подтверждения в CMS.",
  category: "Печатное издание",
  url: `${siteUrl}/shop.html`,
  additionalProperty: [
    { "@type": "PropertyValue", name: "Статус", value: "Концепт / данные из CMS" },
  ],
};

export default function ShopPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} /><ShopClient /></>;
}
