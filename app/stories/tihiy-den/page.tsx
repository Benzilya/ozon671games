import type { Metadata } from "next";
import StoryClient from "./StoryClient";
import { siteUrl } from "../../seo";
import "./story.css";
import "./player.css";
import "./editorial-story.css";

export const dynamic = "force-static";

const description = "История обычного мойщика полов, чья жизнь навсегда изменилась после цепочки загадочных событий.";

export const metadata: Metadata = {
  title: "Тихий Дэн — Ozon 671 Stories",
  description,
  alternates: { canonical: "/stories/tihiy-den.html" },
  openGraph: {
    title: "Тихий Дэн — Ozon 671 Stories",
    description,
    url: "/stories/tihiy-den.html",
    type: "article",
  },
};

const bookSchema = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: "Тихий Дэн",
  description,
  url: `${siteUrl}/stories/tihiy-den.html`,
  inLanguage: "ru",
  isPartOf: {
    "@type": "CreativeWorkSeries",
    name: "Вселенная Ozon671Games",
  },
};

export default function QuietDanPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }} /><StoryClient /></>;
}
